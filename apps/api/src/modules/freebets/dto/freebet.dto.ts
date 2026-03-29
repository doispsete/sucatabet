import { IsNumber, IsNotEmpty, IsString, IsDateString, IsUUID, IsOptional, Min } from 'class-validator';

export class CreateFreebetDto {
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsDateString()
  @IsNotEmpty()
  expiresAt: string;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;
}

export class UpdateFreebetDto {
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsDateString()
  @IsOptional()
  usedAt?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
