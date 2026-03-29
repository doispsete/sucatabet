import { PrismaService } from '../../prisma.service';
import { CreateFreebetDto, UpdateFreebetDto } from './dto/freebet.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserRole } from '@prisma/client';
export declare class FreebetsService {
    private prisma;
    private auditLogs;
    constructor(prisma: PrismaService, auditLogs: AuditLogsService);
    private getStatus;
    findAll(userId: string, role: UserRole): Promise<{
        status: string;
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
            balance: import("@prisma/client-runtime-utils").Decimal;
            inOperation: import("@prisma/client-runtime-utils").Decimal;
            cpfProfileId: string;
            bettingHouseId: string;
        };
        operation: {
            result: import("@prisma/client").$Enums.OperationResult | null;
            id: string;
            userId: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.OperationType;
            category: import("@prisma/client").$Enums.OperationCategory;
            status: import("@prisma/client").$Enums.OperationStatus;
            expectedProfit: import("@prisma/client-runtime-utils").Decimal;
            realProfit: import("@prisma/client-runtime-utils").Decimal | null;
            profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
            description: string | null;
        } | null;
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
        userId: string;
        accountId: string;
        operationId: string | null;
        createdAt: Date;
    }[]>;
    findOne(id: string, userId: string, role: UserRole): Promise<{
        status: string;
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
            balance: import("@prisma/client-runtime-utils").Decimal;
            inOperation: import("@prisma/client-runtime-utils").Decimal;
            cpfProfileId: string;
            bettingHouseId: string;
        };
        operation: {
            result: import("@prisma/client").$Enums.OperationResult | null;
            id: string;
            userId: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.OperationType;
            category: import("@prisma/client").$Enums.OperationCategory;
            status: import("@prisma/client").$Enums.OperationStatus;
            expectedProfit: import("@prisma/client-runtime-utils").Decimal;
            realProfit: import("@prisma/client-runtime-utils").Decimal | null;
            profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
            description: string | null;
        } | null;
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
        userId: string;
        accountId: string;
        operationId: string | null;
        createdAt: Date;
    }>;
    create(userId: string, createFreebetDto: CreateFreebetDto): Promise<{
        status: string;
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
        userId: string;
        accountId: string;
        operationId: string | null;
        createdAt: Date;
    }>;
    update(id: string, userId: string, role: UserRole, updateFreebetDto: UpdateFreebetDto): Promise<{
        status: string;
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
        userId: string;
        accountId: string;
        operationId: string | null;
        createdAt: Date;
    }>;
    remove(id: string, userId: string, role: UserRole): Promise<{
        id: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
        userId: string;
        accountId: string;
        operationId: string | null;
        createdAt: Date;
    }>;
}
