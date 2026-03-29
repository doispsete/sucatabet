import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Resetting database...')
  // Order matters for FK constraints
  await prisma.auditLog.deleteMany({})
  await prisma.bet.deleteMany({})
  await prisma.freebet.deleteMany({})
  await prisma.operation.deleteMany({})
  await prisma.weeklyClub.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.cpfProfile.deleteMany({})
  // BettingHouse and User are kept for system stability
  console.log('Database cleared (excluding Users and Houses)!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
