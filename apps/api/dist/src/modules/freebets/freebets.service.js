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
exports.FreebetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const client_1 = require("@prisma/client");
let FreebetsService = class FreebetsService {
    prisma;
    auditLogs;
    constructor(prisma, auditLogs) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
    }
    getStatus(freebet) {
        const now = new Date();
        const expiresAt = new Date(freebet.expiresAt);
        if (freebet.usedAt)
            return 'USADA';
        if (expiresAt < now)
            return 'EXPIRADA';
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (expiresAt < oneDayFromNow)
            return 'EXPIRANDO';
        return 'PENDENTE';
    }
    async findAll(userId, role) {
        const freebets = await this.prisma.freebet.findMany({
            where: role === client_1.UserRole.ADMIN ? {} : { userId },
            include: {
                account: {
                    include: {
                        bettingHouse: true,
                        cpfProfile: true,
                    },
                },
                operation: true,
            },
            orderBy: { expiresAt: 'asc' },
        });
        return freebets.map(fb => ({
            ...fb,
            status: this.getStatus(fb),
        }));
    }
    async findOne(id, userId, role) {
        const freebet = await this.prisma.freebet.findUnique({
            where: { id },
            include: {
                account: {
                    include: {
                        bettingHouse: true,
                        cpfProfile: true,
                    },
                },
                operation: true,
            },
        });
        if (!freebet)
            throw new common_1.NotFoundException('Freebet não encontrada');
        if (role !== client_1.UserRole.ADMIN && freebet.userId !== userId) {
            throw new common_1.ForbiddenException('Acesso negado a esta freebet');
        }
        return {
            ...freebet,
            status: this.getStatus(freebet),
        };
    }
    async create(userId, createFreebetDto) {
        const freebet = await this.prisma.freebet.create({
            data: {
                ...createFreebetDto,
                userId,
            },
        });
        await this.auditLogs.log('CREATE', 'Freebet', freebet.id, userId, null, freebet);
        return {
            ...freebet,
            status: this.getStatus(freebet),
        };
    }
    async update(id, userId, role, updateFreebetDto) {
        const existing = await this.findOne(id, userId, role);
        const data = { ...updateFreebetDto };
        if (data.status === 'USADA') {
            data.usedAt = new Date().toISOString();
        }
        else if (data.status === 'EXPIRADA') {
            data.expiresAt = new Date(Date.now() - 1000).toISOString();
        }
        delete data.status;
        const updated = await this.prisma.freebet.update({
            where: { id },
            data,
        });
        await this.auditLogs.log('UPDATE', 'Freebet', id, userId, existing, updated);
        return {
            ...updated,
            status: this.getStatus(updated),
        };
    }
    async remove(id, userId, role) {
        await this.findOne(id, userId, role);
        return this.prisma.freebet.delete({ where: { id } });
    }
};
exports.FreebetsService = FreebetsService;
exports.FreebetsService = FreebetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], FreebetsService);
