const { PrismaClient, UserRole } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from apps/api/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error('ERRO: DATABASE_URL não encontrada. Certifique-se de que apps/api/.env existe.');
  process.exit(1);
}

// Replicating production-style initialization with Driver Adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const saltRounds = 12;

  console.log('--- INICIANDO SEED DA DATABASE (DEV) ---');
  console.log('Alvo:', process.env.DATABASE_URL!.split('@').pop()!.split('?')[0]);

  // Limpeza de tabelas (ordem reversa de dependência)
  console.log('Limpando dados antigos...');
  try {
    await prisma.auditLog.deleteMany({});
    await prisma.weeklyClub.deleteMany({});
    await prisma.bet.deleteMany({});
    await prisma.operation.deleteMany({});
    await prisma.freebet.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.cpfProfile.deleteMany({});
    await prisma.bettingHouse.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    // Silencia erros se as tabelas já estiverem vazias
  }

  // 1. Criar Usuário Administrador
  const adminPassword = await bcrypt.hash('Admin@2024', saltRounds);
  await prisma.user.create({
    data: {
      email: 'admin@sucatabet.com',
      password: adminPassword,
      name: 'ADMINISTRADOR LOCAL',
      role: UserRole.ADMIN,
    },
  });
  console.log('✓ Admin criado: admin@sucatabet.com / Admin@2024');

  // 2. Criar Casas de Aposta Iniciais
  console.log('Injetando casas de aposta padrão...');
  const houses = [
    { id: 'bet365', name: 'Bet365', domain: 'bet365.com' },
    { id: 'betano', name: 'Betano', domain: 'betano.com.br' },
    { id: 'stake', name: 'Stake', domain: 'stake.com' },
  ];

  for (const house of houses) {
    await prisma.bettingHouse.create({
      data: {
        id: house.id,
        name: house.name,
        domain: house.domain,
        logoUrl: `https://www.google.com/s2/favicons?domain=${house.domain}&sz=128`,
      },
    });
  }
  console.log('✓ Casas de aposta injetadas.');

  console.log('--- SEED CONCLUÍDO COM SUCESSO ---');
}

main()
  .catch((e) => {
    console.error('ERRO CRÍTICO NO SEED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
