import { PrismaClient } from '@prisma/client';

async function diagnose() {
  const prisma = new PrismaClient();
  console.log('--- SucataBet Database Diagnostic ---');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    // 1. Audit CPFs
    const cpfs = await prisma.cpfProfile.findMany({
      select: { 
        cpf: true, 
        deletedAt: true, 
        userId: true,
        user: { select: { email: true } }
      }
    });

    console.log(`\n--- CPF Audit (${cpfs.length} found) ---`);
    cpfs.forEach(c => {
      console.log(`CPF: ${c.cpf} | Deletado: ${!!c.deletedAt} | Dono: ${c.user?.email || 'N/A'}`);
    });

    // 2. Audit Accounts
    const accounts = await prisma.account.findMany({
        select: { id: true, status: true, cpfProfile: { select: { cpf: true } } }
    });
    console.log(`\n--- Account Audit (${accounts.length} found) ---`);
    accounts.slice(0, 10).forEach(a => {
        console.log(`ID: ${a.id} | Status: ${a.status} | CPF: ${a.cpfProfile?.cpf}`);
    });

  } catch (error: any) {
    console.error('❌ Diagnostic failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
