export declare class CalculatorService {
    calculateSurebet(totalStake: number, odds: number[]): {
        stakes: number[];
        profitPercent: number;
        expectedProfit: number;
        isArbitrage: boolean;
    };
    calculateROI(stake: number, profit: number): number;
}
