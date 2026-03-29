import { FreebetsService } from './freebets.service';
import { CreateFreebetDto, UpdateFreebetDto } from './dto/freebet.dto';
export declare class FreebetsController {
    private readonly freebetsService;
    constructor(freebetsService: FreebetsService);
    findAll(req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    create(req: any, createFreebetDto: CreateFreebetDto): Promise<{
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
    update(id: string, req: any, updateFreebetDto: UpdateFreebetDto): Promise<{
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
    remove(id: string, req: any): Promise<{
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
