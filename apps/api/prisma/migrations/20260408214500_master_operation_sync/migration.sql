-- 1. Assegura que o valor BOOST_30 e NORMAL existem no enum OperationType
-- Nota: ALTER TYPE ADD VALUE não pode ser executado dentro de blocos de transação complexos em algumas versões,
-- mas funciona em scripts de migração do Prisma que lidam com isso.
-- Usamos uma técnica segura para adicionar sem falhar se já existir.

DO $$ 
BEGIN
    ALTER TYPE "OperationType" ADD VALUE 'BOOST_30';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    ALTER TYPE "OperationType" ADD VALUE 'NORMAL';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    ALTER TYPE "OperationType" ADD VALUE 'SUPERODDS';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
    ALTER TYPE "OperationType" ADD VALUE 'TENTATIVA_DUPLO';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Força a conversão das colunas para o tipo ENUM (evita o erro "operator does not exist: text = OperationType")
-- Isso corrige casos onde a coluna possa ter sido criada como TEXT acidentalmente.

-- Operation Table
ALTER TABLE "Operation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Operation" ALTER COLUMN "status" TYPE "OperationStatus" USING ("status"::text::"OperationStatus");
ALTER TABLE "Operation" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"OperationStatus";

ALTER TABLE "Operation" ALTER COLUMN "type" TYPE "OperationType" USING ("type"::text::"OperationType");
ALTER TABLE "Operation" ALTER COLUMN "category" TYPE "OperationCategory" USING ("category"::text::"OperationCategory");

-- Bet Table (Apenas confirmação, bet.type é String/TEXT no schema)
-- No Bets schema, type é String, então mantemos como TEXT no banco se já estiver.

-- 3. Verificação de Integridade para Expense (Prevenindo o erro fatal de 30/03)
ALTER TABLE "Expense" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Expense" ALTER COLUMN "status" TYPE "ExpenseStatus" USING ("status"::text::"ExpenseStatus");
ALTER TABLE "Expense" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"ExpenseStatus";

ALTER TABLE "Expense" ALTER COLUMN "type" TYPE "ExpenseType" USING ("type"::text::"ExpenseType");
