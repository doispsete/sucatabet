-- Migrate OperationType
UPDATE "Operation" SET type = 'FREEBET_GEN' WHERE type = 'FREEBET';
UPDATE "Operation" SET type = 'NORMAL' WHERE type = 'SURREBET';
UPDATE "Operation" SET type = 'BOOST_25' WHERE type = 'BOOST';

-- Migrate OperationCategory
UPDATE "Operation" SET category = 'GERACAO' WHERE category = 'GERADOR';
UPDATE "Operation" SET category = 'CONVERSAO' WHERE category = 'CONVERSOR';
UPDATE "Operation" SET category = 'RISCO' WHERE category = 'CONTROLE';
UPDATE "Operation" SET category = 'RISCO' WHERE category = 'RISCO' AND type = 'NORMAL'; 
-- Ensure categories match types if they were inconsistent before
