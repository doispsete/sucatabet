-- Migração Manual de Despesas
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "totalOccurrences" INTEGER;
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "remainingOccurrences" INTEGER;

-- Salvar tipos atuais em texto temporário
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "type_text_temp" TEXT;
UPDATE "Expense" SET "type_text_temp" = "type"::text;

-- Remover dependência do enum antigo
ALTER TABLE "Expense" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Expense" ALTER COLUMN "type" TYPE TEXT USING "type"::text;

-- Deletar o enum antigo se existir (tentar ambos os nomes possíveis por drift)
DROP TYPE IF EXISTS "ExpenseType";

-- Criar o novo enum
CREATE TYPE "ExpenseType" AS ENUM ('OPERACIONAL', 'PESSOAL');

-- Atualizar valores baseados no mapeamento
UPDATE "Expense" SET "type" = 
    CASE 
        WHEN "type_text_temp" IN ('FIXADA', 'VARIAVEL', 'OPERATIONAL', 'OPERACIONAL') THEN 'OPERACIONAL'
        ELSE 'PESSOAL'
    END;

-- Converter coluna de volta para o novo enum
ALTER TABLE "Expense" ALTER COLUMN "type" TYPE "ExpenseType" USING "type"::"ExpenseType";

-- Limpar coluna temporária
ALTER TABLE "Expense" DROP COLUMN "type_text_temp";
