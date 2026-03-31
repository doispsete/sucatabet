import { PrismaClient } from '@prisma/client';

async function diagnose() {
  const prisma = new PrismaClient();
  console.log('--- SucataBet Database Diagnostic ---');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    // 1. Check counts
    const userCount = await prisma.user.count();
    const cpfCount = await prisma.cpfProfile.count();
    const accountCount = await prisma.account.count();
    const operationCount = await prisma.operation.count();

    console.log(`\n--- Table Counts ---`);
    console.log(`Users: ${userCount}`);
    console.log(`CPF Profiles: ${cpfCount}`);
    console.log(`Accounts: ${accountCount}`);
    console.log(`Operations: ${operationCount}`);

    if (cpfCount === 0 && accountCount === 0) {
      console.warn('\n⚠️  WARNING: CpfProfile and Account tables are EMPTY. Data may have been TRUNCATED.');
    }

    // 2. Check Schema Sync (Try to access the new 'status' column)
    console.log(`\n--- Schema Sync Check ---`);
    try {
      const firstAccount = await prisma.account.findFirst({
        select: { id: true, status: true }
      });
      console.log('✅ Account table has "status" column. Prisma Client seems synced.');
      if (firstAccount) {
          console.log(`Sample account status: ${firstAccount.status}`);
      }
    } catch (e: any) {
      if (e.message.includes('column "status" does not exist') || e.message.includes('not available')) {
        console.error('❌ ERROR: Database matches Prisma model PARTIALLY. "status" column missing in DB but exists in Model (or vice versa).');
        console.error('Action: Run "npx prisma migrate deploy" and "npx prisma generate" on the server.');
      } else {
        console.error('❌ Error checking Account status column:', e.message);
      }
    }

    // 3. Check for lingering CPFs (Unique constraint check)
    if (cpfCount > 0) {
        const sampleCpf = await prisma.cpfProfile.findFirst({ select: { cpf: true } });
        console.log(`\nSample CPF in DB: ${sampleCpf?.cpf}`);
    }

  } catch (error: any) {
    console.error('❌ Diagnostic failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
