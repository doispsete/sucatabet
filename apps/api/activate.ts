import 'dotenv/config';
import { PrismaClient, UserStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool as any);
  const prisma = new PrismaClient({ adapter } as any);

  try {
    const user = await prisma.user.update({
      where: { email: 'admin@sucatabet.com' },
      data: { status: UserStatus.ACTIVE }
    });
    console.log('✅ Usuário admin ativado com sucesso:', user.email);
  } catch (error) {
    console.error('❌ Erro ao ativar admin:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
