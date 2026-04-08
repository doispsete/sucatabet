SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'Operation' AND column_name = 'type';

SELECT typname FROM pg_type 
WHERE typtype = 'e' AND typname = 'OperationType';
