const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// Em produção, o DATABASE_URL já está no process.env do container
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL não encontrado no ambiente do container');
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'quemateusdasilva@gmail.com';
  console.log(`\n🔍 AUDITORIA DE CPFs (PRODUÇÃO) - Usuário: ${email}`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        cpfProfiles: {
          include: {
            _count: {
              select: { accounts: true }
            }
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado em produção.');
      return;
    }

    console.log(`💎 Plano: ${user.plan}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 PERFIS DE CPF:');
    
    const profiles = user.cpfProfiles || [];
    if (profiles.length === 0) {
      console.log('Nenhum CPF cadastrado.');
    } else {
      profiles.forEach((p, i) => {
        const status = p.deletedAt ? '🔴 INATIVO' : '🟢 ATIVO';
        console.log(`${i + 1}. [${status}] ${p.name} (CPF: ${p.cpf}) - ${p._count.accounts} contas`);
      });
    }
  } catch (err) {
    console.error('Erro na auditoria:', err);
  } finally {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
