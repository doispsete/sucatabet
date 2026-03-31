-- NEW SAFETY NET MIGRATION (V2)
-- Specifically targets missing WeeklyClub and redundant checks for Bank/Expenses.

-- 1. WeeklyClub Table (Safe Creation)
CREATE TABLE IF NOT EXISTS "WeeklyClub" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "totalStake" DECIMAL(65,30) NOT NULL DEFAULT 0.0
);

-- 2. Foreign Keys
DO $$ BEGIN
    ALTER TABLE "WeeklyClub" ADD CONSTRAINT "WeeklyClub_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Indices
CREATE INDEX IF NOT EXISTS "WeeklyClub_accountId_idx" ON "WeeklyClub"("accountId");
CREATE INDEX IF NOT EXISTS "WeeklyClub_weekStart_idx" ON "WeeklyClub"("weekStart");
DO $$ BEGIN
    CREATE UNIQUE INDEX "WeeklyClub_accountId_weekStart_key" ON "WeeklyClub"("accountId", "weekStart");
EXCEPTION WHEN duplicate_table OR duplicate_object THEN null; END $$;

-- 4. Ensure BankAccount and Expense columns are definitely there (Redundant check for safety)
ALTER TABLE "BankAccount" ADD COLUMN IF NOT EXISTS "monthlyGoal" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "totalOccurrences" INTEGER;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "remainingOccurrences" INTEGER;
