import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SofascoreService } from './sofascore.service';
import { PrismaService } from '../../prisma.service';

@Controller('sofascore')
@UseGuards(JwtAuthGuard)
export class SofascoreController {
  constructor(
    private readonly sofascoreService: SofascoreService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('cache/:eventId')
  getCache(@Param('eventId') eventId: string) {
    const cached = this.sofascoreService.getEventFromCache(eventId);
    if (cached) return { cached: true, ...cached };
    return { cached: false };
  }

  @Post('cache/:eventId')
  async setCache(@Param('eventId') eventId: string, @Body() body: any) {
    this.sofascoreService.setEventCache(eventId, body);
    const updated = await (this.prisma.operation as any).updateMany({
      where: { sofascoreEventId: eventId, status: 'PENDING' },
      data: {
        sofascoreStatus: body.status || null,
        sofascoreHomeScore: body.homeScore ?? null,
        sofascoreAwayScore: body.awayScore ?? null,
        sofascorePeriod: body.period || null,
        sofascoreMinute: body.minute ? Number(body.minute) : null,
        sofascoreHomeLogo: body.homeLogo || null,
        sofascoreAwayLogo: body.awayLogo || null,
        sofascoreStartTime: body.startTime ? new Date(body.startTime) : null,
      },
    });
    return { ok: true, updatedOperations: updated.count };
  }
}
