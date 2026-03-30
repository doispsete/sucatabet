UPDATE "Expense" SET type = 'OPERACIONAL' WHERE type::text = 'OPERATIONAL';
UPDATE "Expense" SET type = 'PESSOAL' WHERE type::text = 'PERSONAL';
