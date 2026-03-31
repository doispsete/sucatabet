-- 1. Create Enums with Robustness
DO $$ BEGIN
    CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'LIMITED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Account Table (Status & Remove Soft Delete)
ALTER TABLE "Account" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE'::"AccountStatus";

-- 3. Update BankAccount Table (Fix 500 error on Dashboard)
ALTER TABLE "BankAccount" ADD COLUMN IF NOT EXISTS "monthlyGoal" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- 4. Update Expense Table (Add Missing Columns)
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "totalOccurrences" INTEGER;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "remainingOccurrences" INTEGER;

-- 5. Fix ExpenseType Enum (Renaming/Migration)
-- Migration 20260330034047 used 'OPERATIONAL'. Schema 20260331 wants 'OPERACIONAL'.
ALTER TYPE "ExpenseType" ADD VALUE IF NOT EXISTS 'OPERACIONAL';
ALTER TYPE "ExpenseType" ADD VALUE IF NOT EXISTS 'PESSOAL';

-- Migrate safely if old values exist
UPDATE "Expense" SET "type" = 'OPERACIONAL' WHERE "type"::text = 'OPERATIONAL';
UPDATE "Expense" SET "type" = 'PESSOAL' WHERE "type"::text = 'PERSONAL';

-- 6. Update User Table (Status & ApprovedAt)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'PENDING'::"UserStatus";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);

-- Active existing users so they don't get stuck in 'PENDING'
UPDATE "User" SET "status" = 'ACTIVE' WHERE "status"::text = 'PENDING';

-- 7. Indices
CREATE INDEX IF NOT EXISTS "Account_status_idx" ON "Account"("status");
