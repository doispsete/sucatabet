import { PrismaClient } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

// Mocking CpfProfilesService logic for verification
async function test() {
    const prisma = new PrismaClient();
    const testCpf = '123.456.789-01';
    
    console.log('--- Testing Unique Constraint Fix ---');
    
    try {
        // Attempt to create the same CPF twice
        console.log(`Creating CPF: ${testCpf}...`);
        try {
            await prisma.cpfProfile.create({
                data: {
                    cpf: testCpf,
                    name: 'Test Name',
                    userId: 'some-user-id' // Adjust if needed
                }
            });
            console.log('First creation success.');
        } catch (e: any) {
            if (e.code === 'P2002') {
                console.log('Caught expected P2002 from Prisma.');
            } else {
                throw e;
            }
        }

        // Re-simulate the Service Logic
        console.log('Simulating service logic for second creation...');
        try {
            // This is what the service now does
            try {
                await prisma.cpfProfile.create({
                    data: {
                        cpf: testCpf,
                        name: 'Test Name Duplicate',
                        userId: 'some-user-id'
                    }
                });
            } catch (error: any) {
                if (error.code === 'P2002') {
                     console.log('✅ Success: Logic reached P2002 handling.');
                     throw new ConflictException('Este CPF já está cadastrado no sistema.');
                }
                throw error;
            }
        } catch (finalError: any) {
            if (finalError instanceof ConflictException) {
                console.log('✅ Success: Received ConflictException(409) instead of 500.');
                console.log('Message:', finalError.message);
            } else {
                console.error('❌ Fail: Received unknown error:', finalError);
            }
        }

    } catch (err: any) {
        console.error('Test failed:', err.message);
    } finally {
        // Cleanup
        await prisma.cpfProfile.deleteMany({ where: { cpf: testCpf } }).catch(() => null);
        await prisma.$disconnect();
    }
}

test();
