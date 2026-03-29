import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateCpfProfileDto } from './dto/create-cpf-profile.dto';
import { UpdateCpfProfileDto } from './dto/update-cpf-profile.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CpfProfilesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async clearUserDashboardCache(userId: string, role: UserRole) {
    await this.cacheManager.del(`dashboard:summary:${userId}:${role}`);
    await this.cacheManager.del(`dashboard:club:${userId}:${role}`);
  }

  async create(userId: string, createCpfProfileDto: CreateCpfProfileDto) {
    const result = await this.prisma.cpfProfile.create({
      data: {
        ...createCpfProfileDto,
        userId: userId,
      },
    });
    
    await this.clearUserDashboardCache(userId, UserRole.OPERATOR);
    return result;
  }

  async findAll(userId: string, role: UserRole, targetUserId?: string) {
    const filterUserId = (role === UserRole.ADMIN && targetUserId) ? targetUserId : userId;
    
    return this.prisma.cpfProfile.findMany({
      where: { userId: filterUserId },
      include: {
        accounts: {
          include: {
            bettingHouse: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const profile = await this.prisma.cpfProfile.findUnique({
      where: { id },
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
    await this.findOne(id, userId, role);
    const result = await this.prisma.cpfProfile.delete({ where: { id } });
    await this.clearUserDashboardCache(userId, role);
    return result;
  }
}
