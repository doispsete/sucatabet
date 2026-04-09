import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { getStartOfWeekBR } from '../../common/utils/date-utils';
import { CreateOperationDto, UpdateOperationDto, CloseOperationDto } from './dto/operation.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { OperationType, OperationCategory, OperationStatus, OperationResult, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class OperationsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    console.log('[OperationsService] Initialized - Build Version: 2026-04-08-v3');
  }

  private async clearUserDashboardCache(userId: string, role: UserRole) {
    await this.cacheManager.del(`dashboard:summary:${userId}:${role}`);
    await this.cacheManager.del(`dashboard:club:${userId}:${role}`);
  }

  private getEffectiveOdds(opType: OperationType, betType: string, odds: Prisma.Decimal | number): Prisma.Decimal {
    const rawO = new Prisma.Decimal(odds);
    if (betType === 'Aumento') {
      if (opType === OperationType.BOOST_25) return rawO.minus(1).mul(1.25).plus(1);
      if (opType === OperationType.BOOST_30) return rawO.minus(1).mul(1.30).plus(1);
      if (opType === OperationType.BOOST_50) return rawO.minus(1).mul(1.50).plus(1);
    }
    return rawO;
  }

  private getCategory(type: OperationType): OperationCategory {
    // @ts-ignore - Avoid build failure during enum transitions
    const mapping: Partial<Record<OperationType, OperationCategory>> = {
      [OperationType.NORMAL]: OperationCategory.RISCO,
      [OperationType.FREEBET_GEN]: OperationCategory.GERACAO,
      [OperationType.EXTRACAO]: OperationCategory.CONVERSAO,
      [OperationType.BOOST_25]: OperationCategory.BOOST,
      [OperationType.BOOST_30]: OperationCategory.BOOST,
      [OperationType.BOOST_50]: OperationCategory.BOOST,
      [OperationType.SUPERODDS]: OperationCategory.BOOST,
      [OperationType.TENTATIVA_DUPLO]: OperationCategory.RISCO,
    };
    
    // Fallback para tipos legados que podem estar no banco mas foram removidos do enum
    const fallbackMap: Record<string, OperationCategory> = {
      'SUPERODDS': OperationCategory.BOOST,
      'TENTATIVA_DUPLO': OperationCategory.RISCO
    };

    return mapping[type] || fallbackMap[type as string] || OperationCategory.RISCO;
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
      // @ts-ignore - Avoid build failure during enum transitions
      const typeKeywords: Partial<Record<OperationType, string[]>> = {
        [OperationType.NORMAL]: ['normal'],
        [OperationType.FREEBET_GEN]: ['gerar', 'freebet', 'geracao', 'frebet'],
        [OperationType.EXTRACAO]: ['extracao', 'conversao', 'extração'],
        [OperationType.BOOST_25]: ['aumento', 'boost', '25'],
        [OperationType.BOOST_30]: ['aumento', 'boost', '30'],
        [OperationType.BOOST_50]: ['aumento', 'boost', '50'],
        [OperationType.SUPERODDS]: ['super', 'odds'],
        [OperationType.TENTATIVA_DUPLO]: ['tentativa', 'duplo'],
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
        freebet: true,
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
    
    if (createOperationDto.type === OperationType.EXTRACAO) {
      if (!createOperationDto.freebetId) {
        throw new BadRequestException('Operações de extração exigem uma freebet vinculada');
      }
      const fb = await this.prisma.freebet.findUnique({ where: { id: createOperationDto.freebetId } });
      const benefitBet = createOperationDto.bets.find(b => b.type === 'Freebet' || b.isBenefit);
      if (!fb || (benefitBet && fb.accountId !== benefitBet.accountId)) {
        throw new BadRequestException('A freebet selecionada não existe ou não pertence à conta da operação de extração');
      }
    }

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
          const isFree = betDto.type === 'Freebet';
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
          generatedFbValue: (createOperationDto.generatedFbValue && !isNaN(createOperationDto.generatedFbValue)) ? new Prisma.Decimal(createOperationDto.generatedFbValue) : null,
          userId,
          status: OperationStatus.PENDING,
        } as any,
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
      const startOfWeek = getStartOfWeekBR(now);

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
      await this.clearUserDashboardCache(userId, UserRole.ADMIN);
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
        const isF = b.type === 'Freebet';
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
            const isF = bet.type === 'Freebet';

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
            const isF = b.type === 'Freebet';
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

      // Criação de Freebet ao Encerramento (Apenas se for WIN ou se o usuário desejar)
      // Geralmente geramos se o status for FINISHED (encerrada com sucesso)
      if (operation.type === OperationType.FREEBET_GEN && closeDto.status === OperationStatus.FINISHED) {
        const benefitBet = operation.bets.find(b => (b as any).isBenefit);
        const fbValue = (operation as any).generatedFbValue;
        
        if (benefitBet && fbValue && (fbValue as any).toNumber() > 0) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            
            await tx.freebet.create({
                data: {
                    value: fbValue,
                    origin: operation.description || 'Geração via Encerramento de Operação',
                    accountId: benefitBet.accountId,
                    userId,
                    operationId: id,
                    expiresAt,
                }
            });
        }
      }

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
      const reversionWeekStart = getStartOfWeekBR(operation.createdAt);

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
        const is365 = (bet.account as any)?.bettingHouse?.name?.toLowerCase() === 'bet365';
        if (is365) {
          await tx.weeklyClub.updateMany({
            where: { 
              accountId: bet.accountId, 
              weekStart: reversionWeekStart 
            },
            data: { totalStake: { decrement: bet.stake } }
          });
        }
      }
      
      await tx.bet.deleteMany({ where: { operationId: id } });
      const deleted = await tx.operation.delete({ where: { id } });

      await this.auditLogs.log('DELETE', 'Operation', id, userId, operation, null, tx);

      await this.clearUserDashboardCache(userId, role);

      return deleted;
    });
  }
  
  async update(id: string, userId: string, role: UserRole, updateDto: UpdateOperationDto) {
    console.log(`[OperationsService.update] Starting update for ID: ${id}, User: ${userId} - Build Version: 2026-04-08-v4`);

    try {
      const existingOperation = await this.findOne(id, userId, role);
      if (existingOperation.status !== OperationStatus.PENDING) {
        throw new BadRequestException('Apenas operações pendentes podem ser editadas');
      }

      const rawType = updateDto.type as string;

      if (rawType === 'EXTRACAO') {
        const targetFreebetId = updateDto.freebetId || existingOperation.freebet?.id;
        
        if (!targetFreebetId) {
          throw new BadRequestException('Operações de extração exigem uma freebet vinculada');
        }

        const fb = await this.prisma.freebet.findUnique({ where: { id: targetFreebetId } });
        const benefitBet = updateDto.bets.find(b => b.type === 'Freebet' || b.isBenefit);
        
        if (!fb) {
          throw new BadRequestException('A freebet selecionada não existe');
        }
        
        if (benefitBet && fb.accountId !== benefitBet.accountId) {
          throw new BadRequestException('A freebet selecionada não pertence à conta da operação de extração');
        }
      }

      const category = this.getCategory(updateDto.type);

      return await this.prisma.$transaction(async (tx) => {
        const now = new Date();
        const startOfWeek = getStartOfWeekBR(now);
        const reversionWeekStart = getStartOfWeekBR(existingOperation.createdAt);

        // 1. Reverter impactos de saldo e WeeklyClub das bets antigas
        for (const bet of existingOperation.bets) {
          await tx.account.update({
            where: { id: bet.accountId },
            data: {
              inOperation: { decrement: bet.cost },
              balance: { increment: bet.cost },
            },
          });

          const is365 = (bet.account as any)?.bettingHouse?.name?.toLowerCase() === 'bet365';
          if (is365) {
            await tx.weeklyClub.updateMany({
              where: { accountId: bet.accountId, weekStart: reversionWeekStart },
              data: { totalStake: { decrement: bet.stake } }
            });
          }
        }

        // 2. Deletar bets antigas
        await tx.bet.deleteMany({ where: { operationId: id } });

        // 3. Processar novas bets
        const totalCost = (updateDto.bets || []).reduce((acc, b) => {
          const stake = new Prisma.Decimal(b.stake || 0);
          const odds = new Prisma.Decimal(b.odds || 1);
          if (b.side?.toUpperCase() === 'LAY') return acc.plus(stake.mul(odds.minus(1)));
          return acc.plus(b.type === 'Freebet' ? 0 : stake);
        }, new Prisma.Decimal(0));

        const betsToCreate: any[] = [];
        let operationExpectedProfit = new Prisma.Decimal(0);

        for (let i = 0; i < updateDto.bets.length; i++) {
          const betDto = updateDto.bets[i];
          const odds = new Prisma.Decimal(betDto.odds || 1);
          const stake = new Prisma.Decimal(betDto.stake || 0);
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
            const isFree = betDto.type === 'Freebet';
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

        // 4. Criar novas bets e aplicar saldo
        const accountsToUpdateInClub: Set<string> = new Set();
        
        for (const bet of betsToCreate) {
          await tx.bet.create({
            data: {
              odds: bet.odds,
              stake: bet.stake,
              cost: bet.cost,
              expectedProfit: bet.expectedProfit,
              side: (bet.side || 'BACK').toUpperCase(),
              type: bet.type,
              operationId: id,
              accountId: bet.accountId,
              commission: bet.commission || 0,
              isBenefit: bet.isBenefit || false,
            },
          });

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

        // 5. WeeklyClub
        const accountsInvolved = await tx.account.findMany({
          where: { id: { in: Array.from(accountsToUpdateInClub) } },
          include: { bettingHouse: true }
        });

        for (const account of accountsInvolved) {
          if (account.bettingHouse.name.toLowerCase() === 'bet365') {
            const totalStakeForAccount = betsToCreate
              .filter(b => b.accountId === account.id)
              .reduce((sum, b) => sum.plus(new Prisma.Decimal(b.stake || 0)), new Prisma.Decimal(0));
              
            await tx.weeklyClub.upsert({
              where: { accountId_weekStart: { accountId: account.id, weekStart: startOfWeek } },
              update: { totalStake: { increment: totalStakeForAccount } },
              create: { accountId: account.id, weekStart: startOfWeek, totalStake: totalStakeForAccount },
            });
          }
        }

        // 6. Final Update
        const safeFbVal = (updateDto.generatedFbValue !== undefined && updateDto.generatedFbValue !== null && !isNaN(updateDto.generatedFbValue)) 
          ? new Prisma.Decimal(updateDto.generatedFbValue) 
          : null;

        const updated = await tx.operation.update({
          where: { id },
          data: {
            type: updateDto.type,
            category: category,
            expectedProfit: operationExpectedProfit,
            description: updateDto.description,
            generatedFbValue: safeFbVal,
          } as any,
        });

        if (rawType === 'EXTRACAO' && updateDto.freebetId) {
          await tx.freebet.update({
            where: { id: updateDto.freebetId },
            data: { 
              operationId: id,
              usedAt: new Date().toISOString()
            }
          });
        }

        await this.auditLogs.log('UPDATE', 'Operation', id, userId, existingOperation, updated, tx);
        await this.clearUserDashboardCache(userId, role);
        return updated;
      });
    } catch (error) {
      console.error('[OperationsService.update] FATAL ERROR:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Erro interno ao atualizar operação. Detalhes nos logs do servidor.');
    }
  }
}
