import { IsEmail, IsNotEmpty, IsEnum, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsEnum(['FREE', 'BASIC', 'PRO'])
  @IsOptional()
  plan?: 'FREE' | 'BASIC' | 'PRO';
}
