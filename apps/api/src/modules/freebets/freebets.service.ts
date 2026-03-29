import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateFreebetDto, UpdateFreebetDto } from './dto/freebet.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class FreebetsService {
  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  private getStatus(freebet: any) {
    const now = new Date();
    const expiresAt = new Date(freebet.expiresAt);
    
    if (freebet.usedAt) return 'USADA';
    if (expiresAt < now) return 'EXPIRADA';
    
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (expiresAt < oneDayFromNow) return 'EXPIRANDO';
    
    return 'PENDENTE';
  }

  async findAll(userId: string, role: UserRole) {
    const freebets = await this.prisma.freebet.findMany({
      where: { userId },
      include: {
        account: {
          include: {
            bettingHouse: true,
            cpfProfile: true,
          },
        },
        operation: true,
      },
      orderBy: { expiresAt: 'asc' },
    });

    return freebets.map(fb => ({
      ...fb,
      status: this.getStatus(fb),
    }));
  }

  async findOne(id: string, userId: string, role: UserRole) {
    const freebet = await this.prisma.freebet.findUnique({
      where: { id },
      include: {
        account: {
          include: {
            bettingHouse: true,
            cpfProfile: true,
          },
        },
        operation: true,
      },
    });

    if (!freebet) throw new NotFoundException('Freebet não encontrada');
    if (role !== UserRole.ADMIN && freebet.userId !== userId) {
      throw new ForbiddenException('Acesso negado a esta freebet');
    }

    return {
      ...freebet,
      status: this.getStatus(freebet),
    };
  }

  async create(userId: string, createFreebetDto: CreateFreebetDto) {
    const freebet = await this.prisma.freebet.create({
      data: {
        ...createFreebetDto,
        userId,
      },
    });

    await this.auditLogs.log(
      'CREATE',
      'Freebet',
      freebet.id,
      userId,
      null,
      freebet,
    );

    return {
      ...freebet,
      status: this.getStatus(freebet),
    };
  }

  async update(id: string, userId: string, role: UserRole, updateFreebetDto: UpdateFreebetDto) {
    const existing = await this.findOne(id, userId, role);

    const data = { ...updateFreebetDto };
    
    if (data.status === 'USADA') {
      data.usedAt = new Date().toISOString();
    } else if (data.status === 'EXPIRADA') {
      data.expiresAt = new Date(Date.now() - 1000).toISOString();
    }
    
    delete data.status;

    const updated = await this.prisma.freebet.update({
      where: { id },
      data,
    });

    await this.auditLogs.log(
      'UPDATE',
      'Freebet',
      id,
      userId,
      existing,
      updated,
    );

    return {
      ...updated,
      status: this.getStatus(updated),
    };
  }

  async remove(id: string, userId: string, role: UserRole) {
    await this.findOne(id, userId, role);
    return this.prisma.freebet.delete({ where: { id } });
  }
}
