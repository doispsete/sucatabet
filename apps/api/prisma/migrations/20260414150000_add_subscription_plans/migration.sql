-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'BASIC', 'PRO');

-- AlterEnum
BEGIN;
CREATE TYPE "ExpenseType_new" AS ENUM ('OPERACIONAL', 'PESSOAL');
ALTER TABLE "Expense" ALTER COLUMN "type" TYPE "ExpenseType_new" USING (
  CASE 
    WHEN "type"::text = 'OPERATIONAL' THEN 'OPERACIONAL'::"ExpenseType_new"
    WHEN "type"::text = 'PERSONAL' THEN 'PESSOAL'::"ExpenseType_new"
    ELSE "type"::text::"ExpenseType_new"
  END
);
ALTER TYPE "ExpenseType" RENAME TO "ExpenseType_old";
ALTER TYPE "ExpenseType_new" RENAME TO "ExpenseType";
DROP TYPE "public"."ExpenseType_old";
COMMIT;

-- DropIndex
DROP INDEX IF EXISTS "BankAccount_userId_idx";

-- DropIndex
DROP INDEX IF EXISTS "BankTransaction_bankAccountId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Expense_bankAccountId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "UserPlan" NOT NULL DEFAULT 'FREE';
