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
exports.CpfProfilesService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../../prisma.service");
const client_1 = require("@prisma/client");
let CpfProfilesService = class CpfProfilesService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async clearUserDashboardCache(userId, role) {
        await this.cacheManager.del(`dashboard:summary:${userId}:${role}`);
        await this.cacheManager.del(`dashboard:club:${userId}:${role}`);
    }
    async create(userId, createCpfProfileDto) {
        const result = await this.prisma.cpfProfile.create({
            data: {
                ...createCpfProfileDto,
                userId: userId,
            },
        });
        await this.clearUserDashboardCache(userId, client_1.UserRole.OPERATOR);
        return result;
    }
    async findAll(userId, role, targetUserId) {
        const filterUserId = (role === client_1.UserRole.ADMIN && targetUserId) ? targetUserId : userId;
        return this.prisma.cpfProfile.findMany({
            where: { userId: filterUserId },
            include: {
                accounts: {
                    include: {
                        bettingHouse: true,
                    },
                },
            },
        });
    }
    async findOne(id, userId, role) {
        const profile = await this.prisma.cpfProfile.findUnique({
            where: { id },
            include: {
                accounts: {
                    include: {
                        bettingHouse: true,
                    },
                },
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Perfil de CPF não encontrado');
        }
        if (role !== client_1.UserRole.ADMIN && profile.userId !== userId) {
            throw new common_1.ForbiddenException('Acesso negado a este perfil');
        }
        return profile;
    }
    async update(id, userId, role, updateCpfProfileDto) {
        const result = await this.prisma.cpfProfile.update({
            where: { id },
            data: updateCpfProfileDto,
        });
        await this.clearUserDashboardCache(userId, role);
        return result;
    }
    async remove(id, userId, role) {
        await this.findOne(id, userId, role);
        const result = await this.prisma.cpfProfile.delete({ where: { id } });
        await this.clearUserDashboardCache(userId, role);
        return result;
    }
};
exports.CpfProfilesService = CpfProfilesService;
exports.CpfProfilesService = CpfProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], CpfProfilesService);
