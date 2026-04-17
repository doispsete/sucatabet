import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateHouseDto, UpdateHouseDto } from './dto/house.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class HousesService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  private getLogoUrl(domain?: string): string | null {
    if (!domain) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  }

  async findAll() {
    const cacheKey = 'houses:all';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const houses = await this.prisma.bettingHouse.findMany({
      orderBy: { name: 'asc' },
    });

    await this.cacheManager.set(cacheKey, houses, 3600000); // 1h
    return houses;
  }

  async create(executedBy: string, createHouseDto: CreateHouseDto) {
    const logoUrl = this.getLogoUrl(createHouseDto.domain);
    const result = await this.prisma.bettingHouse.create({
      data: {
        ...createHouseDto,
        logoUrl,
      },
    });

    this.auditLogs.log('CREATE', 'BettingHouse', result.id, executedBy, null, result);
    await this.cacheManager.del('houses:all');
    return result;
  }

  async update(id: string, executedBy: string, updateHouseDto: UpdateHouseDto) {
    const house = await this.prisma.bettingHouse.findUnique({ where: { id } });
    if (!house) throw new NotFoundException('Casa não encontrada');

    const logoUrl = updateHouseDto.domain
      ? this.getLogoUrl(updateHouseDto.domain)
      : house.logoUrl;

    const result = await this.prisma.bettingHouse.update({
      where: { id },
      data: {
        ...updateHouseDto,
        logoUrl,
      },
    });

    this.auditLogs.log('UPDATE', 'BettingHouse', id, executedBy, house, result);
    await this.cacheManager.del('houses:all');
    return result;
  }

  async remove(id: string, executedBy: string) {
    const house = await this.prisma.bettingHouse.findUnique({ where: { id } });
    if (!house) throw new NotFoundException('Casa não encontrada');

    const result = await this.prisma.bettingHouse.delete({ where: { id } });

    this.auditLogs.log('DELETE', 'BettingHouse', id, executedBy, house, null);
    await this.cacheManager.del('houses:all');
    return result;
  }
}
