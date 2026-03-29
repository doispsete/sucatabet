-- 1. Temporary cast to text to update EVERYTHING safely
ALTER TABLE "Operation" ALTER COLUMN type TYPE text;
ALTER TABLE "Operation" ALTER COLUMN category TYPE text;

-- 2. Perform updates
UPDATE "Operation" SET type = 'FREEBET_GEN' WHERE type = 'FREEBET';
UPDATE "Operation" SET type = 'FREEBET_GEN' WHERE type = 'FREEBET_GEN_NEW';
UPDATE "Operation" SET type = 'NORMAL' WHERE type = 'SURREBET';
UPDATE "Operation" SET type = 'NORMAL' WHERE type = 'ARBITRAGEM';
UPDATE "Operation" SET type = 'BOOST_25' WHERE type = 'BOOST';

UPDATE "Operation" SET category = 'GERACAO' WHERE category = 'GERADOR';
UPDATE "Operation" SET category = 'CONVERSAO' WHERE category = 'CONVERSOR';
UPDATE "Operation" SET category = 'RISCO' WHERE category = 'CONTROLE';
UPDATE "Operation" SET category = 'RISCO' WHERE category = 'RISCO' AND type = 'NORMAL';

-- 3. Cleanup any remaining nulls or unknown values to default
UPDATE "Operation" SET type = 'NORMAL' WHERE type NOT IN ('NORMAL', 'FREEBET_GEN', 'EXTRACAO', 'BOOST_25', 'BOOST_50', 'SUPERODDS', 'TENTATIVA_DUPLO');
UPDATE "Operation" SET category = 'RISCO' WHERE category NOT IN ('GERACAO', 'CONVERSAO', 'BOOST', 'RISCO');

-- 4. Cast back to the enum types
ALTER TABLE "Operation" 
ALTER COLUMN type TYPE "OperationType" 
USING type::"OperationType";

ALTER TABLE "Operation" 
ALTER COLUMN category TYPE "OperationCategory" 
USING category::"OperationCategory";
