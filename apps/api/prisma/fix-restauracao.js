const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log('--- INICIANDO RESTAURAÇÃO DE DADOS (DATABASE DIRECT) ---');
    
    // 1. Restaurar Perfis de CPF deletados hoje
    const resProfile = await client.query('UPDATE "CpfProfile" SET "deletedAt" = NULL WHERE "deletedAt" >= \'2026-04-01\'');
    console.log(`✅ Restaurados ${resProfile.rowCount} perfis de CPF.`);

    // 2. Ativar contas vinculadas a perfis ativos
    const resAccount = await client.query('UPDATE "Account" SET "status" = \'ACTIVE\' WHERE "cpfProfileId" IN (SELECT "id" FROM "CpfProfile" WHERE "deletedAt" IS NULL)');
    console.log(`✅ Ativadas ${resAccount.rowCount} contas.`);

    console.log('\n--- RESTAURAÇÃO CONCLUÍDA NO BANCO LOCAL ---');

  } catch (err) {
    console.error('❌ ERRO DURANTE A RESTAURAÇÃO:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
