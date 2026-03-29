import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { OperationStatus, OperationCategory, OperationResult, UserRole } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getSummary(userId: string, role: UserRole, startDate?: string, endDate?: string) {
    const cacheKey = `dashboard:vFinal:summary:${userId}:${role}:${startDate || 'none'}:${endDate || 'none'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    const userFilter = role === UserRole.ADMIN ? {} : { userId };
    const accountFilter = role === UserRole.ADMIN ? {} : { cpfProfile: { userId } };

    // 1. Fetch accounts and operations in parallel
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Filter by date for the main query
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const [accounts, allFinishedOps, freebetsExpirando] = await Promise.all([
      this.prisma.account.findMany({
        where: accountFilter,
        select: { balance: true, inOperation: true },
      }),
      this.prisma.operation.findMany({
        where: { 
          ...userFilter, 
          status: OperationStatus.FINISHED,
          // We fetch all from start of month OR custom range to satisfy all stats in one query
          createdAt: { gte: startDate ? new Date(startDate) : startOfMonth }
        },
        select: { realProfit: true, category: true, result: true, createdAt: true },
      }),
      this.prisma.freebet.findMany({
        where: {
          ...userFilter,
          usedAt: null,
          expiresAt: {
            gt: now,
            lt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: { account: { include: { bettingHouse: true } } },
        take: 5,
      })
    ]);

    // 2. Process Stats in Memory (Redundancy Fix)
    const disponivel = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
    const emOperacao = accounts.reduce((acc, curr) => acc + Number(curr.inOperation), 0);
    const bancaTotal = disponivel + emOperacao;

    // Filter closedOps for the specific requested period if dates provided
    const periodOps = startDate || endDate 
      ? allFinishedOps.filter(op => {
          const d = op.createdAt.getTime();
          return (!dateFilter.gte || d >= dateFilter.gte.getTime()) && 
                 (!dateFilter.lte || d <= dateFilter.lte.getTime());
        })
      : allFinishedOps;

    const lucroPeriodo = periodOps.reduce((acc, curr) => acc + Number(curr.realProfit || 0), 0);
    const lucroSemana = allFinishedOps
      .filter(op => op.createdAt >= startOfWeek)
      .reduce((acc, curr) => acc + Number(curr.realProfit || 0), 0);
    const lucroMes = allFinishedOps
      .filter(op => op.createdAt >= startOfMonth)
      .reduce((acc, curr) => acc + Number(curr.realProfit || 0), 0);

    const lucroPorCategoria = periodOps.reduce((acc, curr) => {
      const cat = curr.category;
      acc[cat] = (acc[cat] || 0) + Number(curr.realProfit || 0);
      return acc;
    }, {} as Record<string, number>);

    const distribuicaoPorResultado = periodOps.reduce((acc, curr) => {
      const res = curr.result || 'UNKNOWN';
      acc[res] = (acc[res] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Fetch Atividade Recente (Small specialized query)
    const atividadeRecente = await this.prisma.operation.findMany({
      where: userFilter,
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        bets: { include: { account: { include: { bettingHouse: true } } } },
      },
    });

    const performance = await this.calculatePerformanceData(userId, role, startDate, endDate);

    const alerts: { type: 'URGENT' | 'INFO', message: string }[] = [];
    if (freebetsExpirando.length > 0) {
      alerts.push({
        type: 'URGENT',
        message: `${freebetsExpirando.length} freebet(s) expiram em menos de 24h!`
      });
    }

    if (now.getDay() === 0) {
        const clubProgress = await this.getClubProgress(userId, role) as any;
        const pendingClubs = (clubProgress.items || []).filter((c: any) => c.atual < c.meta);
        if (pendingClubs.length > 0) {
            alerts.push({
                type: 'URGENT',
                message: `Club365 encerra hoje! ${pendingClubs.length} conta(s) pendentes.`
            });
        }
    }

    const result = {
      bancaTotal, disponivel, emOperacao,
      lucroSemana, lucroMes, lucroPeriodo,
      freebetsExpirando, atividadeRecente, performance, alerts,
    };

    await this.cacheManager.set(cacheKey, result, 60); // Increased to 60s
    return result;
  }

  private async calculatePerformanceData(userId: string, role: UserRole, startDate?: string, endDate?: string) {
    const userFilter = role === UserRole.ADMIN ? {} : { userId };
    const now = new Date();

    // 1. Determine Range
    let rangeStart: Date;
    let rangeEnd = now;

    if (startDate || endDate) {
      rangeStart = startDate ? new Date(startDate) : new Date(0);
      if (endDate) rangeEnd = new Date(endDate);
    } else {
      // For default view, we need at least start of current year to satisfy all charts
      rangeStart = new Date(now.getFullYear(), 0, 1);
    }

    // 2. Single Query for ALL performance data (N+1 Fix)
    const allOps = await this.prisma.operation.findMany({
      where: { ...userFilter, status: OperationStatus.FINISHED, createdAt: { gte: rangeStart, lte: rangeEnd } },
      select: { 
        realProfit: true, 
        createdAt: true,
        bets: { select: { stake: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const processGroup = (ops: any[], filterFn: (d: Date) => boolean, labelFn: (d: Date) => string, stepFn: (d: Date) => void, start: Date, end: Date) => {
      const result: any[] = [];
      const record: Record<string, any> = {};
      
      ops.filter(op => filterFn(op.createdAt)).forEach(op => {
        const key = labelFn(op.createdAt);
        if (!record[key]) record[key] = { value: 0, count: 0, volume: 0, label: key };
        record[key].value += Number(op.realProfit || 0);
        record[key].count += 1;
        record[key].volume += op.bets.reduce((s: number, b: any) => s + Number(b.stake || 0), 0);
      });

      for (let d = new Date(start); d <= end; stepFn(d)) {
        const key = labelFn(d);
        result.push(record[key] || { label: key, value: 0, count: 0, volume: 0 });
      }
      return result;
    };

    // Custom view
    if (startDate || endDate) {
      const custom = processGroup(allOps, () => true, d => d.toISOString().split('T')[0], d => d.setUTCDate(d.getUTCDate() + 1), rangeStart, rangeEnd);
      return { weekly: custom, monthly: custom, yearly: custom, isCustom: true };
    }

    // Weekly
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    lastMonday.setHours(0,0,0,0);
    const weekly = processGroup(allOps, d => d >= lastMonday, d => d.toLocaleDateString('pt-BR', { weekday: 'short' }), d => d.setDate(d.getDate() + 1), lastMonday, now);

    // Monthly
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthly = processGroup(allOps, d => d >= monthStart, d => d.toLocaleDateString('pt-BR', { day: '2-digit' }), d => d.setDate(d.getDate() + 1), monthStart, new Date(now.getFullYear(), now.getMonth() + 1, 0));

    // Yearly (Bi-monthly)
    const yearly: any[] = [];
    for (let i = 0; i < 6; i++) {
      const m1 = i * 2;
      const m2 = i * 2 + 1;
      const label = new Date(now.getFullYear(), m1).toLocaleDateString('pt-BR', { month: 'short' }) + '-' + new Date(now.getFullYear(), m2).toLocaleDateString('pt-BR', { month: 'short' });
      const biOps = allOps.filter(op => op.createdAt.getMonth() === m1 || op.createdAt.getMonth() === m2);
      yearly.push({
        label,
        value: biOps.reduce((s, o) => s + Number(o.realProfit || 0), 0),
        count: biOps.length,
        volume: biOps.reduce((s, o) => s + o.bets.reduce((ss: number, b: any) => ss + Number(b.stake || 0), 0), 0)
      });
    }

    return { weekly, monthly, yearly };
  }

  async getClubProgress(userId: string, role: UserRole) {
    const cacheKey = `dashboard:club:${userId}:${role}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const userFilter = role === UserRole.ADMIN ? {} : { userId };
    const accounts = await this.prisma.account.findMany({
      where: { 
        cpfProfile: userFilter,
        bettingHouse: { name: { contains: '365', mode: 'insensitive' } }
      },
      include: { bettingHouse: true, cpfProfile: true }
    });

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Single Query for ALL weekly club progress (N+1 Fix)
    const activities = await this.prisma.weeklyClub.findMany({
      where: { 
        weekStart: startOfWeek,
        accountId: { in: accounts.map(a => a.id) }
      }
    });

    const items = accounts.map(acc => {
      const clubEntry = activities.find(a => a.accountId === acc.id);
      const stakValue = Number(clubEntry?.totalStake || 0);
      return {
        accountId: acc.id,
        accountName: acc.bettingHouse.name,
        profileName: acc.cpfProfile.name,
        meta: 1500,
        atual: stakValue,
        percentual: Math.min((stakValue / 1500) * 100, 100),
      };
    });

    const result = {
      items: items.sort((a, b) => b.percentual - a.percentual),
      stats: { completed: items.filter(i => i.percentual === 100).length, total: items.length }
    };

    await this.cacheManager.set(cacheKey, result, 60); 
    return result;
  }
}
