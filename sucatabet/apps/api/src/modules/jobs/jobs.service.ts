import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  // 1. Reset Semanal do Clube - Segunda-feira às 00:00
  @Cron('0 0 * * 1')
  async handleWeeklyReset() {
    this.logger.log('Iniciando Reset Semanal do Clube...');
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);

    const accounts = await this.prisma.account.findMany();

    for (const account of accounts) {
      await this.prisma.weeklyClub.create({
        data: {
          accountId: account.id,
          weekStart: startOfWeek,
          totalStake: 0,
        },
      });

      await this.auditLogs.log(
        'RESET',
        'WeeklyClub',
        account.id,
        'SYSTEM',
        null,
        { weekStart: startOfWeek },
      );
    }
    
    this.logger.log('Reset Semanal concluído.');
  }

  // 2. Alerta Freebet Expirando - A cada hora
  @Cron(CronExpression.EVERY_HOUR)
  async handleFreebetAlerts() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const expiring = await this.prisma.freebet.findMany({
      where: {
        usedAt: null,
        expiresAt: {
          gt: now,
          lt: tomorrow,
        },
      },
    });

    if (expiring.length > 0) {
      this.logger.log(`Detectadas ${expiring.length} freebets expirando em breve.`);
      // No spec, isso é consumido pelo dashboard summary.
    }
  }

  // 3. Alerta Meta Semanal - Domingo às 20:00
  @Cron('0 20 * * 0')
  async handleWeeklyGoalAlerts() {
    this.logger.log('Verificando metas semanais...');
    
    const clubs = await this.prisma.weeklyClub.findMany({
      where: {
        totalStake: { lt: 1500 },
      },
      include: {
        account: {
          include: {
            cpfProfile: true,
          },
        },
      },
    });

    for (const club of clubs) {
      this.logger.warn(`Conta ${club.accountId} (${club.account.cpfProfile.name}) abaixo da meta: ${club.totalStake}/1500`);
      // No spec, isso é consumido pelo dashboard.
    }
  }
}
