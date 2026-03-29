import { FreebetsService } from './freebets.service';
import { CreateFreebetDto, UpdateFreebetDto } from './dto/freebet.dto';
export declare class FreebetsController {
    private readonly freebetsService;
    constructor(freebetsService: FreebetsService);
    findAll(req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    create(req: any, createFreebetDto: CreateFreebetDto): Promise<{
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
    update(id: string, req: any, updateFreebetDto: UpdateFreebetDto): Promise<{
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
    remove(id: string, req: any): Promise<{
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
