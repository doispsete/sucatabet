const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function diagnose() {
  console.log('--- SucataBet Database Diagnostic (v2) ---');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not found in environment.');
    return;
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    const userCount = await prisma.user.count();
    const cpfCount = await prisma.cpfProfile.count();
    const accountCount = await prisma.account.count();
    const operationCount = await prisma.operation.count();

    console.log('\n--- Table Counts ---');
    console.log(`Users: ${userCount}`);
    console.log(`CPF Profiles: ${cpfCount}`);
    console.log(`Accounts: ${accountCount}`);
    console.log(`Operations: ${operationCount}`);

    if (cpfCount === 0 && accountCount === 0) {
      console.warn('\n⚠️  WARNING: Database tables are EMPTY. Data may have been TRUNCATED.');
    }

    console.log('\n--- Schema Sync Check ---');
    try {
      // Test if 'status' column exists in Account
      const firstAccount = await prisma.account.findFirst({
        select: { id: true, status: true }
      });
      console.log('✅ Account table has "status" column. DB is migrated.');
    } catch (e) {
      if (e.message.includes('column "status" does not exist') || e.message.includes('not available')) {
        console.error('❌ ERROR: "status" column missing in DB. Run "npx prisma migrate deploy".');
      } else {
        console.error('❌ Error checking Account status:', e.message);
      }
    }

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    if (error.stack) console.error(error.stack);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

diagnose();
