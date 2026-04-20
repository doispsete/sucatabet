import { Injectable, NotFoundException, ForbiddenException, Inject, ConflictException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateCpfProfileDto } from './dto/create-cpf-profile.dto';
import { UpdateCpfProfileDto } from './dto/update-cpf-profile.dto';
import { UserRole, Prisma } from '@prisma/client';

@Injectable()
export class CpfProfilesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  private async clearUserDashboardCache(userId: string, role: UserRole) {
    await this.cacheManager.del(`dashboard:summary:${userId}:${role}`);
    await this.cacheManager.del(`dashboard:club:${userId}:${role}`);
  }

  async create(userId: string, createCpfProfileDto: CreateCpfProfileDto) {
    // 0. Verificar limites de Plano
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const plan = user?.plan || 'FREE';
    const limit = plan === 'FREE' ? 1 : (plan === 'BASIC' ? 4 : Infinity);

    const count = await this.prisma.cpfProfile.count({
      where: { userId, deletedAt: null },
    });

    if (count >= limit) {
      throw new ForbiddenException(`Limite de ${limit} perfis de CPF atingido para o plano ${plan}.`);
    }

    try {
      // 1. Procurar por um perfil já existente (ativo ou soft-deleted)
      const existing = await this.prisma.cpfProfile.findFirst({
        where: {
          cpf: createCpfProfileDto.cpf,
        },
      });

      if (existing) {
        // Se já existe (deletado ou ativo), "recuperamos" para o usuário atual
        // Isso resolve o problema de CPFs que ficaram presos em contas antigas ou deletadas
        const result = await this.prisma.cpfProfile.update({
          where: { id: existing.id },
          data: {
            ...createCpfProfileDto,
            deletedAt: null,
            userId: userId,
          } as any,
        });
        await this.clearUserDashboardCache(userId, UserRole.OPERATOR);
        return result;
      }

      // 2. Se não existir nada, cria normalmente
      const result = await this.prisma.cpfProfile.create({
        data: {
          ...createCpfProfileDto,
          userId: userId,
        },
      });

      await this.clearUserDashboardCache(userId, UserRole.OPERATOR);
      return result;
    } catch (error) {
      if (error instanceof ConflictException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Este CPF já está cadastrado no sistema.');
        }
      }
      throw error;
    }
  }

  async findAll(userId: string, role: UserRole, targetUserId?: string) {
    const filterUserId = (role === UserRole.ADMIN && targetUserId) ? targetUserId : userId;

    const profiles = await this.prisma.cpfProfile.findMany({
      where: { userId: filterUserId, deletedAt: null },
      include: {
        accounts: {
          where: { status: { not: 'CANCELLED' } },
          include: {
            bettingHouse: true,
          },
        },
      },
      orderBy: { id: 'asc' }, // Garantir ordem consistente (o primeiro criado é o "titular")
    });

    // Se for Operador (usuário comum), aplicamos os limites de visualização de acordo com o plano
    if (role !== UserRole.ADMIN) {
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
      const plan = user?.plan || 'FREE';
      
      if (plan === 'FREE' && profiles.length > 1) {
        return [profiles[0]]; // Retorna apenas o primeiro para FREE
      }
      
      if (plan === 'BASIC' && profiles.length > 4) {
        return profiles.slice(0, 4); // Retorna apenas os 4 primeiros para BASIC
      }
    }

    return profiles;
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const profile = await this.prisma.cpfProfile.findFirst({
      where: { id, deletedAt: null },
      include: {
        accounts: {
          include: {
            bettingHouse: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Perfil de CPF não encontrado');
    }

    if (role !== UserRole.ADMIN && profile.userId !== userId) {
      throw new ForbiddenException('Acesso negado a este perfil');
    }

    return profile;
  }

  async update(id: string, userId: string, role: UserRole, updateCpfProfileDto: UpdateCpfProfileDto) {
    const result = await this.prisma.cpfProfile.update({
      where: { id },
      data: updateCpfProfileDto,
    });

    await this.clearUserDashboardCache(userId, role);
    return result;
  }

  async remove(id: string, userId: string, role: UserRole) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Marcar contas do CPF como CANCELADAS
      await tx.account.updateMany({
        where: { cpfProfileId: id },
        data: { status: 'CANCELLED' }
      });

      // 2. Marcar o perfil como excluído (mantemos deletedAt para CPF por enquanto)
      return tx.cpfProfile.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
    });

    await this.clearUserDashboardCache(userId, role);
    return result;
  }
}
