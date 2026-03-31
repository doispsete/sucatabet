-- TOTAL DB SAFETY NET & RECONCILIATION MIGRATION
-- This script ensures all required tables, enums and columns exist regardless of previous drift/failures.

-- 1. ENUMS (Safe Creation via DO blocks)
DO $$ BEGIN
    CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'LIMITED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "BankTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW', 'ACCOUNT_DEPOSIT', 'ACCOUNT_WITHDRAW', 'EXPENSE_PAYMENT', 'INCOME');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ExpenseType" AS ENUM ('OPERACIONAL', 'PESSOAL', 'OPERATIONAL', 'PERSONAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABLES (Safe Creation)
CREATE TABLE IF NOT EXISTS "BankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "monthlyGoal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BankTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankAccountId" TEXT NOT NULL,
    "type" "BankTransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bankAccountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT true,
    "totalOccurrences" INTEGER,
    "remainingOccurrences" INTEGER,
    "lastPaidAt" TIMESTAMP(3),
    "nextDueAt" TIMESTAMP(3) NOT NULL,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. COLUMN UPDATES (Safe ADD/DROP)
-- Account Table
ALTER TABLE "Account" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE'::"AccountStatus";

-- User Table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'PENDING'::"UserStatus";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);

-- 4. FOREIGN KEYS (Safe Creation)
DO $$ BEGIN
    ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "Expense" ADD CONSTRAINT "Expense_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 5. DATA MIGRATIONS & CLEANUP
-- Active existing users
UPDATE "User" SET "status" = 'ACTIVE' WHERE "status"::text = 'PENDING';

-- Migrate ExpenseType labels
UPDATE "Expense" SET "type" = 'OPERACIONAL' WHERE "type"::text = 'OPERATIONAL';
UPDATE "Expense" SET "type" = 'PESSOAL' WHERE "type"::text = 'PERSONAL';

-- 6. INDICES
CREATE INDEX IF NOT EXISTS "Account_status_idx" ON "Account"("status");
CREATE INDEX IF NOT EXISTS "BankAccount_userId_idx" ON "BankAccount"("userId");
CREATE INDEX IF NOT EXISTS "BankTransaction_bankAccountId_idx" ON "BankTransaction"("bankAccountId");
CREATE INDEX IF NOT EXISTS "Expense_bankAccountId_idx" ON "Expense"("bankAccountId");
