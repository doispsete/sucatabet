const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const saltRounds = 12;

  console.log('--- Seeding Users ---');
  const adminPassword = await bcrypt.hash('Admin@2024', saltRounds);
  await prisma.user.upsert({
    where: { email: 'admin@sucatabet.com' },
    update: {},
    create: {
      email: 'admin@sucatabet.com',
      password: adminPassword,
      name: 'Admin Sucata',
      role: 'ADMIN',
    },
  });

  const operatorConfigs = [
    { email: 'operador1@sucatabet.com', password: 'Op1@2024', name: 'Operador 1' },
  ];

  for (const op of operatorConfigs) {
    const hashedPassword = await bcrypt.hash(op.password, saltRounds);
    await prisma.user.upsert({
      where: { email: op.email },
      update: {},
      create: {
        email: op.email,
        password: hashedPassword,
        name: op.name,
        role: 'OPERATOR',
      },
    });
  }

  console.log('--- Seeding Betting Houses ---');
  const houses = [
    { name: 'Bet365', domain: 'bet365.com' },
    { name: 'Betano', domain: 'betano.com.br' },
    { name: 'Stake', domain: 'stake.com' },
    { name: 'Sportingbet', domain: 'sportingbet.com' },
    { name: 'KTO', domain: 'kto.com' },
    { name: 'Pixbet', domain: 'pixbet.com' },
  ];

  for (const house of houses) {
    const houseId = house.name.toLowerCase().replace(/\s+/g, '-');
    await prisma.bettingHouse.upsert({
      where: { id: houseId },
      update: { domain: house.domain },
      create: {
        id: houseId,
        name: house.name,
        domain: house.domain,
        logoUrl: `https://www.google.com/s2/favicons?domain=${house.domain}&sz=128`,
      },
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
