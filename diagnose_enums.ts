import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- OperationType Enum ---');
    const typeValues = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE typname = 'OperationType'
    `;
    console.log(JSON.stringify(typeValues, null, 2));

    console.log('\n--- OperationCategory Enum ---');
    const categoryValues = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE typname = 'OperationCategory'
    `;
    console.log(JSON.stringify(categoryValues, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
