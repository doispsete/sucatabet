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
  @IsArray()
  bets: BetDto[];

  @IsUUID()
  @IsOptional()
  freebetId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  generatedFbValue?: number;

  @IsString()
  @IsOptional()
  sofascoreEventId?: string;

  @IsString()
  @IsOptional()
  sofascoreStatus?: string;

  @IsNumber()
  @IsOptional()
  sofascoreHomeScore?: number;

  @IsNumber()
  @IsOptional()
  sofascoreAwayScore?: number;

  @IsString()
  @IsOptional()
  sofascoreHomeName?: string;

  @IsString()
  @IsOptional()
  sofascoreAwayName?: string;

  @IsString()
  @IsOptional()
  sofascoreLeague?: string;

  @IsString()
  @IsOptional()
  sofascoreStartTime?: string;

  @IsString()
  @IsOptional()
  sofascoreHomeLogo?: string;

  @IsString()
  @IsOptional()
  sofascoreAwayLogo?: string;
}

export class UpdateOperationDto extends CreateOperationDto {}

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
