import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.dashboardService.getSummary(req.user.userId, req.user.role, startDate, endDate);
  }

  @Get('club')
  getClubProgress(@Request() req) {
    return this.dashboardService.getClubProgress(req.user.userId, req.user.role);
  }

  @Get('system-status')
  getSystemStatus() {
    return this.dashboardService.getSystemStatus();
  }
}
