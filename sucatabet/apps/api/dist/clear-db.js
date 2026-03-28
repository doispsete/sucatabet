"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Resetting database...');
    await prisma.auditLog.deleteMany({});
    await prisma.bet.deleteMany({});
    await prisma.freebet.deleteMany({});
    await prisma.operation.deleteMany({});
    await prisma.weeklyClub.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.cpfProfile.deleteMany({});
    console.log('Database cleared (excluding Users and Houses)!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
