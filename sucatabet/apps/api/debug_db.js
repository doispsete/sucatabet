
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- BETTING HOUSES ---");
  const houses = await prisma.bettingHouse.findMany();
  houses.forEach(h => console.log(`ID: ${h.id} | Name: "${h.name}"`));

  console.log("\n--- WEEKLY CLUB ENTRIES ---");
  const clubs = await prisma.weeklyClub.findMany({
    include: {
      account: {
        include: {
          bettingHouse: true,
          cpfProfile: true
        }
      }
    }
  });
  clubs.forEach(c => {
    console.log(`Account: ${c.account.bettingHouse.name} | Profile: ${c.account.cpfProfile.name} | Stake: ${c.totalStake}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
