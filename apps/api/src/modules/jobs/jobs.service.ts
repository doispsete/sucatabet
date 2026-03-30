import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { getStartOfWeekBR } from '../../common/utils/date-utils';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ExpenseStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogs: AuditLogsService,
  ) {}

  // 1. Reset Semanal do Clube - Segunda-feira às 00:00 BRT (03:00 UTC)
  @Cron('0 3 * * 1')
  async handleWeeklyReset() {
    this.logger.log('Iniciando Reset Semanal do Clube...');
    
    const now = new Date();
    const startOfWeek = getStartOfWeekBR(now);

    const accounts = await this.prisma.account.findMany();

    for (const account of accounts) {
      await this.prisma.weeklyClub.upsert({
        where: { accountId_weekStart: { accountId: account.id, weekStart: startOfWeek } },
        update: {},
        create: {
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
    const startOfWeek = getStartOfWeekBR();
    const clubs = await this.prisma.weeklyClub.findMany({
      where: {
        weekStart: startOfWeek,
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
  
  // 4. Reset Mensal de Despesas - Dia 1 às 00:00
  @Cron('0 0 1 * *')
  async handleMonthlyExpenseReset() {
    this.logger.log('Iniciando Reset Mensal de Despesas...');
    
    const result = await this.prisma.expense.updateMany({
      where: {
        recurring: true,
        status: ExpenseStatus.PAID,
      },
      data: {
        status: ExpenseStatus.PENDING,
      },
    });

    this.logger.log(`Reset Mensal concluído. ${result.count} despesas voltaram para PENDENTE.`);
  }
}
