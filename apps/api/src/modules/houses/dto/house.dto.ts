import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateHouseDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da casa é obrigatório' })
  name: string;

  @IsString()
  @IsOptional()
  domain?: string;
}

export class UpdateHouseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  domain?: string;
}
