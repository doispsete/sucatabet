import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountDto, AmountDto } from './dto/account.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.accountsService.findOne(id, req.user.userId, req.user.role);
  }

  @Post()
  create(@Request() req, @Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(req.user.userId, req.user.role, createAccountDto);
  }

  @Post(':id/deposit')
  deposit(@Param('id') id: string, @Request() req, @Body() amountDto: AmountDto) {
    return this.accountsService.deposit(id, req.user.userId, req.user.role, amountDto);
  }

  @Post(':id/withdraw')
  withdraw(@Param('id') id: string, @Request() req, @Body() amountDto: AmountDto) {
    return this.accountsService.withdraw(id, req.user.userId, req.user.role, amountDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, req.user.userId, req.user.role, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.accountsService.remove(id, req.user.userId, req.user.role);
  }
}
