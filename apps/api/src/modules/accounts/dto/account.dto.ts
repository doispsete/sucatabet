import { IsNumber, IsNotEmpty, Min, IsUUID, IsString } from 'class-validator';

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
  @IsNumber()
  @Min(0)
  balance?: number;

  @IsString()
  @IsNotEmpty()
  status?: string;
}

export class AmountDto {
  @IsNumber()
  @Min(0.01, { message: 'O valor mínimo é 0.01' })
  amount: number;
}
