import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('fix-db')
  async fixDb() {
    try {
      // 1. Criar Enums se não existirem
      await this.prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN 
                CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'); 
            END IF; 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserPlan') THEN 
                CREATE TYPE "UserPlan" AS ENUM ('FREE', 'BASIC', 'PRO'); 
            END IF; 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BankTransactionType') THEN 
                CREATE TYPE "BankTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'ACCOUNT_DEPOSIT', 'ACCOUNT_WITHDRAW', 'EXPENSE_PAYMENT', 'INCOME'); 
            END IF; 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExpenseType') THEN 
                CREATE TYPE "ExpenseType" AS ENUM ('OPERACIONAL', 'PESSOAL'); 
            END IF; 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExpenseStatus') THEN 
                CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE'); 
            END IF; 
        END $$;
      `);

      // 2. Tabela User
      await this.prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT \'PENDING\';');
      await this.prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" "UserPlan" NOT NULL DEFAULT \'FREE\';');
      await this.prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);');
      await this.prisma.$executeRawUnsafe('UPDATE "User" SET "status" = \'ACTIVE\' WHERE "status" = \'PENDING\';');

      // 3. Tabela BankAccount
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BankAccount" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
        );
      `);
      await this.prisma.$executeRawUnsafe('ALTER TABLE "BankAccount" ADD COLUMN IF NOT EXISTS "monthlyGoal" DECIMAL(65,30) NOT NULL DEFAULT 0;');

      // 4. Tabela BankTransaction
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BankTransaction" (
            "id" TEXT NOT NULL,
            "bankAccountId" TEXT NOT NULL,
            "amount" DECIMAL(65,30) NOT NULL,
            "description" TEXT NOT NULL,
            "referenceId" TEXT,
            "referenceType" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
        );
      `);
      await this.prisma.$executeRawUnsafe('ALTER TABLE "BankTransaction" ADD COLUMN IF NOT EXISTS "type" "BankTransactionType";');

      // 5. Tabela Expense
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Expense" (
            "id" TEXT NOT NULL,
            "bankAccountId" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "amount" DECIMAL(65,30) NOT NULL,
            "dueDay" INTEGER NOT NULL,
            "recurring" BOOLEAN NOT NULL DEFAULT true,
            "nextDueAt" TIMESTAMP(3) NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
        );
      `);
      await this.prisma.$executeRawUnsafe('ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "type" "ExpenseType";');
      await this.prisma.$executeRawUnsafe('ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "status" "ExpenseStatus" NOT NULL DEFAULT \'PENDING\';');
      await this.prisma.$executeRawUnsafe('ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "totalOccurrences" INTEGER;');
      await this.prisma.$executeRawUnsafe('ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "remainingOccurrences" INTEGER;');
      await this.prisma.$executeRawUnsafe('ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "lastPaidAt" TIMESTAMP(3);');

      // 6. Garantir BankAccount para todos (v5)
      await this.prisma.$executeRawUnsafe(`
        INSERT INTO "BankAccount" ("id", "userId", "balance", "monthlyGoal", "createdAt", "updatedAt")
        SELECT 
            'acc_' || md5(random()::text || clock_timestamp()::text), 
            u."id", 
            0, 
            0, 
            NOW(), 
            NOW()
        FROM "User" u
        WHERE NOT EXISTS (SELECT 1 FROM "BankAccount" b WHERE b."userId" = u."id");
      `);

      return { status: 'success', message: 'Correção completa aplicada (v5 - Subscription Plans added).' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
