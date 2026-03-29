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
exports.HousesService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../../prisma.service");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let HousesService = class HousesService {
    prisma;
    auditLogs;
    cacheManager;
    constructor(prisma, auditLogs, cacheManager) {
        this.prisma = prisma;
        this.auditLogs = auditLogs;
        this.cacheManager = cacheManager;
    }
    getLogoUrl(domain) {
        if (!domain)
            return null;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    }
    async findAll() {
        const cacheKey = 'houses:all';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const houses = await this.prisma.bettingHouse.findMany({
            orderBy: { name: 'asc' },
        });
        await this.cacheManager.set(cacheKey, houses, 3600000);
        return houses;
    }
    async create(executedBy, createHouseDto) {
        const logoUrl = this.getLogoUrl(createHouseDto.domain);
        const result = await this.prisma.bettingHouse.create({
            data: {
                ...createHouseDto,
                logoUrl,
            },
        });
        await this.auditLogs.log('CREATE', 'BettingHouse', result.id, executedBy, null, result);
        await this.cacheManager.del('houses:all');
        return result;
    }
    async update(id, executedBy, updateHouseDto) {
        const house = await this.prisma.bettingHouse.findUnique({ where: { id } });
        if (!house)
            throw new common_1.NotFoundException('Casa não encontrada');
        const logoUrl = updateHouseDto.domain
            ? this.getLogoUrl(updateHouseDto.domain)
            : house.logoUrl;
        const result = await this.prisma.bettingHouse.update({
            where: { id },
            data: {
                ...updateHouseDto,
                logoUrl,
            },
        });
        await this.auditLogs.log('UPDATE', 'BettingHouse', id, executedBy, house, result);
        await this.cacheManager.del('houses:all');
        return result;
    }
    async remove(id, executedBy) {
        const house = await this.prisma.bettingHouse.findUnique({ where: { id } });
        if (!house)
            throw new common_1.NotFoundException('Casa não encontrada');
        const result = await this.prisma.bettingHouse.delete({ where: { id } });
        await this.auditLogs.log('DELETE', 'BettingHouse', id, executedBy, house, null);
        await this.cacheManager.del('houses:all');
        return result;
    }
};
exports.HousesService = HousesService;
exports.HousesService = HousesService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_logs_service_1.AuditLogsService, Object])
], HousesService);
