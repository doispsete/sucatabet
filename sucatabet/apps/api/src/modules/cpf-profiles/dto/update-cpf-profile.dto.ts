import { PartialType } from '@nestjs/mapped-types';
import { CreateCpfProfileDto } from './create-cpf-profile.dto';

export class UpdateCpfProfileDto extends PartialType(CreateCpfProfileDto) {}
