import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class ProfitReportDto {
  @IsEnum(['daily', 'weekly', 'monthly'])
  @IsOptional()
  period?: string = 'daily';

  @IsEnum(['account', 'house', 'type', 'category', 'result'])
  @IsOptional()
  groupBy?: string = 'category';

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}
