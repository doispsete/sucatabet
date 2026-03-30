import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { ExpenseStatus, BankTransactionType, Prisma } from '@prisma/client';
import { BankService } from '../bank/bank.service';

@Injectable()
export class ExpensesService {
  constructor(
    private prisma: PrismaService,
    private bankService: BankService,
  ) {}

  private calculateNextDueAt(dueDay: number, fromDate: Date = new Date()): Date {
    const year = fromDate.getFullYear();
    const month = fromDate.getMonth();
    
    // Inicia com o dia solicitado no mês base
    let date = new Date(year, month, dueDay, 0, 0, 0, 0);
    
    // Se o mês mudou, significa que o dia (ex: 31) não existe no mês (ex: Fevereiro)
    // Então retrocedemos para o último dia do mês pretendido
    if (date.getMonth() !== month % 12 && !(month === 11 && date.getMonth() === 0)) {
      date = new Date(year, month + 1, 0, 0, 0, 0, 0);
    }

    // Se a data já passou (ou é hoje), movemos para o próximo mês
    if (date <= fromDate) {
      const nextMonth = month + 1;
      date = new Date(year, nextMonth, dueDay, 0, 0, 0, 0);
      
      // Validação de overflow para o próximo mês
      const expectedMonth = nextMonth % 12;
      if (date.getMonth() !== expectedMonth) {
        date = new Date(year, nextMonth + 1, 0, 0, 0, 0, 0);
      }
    }
    
    return date;
  }

  async findAll(userId: string) {
    const bank = await this.bankService.getOrCreateBank(userId);
    return this.prisma.expense.findMany({
      where: { bankAccountId: bank.id },
      orderBy: { nextDueAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateExpenseDto) {
    const bank = await this.bankService.getOrCreateBank(userId);
    const nextDueAt = this.calculateNextDueAt(dto.dueDay);

    return this.prisma.expense.create({
      data: {
        bankAccountId: bank.id,
        name: dto.name,
        type: dto.type,
        amount: new Prisma.Decimal(dto.amount),
        dueDay: dto.dueDay,
        recurring: dto.recurring ?? true,
        totalOccurrences: dto.totalMonths || null,
        remainingOccurrences: dto.totalMonths || null,
        nextDueAt,
        status: ExpenseStatus.PENDING,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateExpenseDto) {
    const expense = await this.prisma.expense.findFirst({
      where: { 
        id, 
        bankAccount: { userId } 
      },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    const updateData: Prisma.ExpenseUpdateInput = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.type) updateData.type = dto.type;
    if (dto.amount !== undefined) updateData.amount = new Prisma.Decimal(dto.amount);
    if (dto.recurring !== undefined) updateData.recurring = dto.recurring;
    
    if (dto.totalMonths !== undefined) {
        updateData.totalOccurrences = dto.totalMonths;
        updateData.remainingOccurrences = dto.totalMonths;
    }

    if (dto.dueDay !== undefined && dto.dueDay !== expense.dueDay) {
      updateData.dueDay = dto.dueDay;
      updateData.nextDueAt = this.calculateNextDueAt(dto.dueDay);
    }

    return this.prisma.expense.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { 
        id, 
        bankAccount: { userId } 
      },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    return this.prisma.expense.delete({
      where: { id },
    });
  }

  async pay(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { 
        id, 
        bankAccount: { userId } 
      },
      include: { 
        bankAccount: true 
      },
    });

    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }

    if (expense.status === ExpenseStatus.PAID && !expense.recurring) {
      throw new BadRequestException('Esta despesa já foi paga');
    }

    const bank = expense.bankAccount;
    const amount = new Prisma.Decimal(expense.amount);

    if (bank.balance.lessThan(amount)) {
      throw new BadRequestException('Saldo insuficiente no banco');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Desconta do banco
      await tx.bankAccount.update({
        where: { id: bank.id },
        data: { 
          balance: { decrement: amount } 
        },
      });

      // 2. Cria transação
      const installment = expense.totalOccurrences 
        ? ` ${expense.totalOccurrences - (expense.remainingOccurrences || 0) + 1}/${expense.totalOccurrences}`
        : '';

      await tx.bankTransaction.create({
        data: {
          bankAccountId: bank.id,
          amount: amount,
          description: `Pagamento: ${expense.name}${installment}`,
          type: BankTransactionType.EXPENSE_PAYMENT,
          referenceId: expense.id,
          referenceType: 'expense',
        },
      });

      // 3. Atualiza despesa
      if (expense.recurring) {
        let remaining = expense.remainingOccurrences;
        let isStillRecurring = true;

        if (remaining !== null) {
          remaining -= 1;
          if (remaining <= 0) {
            isStillRecurring = false;
            remaining = 0;
          }
        }

        const nextDue = this.calculateNextDueAt(expense.dueDay, expense.nextDueAt);
        return tx.expense.update({
          where: { id },
          data: {
            status: ExpenseStatus.PAID,
            lastPaidAt: new Date(),
            nextDueAt: nextDue,
            remainingOccurrences: remaining,
            recurring: isStillRecurring,
          },
        });
      } else {
        // Se não for recorrente, marca como PAGO definitiva
        return tx.expense.update({
          where: { id },
          data: {
            status: ExpenseStatus.PAID,
            lastPaidAt: new Date(),
          },
        });
      }
    });
  }
}
