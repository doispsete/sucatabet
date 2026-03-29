import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ProfitReportDto } from './dto/report.dto';
import { OperationStatus, UserRole } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getProfitReport(userId: string, role: UserRole, query: ProfitReportDto) {
    const userFilter = query.userId ? { userId: query.userId } : { userId };

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const commonWhere = {
      ...userFilter,
      status: OperationStatus.FINISHED,
      createdAt: { gte: startDate, lte: endDate },
    };

    // 1. Native Fields GroupBy (Category, Type, Result) - 3A Fix
    if (['category', 'type', 'result'].includes(query.groupBy || '')) {
      const field = query.groupBy as 'category' | 'type' | 'result';
      const grouped = await this.prisma.operation.groupBy({
        by: [field],
        where: commonWhere,
        _sum: { realProfit: true },
      });

      return grouped.map(g => ({
        label: (g as any)[field] || 'UNKNOWN',
        profit: Number(g._sum.realProfit || 0),
      }));
    }

    // 2. Relation Fields (Account, House) - Optimized Load
    // We only load what's strictly necessary to avoid RAM bloat
    const operations = await this.prisma.operation.findMany({
      where: commonWhere,
      select: {
        realProfit: true,
        bets: {
          take: 1, // We only need the first bet to identify the account/house
          select: {
            accountId: true,
            account: {
              select: {
                bettingHouse: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    const grouped = operations.reduce((acc, op) => {
      let key = 'Other';
      const firstBet = op.bets[0];
      
      if (query.groupBy === 'account') {
        key = firstBet?.accountId || 'No Account';
      } else if (query.groupBy === 'house') {
        key = firstBet?.account.bettingHouse.name || 'No House';
      }

      acc[key] = (acc[key] || 0) + Number(op.realProfit || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([label, profit]) => ({
      label,
      profit,
    }));
  }
}
