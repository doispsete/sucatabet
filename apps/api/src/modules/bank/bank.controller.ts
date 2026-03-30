import { Controller, Get, Post, Patch, Body, UseGuards, Request, Query } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankDepositDto, BankWithdrawDto } from './dto/bank-action.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  getBank(@Request() req) {
    return this.bankService.getOrCreateBank(req.user.userId);
  }

  @Get('summary')
  getSummary(@Request() req, @Query() query: { startDate?: string, endDate?: string }) {
    return this.bankService.getSummary(req.user.userId, query);
  }

  @Get('transactions')
  getTransactions(@Request() req, @Query() filters?: any) {
    return this.bankService.getTransactions(req.user.userId, filters);
  }

  @Post('deposit')
  deposit(@Request() req, @Body() dto: BankDepositDto) {
    return this.bankService.deposit(req.user.userId, dto);
  }

  @Post('withdraw')
  withdraw(@Request() req, @Body() dto: BankWithdrawDto) {
    return this.bankService.withdraw(req.user.userId, dto);
  }

  @Patch('goal')
  updateGoal(@Request() req, @Body('goal') goal: number) {
    return this.bankService.updateGoal(req.user.userId, goal);
  }
}
