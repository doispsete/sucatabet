import { OperationType, OperationStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBoost30() {
  console.log('Testing BOOST_30 creation...');
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found to test with.');
      return;
    }

    const account = await prisma.account.findFirst();
    if (!account) {
      console.log('No account found to test with.');
      return;
    }

    const op = await prisma.operation.create({
      data: {
        type: OperationType.BOOST_30,
        category: 'BOOST' as any,
        expectedProfit: 0,
        userId: user.id,
        status: OperationStatus.PENDING,
      }
    });
    console.log('Successfully created BOOST_30 operation:', op.id);

    // Test update
    await prisma.operation.update({
      where: { id: op.id },
      data: {
        description: 'Testing update'
      }
    });
    console.log('Successfully updated BOOST_30 operation.');

    // Cleanup
    await prisma.operation.delete({ where: { id: op.id } });
    console.log('Successfully cleaned up.');
  } catch (error) {
    console.error('BOOST_30 test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBoost30();
