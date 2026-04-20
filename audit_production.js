const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'quemateusdasilva@gmail.com';
  console.log(`\n🔍 AUDITORIA DE CPFS (PRODUÇÃO) - Usuário: ${email}`);
  
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
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
