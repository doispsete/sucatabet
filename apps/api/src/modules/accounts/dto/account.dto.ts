import { IsNumber, IsNotEmpty, Min, IsUUID, IsString, IsEnum, IsOptional } from 'class-validator';
import { AccountStatus } from '@prisma/client';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  cpfProfileId: string;

  @IsNotEmpty()
  @IsString()
  bettingHouseId: string;

  @IsNumber()
  @Min(0)
  balance: number;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;
}

export class AmountDto {
  @IsNumber()
  @Min(0.01, { message: 'O valor mínimo é 0.01' })
  amount: number;
}
