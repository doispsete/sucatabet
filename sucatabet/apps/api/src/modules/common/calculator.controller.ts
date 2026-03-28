import { Controller, Post, Body } from '@nestjs/common';
import { CalculatorService } from './calculator.service';

@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Post('surebet')
  calculateSurebet(@Body() data: { totalStake: number; odds: number[] }) {
    return this.calculatorService.calculateSurebet(data.totalStake, data.odds);
  }

  @Post('roi')
  calculateROI(@Body() data: { stake: number; profit: number }) {
    return { roi: this.calculatorService.calculateROI(data.stake, data.profit) };
  }
}
