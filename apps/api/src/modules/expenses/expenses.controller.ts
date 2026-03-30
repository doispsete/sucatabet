import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(@Request() req) {
    return this.expensesService.findAll(req.user.userId);
  }

  @Post()
  create(@Request() req, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(req.user.userId, createExpenseDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateDto: UpdateExpenseDto) {
    return this.expensesService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.expensesService.remove(id, req.user.userId);
  }

  @Post(':id/pay')
  pay(@Param('id') id: string, @Request() req) {
    return this.expensesService.pay(id, req.user.userId);
  }
}
