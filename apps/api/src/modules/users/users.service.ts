import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        status: UserStatus.ACTIVE, // Admin creation defaults to ACTIVE
        bankAccount: {
          create: {
            balance: 0,
            monthlyGoal: 0,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        plan: true,
        avatarUrl: true,
      },
    });
  }

  async findAll(status?: UserStatus) {
    return this.prisma.user.findMany({
      where: status ? { status } : {},
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        plan: true,
        avatarUrl: true,
        approvedAt: true,
        lastLoginAt: true,
      },
    });
  }

  async updateStatus(id: string, status: UserStatus) {
    const data: any = { status };
    if (status === UserStatus.ACTIVE) {
      data.approvedAt = new Date();
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        plan: true,
        avatarUrl: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
      },
    });
  }

  async updateProfile(id: string, data: { name?: string, email?: string, oldPassword?: string, newPassword?: string, avatarUrl?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.avatarUrl) updateData.avatarUrl = data.avatarUrl;

    if (data.newPassword) {
      if (!data.oldPassword) {
        throw new BadRequestException('Senha atual é obrigatória para alteração');
      }
      const isMatch = await bcrypt.compare(data.oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Senha atual incorreta');
      }
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        avatarUrl: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        cpfProfiles: {
          include: {
            accounts: true
          }
        },
        bankAccount: true,
      }
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return this.prisma.$transaction(async (tx) => {
      // 1. Limpar Auditoria
      await tx.auditLog.deleteMany({ where: { executedBy: id } });

      // 2. Limpar Freebets
      await tx.freebet.deleteMany({ where: { userId: id } });

      // 3. Limpar Operações (e Apostas vinculadas)
      const ops = await tx.operation.findMany({ where: { userId: id } });
      const opIds = ops.map(o => o.id);
      await tx.bet.deleteMany({ where: { operationId: { in: opIds } } });
      await tx.operation.deleteMany({ where: { userId: id } });

      // 4. Limpar Contas e Perfis CPF
      for (const profile of user.cpfProfiles) {
        const accIds = profile.accounts.map(a => a.id);
        await tx.bet.deleteMany({ where: { accountId: { in: accIds } } });
        await tx.weeklyClub.deleteMany({ where: { accountId: { in: accIds } } });
        await tx.account.deleteMany({ where: { cpfProfileId: profile.id } });
      }
      await tx.cpfProfile.deleteMany({ where: { userId: id } });

      // 5. Limpar Banco Central e Transações
      if (user.bankAccount) {
        await tx.bankTransaction.deleteMany({ where: { bankAccountId: user.bankAccount.id } });
        await tx.expense.deleteMany({ where: { bankAccountId: user.bankAccount.id } });
        await tx.bankAccount.delete({ where: { id: user.bankAccount.id } });
      }

      // 6. Finalmente, deletar o usuário
      return tx.user.delete({ where: { id } });
    });
  }

  async getOnlineUsers() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const recentLogs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: { gte: fifteenMinutesAgo }
      },
      select: {
        executedBy: true
      },
      distinct: ['executedBy']
    });

    return recentLogs.map(log => log.executedBy);
  }

  async heartbeat(userId: string) {
    // Registra uma atividade silenciosa apenas para atualizar o "last_seen" via AuditLog
    await this.prisma.auditLog.create({
      data: {
        action: 'HEARTBEAT',
        entity: 'USER',
        entityId: userId,
        executedBy: userId
      }
    });
    return { ok: true };
  }
}
