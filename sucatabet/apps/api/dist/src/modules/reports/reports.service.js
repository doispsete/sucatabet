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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfitReport(userId, role, query) {
        const userFilter = (role === client_1.UserRole.ADMIN && query.userId) ? { userId: query.userId } : (role === client_1.UserRole.ADMIN ? {} : { userId });
        const startDate = query.startDate ? new Date(query.startDate) : undefined;
        const endDate = query.endDate ? new Date(query.endDate) : undefined;
        const commonWhere = {
            ...userFilter,
            status: client_1.OperationStatus.FINISHED,
            createdAt: { gte: startDate, lte: endDate },
        };
        if (['category', 'type', 'result'].includes(query.groupBy || '')) {
            const field = query.groupBy;
            const grouped = await this.prisma.operation.groupBy({
                by: [field],
                where: commonWhere,
                _sum: { realProfit: true },
            });
            return grouped.map(g => ({
                label: g[field] || 'UNKNOWN',
                profit: Number(g._sum.realProfit || 0),
            }));
        }
        const operations = await this.prisma.operation.findMany({
            where: commonWhere,
            select: {
                realProfit: true,
                bets: {
                    take: 1,
                    select: {
                        accountId: true,
                        account: {
                            select: {
                                bettingHouse: { select: { name: true } }
                            }
                        }
                    }
                }
            }
        });
        const grouped = operations.reduce((acc, op) => {
            let key = 'Other';
            const firstBet = op.bets[0];
            if (query.groupBy === 'account') {
                key = firstBet?.accountId || 'No Account';
            }
            else if (query.groupBy === 'house') {
                key = firstBet?.account.bettingHouse.name || 'No House';
            }
            acc[key] = (acc[key] || 0) + Number(op.realProfit || 0);
            return acc;
        }, {});
        return Object.entries(grouped).map(([label, profit]) => ({
            label,
            profit,
        }));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
