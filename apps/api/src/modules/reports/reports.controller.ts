import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ProfitReportDto } from './dto/report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profit')
  getProfit(@Request() req, @Query() query: ProfitReportDto) {
    return this.reportsService.getProfitReport(req.user.userId, req.user.role, query);
  }
}
