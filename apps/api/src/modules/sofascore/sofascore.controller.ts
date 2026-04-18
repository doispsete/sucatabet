import { Controller, Get, Post, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { SofascoreService } from './sofascore.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma.service';

@Controller('sofascore')
@UseGuards(JwtAuthGuard)
export class SofascoreController {
  private readonly logger = new Logger(SofascoreController.name);

  constructor(
    private readonly sofascoreService: SofascoreService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('cache/:eventId')
  getCache(@Param('eventId') eventId: string) {
    const data = this.sofascoreService.getEventFromCache(eventId);
    if (!data) return { cached: false };
    return { cached: true, data };
  }

  @Post('cache/:eventId')
  async setCache(@Param('eventId') eventId: string, @Body() data: any) {
    this.sofascoreService.setEventCache(eventId, data);
    
    // Atualiza todas as operações ligadas a este evento (Requisito V15)
    const updateData = {
      sofascoreStatus: String(data.status || 'notstarted'),
      sofascoreHomeScore: data.homeScore !== null ? Number(data.homeScore) : null,
      sofascoreAwayScore: data.awayScore !== null ? Number(data.awayScore) : null,
      sofascorePeriod: data.period !== null ? String(data.period) : null,
      sofascoreMinute: data.minute !== null ? Number(data.minute) : null,
      sofascoreHomeLogo: data.homeLogo,
      sofascoreAwayLogo: data.awayLogo,
      sofascoreStartTime: data.startTime,
    };

    const result = await this.prisma.operation.updateMany({
      where: { sofascoreEventId: eventId },
      data: updateData as any,
    });

    this.logger.log(`[Sofascore] Cache alimentado para evento ${eventId}. Operações atualizadas: ${result.count}`);
    
    return { ok: true, updatedOperations: result.count };
  }
}
