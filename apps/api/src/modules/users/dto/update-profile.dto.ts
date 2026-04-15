import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  newPassword?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
