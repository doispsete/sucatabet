import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateCpfProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  @Length(6, 6, { message: 'Forneça apenas os 6 primeiros dígitos do CPF' })
  cpf: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;
}
