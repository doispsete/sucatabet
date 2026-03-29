import type { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma.service';
import { CreateOperationDto, CloseOperationDto } from './dto/operation.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { OperationStatus, UserRole, Prisma } from '@prisma/client';
export declare class OperationsService {
    private prisma;
    private auditLogs;
    private cacheManager;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService, cacheManager: Cache);
    private clearUserDashboardCache;
    private getEffectiveOdds;
    private getCategory;
    findAll(userId: string, role: UserRole, options: {
        page: number;
        limit: number;
        status?: OperationStatus;
        startDate?: string;
        endDate?: string;
        search?: string;
    }): Promise<{
        data: ({
            bets: ({
                account: {
                    bettingHouse: {
                        id: string;
                        name: string;
                        domain: string | null;
                        logoUrl: string | null;
                    };
                    cpfProfile: {
                        id: string;
                        userId: string;
                        name: string;
                        cpf: string;
                    };
                } & {
                    id: string;
                    balance: Prisma.Decimal;
                    inOperation: Prisma.Decimal;
                    cpfProfileId: string;
                    bettingHouseId: string;
                };
            } & {
                id: string;
                type: string;
                expectedProfit: Prisma.Decimal;
                odds: Prisma.Decimal;
                stake: Prisma.Decimal;
                cost: Prisma.Decimal;
                side: string;
                operationId: string;
                accountId: string;
                isWinner: boolean;
                commission: Prisma.Decimal;
                isBenefit: boolean;
            })[];
        } & {
            result: import("@prisma/client").$Enums.OperationResult | null;
            id: string;
            type: import("@prisma/client").$Enums.OperationType;
            category: import("@prisma/client").$Enums.OperationCategory;
            status: import("@prisma/client").$Enums.OperationStatus;
            expectedProfit: Prisma.Decimal;
            realProfit: Prisma.Decimal | null;
            profitDifference: Prisma.Decimal | null;
            userId: string;
            description: string | null;
            createdAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, userId: string, role: UserRole): Promise<{
        bets: ({
            account: {
                bettingHouse: {
                    id: string;
                    name: string;
                    domain: string | null;
                    logoUrl: string | null;
                };
                cpfProfile: {
                    id: string;
                    userId: string;
                    name: string;
                    cpf: string;
                };
            } & {
                id: string;
                balance: Prisma.Decimal;
                inOperation: Prisma.Decimal;
                cpfProfileId: string;
                bettingHouseId: string;
            };
        } & {
            id: string;
            type: string;
            expectedProfit: Prisma.Decimal;
            odds: Prisma.Decimal;
            stake: Prisma.Decimal;
            cost: Prisma.Decimal;
            side: string;
            operationId: string;
            accountId: string;
            isWinner: boolean;
            commission: Prisma.Decimal;
            isBenefit: boolean;
        })[];
    } & {
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        type: import("@prisma/client").$Enums.OperationType;
        category: import("@prisma/client").$Enums.OperationCategory;
        status: import("@prisma/client").$Enums.OperationStatus;
        expectedProfit: Prisma.Decimal;
        realProfit: Prisma.Decimal | null;
        profitDifference: Prisma.Decimal | null;
        userId: string;
        description: string | null;
        createdAt: Date;
    }>;
    create(userId: string, createOperationDto: CreateOperationDto): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        type: import("@prisma/client").$Enums.OperationType;
        category: import("@prisma/client").$Enums.OperationCategory;
        status: import("@prisma/client").$Enums.OperationStatus;
        expectedProfit: Prisma.Decimal;
        realProfit: Prisma.Decimal | null;
        profitDifference: Prisma.Decimal | null;
        userId: string;
        description: string | null;
        createdAt: Date;
    }>;
    close(id: string, userId: string, role: UserRole, closeDto: CloseOperationDto): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        type: import("@prisma/client").$Enums.OperationType;
        category: import("@prisma/client").$Enums.OperationCategory;
        status: import("@prisma/client").$Enums.OperationStatus;
        expectedProfit: Prisma.Decimal;
        realProfit: Prisma.Decimal | null;
        profitDifference: Prisma.Decimal | null;
        userId: string;
        description: string | null;
        createdAt: Date;
    }>;
    void(id: string, userId: string, role: UserRole): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        type: import("@prisma/client").$Enums.OperationType;
        category: import("@prisma/client").$Enums.OperationCategory;
        status: import("@prisma/client").$Enums.OperationStatus;
        expectedProfit: Prisma.Decimal;
        realProfit: Prisma.Decimal | null;
        profitDifference: Prisma.Decimal | null;
        userId: string;
        description: string | null;
        createdAt: Date;
    }>;
    remove(id: string, userId: string, role: UserRole): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        type: import("@prisma/client").$Enums.OperationType;
        category: import("@prisma/client").$Enums.OperationCategory;
        status: import("@prisma/client").$Enums.OperationStatus;
        expectedProfit: Prisma.Decimal;
        realProfit: Prisma.Decimal | null;
        profitDifference: Prisma.Decimal | null;
        userId: string;
        description: string | null;
        createdAt: Date;
    }>;
    update(id: string, userId: string, role: UserRole, updateDto: CreateOperationDto): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        type: import("@prisma/client").$Enums.OperationType;
        category: import("@prisma/client").$Enums.OperationCategory;
        status: import("@prisma/client").$Enums.OperationStatus;
        expectedProfit: Prisma.Decimal;
        realProfit: Prisma.Decimal | null;
        profitDifference: Prisma.Decimal | null;
        userId: string;
        description: string | null;
        createdAt: Date;
    }>;
}
