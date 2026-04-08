import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('--- Checking Operation table columns ---');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'Operation' AND column_name = 'type';
    `;
    console.log('Columns:', JSON.stringify(columns, null, 2));

    console.log('\n--- Checking OperationType enum labels ---');
    const enums = await prisma.$queryRaw`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'OperationType';
    `;
    console.log('Enums:', JSON.stringify(enums, null, 2));

  } catch (error) {
    console.error('Diagnosis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
