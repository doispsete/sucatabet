DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'User' AND tablename <> 'BettingHouse' AND tablename <> '_prisma_migrations') LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
    END LOOP;
END $$;
