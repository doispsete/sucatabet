import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateCpfProfileDto } from './dto/create-cpf-profile.dto';
import { UpdateCpfProfileDto } from './dto/update-cpf-profile.dto';
import { UserRole } from '@prisma/client';
export declare class CpfProfilesService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    private clearUserDashboardCache;
    create(userId: string, createCpfProfileDto: CreateCpfProfileDto): Promise<{
        id: string;
        cpf: string;
        name: string;
        userId: string;
    }>;
    findAll(userId: string, role: UserRole, targetUserId?: string): Promise<({
        accounts: ({
            bettingHouse: {
                id: string;
                name: string;
                domain: string | null;
                logoUrl: string | null;
            };
        } & {
            id: string;
            balance: import("@prisma/client-runtime-utils").Decimal;
            inOperation: import("@prisma/client-runtime-utils").Decimal;
            cpfProfileId: string;
            bettingHouseId: string;
        })[];
    } & {
        id: string;
        cpf: string;
        name: string;
        userId: string;
    })[]>;
    findOne(id: string, userId: string, role: UserRole): Promise<{
        accounts: ({
            bettingHouse: {
                id: string;
                name: string;
                domain: string | null;
                logoUrl: string | null;
            };
        } & {
            id: string;
            balance: import("@prisma/client-runtime-utils").Decimal;
            inOperation: import("@prisma/client-runtime-utils").Decimal;
            cpfProfileId: string;
            bettingHouseId: string;
        })[];
    } & {
        id: string;
        cpf: string;
        name: string;
        userId: string;
    }>;
    update(id: string, userId: string, role: UserRole, updateCpfProfileDto: UpdateCpfProfileDto): Promise<{
        id: string;
        cpf: string;
        name: string;
        userId: string;
    }>;
    remove(id: string, userId: string, role: UserRole): Promise<{
        id: string;
        cpf: string;
        name: string;
        userId: string;
    }>;
}
