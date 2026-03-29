import { OperationType, OperationResult, OperationStatus } from '@prisma/client';
export declare class BetDto {
    accountId: string;
    odds: number;
    stake: number;
    side: 'BACK' | 'LAY';
    type: 'Normal' | 'Freebet' | 'Aumento';
    commission?: number;
    isBenefit?: boolean;
}
export declare class CreateOperationDto {
    type: OperationType;
    bets: BetDto[];
    freebetId?: string;
    description?: string;
}
export declare class CloseOperationDto {
    status: Array<OperationStatus> | any;
    result: OperationResult;
    winningBetIds?: string[];
    realProfit?: number;
}
