import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        status: true,
        role: true,
        approvedAt: true,
      },
      orderBy: { email: 'asc' },
    });
    
    console.log('--- Relatório de Usuários ---');
    users.forEach(u => {
      console.log(`Email: ${u.email} | Status: ${u.status} | Role: ${u.role} | ApprovedAt: ${u.approvedAt}`);
    });
    console.log('---------------------------');
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
