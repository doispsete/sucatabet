import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, Max, Min } from 'class-validator';
import { ExpenseType } from '@prisma/client';

export class CreateExpenseDto {
  @IsString()
  name: string;

  @IsEnum(ExpenseType)
  type: ExpenseType;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  dueDay: number;

  @IsBoolean()
  @IsOptional()
  recurring?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  totalMonths?: number;
}

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ExpenseType)
  @IsOptional()
  type?: ExpenseType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  dueDay?: number;

  @IsBoolean()
  @IsOptional()
  recurring?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  totalMonths?: number;
}
