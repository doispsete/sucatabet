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
      // 1. Criar Enum se não existir
      await this.prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN 
                CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'); 
            END IF; 
        END $$;
      `);

      // 2. Adicionar colunas se não existirem
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'PENDING';
      `);
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
      `);

      // 3. Ativar usuários existentes
      await this.prisma.$executeRawUnsafe(`
        UPDATE "User" SET "status" = 'ACTIVE' WHERE "status" = 'PENDING';
      `);

      // 4. Criar tabelas BankAccount, BankTransaction e Expense se não existirem
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

      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BankTransaction" (
            "id" TEXT NOT NULL,
            "bankAccountId" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "amount" DECIMAL(65,30) NOT NULL,
            "description" TEXT NOT NULL,
            "referenceId" TEXT,
            "referenceType" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
        );
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Expense" (
            "id" TEXT NOT NULL,
            "bankAccountId" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "amount" DECIMAL(65,30) NOT NULL,
            "dueDay" INTEGER NOT NULL,
            "recurring" BOOLEAN NOT NULL DEFAULT true,
            "lastPaidAt" TIMESTAMP(3),
            "nextDueAt" TIMESTAMP(3) NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
        );
      `);

      return { status: 'success', message: 'Banco de dados corrigido manualmente com todas as tabelas.' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
