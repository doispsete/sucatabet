-- 1. Criar Enum UserPlan se não existir
DO $$ BEGIN
    CREATE TYPE "UserPlan" AS ENUM ('FREE', 'BASIC', 'PRO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Atualizar ExpenseType com tradução e garantir tipo ENUM
DO $$ BEGIN
    CREATE TYPE "ExpenseType_new" AS ENUM ('OPERACIONAL', 'PESSOAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Expense" ALTER COLUMN "type" TYPE "ExpenseType_new" USING (
  CASE 
    WHEN "type"::text = 'OPERATIONAL' THEN 'OPERACIONAL'::"ExpenseType_new"
    WHEN "type"::text = 'PERSONAL' THEN 'PESSOAL'::"ExpenseType_new"
    ELSE "type"::text::"ExpenseType_new"
  END
);

-- Renomear tipos para manter o padrão
DO $$ BEGIN
    ALTER TYPE "ExpenseType" RENAME TO "ExpenseType_old";
    ALTER TYPE "ExpenseType_new" RENAME TO "ExpenseType";
    DROP TYPE IF EXISTS "ExpenseType_old";
EXCEPTION
    WHEN undefined_object THEN 
        ALTER TYPE "ExpenseType_new" RENAME TO "ExpenseType";
END $$;

-- 3. Garantir que colunas críticas são ENUNS e não TEXT (Prevenção de Erro de Produção)
-- Tabela User
ALTER TABLE "User" ALTER COLUMN "role" SET DATA TYPE "UserRole" USING "role"::text::"UserRole";
ALTER TABLE "User" ALTER COLUMN "status" SET DATA TYPE "UserStatus" USING "status"::text::"UserStatus";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"UserStatus";

-- Tabela Expense status
ALTER TABLE "Expense" ALTER COLUMN "status" SET DATA TYPE "ExpenseStatus" USING "status"::text::"ExpenseStatus";
ALTER TABLE "Expense" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"ExpenseStatus";

-- 4. Adicionar coluna plan com cast explícito no default
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" "UserPlan" NOT NULL DEFAULT 'FREE'::"UserPlan";

-- 5. Limpeza de índices (Robustez)
DROP INDEX IF EXISTS "BankAccount_userId_idx";
DROP INDEX IF EXISTS "BankTransaction_bankAccountId_idx";
DROP INDEX IF EXISTS "Expense_bankAccountId_idx";
