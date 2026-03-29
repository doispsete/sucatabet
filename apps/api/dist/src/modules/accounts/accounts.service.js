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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../../prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const client_1 = require("@prisma/client");
let AccountsService = class AccountsService {
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
    async findAll(userId, role) {
        return this.prisma.account.findMany({
            where: { cpfProfile: { userId } },
            include: {
                cpfProfile: true,
                bettingHouse: true,
            },
        });
    }
    async findOne(id, userId, role) {
        const account = await this.prisma.account.findUnique({
            where: { id },
            include: {
                cpfProfile: true,
                bettingHouse: true,
            },
        });
        if (!account)
            throw new common_1.NotFoundException('Conta não encontrada');
        if (role !== client_1.UserRole.ADMIN && account.cpfProfile.userId !== userId) {
            throw new common_1.ForbiddenException('Acesso negado a esta conta');
        }
        return account;
    }
    async create(userId, role, createAccountDto) {
        const profile = await this.prisma.cpfProfile.findUnique({
            where: { id: createAccountDto.cpfProfileId },
        });
        if (!profile || (role !== client_1.UserRole.ADMIN && profile.userId !== userId)) {
            throw new common_1.BadRequestException('Perfil de CPF inválido ou inacessível');
        }
        const existing = await this.prisma.account.findUnique({
            where: {
                cpfProfileId_bettingHouseId: {
                    cpfProfileId: createAccountDto.cpfProfileId,
                    bettingHouseId: createAccountDto.bettingHouseId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('Este CPF já possui uma conta vinculada nesta casa');
        }
        const result = await this.prisma.account.create({
            data: createAccountDto,
        });
        await this.clearUserDashboardCache(userId, client_1.UserRole.OPERATOR);
        return result;
    }
    async deposit(id, userId, role, amountDto) {
        const account = await this.findOne(id, userId, role);
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.account.update({
                where: { id },
                data: { balance: { increment: amountDto.amount } },
            });
            await this.auditLogs.log('DEPOSIT', 'Account', id, userId, { balance: new client_1.Prisma.Decimal(account.balance) }, { balance: new client_1.Prisma.Decimal(updated.balance), depositAmount: new client_1.Prisma.Decimal(amountDto.amount) }, tx);
            await this.clearUserDashboardCache(userId, role);
            return updated;
        });
    }
    async withdraw(id, userId, role, amountDto) {
        const account = await this.findOne(id, userId, role);
        if (new client_1.Prisma.Decimal(account.balance).lt(amountDto.amount)) {
            throw new common_1.BadRequestException('Saldo insuficiente para o saque');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.account.update({
                where: { id },
                data: { balance: { decrement: amountDto.amount } },
            });
            await this.auditLogs.log('WITHDRAW', 'Account', id, userId, { balance: new client_1.Prisma.Decimal(account.balance) }, { balance: new client_1.Prisma.Decimal(updated.balance), withdrawAmount: new client_1.Prisma.Decimal(amountDto.amount) }, tx);
            await this.clearUserDashboardCache(userId, role);
            return updated;
        });
    }
    async update(id, userId, role, updateAccountDto) {
        const account = await this.findOne(id, userId, role);
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.account.update({
                where: { id },
                data: updateAccountDto,
            });
            await this.auditLogs.log('UPDATE', 'Account', id, userId, { balance: Number(account.balance) }, { balance: Number(updated.balance) }, tx);
            await this.clearUserDashboardCache(userId, role);
            return updated;
        });
    }
    async remove(id, userId, role) {
        const account = await this.findOne(id, userId, role);
        await this.auditLogs.log('DELETE', 'Account', id, userId, { balance: Number(account.balance) }, null);
        const result = await this.prisma.account.delete({ where: { id } });
        await this.clearUserDashboardCache(userId, role);
        return result;
    }
    async getHistory(id, userId, role) {
        await this.findOne(id, userId, role);
        return this.prisma.auditLog.findMany({
            where: {
                entityId: id,
                entity: 'Account',
                action: { in: ['DEPOSIT', 'WITHDRAW'] },
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService, Object])
], AccountsService);
