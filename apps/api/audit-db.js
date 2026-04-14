const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function audit() {
  try {
    console.log('--- AUDITORIA DE TIPOS DE COLUNA ---');
    
    const tables = ['User', 'Expense'];
    for (const table of tables) {
      console.log(`\nTABELA: ${table}`);
      const columns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}';
      `);
      console.table(columns);
    }

    console.log('\n--- AUDITORIA DE ENUMS NO PG ---');
    const enums = await prisma.$queryRawUnsafe(`
      SELECT typname FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname;
    `);
    console.table(enums);

    console.log('\n--- TESTE DE ENDPOINT (SELECT 1) ---');
    const user = await prisma.user.findFirst({ select: { id: true, plan: true } });
    console.log('User Sample:', user);

  } catch (error) {
    console.error('ERRO NA AUDITORIA:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

audit();
