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
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let JobsService = JobsService_1 = class JobsService {
    prisma;
    auditLogs;
    logger = new common_1.Logger(JobsService_1.name);
    constructor(prisma, auditLogs) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
    }
    async handleWeeklyReset() {
        this.logger.log('Iniciando Reset Semanal do Clube...');
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setHours(0, 0, 0, 0);
        const accounts = await this.prisma.account.findMany();
        for (const account of accounts) {
            await this.prisma.weeklyClub.create({
                data: {
                    accountId: account.id,
                    weekStart: startOfWeek,
                    totalStake: 0,
                },
            });
            await this.auditLogs.log('RESET', 'WeeklyClub', account.id, 'SYSTEM', null, { weekStart: startOfWeek });
        }
        this.logger.log('Reset Semanal concluído.');
    }
    async handleFreebetAlerts() {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const expiring = await this.prisma.freebet.findMany({
            where: {
                usedAt: null,
                expiresAt: {
                    gt: now,
                    lt: tomorrow,
                },
            },
        });
        if (expiring.length > 0) {
            this.logger.log(`Detectadas ${expiring.length} freebets expirando em breve.`);
        }
    }
    async handleWeeklyGoalAlerts() {
        this.logger.log('Verificando metas semanais...');
        const clubs = await this.prisma.weeklyClub.findMany({
            where: {
                totalStake: { lt: 1500 },
            },
            include: {
                account: {
                    include: {
                        cpfProfile: true,
                    },
                },
            },
        });
        for (const club of clubs) {
            this.logger.warn(`Conta ${club.accountId} (${club.account.cpfProfile.name}) abaixo da meta: ${club.totalStake}/1500`);
        }
    }
};
exports.JobsService = JobsService;
__decorate([
    (0, schedule_1.Cron)('0 0 * * 1'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "handleWeeklyReset", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "handleFreebetAlerts", null);
__decorate([
    (0, schedule_1.Cron)('0 20 * * 0'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JobsService.prototype, "handleWeeklyGoalAlerts", null);
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService])
], JobsService);
