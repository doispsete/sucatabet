import { IsNumber, IsString, IsEnum, IsPositive, IsOptional } from 'class-validator';
import { BankTransactionType } from '@prisma/client';

export class BankDepositDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  description: string;

  @IsEnum(BankTransactionType)
  @IsOptional()
  type?: BankTransactionType;
}

export class BankWithdrawDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  description: string;
}
