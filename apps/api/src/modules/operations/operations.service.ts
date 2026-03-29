import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateOperationDto, CloseOperationDto } from './dto/operation.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { OperationType, OperationCategory, OperationStatus, OperationResult, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class OperationsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async clearUserDashboardCache(userId: string, role: UserRole) {
    await this.cacheManager.del(`dashboard:summary:${userId}:${role}`);
    await this.cacheManager.del(`dashboard:club:${userId}:${role}`);
  }

  private getEffectiveOdds(opType: OperationType, betType: string, odds: Prisma.Decimal | number): Prisma.Decimal {
    const rawO = new Prisma.Decimal(odds);
    if (betType === 'Aumento') {
      if (opType === OperationType.BOOST_25) return rawO.minus(1).mul(1.25).plus(1);
      if (opType === OperationType.BOOST_50) return rawO.minus(1).mul(1.50).plus(1);
    }
    return rawO;
  }

  private getCategory(type: OperationType): OperationCategory {
    const mapping: Record<OperationType, OperationCategory> = {
      [OperationType.NORMAL]: OperationCategory.RISCO,
      [OperationType.FREEBET_GEN]: OperationCategory.GERACAO,
      [OperationType.EXTRACAO]: OperationCategory.CONVERSAO,
      [OperationType.BOOST_25]: OperationCategory.BOOST,
      [OperationType.BOOST_50]: OperationCategory.BOOST,
      [OperationType.SUPERODDS]: OperationCategory.BOOST,
      [OperationType.TENTATIVA_DUPLO]: OperationCategory.RISCO,
    };
    return mapping[type];
  }

  async findAll(userId: string, role: UserRole, options: { page: number, limit: number, status?: OperationStatus, startDate?: string, endDate?: string, search?: string }) {
    const { page, limit, status, startDate, endDate, search } = options;
    const skip = (page - 1) * limit;
    
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    if (search) {
      const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      // Keywords mapping for OperationType search
      const typeKeywords: Record<OperationType, string[]> = {
        [OperationType.NORMAL]: ['normal'],
        [OperationType.FREEBET_GEN]: ['gerar', 'freebet', 'geracao', 'frebet'],
        [OperationType.EXTRACAO]: ['extracao', 'conversao', 'extração'],
        [OperationType.BOOST_25]: ['aumento', 'boost', '25'],
        [OperationType.BOOST_50]: ['aumento', 'boost', '50'],
        [OperationType.SUPERODDS]: ['super', 'odds'],
        [OperationType.TENTATIVA_DUPLO]: ['tentativa', 'duplo']
      };

      const matchedTypes = Object.entries(typeKeywords)
        .filter(([_, keywords]) => keywords.some(k => {
          const nk = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          return nk.includes(normalizedSearch) || normalizedSearch.includes(nk);
        }))
        .map(([type]) => type as OperationType);

      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { 
          bets: { 
            some: { 
              account: { 
                bettingHouse: { 
                  name: { contains: search, mode: 'insensitive' } 
                } 
              } 
            } 
          } 
        },
        { 
          bets: { 
            some: { 
              account: { 
                cpfProfile: { 
                  name: { contains: search, mode: 'insensitive' } 
                } 
              } 
            } 
          } 
        }
      ];

      if (matchedTypes.length > 0) {
        where.OR.push({ type: { in: matchedTypes } });
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.operation.findMany({
        where,
        include: {
          bets: {
            include: {
              account: {
                include: {
                  bettingHouse: true,
                  cpfProfile: true, // Adicionado para exibir nome do operador
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.operation.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const operation = await this.prisma.operation.findUnique({
      where: { id },
      include: {
        bets: {
          include: {
            account: {
              include: {
                bettingHouse: true,
                cpfProfile: true, // Adicionado para exibir nome do operador
              },
            },
          },
        },
      },
    });

    if (!operation) throw new NotFoundException('Operação não encontrada');
    if (role !== UserRole.ADMIN && operation.userId !== userId) {
      throw new ForbiddenException('Acesso negado a esta operação');
    }

    return operation;
  }

  async create(userId: string, createOperationDto: CreateOperationDto) {
    const category = this.getCategory(createOperationDto.type);
    
    return this.prisma.$transaction(async (tx) => {
      const totalCost = createOperationDto.bets.reduce((acc, b) => {
        const stake = new Prisma.Decimal(b.stake);
        const odds = new Prisma.Decimal(b.odds);
        if (b.side?.toUpperCase() === 'LAY') return acc.plus(stake.mul(odds.minus(1)));
        return acc.plus(b.type === 'Freebet' ? 0 : stake);
      }, new Prisma.Decimal(0));

      const betsToCreate: any[] = [];
      // Usamos o lucro do primeiro cenário como o ExpectedProfit da operação (assumindo balanceamento)
      let operationExpectedProfit = new Prisma.Decimal(0);

      for (let i = 0; i < createOperationDto.bets.length; i++) {
        const betDto = createOperationDto.bets[i];
        const odds = new Prisma.Decimal(betDto.odds);
        const stake = new Prisma.Decimal(betDto.stake);
        const comm = new Prisma.Decimal(betDto.commission || 0).div(100);
        
        let effOdds = this.getEffectiveOdds(createOperationDto.type, betDto.type, odds);

        let betWinNet = new Prisma.Decimal(0); // O que a casa paga ALÉM do que você apostou nela
        let betReturn = new Prisma.Decimal(0); // O que volta para a conta se esta bet vencer
        let cost = new Prisma.Decimal(0);

        const side = (betDto.side || 'BACK').toUpperCase();
        if (side === 'LAY') {
          // Lucro Líquido na Casa = Stake * (1 - Comm)
          betWinNet = stake.mul(new Prisma.Decimal(1).minus(comm));
          cost = stake.mul(odds.minus(1));
          betReturn = cost.plus(betWinNet);
        } else {
          // Lucro Líquido na Casa = (Odd_Eff - 1) * Stake * (1 - Comm)
          betWinNet = effOdds.minus(1).mul(stake).mul(new Prisma.Decimal(1).minus(comm));
          // Custo = 0 se for Freebet ou se estiver marcado como Benefício (ex: Extração)
          const isFree = betDto.type === 'Freebet' || betDto.isBenefit;
          cost = isFree ? new Prisma.Decimal(0) : stake;
          betReturn = cost.plus(betWinNet);
        }

        if (i === 0) {
            operationExpectedProfit = betReturn.minus(totalCost);
        }
        
        betsToCreate.push({
          ...betDto,
          expectedProfit: betWinNet, // Salva o lucro líquido individual da bet
          cost
        });
      }

      const operation = await tx.operation.create({
        data: {
          type: createOperationDto.type,
          category,
          expectedProfit: operationExpectedProfit,
          description: createOperationDto.description,
          userId,
          status: OperationStatus.PENDING,
        },
      });

      for (const bet of betsToCreate) {
        await tx.bet.create({
          data: {
            odds: bet.odds,
            stake: bet.stake,
            cost: bet.cost,
            expectedProfit: bet.expectedProfit,
            side: bet.side.toUpperCase(),
            type: bet.type,
            operationId: operation.id,
            accountId: bet.accountId,
            commission: (bet as any).commission || 0,
            isBenefit: (bet as any).isBenefit || false,
          },
        });

        // Update Account: increment inOperation, decrement balance by COST
        if (bet.cost.gt(0)) {
          await tx.account.update({
            where: { id: bet.accountId },
            data: {
              inOperation: { increment: bet.cost },
              balance: { decrement: bet.cost },
            },
          });
        }
      }

      // Weekly Club progress: Optimized Grouping (2B Fix)
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const stakesByAccount: Record<string, Prisma.Decimal> = {};
      for (const bet of betsToCreate) {
        stakesByAccount[bet.accountId] = (stakesByAccount[bet.accountId] || new Prisma.Decimal(0)).plus(new Prisma.Decimal(bet.stake));
      }

      const accountsInvolved = await tx.account.findMany({
        where: { id: { in: Object.keys(stakesByAccount) } },
        include: { bettingHouse: true }
      });

      for (const account of accountsInvolved) {
        if (account.bettingHouse.name.toLowerCase().includes('365')) {
          const totalStake = stakesByAccount[account.id];
          await tx.weeklyClub.upsert({
            where: { accountId_weekStart: { accountId: account.id, weekStart: startOfWeek } },
            update: { totalStake: { increment: totalStake } },
            create: { accountId: account.id, weekStart: startOfWeek, totalStake },
          });
        }
      }

      if (createOperationDto.freebetId) {
        await tx.freebet.update({
          where: { id: createOperationDto.freebetId },
          data: { 
            operationId: operation.id,
            usedAt: new Date().toISOString()
          }
        });
      }

      await this.auditLogs.log('CREATE', 'Operation', operation.id, userId, null, operation, tx);
      await this.clearUserDashboardCache(userId, UserRole.OPERATOR);

      return operation;
    });
  }

  async close(id: string, userId: string, role: UserRole, closeDto: CloseOperationDto) {
    const operation = await this.findOne(id, userId, role);
    if (operation.status !== OperationStatus.PENDING) {
      throw new BadRequestException('Apenas operações pendentes podem ser encerradas');
    }

    return this.prisma.$transaction(async (tx) => {
      const totalStaked = operation.bets.reduce((acc, b) => {
        const isF = b.type === 'Freebet' || (b as any).isBenefit;
        if (isF) return acc;
        return acc.plus(new Prisma.Decimal(b.cost));
      }, new Prisma.Decimal(0));
      const winnersCount = closeDto.winningBetIds?.length || 0;

      // 1. Clear inOperation and update balance based on winners
      for (const bet of operation.bets) {
        const isWinner = closeDto.winningBetIds?.includes(bet.id);
        
        // Payout Calculation: Standard payout for any winning bet (including early payout)
        let payout = new Prisma.Decimal(0);
        if (isWinner) {
            const oo = this.getEffectiveOdds(operation.type, bet.type, new Prisma.Decimal(bet.odds));
            const os = new Prisma.Decimal(bet.stake);
            const oc = new Prisma.Decimal((bet as any).commission || 0).div(100);
            const cost = new Prisma.Decimal(bet.cost);
            const isF = bet.type === 'Freebet' || (bet as any).isBenefit;

            if (bet.side?.toUpperCase() === 'BACK') {
                if (isF) {
                    payout = os.mul(oo.minus(1)).mul(new Prisma.Decimal(1).minus(oc));
                } else {
                    payout = os.plus(os.mul(oo).minus(os).mul(new Prisma.Decimal(1).minus(oc)));
                }
            } else {
                // LAY payout: devolução da responsabilidade + lucro líquido
                payout = os.mul(new Prisma.Decimal(1).minus(oc)).plus(cost);
            }
        }

        await tx.account.update({
          where: { id: bet.accountId },
          data: {
            inOperation: { decrement: bet.cost },
            balance: isWinner ? { increment: payout } : undefined,
          },
        });

        if (isWinner) {
          await tx.bet.update({
            where: { id: bet.id },
            data: { isWinner: true },
          });
        }
      }
      
      // Calculate real profit
      let realProfit: Prisma.Decimal | number | null | undefined = closeDto.realProfit;
      if (realProfit === undefined || realProfit === null) {
        const totalPayout = operation.bets
          .filter(b => closeDto.winningBetIds?.includes(b.id))
          .reduce((acc, b) => {
            const os = new Prisma.Decimal(b.stake);
            const oo = this.getEffectiveOdds(operation.type, b.type, new Prisma.Decimal(b.odds));
            const oc = new Prisma.Decimal((b as any).commission || 0).div(100);
            const isF = b.type === 'Freebet' || (b as any).isBenefit;
            const cost = new Prisma.Decimal(b.cost);

            let br = new Prisma.Decimal(0);
            if (b.side?.toUpperCase() === 'BACK') {
                if (isF) {
                    br = os.mul(oo.minus(1)).mul(new Prisma.Decimal(1).minus(oc));
                } else {
                    br = os.plus(os.mul(oo).minus(os).mul(new Prisma.Decimal(1).minus(oc)));
                }
            } else {
                // LAY: Payout = Responsabilidade + Lucro Líquido
                br = os.mul(new Prisma.Decimal(1).minus(oc)).plus(cost);
            }
            return acc.plus(br);
          }, new Prisma.Decimal(0));
        
        realProfit = totalPayout.minus(totalStaked);
        console.log(`[BACKEND SETTLEMENT]`, { totalPayout: totalPayout.toNumber(), totalStaked: totalStaked.toNumber(), realProfit: realProfit.toNumber() });
      }

      const updated = await tx.operation.update({
        where: { id },
        data: {
          status: closeDto.status as OperationStatus,
          realProfit,
          result: closeDto.result,
          profitDifference: new Prisma.Decimal(realProfit).minus(new Prisma.Decimal(operation.expectedProfit)),
        },
      });

      await this.auditLogs.log('CLOSE', 'Operation', id, userId, operation, updated, tx);
      await this.clearUserDashboardCache(userId, role);

      return updated;
    });
  }

  async void(id: string, userId: string, role: UserRole) {
    const operation = await this.findOne(id, userId, role);
    if (operation.status !== OperationStatus.PENDING) {
      throw new BadRequestException('Apenas operações pendentes podem ser anuladas');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.operation.update({
        where: { id },
        data: { status: OperationStatus.VOID },
      });

      for (const bet of operation.bets) {
        await tx.account.update({
          where: { id: bet.accountId },
          data: {
            inOperation: { decrement: bet.cost },
            balance: { increment: bet.cost },
          },
        });
      }

      await this.auditLogs.log('VOID', 'Operation', id, userId, operation, updated, tx);

      await this.clearUserDashboardCache(userId, role);

      return updated;
    });
  }


  async remove(id: string, userId: string, role: UserRole) {
    const operation = await this.findOne(id, userId, role);
    if (operation.status !== OperationStatus.PENDING) {
      throw new BadRequestException('Não é possível remover uma operação fechada ou anulada');
    }
    
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);

      for (const bet of operation.bets) {
        // Reverter impacto no saldo da conta
        await tx.account.update({
          where: { id: bet.accountId },
          data: {
            inOperation: { decrement: bet.cost },
            balance: { increment: bet.cost },
          },
        });

        // Reverter impacto no WeeklyClub (APENAS SE FOR 365)
        const is365 = (bet.account as any)?.bettingHouse?.name?.toLowerCase().includes('365');
        if (is365) {
          await tx.weeklyClub.update({
            where: { accountId_weekStart: { accountId: bet.accountId, weekStart: startOfWeek } },
            data: { totalStake: { decrement: bet.stake } }
          }).catch(() => null);
        }
      }
      
      await tx.bet.deleteMany({ where: { operationId: id } });
      const deleted = await tx.operation.delete({ where: { id } });

      await this.auditLogs.log('DELETE', 'Operation', id, userId, operation, null, tx);

      await this.clearUserDashboardCache(userId, role);

      return deleted;
    });
  }

  async update(id: string, userId: string, role: UserRole, updateDto: CreateOperationDto) {
    const existingOperation = await this.findOne(id, userId, role);
    if (existingOperation.status !== OperationStatus.PENDING) {
      throw new BadRequestException('Apenas operações pendentes podem ser editadas');
    }

    const category = this.getCategory(updateDto.type);

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);

      // 1. Reverter impactos de saldo e WeeklyClub das bets antigas
      for (const bet of existingOperation.bets) {
        await tx.account.update({
          where: { id: bet.accountId },
          data: {
            inOperation: { decrement: bet.cost },
            balance: { increment: bet.cost },
          },
        });

        const is365 = (bet.account as any)?.bettingHouse?.name?.toLowerCase().includes('365');
        if (is365) {
          await tx.weeklyClub.update({
            where: { accountId_weekStart: { accountId: bet.accountId, weekStart: startOfWeek } },
            data: { totalStake: { decrement: bet.stake } }
          }).catch(() => null);
        }
      }

      // 2. Deletar bets antigas
      await tx.bet.deleteMany({ where: { operationId: id } });

      // 3. Processar novas bets
      const totalCost = updateDto.bets.reduce((acc, b) => {
        const stake = new Prisma.Decimal(b.stake);
        const odds = new Prisma.Decimal(b.odds);
        if (b.side?.toUpperCase() === 'LAY') return acc.plus(stake.mul(odds.minus(1)));
        return acc.plus(b.type === 'Freebet' ? 0 : stake);
      }, new Prisma.Decimal(0));

      const betsToCreate: any[] = [];
      let operationExpectedProfit = new Prisma.Decimal(0);

      for (let i = 0; i < updateDto.bets.length; i++) {
        const betDto = updateDto.bets[i];
        const odds = new Prisma.Decimal(betDto.odds);
        const stake = new Prisma.Decimal(betDto.stake);
        const comm = new Prisma.Decimal(betDto.commission || 0).div(100);
        
        let effOdds = this.getEffectiveOdds(updateDto.type, betDto.type, odds);

        let betWinNet = new Prisma.Decimal(0);
        let betReturn = new Prisma.Decimal(0);
        let cost = new Prisma.Decimal(0);

        const side = (betDto.side || 'BACK').toUpperCase();
        if (side === 'LAY') {
          betWinNet = stake.mul(new Prisma.Decimal(1).minus(comm));
          cost = stake.mul(odds.minus(1));
          betReturn = cost.plus(betWinNet);
        } else {
          betWinNet = effOdds.minus(1).mul(stake).mul(new Prisma.Decimal(1).minus(comm));
          const isFree = betDto.type === 'Freebet' || betDto.isBenefit;
          cost = isFree ? new Prisma.Decimal(0) : stake;
          betReturn = cost.plus(betWinNet);
        }

        if (i === 0) {
            operationExpectedProfit = betReturn.minus(totalCost);
        }
        
        betsToCreate.push({
          ...betDto,
          expectedProfit: betWinNet,
          cost
        });
      }

      // 4. Criar novas bets e aplicar novos impactos de saldo
      const accountsToUpdateInClub: Set<string> = new Set();
      
      for (const bet of betsToCreate) {
        await tx.bet.create({
          data: {
            odds: bet.odds,
            stake: bet.stake,
            cost: bet.cost,
            expectedProfit: bet.expectedProfit,
            side: bet.side.toUpperCase(),
            type: bet.type,
            operationId: id,
            accountId: bet.accountId,
            commission: (bet as any).commission || 0,
            isBenefit: (bet as any).isBenefit || false,
          },
        });

        // Update Account Balance
        if (bet.cost.gt(0)) {
          await tx.account.update({
            where: { id: bet.accountId },
            data: {
              inOperation: { increment: bet.cost },
              balance: { decrement: bet.cost },
            },
          });
        }
        
        accountsToUpdateInClub.add(bet.accountId);
      }

      // 5. Atualizar progressos do WeeklyClub (Apenas 365)
      const accountsInvolved = await tx.account.findMany({
        where: { id: { in: Array.from(accountsToUpdateInClub) } },
        include: { bettingHouse: true }
      });

      for (const account of accountsInvolved) {
        if (account.bettingHouse.name.toLowerCase().includes('365')) {
          const totalStakeForAccount = betsToCreate
            .filter(b => b.accountId === account.id)
            .reduce((sum, b) => sum.plus(new Prisma.Decimal(b.stake)), new Prisma.Decimal(0));
            
          await tx.weeklyClub.upsert({
            where: { accountId_weekStart: { accountId: account.id, weekStart: startOfWeek } },
            update: { totalStake: { increment: totalStakeForAccount } },
            create: { accountId: account.id, weekStart: startOfWeek, totalStake: totalStakeForAccount },
          });
        }
      }

      // 6. Atualizar cabeçalho da operação
      const updated = await tx.operation.update({
        where: { id },
        data: {
          type: updateDto.type,
          category,
          expectedProfit: operationExpectedProfit,
          description: updateDto.description,
        },
      });

      await this.auditLogs.log('UPDATE', 'Operation', id, userId, existingOperation, updated, tx);
      await this.clearUserDashboardCache(userId, role);

      return updated;
    });
  }
}
