"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../../prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const client_1 = require("@prisma/client");
let OperationsService = class OperationsService {
    prisma;
    auditLogs;
    cacheManager;
    constructor(prisma, auditLogs, cacheManager) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
        this.cacheManager = cacheManager;
    }
    async clearUserDashboardCache(userId, role) {
        await this.cacheManager.del(`dashboard:summary:${userId}:${role}`);
        await this.cacheManager.del(`dashboard:club:${userId}:${role}`);
    }
    getEffectiveOdds(opType, betType, odds) {
        const rawO = new client_1.Prisma.Decimal(odds);
        if (betType === 'Aumento') {
            if (opType === client_1.OperationType.BOOST_25)
                return rawO.minus(1).mul(1.25).plus(1);
            if (opType === client_1.OperationType.BOOST_50)
                return rawO.minus(1).mul(1.50).plus(1);
        }
        return rawO;
    }
    getCategory(type) {
        const mapping = {
            [client_1.OperationType.NORMAL]: client_1.OperationCategory.RISCO,
            [client_1.OperationType.FREEBET_GEN]: client_1.OperationCategory.GERACAO,
            [client_1.OperationType.EXTRACAO]: client_1.OperationCategory.CONVERSAO,
            [client_1.OperationType.BOOST_25]: client_1.OperationCategory.BOOST,
            [client_1.OperationType.BOOST_50]: client_1.OperationCategory.BOOST,
            [client_1.OperationType.SUPERODDS]: client_1.OperationCategory.BOOST,
            [client_1.OperationType.TENTATIVA_DUPLO]: client_1.OperationCategory.RISCO,
        };
        return mapping[type];
    }
    async findAll(userId, role, options) {
        const { page, limit, status, startDate, endDate, search } = options;
        const skip = (page - 1) * limit;
        const where = { userId };
        if (status) {
            where.status = status;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(`${startDate}T00:00:00.000Z`);
            }
            if (endDate) {
                where.createdAt.lte = new Date(`${endDate}T23:59:59.999Z`);
            }
        }
        if (search) {
            const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const typeKeywords = {
                [client_1.OperationType.NORMAL]: ['normal'],
                [client_1.OperationType.FREEBET_GEN]: ['gerar', 'freebet', 'geracao', 'frebet'],
                [client_1.OperationType.EXTRACAO]: ['extracao', 'conversao', 'extração'],
                [client_1.OperationType.BOOST_25]: ['aumento', 'boost', '25'],
                [client_1.OperationType.BOOST_50]: ['aumento', 'boost', '50'],
                [client_1.OperationType.SUPERODDS]: ['super', 'odds'],
                [client_1.OperationType.TENTATIVA_DUPLO]: ['tentativa', 'duplo']
            };
            const matchedTypes = Object.entries(typeKeywords)
                .filter(([_, keywords]) => keywords.some(k => {
                const nk = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                return nk.includes(normalizedSearch) || normalizedSearch.includes(nk);
            }))
                .map(([type]) => type);
            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                {
                    bets: {
                        some: {
                            account: {
                                bettingHouse: {
                                    name: { contains: search, mode: 'insensitive' }
                                }
                            }
                        }
                    }
                },
                {
                    bets: {
                        some: {
                            account: {
                                cpfProfile: {
                                    name: { contains: search, mode: 'insensitive' }
                                }
                            }
                        }
                    }
                }
            ];
            if (matchedTypes.length > 0) {
                where.OR.push({ type: { in: matchedTypes } });
            }
        }
        const [data, total] = await Promise.all([
            this.prisma.operation.findMany({
                where,
                include: {
                    bets: {
                        include: {
                            account: {
                                include: {
                                    bettingHouse: true,
                                    cpfProfile: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.operation.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id, userId, role) {
        const operation = await this.prisma.operation.findUnique({
            where: { id },
            include: {
                bets: {
                    include: {
                        account: {
                            include: {
                                bettingHouse: true,
                                cpfProfile: true,
                            },
                        },
                    },
                },
            },
        });
        if (!operation)
            throw new common_1.NotFoundException('Operação não encontrada');
        if (role !== client_1.UserRole.ADMIN && operation.userId !== userId) {
            throw new common_1.ForbiddenException('Acesso negado a esta operação');
        }
        return operation;
    }
    async create(userId, createOperationDto) {
        const category = this.getCategory(createOperationDto.type);
        return this.prisma.$transaction(async (tx) => {
            const totalCost = createOperationDto.bets.reduce((acc, b) => {
                const stake = new client_1.Prisma.Decimal(b.stake);
                const odds = new client_1.Prisma.Decimal(b.odds);
                if (b.side?.toUpperCase() === 'LAY')
                    return acc.plus(stake.mul(odds.minus(1)));
                return acc.plus(b.type === 'Freebet' ? 0 : stake);
            }, new client_1.Prisma.Decimal(0));
            const betsToCreate = [];
            let operationExpectedProfit = new client_1.Prisma.Decimal(0);
            for (let i = 0; i < createOperationDto.bets.length; i++) {
                const betDto = createOperationDto.bets[i];
                const odds = new client_1.Prisma.Decimal(betDto.odds);
                const stake = new client_1.Prisma.Decimal(betDto.stake);
                const comm = new client_1.Prisma.Decimal(betDto.commission || 0).div(100);
                let effOdds = this.getEffectiveOdds(createOperationDto.type, betDto.type, odds);
                let betWinNet = new client_1.Prisma.Decimal(0);
                let betReturn = new client_1.Prisma.Decimal(0);
                let cost = new client_1.Prisma.Decimal(0);
                const side = (betDto.side || 'BACK').toUpperCase();
                if (side === 'LAY') {
                    betWinNet = stake.mul(new client_1.Prisma.Decimal(1).minus(comm));
                    cost = stake.mul(odds.minus(1));
                    betReturn = cost.plus(betWinNet);
                }
                else {
                    betWinNet = effOdds.minus(1).mul(stake).mul(new client_1.Prisma.Decimal(1).minus(comm));
                    const isFree = betDto.type === 'Freebet' || betDto.isBenefit;
                    cost = isFree ? new client_1.Prisma.Decimal(0) : stake;
                    betReturn = cost.plus(betWinNet);
                }
                if (i === 0) {
                    operationExpectedProfit = betReturn.minus(totalCost);
                }
                betsToCreate.push({
                    ...betDto,
                    expectedProfit: betWinNet,
                    cost
                });
            }
            const operation = await tx.operation.create({
                data: {
                    type: createOperationDto.type,
                    category,
                    expectedProfit: operationExpectedProfit,
                    description: createOperationDto.description,
                    userId,
                    status: client_1.OperationStatus.PENDING,
                },
            });
            for (const bet of betsToCreate) {
                await tx.bet.create({
                    data: {
                        odds: bet.odds,
                        stake: bet.stake,
                        cost: bet.cost,
                        expectedProfit: bet.expectedProfit,
                        side: bet.side.toUpperCase(),
                        type: bet.type,
                        operationId: operation.id,
                        accountId: bet.accountId,
                        commission: bet.commission || 0,
                        isBenefit: bet.isBenefit || false,
                    },
                });
                if (bet.cost.gt(0)) {
                    await tx.account.update({
                        where: { id: bet.accountId },
                        data: {
                            inOperation: { increment: bet.cost },
                            balance: { decrement: bet.cost },
                        },
                    });
                }
            }
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
            startOfWeek.setHours(0, 0, 0, 0);
            const stakesByAccount = {};
            for (const bet of betsToCreate) {
                stakesByAccount[bet.accountId] = (stakesByAccount[bet.accountId] || new client_1.Prisma.Decimal(0)).plus(new client_1.Prisma.Decimal(bet.stake));
            }
            const accountsInvolved = await tx.account.findMany({
                where: { id: { in: Object.keys(stakesByAccount) } },
                include: { bettingHouse: true }
            });
            for (const account of accountsInvolved) {
                if (account.bettingHouse.name.toLowerCase().includes('365')) {
                    const totalStake = stakesByAccount[account.id];
                    await tx.weeklyClub.upsert({
                        where: { accountId_weekStart: { accountId: account.id, weekStart: startOfWeek } },
                        update: { totalStake: { increment: totalStake } },
                        create: { accountId: account.id, weekStart: startOfWeek, totalStake },
                    });
                }
            }
            if (createOperationDto.freebetId) {
                await tx.freebet.update({
                    where: { id: createOperationDto.freebetId },
                    data: {
                        operationId: operation.id,
                        usedAt: new Date().toISOString()
                    }
                });
            }
            await this.auditLogs.log('CREATE', 'Operation', operation.id, userId, null, operation, tx);
            await this.clearUserDashboardCache(userId, client_1.UserRole.OPERATOR);
            return operation;
        });
    }
    async close(id, userId, role, closeDto) {
        const operation = await this.findOne(id, userId, role);
        if (operation.status !== client_1.OperationStatus.PENDING) {
            throw new common_1.BadRequestException('Apenas operações pendentes podem ser encerradas');
        }
        return this.prisma.$transaction(async (tx) => {
            const totalStaked = operation.bets.reduce((acc, b) => {
                const isF = b.type === 'Freebet' || b.isBenefit;
                if (isF)
                    return acc;
                return acc.plus(new client_1.Prisma.Decimal(b.cost));
            }, new client_1.Prisma.Decimal(0));
            const winnersCount = closeDto.winningBetIds?.length || 0;
            for (const bet of operation.bets) {
                const isWinner = closeDto.winningBetIds?.includes(bet.id);
                let payout = new client_1.Prisma.Decimal(0);
                if (isWinner) {
                    const oo = this.getEffectiveOdds(operation.type, bet.type, new client_1.Prisma.Decimal(bet.odds));
                    const os = new client_1.Prisma.Decimal(bet.stake);
                    const oc = new client_1.Prisma.Decimal(bet.commission || 0).div(100);
                    const cost = new client_1.Prisma.Decimal(bet.cost);
                    const isF = bet.type === 'Freebet' || bet.isBenefit;
                    if (bet.side?.toUpperCase() === 'BACK') {
                        if (isF) {
                            payout = os.mul(oo.minus(1)).mul(new client_1.Prisma.Decimal(1).minus(oc));
                        }
                        else {
                            payout = os.plus(os.mul(oo).minus(os).mul(new client_1.Prisma.Decimal(1).minus(oc)));
                        }
                    }
                    else {
                        payout = os.mul(new client_1.Prisma.Decimal(1).minus(oc)).plus(cost);
                    }
                }
                await tx.account.update({
                    where: { id: bet.accountId },
                    data: {
                        inOperation: { decrement: bet.cost },
                        balance: isWinner ? { increment: payout } : undefined,
                    },
                });
                if (isWinner) {
                    await tx.bet.update({
                        where: { id: bet.id },
                        data: { isWinner: true },
                    });
                }
            }
            let realProfit = closeDto.realProfit;
            if (realProfit === undefined || realProfit === null) {
                const totalPayout = operation.bets
                    .filter(b => closeDto.winningBetIds?.includes(b.id))
                    .reduce((acc, b) => {
                    const os = new client_1.Prisma.Decimal(b.stake);
                    const oo = this.getEffectiveOdds(operation.type, b.type, new client_1.Prisma.Decimal(b.odds));
                    const oc = new client_1.Prisma.Decimal(b.commission || 0).div(100);
                    const isF = b.type === 'Freebet' || b.isBenefit;
                    const cost = new client_1.Prisma.Decimal(b.cost);
                    let br = new client_1.Prisma.Decimal(0);
                    if (b.side?.toUpperCase() === 'BACK') {
                        if (isF) {
                            br = os.mul(oo.minus(1)).mul(new client_1.Prisma.Decimal(1).minus(oc));
                        }
                        else {
                            br = os.plus(os.mul(oo).minus(os).mul(new client_1.Prisma.Decimal(1).minus(oc)));
                        }
                    }
                    else {
                        br = os.mul(new client_1.Prisma.Decimal(1).minus(oc)).plus(cost);
                    }
                    return acc.plus(br);
                }, new client_1.Prisma.Decimal(0));
                realProfit = totalPayout.minus(totalStaked);
                console.log(`[BACKEND SETTLEMENT]`, { totalPayout: totalPayout.toNumber(), totalStaked: totalStaked.toNumber(), realProfit: realProfit.toNumber() });
            }
            const updated = await tx.operation.update({
                where: { id },
                data: {
                    status: closeDto.status,
                    realProfit,
                    result: closeDto.result,
                    profitDifference: new client_1.Prisma.Decimal(realProfit).minus(new client_1.Prisma.Decimal(operation.expectedProfit)),
                },
            });
            await this.auditLogs.log('CLOSE', 'Operation', id, userId, operation, updated, tx);
            await this.clearUserDashboardCache(userId, role);
            return updated;
        });
    }
    async void(id, userId, role) {
        const operation = await this.findOne(id, userId, role);
        if (operation.status !== client_1.OperationStatus.PENDING) {
            throw new common_1.BadRequestException('Apenas operações pendentes podem ser anuladas');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.operation.update({
                where: { id },
                data: { status: client_1.OperationStatus.VOID },
            });
            for (const bet of operation.bets) {
                await tx.account.update({
                    where: { id: bet.accountId },
                    data: {
                        inOperation: { decrement: bet.cost },
                        balance: { increment: bet.cost },
                    },
                });
            }
            await this.auditLogs.log('VOID', 'Operation', id, userId, operation, updated, tx);
            await this.clearUserDashboardCache(userId, role);
            return updated;
        });
    }
    async remove(id, userId, role) {
        const operation = await this.findOne(id, userId, role);
        if (operation.status !== client_1.OperationStatus.PENDING) {
            throw new common_1.BadRequestException('Não é possível remover uma operação fechada ou anulada');
        }
        return this.prisma.$transaction(async (tx) => {
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
            startOfWeek.setHours(0, 0, 0, 0);
            for (const bet of operation.bets) {
                await tx.account.update({
                    where: { id: bet.accountId },
                    data: {
                        inOperation: { decrement: bet.cost },
                        balance: { increment: bet.cost },
                    },
                });
                const is365 = bet.account?.bettingHouse?.name?.toLowerCase().includes('365');
                if (is365) {
                    await tx.weeklyClub.update({
                        where: { accountId_weekStart: { accountId: bet.accountId, weekStart: startOfWeek } },
                        data: { totalStake: { decrement: bet.stake } }
                    }).catch(() => null);
                }
            }
            await tx.bet.deleteMany({ where: { operationId: id } });
            const deleted = await tx.operation.delete({ where: { id } });
            await this.auditLogs.log('DELETE', 'Operation', id, userId, operation, null, tx);
            await this.clearUserDashboardCache(userId, role);
            return deleted;
        });
    }
    async update(id, userId, role, updateDto) {
        const existingOperation = await this.findOne(id, userId, role);
        if (existingOperation.status !== client_1.OperationStatus.PENDING) {
            throw new common_1.BadRequestException('Apenas operações pendentes podem ser editadas');
        }
        const category = this.getCategory(updateDto.type);
        return this.prisma.$transaction(async (tx) => {
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
            startOfWeek.setHours(0, 0, 0, 0);
            for (const bet of existingOperation.bets) {
                await tx.account.update({
                    where: { id: bet.accountId },
                    data: {
                        inOperation: { decrement: bet.cost },
                        balance: { increment: bet.cost },
                    },
                });
                const is365 = bet.account?.bettingHouse?.name?.toLowerCase().includes('365');
                if (is365) {
                    await tx.weeklyClub.update({
                        where: { accountId_weekStart: { accountId: bet.accountId, weekStart: startOfWeek } },
                        data: { totalStake: { decrement: bet.stake } }
                    }).catch(() => null);
                }
            }
            await tx.bet.deleteMany({ where: { operationId: id } });
            const totalCost = updateDto.bets.reduce((acc, b) => {
                const stake = new client_1.Prisma.Decimal(b.stake);
                const odds = new client_1.Prisma.Decimal(b.odds);
                if (b.side?.toUpperCase() === 'LAY')
                    return acc.plus(stake.mul(odds.minus(1)));
                return acc.plus(b.type === 'Freebet' ? 0 : stake);
            }, new client_1.Prisma.Decimal(0));
            const betsToCreate = [];
            let operationExpectedProfit = new client_1.Prisma.Decimal(0);
            for (let i = 0; i < updateDto.bets.length; i++) {
                const betDto = updateDto.bets[i];
                const odds = new client_1.Prisma.Decimal(betDto.odds);
                const stake = new client_1.Prisma.Decimal(betDto.stake);
                const comm = new client_1.Prisma.Decimal(betDto.commission || 0).div(100);
                let effOdds = this.getEffectiveOdds(updateDto.type, betDto.type, odds);
                let betWinNet = new client_1.Prisma.Decimal(0);
                let betReturn = new client_1.Prisma.Decimal(0);
                let cost = new client_1.Prisma.Decimal(0);
                const side = (betDto.side || 'BACK').toUpperCase();
                if (side === 'LAY') {
                    betWinNet = stake.mul(new client_1.Prisma.Decimal(1).minus(comm));
                    cost = stake.mul(odds.minus(1));
                    betReturn = cost.plus(betWinNet);
                }
                else {
                    betWinNet = effOdds.minus(1).mul(stake).mul(new client_1.Prisma.Decimal(1).minus(comm));
                    const isFree = betDto.type === 'Freebet' || betDto.isBenefit;
                    cost = isFree ? new client_1.Prisma.Decimal(0) : stake;
                    betReturn = cost.plus(betWinNet);
                }
                if (i === 0) {
                    operationExpectedProfit = betReturn.minus(totalCost);
                }
                betsToCreate.push({
                    ...betDto,
                    expectedProfit: betWinNet,
                    cost
                });
            }
            const accountsToUpdateInClub = new Set();
            for (const bet of betsToCreate) {
                await tx.bet.create({
                    data: {
                        odds: bet.odds,
                        stake: bet.stake,
                        cost: bet.cost,
                        expectedProfit: bet.expectedProfit,
                        side: bet.side.toUpperCase(),
                        type: bet.type,
                        operationId: id,
                        accountId: bet.accountId,
                        commission: bet.commission || 0,
                        isBenefit: bet.isBenefit || false,
                    },
                });
                if (bet.cost.gt(0)) {
                    await tx.account.update({
                        where: { id: bet.accountId },
                        data: {
                            inOperation: { increment: bet.cost },
                            balance: { decrement: bet.cost },
                        },
                    });
                }
                accountsToUpdateInClub.add(bet.accountId);
            }
            const accountsInvolved = await tx.account.findMany({
                where: { id: { in: Array.from(accountsToUpdateInClub) } },
                include: { bettingHouse: true }
            });
            for (const account of accountsInvolved) {
                if (account.bettingHouse.name.toLowerCase().includes('365')) {
                    const totalStakeForAccount = betsToCreate
                        .filter(b => b.accountId === account.id)
                        .reduce((sum, b) => sum.plus(new client_1.Prisma.Decimal(b.stake)), new client_1.Prisma.Decimal(0));
                    await tx.weeklyClub.upsert({
                        where: { accountId_weekStart: { accountId: account.id, weekStart: startOfWeek } },
                        update: { totalStake: { increment: totalStakeForAccount } },
                        create: { accountId: account.id, weekStart: startOfWeek, totalStake: totalStakeForAccount },
                    });
                }
            }
            const updated = await tx.operation.update({
                where: { id },
                data: {
                    type: updateDto.type,
                    category,
                    expectedProfit: operationExpectedProfit,
                    description: updateDto.description,
                },
            });
            await this.auditLogs.log('UPDATE', 'Operation', id, userId, existingOperation, updated, tx);
            await this.clearUserDashboardCache(userId, role);
            return updated;
        });
    }
};
exports.OperationsService = OperationsService;
exports.OperationsService = OperationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService, Object])
], OperationsService);
