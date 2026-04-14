-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'BASIC', 'PRO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "plan" "UserPlan" NOT NULL DEFAULT 'FREE'::"UserPlan";

-- Limpeza de índices (Robustez)
DROP INDEX IF EXISTS "BankAccount_userId_idx";
DROP INDEX IF EXISTS "BankTransaction_bankAccountId_idx";
DROP INDEX IF EXISTS "Expense_bankAccountId_idx";
