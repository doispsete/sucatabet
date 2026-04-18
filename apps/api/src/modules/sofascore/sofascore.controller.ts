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
    const cached = this.sofascoreService.getEventFromCache(eventId);
    if (cached) return { cached: true, ...cached };
    return { cached: false };
  }

  @Post('cache/:eventId')
  async setCache(@Param('eventId') eventId: string, @Body() body: any) {
    this.sofascoreService.setEventCache(eventId, body);
    
    // Atualizar todas as operações com esse eventId no banco (Requisito ═════)
    const result = await this.prisma.operation.updateMany({
      where: { sofascoreEventId: eventId } as any,
      data: {
        sofascoreStatus: body.status,
        sofascoreHomeScore: body.homeScore,
        sofascoreAwayScore: body.awayScore,
        sofascorePeriod: body.period,
        sofascoreMinute: body.minute,
        sofascoreHomeLogo: body.homeLogo,
        sofascoreAwayLogo: body.awayLogo,
      } as any,
    });

    this.logger.log(`[Sofascore] ✅ CACHE ATUALIZADO para o evento ${eventId} (${body.homeTeam} x ${body.awayTeam}). Operações afetadas: ${result.count}`);
    
    return { ok: true, updatedOperations: result.count };
  }
}
