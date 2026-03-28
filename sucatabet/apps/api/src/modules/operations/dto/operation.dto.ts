import { IsEnum, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsUUID, ArrayMinSize, IsArray, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OperationType, OperationResult, OperationStatus } from '@prisma/client';

export class BetDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsNumber()
  @Min(1.001)
  odds: number;

  @IsNumber()
  @Min(0.01)
  stake: number;

  @IsString()
  @IsNotEmpty()
  side: 'BACK' | 'LAY';

  @IsString()
  @IsNotEmpty()
  type: 'Normal' | 'Freebet' | 'Aumento';

  @IsNumber()
  @IsOptional()
  commission?: number;

  @IsNotEmpty()
  @IsOptional()
  isBenefit?: boolean;
}

export class CreateOperationDto {
  @IsEnum(OperationType)
  @IsNotEmpty()
  type: OperationType;

  @ValidateNested({ each: true })
  @Type(() => BetDto)
  @ArrayMinSize(1)
  bets: BetDto[];

  @IsUUID()
  @IsOptional()
  freebetId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CloseOperationDto {
  @IsEnum(OperationStatus)
  @IsNotEmpty()
  status: Array<OperationStatus> | any; // Using any for flex but enum in practice

  @IsEnum(OperationResult)
  @IsNotEmpty()
  result: OperationResult;

  @IsArray()
  @IsOptional()
  winningBetIds?: string[];

  @IsNumber()
  @IsOptional()
  realProfit?: number;
}
