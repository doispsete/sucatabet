import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SofascoreService } from './sofascore.service';

@Injectable()
export class SofascorePollingService implements OnModuleInit {
  private readonly logger = new Logger(SofascorePollingService.name);
  private readonly POLLING_INTERVAL = 60000; // 60 segundos

  constructor(
    private prisma: PrismaService,
    private sofascoreService: SofascoreService,
  ) {}

  onModuleInit() {
    this.startPolling();
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
        await this.prisma.operation.update({
          where: { id: operation.id },
          data: {
            // @ts-ignore
            sofascoreStatus: gameData.status,
            // @ts-ignore
            sofascoreHomeScore: gameData.homeScore,
            // @ts-ignore
            sofascoreAwayScore: gameData.awayScore,
            // @ts-ignore
            sofascorePeriod: gameData.period,
            // @ts-ignore
            sofascoreMinute: gameData.minute,
          },
        });

        if (gameData.status === 'finished') {
          this.logger.log(`[Sofascore] Jogo ${gameData.homeTeam} x ${gameData.awayTeam} encerrado para operação ${operation.id}`);
        }
      }
      
      // Delay de 1s para respeitar o rate limit entre consultas de eventos
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
