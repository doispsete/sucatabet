import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SofascoreService } from './sofascore.service';

@Injectable()
export class SofascorePollingService implements OnModuleInit {
  private readonly logger = new Logger(SofascorePollingService.name);
  private readonly POLLING_INTERVAL = 20000; // 20 segundos

  constructor(
    private prisma: PrismaService,
    private sofascoreService: SofascoreService,
  ) {}

  onModuleInit() {
    // Polling migrado para o frontend com cache compartilhado
    // Ver: sofascore.controller.ts POST /sofascore/cache/:eventId
    this.logger.log('[Sofascore] Polling backend desativado — usando client-side polling com cache compartilhado');
  }

  private startPolling() {
    setInterval(async () => {
      try {
        await this.pollActiveGames();
      } catch (error) {
        this.logger.error(`Erro no polling do Sofascore: ${error.message}`);
      }
    }, this.POLLING_INTERVAL);
  }

  private async pollActiveGames() {
    this.logger.log('[Sofascore] Iniciando polling de placares ativos...');
    
    // Busca operações pendentes que tenham um ID do Sofascore
    const pendingOperations = await this.prisma.operation.findMany({
      where: {
        status: 'PENDING',
        // @ts-ignore
        sofascoreEventId: { not: null },
      },
    }) as any[];

    if (pendingOperations.length === 0) return;

    for (const operation of pendingOperations) {
      if (!operation.sofascoreEventId) continue;

      this.logger.debug(`[Sofascore] Atualizando jogo para operação ${operation.id} (Event: ${operation.sofascoreEventId})`);
      
      const gameData = await this.sofascoreService.getEventDetails(operation.sofascoreEventId);
      
      if (gameData) {
        // Sanitização explícita para evitar erros de serialização do Prisma
        const updateData = {
          sofascoreStatus: String(gameData.status || 'notstarted'),
          sofascoreHomeScore: gameData.homeScore !== null ? Number(gameData.homeScore) : null,
          sofascoreAwayScore: gameData.awayScore !== null ? Number(gameData.awayScore) : null,
          sofascorePeriod: gameData.period !== null ? String(gameData.period) : null,
          sofascoreMinute: gameData.minute !== null ? Number(gameData.minute) : null,
          sofascoreHomeLogo: gameData.homeLogo,
          sofascoreAwayLogo: gameData.awayLogo,
          sofascoreStartTime: gameData.startTime,
        };

        await this.prisma.operation.update({
          where: { id: operation.id },
          data: updateData as any,
        });

        if (gameData.status === 'finished') {
          this.logger.log(`[Sofascore] Jogo ${gameData.homeTeam} x ${gameData.awayTeam} encerrado para operação ${operation.id}`);
        }
      }
      
      // Delay de 300ms para respeitar o rate limit entre consultas de eventos
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}
