import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { BankDepositDto, BankWithdrawDto } from './dto/bank-action.dto';
import { BankTransactionType, OperationStatus, ExpenseStatus } from '@prisma/client';

@Injectable()
export class BankService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateBank(userId: string) {
    let bank = await this.prisma.bankAccount.findUnique({
      where: { userId },
    });

    if (!bank) {
      console.log(`[BankService] Criando nova conta bancária para usuário: ${userId}`);
      bank = await this.prisma.bankAccount.create({
        data: { userId },
      });
    }

    return bank;
  }

  async getSummary(userId: string, query?: { startDate?: string, endDate?: string }) {
    console.log(`[BankService] Buscando sumário bancário - Usuário: ${userId}, Query:`, query);
    const now = new Date();
    // Forçar UTC para evitar discrepâncias em ambientes Alpine Linux
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const bank = await this.getOrCreateBank(userId);

    // Define the period for Compass
    const twelveMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    let rangeStart = query?.startDate ? new Date(query.startDate) : twelveMonthsAgo;
    const rangeEnd = query?.endDate ? new Date(query.endDate) : now;

    // Se não for fornecida startDate (ou se for o filtro "all"), buscamos a primeira transação para o "Todo o Período"
    if (!query?.startDate) {
      const firstTx = await this.prisma.bankTransaction.findFirst({
        where: { bankAccountId: bank.id },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      });
      if (firstTx) rangeStart = firstTx.createdAt;
    }

    // --- Compass Data (Dynamic Period - Fixed 12 Candles) ---
    const periodTransactions = await this.prisma.bankTransaction.findMany({
      where: { 
        bankAccountId: bank.id,
        createdAt: { gte: rangeStart, lte: rangeEnd }
      },
      select: { amount: true, type: true, createdAt: true, description: true },
    });

    const monthsShort = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const monthlyCompass: any[] = [];
    
    // Sempre 12 candles independente do período
    const numBuckets = 12;
    const totalMs = rangeEnd.getTime() - rangeStart.getTime();
    const bucketDurationMs = totalMs > 0 ? totalMs / numBuckets : 0;
    const daysDiffTotal = totalMs / (1000 * 60 * 60 * 24);

    for (let i = 0; i < numBuckets; i++) {
        const bStart = new Date(rangeStart.getTime() + (i * bucketDurationMs));
        const bEnd = new Date(rangeStart.getTime() + ((i + 1) * bucketDurationMs));
        
        let label = '';
        if (daysDiffTotal <= 1.1) {
          // Fallback manual for UTC-3 if Intl fails or behaves oddly
          const dateBR = new Date(bStart.getTime() - (3 * 60 * 60 * 1000));
          label = `${String(dateBR.getUTCHours()).padStart(2, '0')}:${String(dateBR.getUTCMinutes()).padStart(2, '0')}`;
        } else if (daysDiffTotal <= 31) {
          const dateBR = new Date(bStart.getTime() - (3 * 60 * 60 * 1000));
          label = `${String(dateBR.getUTCDate()).padStart(2, '0')}/${String(dateBR.getUTCMonth() + 1).padStart(2, '0')}`;
        } else if (daysDiffTotal <= 400) {
          const dateBR = new Date(bStart.getTime() - (3 * 60 * 60 * 1000));
          label = monthsShort[dateBR.getUTCMonth()];
        } else {
          const dateBR = new Date(bStart.getTime() - (3 * 60 * 60 * 1000));
          label = `${monthsShort[dateBR.getUTCMonth()]}/${String(dateBR.getUTCFullYear()).slice(-2)}`;
        }

        const bucketTxs = periodTransactions.filter(tx => {
            const t = tx.createdAt.getTime();
            return t >= bStart.getTime() && (i === numBuckets - 1 ? t <= bEnd.getTime() : t < bEnd.getTime());
        });

        const income = bucketTxs
          .filter(tx => ['DEPOSIT', 'INCOME', 'ACCOUNT_WITHDRAW'].includes(tx.type))
          .reduce((sum, tx) => sum + Number(tx.amount), 0);
          
        const expense = bucketTxs
          .filter(tx => ['WITHDRAW', 'ACCOUNT_DEPOSIT', 'EXPENSE_PAYMENT'].includes(tx.type))
          .reduce((sum, tx) => sum + Number(tx.amount), 0);

        // Categorias por bucket
        const bucketCategoryMap: Record<string, { amount: number, type: 'INCOME' | 'EXPENSE' }> = {};
        bucketTxs.forEach(tx => {
          const isIncome = ['DEPOSIT', 'INCOME', 'ACCOUNT_WITHDRAW'].includes(tx.type);
          const catName = tx.type === 'EXPENSE_PAYMENT' ? 'Despesas' : 
                          tx.type.includes('ACCOUNT') ? 'Casas' : 'Manual';
          
          if (!bucketCategoryMap[catName]) bucketCategoryMap[catName] = { amount: 0, type: isIncome ? 'INCOME' : 'EXPENSE' };
          bucketCategoryMap[catName].amount += Number(tx.amount);
        });

        const bucketCategories = Object.entries(bucketCategoryMap).map(([name, data]) => ({
          name,
          amount: data.amount,
          type: data.type
        }));

        monthlyCompass.push({
          key: `bucket-${i}`,
          label,
          income,
          expense,
          net: income - expense,
          categories: bucketCategories
        });
    }

    // 1. Total nas casas (Betting Accounts)
    const accounts = await this.prisma.account.findMany({
      where: { cpfProfile: { userId } },
      select: { balance: true, inOperation: true },
    });

    const totalInAccounts = accounts.reduce(
      (acc, curr) => acc + Number(curr.balance) + Number(curr.inOperation),
      0,
    );

    // 2. Lucro Bruto Mensal
    const operations = await this.prisma.operation.findMany({
      where: {
        userId,
        status: OperationStatus.FINISHED,
        createdAt: { gte: startOfMonth },
      },
      select: { realProfit: true },
    });

    const monthlyGrossProfit = operations.reduce(
      (acc, curr) => acc + Number(curr.realProfit || 0),
      0,
    );

    // 3. Despesas do Mês
    const paidExpenses = await this.prisma.expense.findMany({
      where: {
        bankAccountId: bank.id,
        status: ExpenseStatus.PAID,
        lastPaidAt: { gte: startOfMonth },
      },
      select: { amount: true },
    });

    const monthlyExpenses = paidExpenses.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );

    const balance = Number(bank.balance);
    const totalPatrimony = balance + totalInAccounts;
    const monthlyNetProfit = monthlyGrossProfit - monthlyExpenses;

    const recentTransactions = await this.prisma.bankTransaction.findMany({
      where: { bankAccountId: bank.id },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    // Category calculation (simplistic based on type)
    const categoryMap: Record<string, { amount: number, type: 'INCOME' | 'EXPENSE' }> = {};
    periodTransactions.forEach(tx => {
      const isIncome = ['DEPOSIT', 'INCOME', 'ACCOUNT_WITHDRAW'].includes(tx.type);
      const catName = tx.type === 'EXPENSE_PAYMENT' ? 'Despesas' : 
                      tx.type.includes('ACCOUNT') ? 'Casas' : 'Manual';
      
      if (!categoryMap[catName]) categoryMap[catName] = { amount: 0, type: isIncome ? 'INCOME' : 'EXPENSE' };
      categoryMap[catName].amount += Number(tx.amount);
    });

    const categories = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      amount: data.amount,
      type: data.type
    }));

    // Fetch next expenses
    const nextExpenses = await this.prisma.expense.findMany({
      where: { 
        bankAccountId: bank.id,
        status: { in: [ExpenseStatus.PENDING, ExpenseStatus.OVERDUE, ExpenseStatus.PAID] }
      },
      orderBy: { nextDueAt: 'asc' },
      take: 20
    });

    return {
      balance,
      totalInAccounts,
      totalPatrimony,
      monthlyGrossProfit,
      monthlyExpenses,
      monthlyNetProfit,
      recentTransactions,
      nextExpenses,
      compassData: {
        monthly: monthlyCompass,
        categories
      }
    };
  }

  async getTransactions(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    category?: 'Despesas' | 'Casas' | 'Manual';
    mode?: 'IN' | 'OUT';
    search?: string;
  }) {
    const bank = await this.getOrCreateBank(userId);
    
    const where: any = { bankAccountId: bank.id };

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (!isNaN(start.getTime())) where.createdAt.gte = start;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          where.createdAt.lte = end;
        }
      }
    }

    if (filters?.type) {
      where.type = filters.type;
    } else if (filters?.category) {
      if (filters.category === 'Despesas') {
        where.type = 'EXPENSE_PAYMENT';
      } else if (filters.category === 'Casas') {
        where.type = { in: ['ACCOUNT_DEPOSIT', 'ACCOUNT_WITHDRAW'] };
      } else if (filters.category === 'Manual') {
        where.type = { in: ['DEPOSIT', 'WITHDRAW'] };
      }
    } else if (filters?.mode) {
      const incomeTypes = ['DEPOSIT', 'INCOME', 'ACCOUNT_WITHDRAW'];
      const expenseTypes = ['WITHDRAW', 'ACCOUNT_DEPOSIT', 'EXPENSE_PAYMENT'];
      where.type = { in: filters.mode === 'IN' ? incomeTypes : expenseTypes };
    }

    if (filters?.search) {
      where.description = { contains: filters.search, mode: 'insensitive' };
    }

    return this.prisma.bankTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async deposit(userId: string, dto: BankDepositDto) {
    const bank = await this.getOrCreateBank(userId);

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.bankTransaction.create({
        data: {
          bankAccountId: bank.id,
          amount: dto.amount,
          description: dto.description,
          type: dto.type || BankTransactionType.DEPOSIT,
          referenceType: 'manual',
        },
      });

      await tx.bankAccount.update({
        where: { id: bank.id },
        data: { balance: { increment: dto.amount } },
      });

      return transaction;
    });
  }

  async withdraw(userId: string, dto: BankWithdrawDto) {
    const bank = await this.getOrCreateBank(userId);

    if (Number(bank.balance) < dto.amount) {
      throw new BadRequestException('Saldo insuficiente no banco');
    }

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.bankTransaction.create({
        data: {
          bankAccountId: bank.id,
          amount: dto.amount,
          description: dto.description,
          type: BankTransactionType.WITHDRAW,
          referenceType: 'manual',
        },
      });

      await tx.bankAccount.update({
        where: { id: bank.id },
        data: { balance: { decrement: dto.amount } },
      });

      return transaction;
    });
  }

  async updateGoal(userId: string, goal: number) {
    const bank = await this.getOrCreateBank(userId);
    return this.prisma.bankAccount.update({
      where: { id: bank.id },
      data: { monthlyGoal: goal },
    });
  }
}
