import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculatorService {
  /**
   * Calculates the arbitrage (Surebet) stakes.
   * @param totalStake Total amount to be bet.
   * @param odds Array of odds for each outcome.
   */
  calculateSurebet(totalStake: number, odds: number[]) {
    const individualArbitrage = odds.map(o => 1 / o);
    const totalArbitrage = individualArbitrage.reduce((a, b) => a + b, 0);
    const profit = (1 / totalArbitrage - 1) * 100;

    const stakes = individualArbitrage.map(ia => (ia / totalArbitrage) * totalStake);

    return {
      stakes: stakes.map(s => Number(s.toFixed(2))),
      profitPercent: Number(profit.toFixed(2)),
      expectedProfit: Number((totalStake * (profit / 100)).toFixed(2)),
      isArbitrage: totalArbitrage < 1
    };
  }

  /**
   * Calculates ROI for a given operation.
   */
  calculateROI(stake: number, profit: number): number {
    if (stake === 0) return 0;
    return Number(((profit / stake) * 100).toFixed(2));
  }
}
