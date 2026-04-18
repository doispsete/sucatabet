const { PrismaClient } = require('@prisma/client');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'apps/api/.env') });

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('USUARIOS ENCONTRADOS:', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
