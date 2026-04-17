-- Reparar conta admin caik7e@pm.me e garantir status ACTIVE e role ADMIN
-- Executar via: docker exec -i postgres psql -U postgres -d sucatabet_db < repair_admin.sql

DO $$ 
DECLARE 
    target_email TEXT := 'caik7e@pm.me';
    user_record RECORD;
BEGIN
    SELECT * INTO user_record FROM "User" WHERE email = target_email;

    IF user_record.id IS NULL THEN
        RAISE NOTICE 'Usuário % NÃO ENCONTRADO no banco de dados. Certifique-se de que o cadastro foi concluído.', target_email;
        RETURN;
    END IF;

    RAISE NOTICE 'Usuário encontrado: % (ID: %)', target_email, user_record.id;
    RAISE NOTICE 'Status atual: %, Role atual: %', user_record.status, user_record.role;

    UPDATE "User" 
    SET status = 'ACTIVE', 
        role = 'ADMIN' 
    WHERE id = user_record.id;

    RAISE NOTICE 'Usuário % atualizado para ACTIVE e ADMIN com sucesso.', target_email;
END $$;
