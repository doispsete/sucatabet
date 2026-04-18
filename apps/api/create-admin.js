const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const password = await bcrypt.hash('sucata123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'suporte@sucatabet.com.br' },
      update: {
        password: password,
        role: 'ADMIN',
        status: 'ACTIVE',
        plan: 'PRO',
        approvedAt: new Date()
      },
      create: {
        email: 'suporte@sucatabet.com.br',
        password: password,
        name: 'Suporte Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        plan: 'PRO',
        approvedAt: new Date()
      },
    });

    console.log('✅ Admin criado/atualizado com sucesso:', user.email);
    console.log('Login: suporte@sucatabet.com.br');
    console.log('Senha: sucata123');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
