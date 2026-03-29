import { CalculatorService } from './calculator.service';
export declare class CalculatorController {
    private readonly calculatorService;
    constructor(calculatorService: CalculatorService);
    calculateSurebet(data: {
        totalStake: number;
        odds: number[];
    }): {
        stakes: number[];
        profitPercent: number;
        expectedProfit: number;
        isArbitrage: boolean;
    };
    calculateROI(data: {
        stake: number;
        profit: number;
    }): {
        roi: number;
    };
}
