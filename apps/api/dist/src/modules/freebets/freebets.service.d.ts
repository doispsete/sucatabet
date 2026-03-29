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
            balance: import("@prisma/client-runtime-utils").Decimal;
            id: string;
            inOperation: import("@prisma/client-runtime-utils").Decimal;
        };
        operation: {
            result: import("@prisma/client").$Enums.OperationResult | null;
            id: string;
            userId: string;
            type: import("@prisma/client").$Enums.OperationType;
            description: string | null;
            status: import("@prisma/client").$Enums.OperationStatus;
            realProfit: import("@prisma/client-runtime-utils").Decimal | null;
            category: import("@prisma/client").$Enums.OperationCategory;
            expectedProfit: import("@prisma/client-runtime-utils").Decimal;
            profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
            createdAt: Date;
        } | null;
        id: string;
        userId: string;
        accountId: string;
        createdAt: Date;
        operationId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
    }[]>;
    findOne(id: string, userId: string, role: UserRole): Promise<{
        status: string;
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
            balance: import("@prisma/client-runtime-utils").Decimal;
            id: string;
            inOperation: import("@prisma/client-runtime-utils").Decimal;
        };
        operation: {
            result: import("@prisma/client").$Enums.OperationResult | null;
            id: string;
            userId: string;
            type: import("@prisma/client").$Enums.OperationType;
            description: string | null;
            status: import("@prisma/client").$Enums.OperationStatus;
            realProfit: import("@prisma/client-runtime-utils").Decimal | null;
            category: import("@prisma/client").$Enums.OperationCategory;
            expectedProfit: import("@prisma/client-runtime-utils").Decimal;
            profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
            createdAt: Date;
        } | null;
        id: string;
        userId: string;
        accountId: string;
        createdAt: Date;
        operationId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
    }>;
    create(userId: string, createFreebetDto: CreateFreebetDto): Promise<{
        status: string;
        id: string;
        userId: string;
        accountId: string;
        createdAt: Date;
        operationId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
    }>;
    update(id: string, userId: string, role: UserRole, updateFreebetDto: UpdateFreebetDto): Promise<{
        status: string;
        id: string;
        userId: string;
        accountId: string;
        createdAt: Date;
        operationId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
    }>;
    remove(id: string, userId: string, role: UserRole): Promise<{
        id: string;
        userId: string;
        accountId: string;
        createdAt: Date;
        operationId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        origin: string;
        expiresAt: Date;
        usedAt: Date | null;
    }>;
}
