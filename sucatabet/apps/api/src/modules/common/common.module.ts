import { Module, Global } from '@nestjs/common';
import { CalculatorService } from './calculator.service';
import { CalculatorController } from './calculator.controller';

@Global()
@Module({
  controllers: [CalculatorController],
  providers: [CalculatorService],
  exports: [CalculatorService],
})
export class CommonModule {}
