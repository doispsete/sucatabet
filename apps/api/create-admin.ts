import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('sucata123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'suporte@sucatabet.com.br' },
    update: {
      password,
      role: 'ADMIN',
      status: 'ACTIVE',
      plan: 'PRO',
      approvedAt: new Date()
    },
    create: {
      email: 'suporte@sucatabet.com.br',
      password,
      name: 'Suporte Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      plan: 'PRO',
      approvedAt: new Date()
    },
  });

  console.log('Admin criado/atualizado com sucesso:', user.email);
}

main()
  .catch((e) => {
    console.error('Erro ao criar admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
