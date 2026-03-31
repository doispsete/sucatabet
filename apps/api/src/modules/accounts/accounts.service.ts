import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateAccountDto, UpdateAccountDto, AmountDto } from './dto/account.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole, Prisma, BankTransactionType } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async clearUserDashboardCache(userId: string, role: UserRole) {
    // Clear legacy and vFinal summaries
    await this.cacheManager.del(`dashboard:summary:${userId}:${role}`);
    await this.cacheManager.del(`dashboard:vFinal:summary:${userId}:${role}:none:none`);
    await this.cacheManager.del(`dashboard:club:${userId}:${role}`);
  }

  async findAll(userId: string, role: UserRole) {
    return this.prisma.account.findMany({
      where: { cpfProfile: { userId }, status: { not: 'CANCELLED' } },
      include: {
        cpfProfile: true,
        bettingHouse: true,
      },
    });
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const account = await this.prisma.account.findFirst({
      where: { id, status: { not: 'CANCELLED' } },
      include: {
        cpfProfile: true,
        bettingHouse: true,
      },
    });

    if (!account) throw new NotFoundException('Conta não encontrada');
    if (role !== UserRole.ADMIN && account.cpfProfile.userId !== userId) {
      throw new ForbiddenException('Acesso negado a esta conta');
    }

    return account;
  }

  async create(userId: string, role: UserRole, createAccountDto: CreateAccountDto) {
    // Validate profile belongs to user (or is admin)
    const profile = await this.prisma.cpfProfile.findUnique({
      where: { id: createAccountDto.cpfProfileId },
    });
    if (!profile || (role !== UserRole.ADMIN && profile.userId !== userId)) {
      throw new BadRequestException('Perfil de CPF inválido ou inacessível');
    }

    const existing = await this.prisma.account.findUnique({
      where: {
        cpfProfileId_bettingHouseId: {
          cpfProfileId: createAccountDto.cpfProfileId,
          bettingHouseId: createAccountDto.bettingHouseId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'CANCELLED') {
        // Restaurar conta cancelada ao invés de criar nove
        const restored = await this.prisma.account.update({
          where: { id: existing.id },
          data: { 
            status: 'ACTIVE',
            balance: createAccountDto.balance 
          },
        });
        await this.clearUserDashboardCache(userId, UserRole.OPERATOR);
        return restored;
      }
      throw new BadRequestException('Este CPF já possui uma conta vinculada nesta casa');
    }

    const result = await this.prisma.account.create({
      data: createAccountDto,
    });
    
    await this.clearUserDashboardCache(userId, UserRole.OPERATOR);
    return result;
  }

  async deposit(id: string, userId: string, role: UserRole, amountDto: AmountDto) {
    const account = await this.findOne(id, userId, role);

    return this.prisma.$transaction(async (tx) => {
      // 1. Atualizar saldo da casa
      const updated = await tx.account.update({
        where: { id },
        data: { balance: { increment: amountDto.amount } },
      });

      // 2. Localizar/Criar banco do usuário
      let bankAccount = await tx.bankAccount.findUnique({
        where: { userId: account.cpfProfile.userId },
      });

      if (!bankAccount) {
        bankAccount = await tx.bankAccount.create({
          data: { userId: account.cpfProfile.userId },
        });
      }

      // 3. Verificar saldo no banco (Não permitimos depósito se não houver saldo no banco central)
      if (Number(bankAccount.balance) < amountDto.amount) {
        throw new BadRequestException('Saldo insuficiente no Banco Central para realizar esta transferência');
      }

      // 4. Decrementar saldo do banco
      await tx.bankAccount.update({
        where: { id: bankAccount.id },
        data: { balance: { decrement: amountDto.amount } },
      });

      // 5. Registrar transação bancária
      await tx.bankTransaction.create({
        data: {
          bankAccountId: bankAccount.id,
          type: BankTransactionType.ACCOUNT_DEPOSIT,
          amount: amountDto.amount,
          description: `Depósito para casa: ${account.bettingHouse?.name || 'Aposta'} (${account.cpfProfile?.name} - ${account.cpfProfile?.cpf?.substring(0, 6)})`,
          referenceId: id,
          referenceType: 'account_deposit',
        },
      });

      await this.auditLogs.log(
        'DEPOSIT',
        'Account',
        id,
        userId,
        { balance: new Prisma.Decimal(account.balance) },
        { balance: new Prisma.Decimal(updated.balance), depositAmount: new Prisma.Decimal(amountDto.amount) },
        tx,
      );

      await this.clearUserDashboardCache(userId, role);

      return updated;
    });
  }

  async withdraw(id: string, userId: string, role: UserRole, amountDto: AmountDto) {
    const account = await this.findOne(id, userId, role);

    if (new Prisma.Decimal(account.balance).lt(amountDto.amount)) {
      throw new BadRequestException('Saldo insuficiente para o saque');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Atualizar saldo da casa (decremento)
      const updated = await tx.account.update({
        where: { id },
        data: { balance: { decrement: amountDto.amount } },
      });

      // 2. Localizar/Criar banco do usuário
      let bankAccount = await tx.bankAccount.findUnique({
        where: { userId: account.cpfProfile.userId },
      });

      if (!bankAccount) {
        bankAccount = await tx.bankAccount.create({
          data: { userId: account.cpfProfile.userId },
        });
      }

      // 3. Incrementar saldo do banco
      await tx.bankAccount.update({
        where: { id: bankAccount.id },
        data: { balance: { increment: amountDto.amount } },
      });

      // 4. Registrar transação bancária
      await tx.bankTransaction.create({
        data: {
          bankAccountId: bankAccount.id,
          type: BankTransactionType.ACCOUNT_WITHDRAW,
          amount: amountDto.amount,
          description: `Saque da casa: ${account.bettingHouse?.name || 'Aposta'} (${account.cpfProfile?.name} - ${account.cpfProfile?.cpf?.substring(0, 6)})`,
          referenceId: id,
          referenceType: 'account_withdraw',
        },
      });

      await this.auditLogs.log(
        'WITHDRAW',
        'Account',
        id,
        userId,
        { balance: new Prisma.Decimal(account.balance) },
        { balance: new Prisma.Decimal(updated.balance), withdrawAmount: new Prisma.Decimal(amountDto.amount) },
        tx,
      );

      await this.clearUserDashboardCache(userId, role);

      return updated;
    });
  }

  async update(id: string, userId: string, role: UserRole, updateAccountDto: UpdateAccountDto) {
    const account = await this.findOne(id, userId, role);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.account.update({
        where: { id },
        data: updateAccountDto as any,
      });

      await this.auditLogs.log(
        'UPDATE',
        'Account',
        id,
        userId,
        { status: account.status, balance: Number(account.balance) },
        { status: updated.status, balance: Number(updated.balance) },
        tx,
      );

      await this.clearUserDashboardCache(userId, role);

      return updated;
    });
  }

  async remove(id: string, userId: string, role: UserRole) {
    const account = await this.findOne(id, userId, role);
    
    await this.auditLogs.log(
      'DELETE',
      'Account',
      id,
      userId,
      { balance: Number(account.balance) },
      null,
    );

    const result = await this.prisma.account.update({ 
      where: { id },
      data: { status: 'CANCELLED' }
    });
    await this.clearUserDashboardCache(userId, role);
    return result;
  }
  async getHistory(id: string, userId: string, role: UserRole) {
    await this.findOne(id, userId, role);

    return this.prisma.auditLog.findMany({
      where: {
        entityId: id,
        entity: 'Account',
        action: { in: ['DEPOSIT', 'WITHDRAW'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
  }
}
