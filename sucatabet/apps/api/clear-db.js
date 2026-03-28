const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Resetting database (JS)...')
  try {
    await prisma.auditLog.deleteMany({})
    await prisma.bet.deleteMany({})
    await prisma.freebet.deleteMany({})
    await prisma.operation.deleteMany({})
    await prisma.weeklyClub.deleteMany({})
    await prisma.account.deleteMany({})
    await prisma.cpfProfile.deleteMany({})
    console.log('Database cleared (excluding Users and Houses)!')
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
