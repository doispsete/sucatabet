-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'BASIC', 'PRO');

-- AlterEnum
BEGIN;
CREATE TYPE "ExpenseType_new" AS ENUM ('OPERACIONAL', 'PESSOAL');
ALTER TABLE "Expense" ALTER COLUMN "type" TYPE "ExpenseType_new" USING ("type"::text::"ExpenseType_new");
ALTER TYPE "ExpenseType" RENAME TO "ExpenseType_old";
ALTER TYPE "ExpenseType_new" RENAME TO "ExpenseType";
DROP TYPE "public"."ExpenseType_old";
COMMIT;

-- DropIndex
DROP INDEX "BankAccount_userId_idx";

-- DropIndex
DROP INDEX "BankTransaction_bankAccountId_idx";

-- DropIndex
DROP INDEX "Expense_bankAccountId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "UserPlan" NOT NULL DEFAULT 'FREE';
