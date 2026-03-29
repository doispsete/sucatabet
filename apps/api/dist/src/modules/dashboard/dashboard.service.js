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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async getSummary(userId, role, startDate, endDate) {
        const cacheKey = `dashboard:vFinal:summary:${userId}:${role}:${startDate || 'none'}:${endDate || 'none'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const userFilter = role === client_1.UserRole.ADMIN ? {} : { userId };
        const accountFilter = role === client_1.UserRole.ADMIN ? {} : { cpfProfile: { userId } };
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const dateFilter = {};
        if (startDate)
            dateFilter.gte = new Date(startDate);
        if (endDate)
            dateFilter.lte = new Date(endDate);
        const [accounts, allFinishedOps, freebetsExpirando] = await Promise.all([
            this.prisma.account.findMany({
                where: accountFilter,
                select: { balance: true, inOperation: true },
            }),
            this.prisma.operation.findMany({
                where: {
                    ...userFilter,
                    status: client_1.OperationStatus.FINISHED,
                    createdAt: { gte: startDate ? new Date(startDate) : startOfMonth }
                },
                select: { realProfit: true, category: true, result: true, createdAt: true },
            }),
            this.prisma.freebet.findMany({
                where: {
                    ...userFilter,
                    usedAt: null,
                    expiresAt: {
                        gt: now,
                        lt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
                include: { account: { include: { bettingHouse: true } } },
                take: 5,
            })
        ]);
        const disponivel = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0);
        const emOperacao = accounts.reduce((acc, curr) => acc + Number(curr.inOperation), 0);
        const bancaTotal = disponivel + emOperacao;
        const periodOps = startDate || endDate
            ? allFinishedOps.filter(op => {
                const d = op.createdAt.getTime();
                return (!dateFilter.gte || d >= dateFilter.gte.getTime()) &&
                    (!dateFilter.lte || d <= dateFilter.lte.getTime());
            })
            : allFinishedOps;
        const lucroPeriodo = periodOps.reduce((acc, curr) => acc + Number(curr.realProfit || 0), 0);
        const lucroSemana = allFinishedOps
            .filter(op => op.createdAt >= startOfWeek)
            .reduce((acc, curr) => acc + Number(curr.realProfit || 0), 0);
        const lucroMes = allFinishedOps
            .filter(op => op.createdAt >= startOfMonth)
            .reduce((acc, curr) => acc + Number(curr.realProfit || 0), 0);
        const lucroPorCategoria = periodOps.reduce((acc, curr) => {
            const cat = curr.category;
            acc[cat] = (acc[cat] || 0) + Number(curr.realProfit || 0);
            return acc;
        }, {});
        const distribuicaoPorResultado = periodOps.reduce((acc, curr) => {
            const res = curr.result || 'UNKNOWN';
            acc[res] = (acc[res] || 0) + 1;
            return acc;
        }, {});
        const atividadeRecente = await this.prisma.operation.findMany({
            where: userFilter,
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                bets: { include: { account: { include: { bettingHouse: true } } } },
            },
        });
        const performance = await this.calculatePerformanceData(userId, role, startDate, endDate);
        const alerts = [];
        if (freebetsExpirando.length > 0) {
            alerts.push({
                type: 'URGENT',
                message: `${freebetsExpirando.length} freebet(s) expiram em menos de 24h!`
            });
        }
        if (now.getDay() === 0) {
            const clubProgress = await this.getClubProgress(userId, role);
            const pendingClubs = (clubProgress.items || []).filter((c) => c.atual < c.meta);
            if (pendingClubs.length > 0) {
                alerts.push({
                    type: 'URGENT',
                    message: `Club365 encerra hoje! ${pendingClubs.length} conta(s) pendentes.`
                });
            }
        }
        const result = {
            bancaTotal, disponivel, emOperacao,
            lucroSemana, lucroMes, lucroPeriodo,
            freebetsExpirando, atividadeRecente, performance, alerts,
        };
        await this.cacheManager.set(cacheKey, result, 60);
        return result;
    }
    async calculatePerformanceData(userId, role, startDate, endDate) {
        const userFilter = role === client_1.UserRole.ADMIN ? {} : { userId };
        const now = new Date();
        let rangeStart;
        let rangeEnd = now;
        if (startDate || endDate) {
            rangeStart = startDate ? new Date(startDate) : new Date(0);
            if (endDate)
                rangeEnd = new Date(endDate);
        }
        else {
            rangeStart = new Date(now.getFullYear(), 0, 1);
        }
        const allOps = await this.prisma.operation.findMany({
            where: { ...userFilter, status: client_1.OperationStatus.FINISHED, createdAt: { gte: rangeStart, lte: rangeEnd } },
            select: {
                realProfit: true,
                createdAt: true,
                bets: { select: { stake: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        const processGroup = (ops, filterFn, labelFn, stepFn, start, end, fullDateFn) => {
            const result = [];
            const record = {};
            ops.filter(op => filterFn(op.createdAt)).forEach(op => {
                const key = labelFn(op.createdAt);
                const fullDate = fullDateFn ? fullDateFn(op.createdAt) : op.createdAt.toISOString().split('T')[0];
                if (!record[key])
                    record[key] = { value: 0, count: 0, volume: 0, label: key, fullDate };
                record[key].value += Number(op.realProfit || 0);
                record[key].count += 1;
                record[key].volume += op.bets.reduce((s, b) => s + Number(b.stake || 0), 0);
            });
            for (let d = new Date(start); d <= end; stepFn(d)) {
                const key = labelFn(d);
                const fullDate = fullDateFn ? fullDateFn(d) : d.toISOString().split('T')[0];
                result.push(record[key] || { label: key, value: 0, count: 0, volume: 0, fullDate });
            }
            return result;
        };
        if (startDate || endDate) {
            const custom = processGroup(allOps, () => true, d => d.toISOString().split('T')[0], d => d.setUTCDate(d.getUTCDate() + 1), rangeStart, rangeEnd);
            return { weekly: custom, monthly: custom, yearly: custom, isCustom: true };
        }
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        lastMonday.setHours(0, 0, 0, 0);
        const weekly = processGroup(allOps, d => d >= lastMonday, d => d.toLocaleDateString('pt-BR', { weekday: 'short' }), d => d.setDate(d.getDate() + 1), lastMonday, now, d => d.toISOString().split('T')[0]);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthly = processGroup(allOps, d => d >= monthStart, d => d.toLocaleDateString('pt-BR', { day: '2-digit' }), d => d.setDate(d.getDate() + 1), monthStart, new Date(now.getFullYear(), now.getMonth() + 1, 0), d => d.toISOString().split('T')[0]);
        const yearly = [];
        for (let i = 0; i < 6; i++) {
            const m1 = i * 2;
            const m2 = i * 2 + 1;
            const label = new Date(now.getFullYear(), m1).toLocaleDateString('pt-BR', { month: 'short' }) + '-' + new Date(now.getFullYear(), m2).toLocaleDateString('pt-BR', { month: 'short' });
            const biOps = allOps.filter(op => op.createdAt.getMonth() === m1 || op.createdAt.getMonth() === m2);
            yearly.push({
                label,
                value: biOps.reduce((s, o) => s + Number(o.realProfit || 0), 0),
                count: biOps.length,
                volume: biOps.reduce((s, o) => s + o.bets.reduce((ss, b) => ss + Number(b.stake || 0), 0), 0)
            });
        }
        return { weekly, monthly, yearly };
    }
    async getClubProgress(userId, role) {
        const cacheKey = `dashboard:club:${userId}:${role}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const userFilter = role === client_1.UserRole.ADMIN ? {} : { userId };
        const accounts = await this.prisma.account.findMany({
            where: {
                cpfProfile: userFilter,
                bettingHouse: { name: { contains: '365', mode: 'insensitive' } }
            },
            include: { bettingHouse: true, cpfProfile: true }
        });
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);
        const activities = await this.prisma.weeklyClub.findMany({
            where: {
                weekStart: startOfWeek,
                accountId: { in: accounts.map(a => a.id) }
            }
        });
        const items = accounts.map(acc => {
            const clubEntry = activities.find(a => a.accountId === acc.id);
            const stakValue = Number(clubEntry?.totalStake || 0);
            return {
                accountId: acc.id,
                accountName: acc.bettingHouse.name,
                profileName: acc.cpfProfile.name,
                meta: 1500,
                atual: stakValue,
                percentual: Math.min((stakValue / 1500) * 100, 100),
            };
        });
        const result = {
            items: items.sort((a, b) => b.percentual - a.percentual),
            stats: { completed: items.filter(i => i.percentual === 100).length, total: items.length }
        };
        await this.cacheManager.set(cacheKey, result, 60);
        return result;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], DashboardService);
