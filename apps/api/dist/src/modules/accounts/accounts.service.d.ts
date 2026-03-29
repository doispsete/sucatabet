import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateAccountDto, UpdateAccountDto, AmountDto } from './dto/account.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole, Prisma } from '@prisma/client';
export declare class AccountsService {
    private prisma;
    private auditLogs;
    private cacheManager;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService, cacheManager: Cache);
    private clearUserDashboardCache;
    findAll(userId: string, role: UserRole): Promise<({
        cpfProfile: {
            id: string;
            cpf: string;
            name: string;
            userId: string;
        };
        bettingHouse: {
            id: string;
            name: string;
            domain: string | null;
            logoUrl: string | null;
        };
    } & {
        id: string;
        balance: Prisma.Decimal;
        inOperation: Prisma.Decimal;
        cpfProfileId: string;
        bettingHouseId: string;
    })[]>;
    findOne(id: string, userId: string, role: UserRole): Promise<{
        cpfProfile: {
            id: string;
            cpf: string;
            name: string;
            userId: string;
        };
        bettingHouse: {
            id: string;
            name: string;
            domain: string | null;
            logoUrl: string | null;
        };
    } & {
        id: string;
        balance: Prisma.Decimal;
        inOperation: Prisma.Decimal;
        cpfProfileId: string;
        bettingHouseId: string;
    }>;
    create(userId: string, role: UserRole, createAccountDto: CreateAccountDto): Promise<{
        id: string;
        balance: Prisma.Decimal;
        inOperation: Prisma.Decimal;
        cpfProfileId: string;
        bettingHouseId: string;
    }>;
    deposit(id: string, userId: string, role: UserRole, amountDto: AmountDto): Promise<{
        id: string;
        balance: Prisma.Decimal;
        inOperation: Prisma.Decimal;
        cpfProfileId: string;
        bettingHouseId: string;
    }>;
    withdraw(id: string, userId: string, role: UserRole, amountDto: AmountDto): Promise<{
        id: string;
        balance: Prisma.Decimal;
        inOperation: Prisma.Decimal;
        cpfProfileId: string;
        bettingHouseId: string;
    }>;
    update(id: string, userId: string, role: UserRole, updateAccountDto: UpdateAccountDto): Promise<{
        id: string;
        balance: Prisma.Decimal;
        inOperation: Prisma.Decimal;
        cpfProfileId: string;
        bettingHouseId: string;
    }>;
    remove(id: string, userId: string, role: UserRole): Promise<{
        id: string;
        balance: Prisma.Decimal;
        inOperation: Prisma.Decimal;
        cpfProfileId: string;
        bettingHouseId: string;
    }>;
    getHistory(id: string, userId: string, role: UserRole): Promise<({
        user: {
            name: string;
        };
    } & {
        id: string;
        action: string;
        entity: string;
        entityId: string;
        oldValue: Prisma.JsonValue | null;
        newValue: Prisma.JsonValue | null;
        executedBy: string;
        createdAt: Date;
    })[]>;
}
