"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
    const saltRounds = 12;
    console.log('--- INICIANDO RESET TOTAL DA DATABASE ---');
    console.log('Limpando tabelas...');
    try {
        await prisma.auditLog.deleteMany({});
        await prisma.weeklyClub.deleteMany({});
        await prisma.bet.deleteMany({});
        await prisma.operation.deleteMany({});
        await prisma.freebet.deleteMany({});
        await prisma.account.deleteMany({});
        await prisma.cpfProfile.deleteMany({});
        await prisma.bettingHouse.deleteMany({});
        await prisma.user.deleteMany({});
    }
    catch (error) {
        console.warn('Alerta na limpeza (vazio ou erro):', error.message);
    }
    console.log('Tabelas limpas. Criando acessos padrão...');
    const adminPassword = await bcrypt.hash('Admin@2024', saltRounds);
    await prisma.user.create({
        data: {
            email: 'admin@sucatabet.com',
            password: adminPassword,
            name: 'ADMINISTRADOR',
            role: UserRole.ADMIN,
        },
    });
    console.log('✓ Admin criado: admin@sucatabet.com / Admin@2024');
    const operatorPassword = await bcrypt.hash('Operador@2024', saltRounds);
    await prisma.user.create({
        data: {
            email: 'operador@sucatabet.com',
            password: operatorPassword,
            name: 'OPERADOR PADRAO',
            role: UserRole.OPERATOR,
        },
    });
    console.log('✓ Operador criado: operador@sucatabet.com / Operador@2024');
    console.log('Injetando casas de aposta padrão...');
    const houses = [
        { name: 'Bet365', domain: 'bet365.com' },
        { name: 'Betano', domain: 'betano.com.br' },
        { name: 'Stake', domain: 'stake.com' },
        { name: 'Sportingbet', domain: 'sportingbet.com' },
        { name: 'KTO', domain: 'kto.com' },
        { name: 'Pixbet', domain: 'pixbet.com' },
        { name: 'Betfair', domain: 'betfair.com' },
        { name: 'Pinnacle', domain: 'pinnacle.com' },
    ];
    for (const house of houses) {
        const houseId = house.name.toLowerCase().replace(/\s+/g, '-');
        await prisma.bettingHouse.create({
            data: {
                id: houseId,
                name: house.name,
                domain: house.domain,
                logoUrl: `https://www.google.com/s2/favicons?domain=${house.domain}&sz=128`,
            },
        });
    }
    console.log('✓ Casas de aposta injetadas.');
    console.log('--- RESET COMPLETADO COM SUCESSO ---');
}
main()
    .catch((e) => {
    console.error('ERRO NO RESET:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
