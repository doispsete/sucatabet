const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function probe() {
  console.log('🔍 Iniciando sondagem de banco de dados...');
  try {
    console.log('📡 Testando conexão...');
    await prisma.$connect();
    console.log('✅ Conectado.');

    console.log('👤 Tentando buscar 1 usuário...');
    const user = await prisma.user.findFirst();
    if (user) {
      console.log('✅ Usuário encontrado. Colunas presentes:', Object.keys(user).join(', '));
    } else {
      console.log('ℹ️ Nenhum usuário na tabela.');
    }

    console.log('📊 Tentando buscar 1 operação...');
    const op = await prisma.operation.findFirst();
    if (op) {
      console.log('✅ Operação encontrada. Colunas presentes:', Object.keys(op).join(', '));
    }

  } catch (error) {
    console.error('❌ ERRO NA SONDAGEM:', error.message);
    if (error.code) console.error('Código do erro:', error.code);
    if (error.stack) console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

probe();
