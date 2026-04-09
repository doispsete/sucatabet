import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- TABLE SCHEMA: Operation ---');
    const operationCols = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'Operation';
    `;
    console.log(JSON.stringify(operationCols, null, 2));

    console.log('\n--- TABLE SCHEMA: Bet ---');
    const betCols = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'Bet';
    `;
    console.log(JSON.stringify(betCols, null, 2));

    console.log('\n--- ENUM: OperationType ---');
    const typeValues = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE typname = 'OperationType'
      ORDER BY enumlabel;
    `;
    console.log(JSON.stringify(typeValues, null, 2));

    console.log('\n--- ENUM: OperationCategory ---');
    const catValues = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE typname = 'OperationCategory'
      ORDER BY enumlabel;
    `;
    console.log(JSON.stringify(catValues, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
