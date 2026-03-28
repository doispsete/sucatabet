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
                    cpfProfileId: string;
                    bettingHouseId: string;
                    balance: Prisma.Decimal;
                    id: string;
                    inOperation: Prisma.Decimal;
                };
            } & {
                id: string;
                accountId: string;
                odds: Prisma.Decimal;
                stake: Prisma.Decimal;
                side: string;
                type: string;
                commission: Prisma.Decimal;
                isBenefit: boolean;
                expectedProfit: Prisma.Decimal;
                cost: Prisma.Decimal;
                operationId: string;
                isWinner: boolean;
            })[];
        } & {
            result: import("@prisma/client").$Enums.OperationResult | null;
            id: string;
            userId: string;
            type: import("@prisma/client").$Enums.OperationType;
            description: string | null;
            status: import("@prisma/client").$Enums.OperationStatus;
            realProfit: Prisma.Decimal | null;
            category: import("@prisma/client").$Enums.OperationCategory;
            expectedProfit: Prisma.Decimal;
            profitDifference: Prisma.Decimal | null;
            createdAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, userId: string, role: UserRole): Promise<{
        bets: ({
            account: {
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
                cpfProfileId: string;
                bettingHouseId: string;
                balance: Prisma.Decimal;
                id: string;
                inOperation: Prisma.Decimal;
            };
        } & {
            id: string;
            accountId: string;
            odds: Prisma.Decimal;
            stake: Prisma.Decimal;
            side: string;
            type: string;
            commission: Prisma.Decimal;
            isBenefit: boolean;
            expectedProfit: Prisma.Decimal;
            cost: Prisma.Decimal;
            operationId: string;
            isWinner: boolean;
        })[];
    } & {
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: Prisma.Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: Prisma.Decimal;
        profitDifference: Prisma.Decimal | null;
        createdAt: Date;
    }>;
    create(userId: string, createOperationDto: CreateOperationDto): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: Prisma.Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: Prisma.Decimal;
        profitDifference: Prisma.Decimal | null;
        createdAt: Date;
    }>;
    close(id: string, userId: string, role: UserRole, closeDto: CloseOperationDto): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: Prisma.Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: Prisma.Decimal;
        profitDifference: Prisma.Decimal | null;
        createdAt: Date;
    }>;
    void(id: string, userId: string, role: UserRole): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: Prisma.Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: Prisma.Decimal;
        profitDifference: Prisma.Decimal | null;
        createdAt: Date;
    }>;
    remove(id: string, userId: string, role: UserRole): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: Prisma.Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: Prisma.Decimal;
        profitDifference: Prisma.Decimal | null;
        createdAt: Date;
    }>;
}
