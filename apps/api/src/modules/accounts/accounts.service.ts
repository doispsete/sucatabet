import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateAccountDto, UpdateAccountDto, AmountDto } from './dto/account.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole, Prisma } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async clearUserDashboardCache(userId: string, role: UserRole) {
    await this.cacheManager.del(`dashboard:summary:${userId}:${role}`);
    await this.cacheManager.del(`dashboard:club:${userId}:${role}`);
  }

  async findAll(userId: string, role: UserRole) {
    return this.prisma.account.findMany({
      where: role === UserRole.ADMIN ? {} : { cpfProfile: { userId } },
      include: {
        cpfProfile: true,
        bettingHouse: true,
      },
    });
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const account = await this.prisma.account.findUnique({
      where: { id },
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
      const updated = await tx.account.update({
        where: { id },
        data: { balance: { increment: amountDto.amount } },
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
      const updated = await tx.account.update({
        where: { id },
        data: { balance: { decrement: amountDto.amount } },
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
        data: updateAccountDto,
      });

      await this.auditLogs.log(
        'UPDATE',
        'Account',
        id,
        userId,
        { balance: Number(account.balance) },
        { balance: Number(updated.balance) },
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

    const result = await this.prisma.account.delete({ where: { id } });
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
