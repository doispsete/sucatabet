import { OperationsService } from './operations.service';
import { CreateOperationDto, CloseOperationDto } from './dto/operation.dto';
export declare class OperationsController {
    private readonly operationsService;
    constructor(operationsService: OperationsService);
    findAll(req: any, page?: string, limit?: string, status?: string, startDate?: string, endDate?: string, search?: string): Promise<{
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
                    balance: import("@prisma/client-runtime-utils").Decimal;
                    id: string;
                    inOperation: import("@prisma/client-runtime-utils").Decimal;
                };
            } & {
                stake: import("@prisma/client-runtime-utils").Decimal;
                id: string;
                accountId: string;
                odds: import("@prisma/client-runtime-utils").Decimal;
                side: string;
                type: string;
                commission: import("@prisma/client-runtime-utils").Decimal;
                isBenefit: boolean;
                expectedProfit: import("@prisma/client-runtime-utils").Decimal;
                cost: import("@prisma/client-runtime-utils").Decimal;
                operationId: string;
                isWinner: boolean;
            })[];
        } & {
            result: import("@prisma/client").$Enums.OperationResult | null;
            id: string;
            userId: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.OperationType;
            description: string | null;
            status: import("@prisma/client").$Enums.OperationStatus;
            realProfit: import("@prisma/client-runtime-utils").Decimal | null;
            category: import("@prisma/client").$Enums.OperationCategory;
            expectedProfit: import("@prisma/client-runtime-utils").Decimal;
            profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, req: any): Promise<{
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
                balance: import("@prisma/client-runtime-utils").Decimal;
                id: string;
                inOperation: import("@prisma/client-runtime-utils").Decimal;
            };
        } & {
            stake: import("@prisma/client-runtime-utils").Decimal;
            id: string;
            accountId: string;
            odds: import("@prisma/client-runtime-utils").Decimal;
            side: string;
            type: string;
            commission: import("@prisma/client-runtime-utils").Decimal;
            isBenefit: boolean;
            expectedProfit: import("@prisma/client-runtime-utils").Decimal;
            cost: import("@prisma/client-runtime-utils").Decimal;
            operationId: string;
            isWinner: boolean;
        })[];
    } & {
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: import("@prisma/client-runtime-utils").Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: import("@prisma/client-runtime-utils").Decimal;
        profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    create(req: any, createOperationDto: CreateOperationDto): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: import("@prisma/client-runtime-utils").Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: import("@prisma/client-runtime-utils").Decimal;
        profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    update(id: string, req: any, updateDto: CreateOperationDto): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: import("@prisma/client-runtime-utils").Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: import("@prisma/client-runtime-utils").Decimal;
        profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    close(id: string, req: any, closeDto: CloseOperationDto): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: import("@prisma/client-runtime-utils").Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: import("@prisma/client-runtime-utils").Decimal;
        profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    void(id: string, req: any): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: import("@prisma/client-runtime-utils").Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: import("@prisma/client-runtime-utils").Decimal;
        profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    remove(id: string, req: any): Promise<{
        result: import("@prisma/client").$Enums.OperationResult | null;
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.OperationType;
        description: string | null;
        status: import("@prisma/client").$Enums.OperationStatus;
        realProfit: import("@prisma/client-runtime-utils").Decimal | null;
        category: import("@prisma/client").$Enums.OperationCategory;
        expectedProfit: import("@prisma/client-runtime-utils").Decimal;
        profitDifference: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
}
