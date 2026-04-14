const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@sucatabet.com';
  console.log(`Upgrading ${email} to PRO...`);
  
  const user = await prisma.user.update({
    where: { email },
    data: { 
      plan: 'PRO',
      status: 'ACTIVE'
    }
  });
  
  console.log('✅ Admin Upgraded Successfully:', user.email, user.plan);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
