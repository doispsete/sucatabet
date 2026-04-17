import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class SofascoreService {
  private readonly logger = new Logger(SofascoreService.name);
  private readonly baseUrl = 'https://api.sofascore.com/api/v1';
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

  private async fetchWithRateLimit(url: string, skipDelay = false) {
    if (!skipDelay) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
          'Origin': 'https://www.sofascore.com',
          'Referer': 'https://www.sofascore.com/',
        },
      });

      if (response.status === 429 || response.status === 403) {
        this.logger.error(`BLOQUEIO SOFASCORE: IP da VPS pode estar bloqueado (${response.status}) na URL: ${url}`);
        throw new HttpException('Sofascore temporariamente indisponível', HttpStatus.SERVICE_UNAVAILABLE);
      }

      if (!response.ok) {
        this.logger.error(`Erro ao consultar Sofascore: ${url} - Status: ${response.status}`);
        return null;
      }

      return response.json();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Falha na requisição Sofascore: ${error.message}`);
      return null;
    }
  }

  async searchGames(term: string) {
    const today = new Date();
    const dates: string[] = [];
    
    // Vamos buscar apenas os próximos 4 dias para garantir velocidade (0, 1, 2, 3)
    for (let i = 0; i < 4; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }

    const searchTerm = term.toLowerCase();
    
    // Busca os 4 dias em paralelo para evitar timeout de 7s
    // O delay agora é aplicado apenas se não for a primeira leva paralela
    const dayPromises = dates.map((date, index) => 
        this.fetchWithRateLimit(`${this.baseUrl}/sport/football/scheduled-events/${date}`, true)
    );

    const allDaysData = await Promise.all(dayPromises);
    const allEvents: any[] = [];

    for (const data of allDaysData) {
        if (data?.events) {
            const filtered = data.events.filter((event: any) => 
                event.homeTeam.name.toLowerCase().includes(searchTerm) || 
                event.awayTeam.name.toLowerCase().includes(searchTerm)
            );
            allEvents.push(...filtered);
        }
    }

    // Retorna os eventos formatados conforme a especificação
    return allEvents.map((event: any) => ({
        eventId: event.id,
        homeTeam: event.homeTeam.name,
        homeTeamId: event.homeTeam.id,
        homeLogo: `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image`,
        awayTeam: event.awayTeam.name,
        awayTeamId: event.awayTeam.id,
        awayLogo: `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image`,
        league: event.tournament.name,
        startTime: new Date(event.startTimestamp * 1000).toISOString(),
        status: event.status.type, // notstarted, inprogress, finished
        period: event.status.period || null,
        minute: event.status.minute || null,
        homeScore: event.homeScore?.current ?? null,
        awayScore: event.awayScore?.current ?? null
    }));
  }

  async getEventDetails(eventId: string) {
    const data: any = await this.fetchWithRateLimit(`${this.baseUrl}/event/${eventId}`);
    if (!data?.event) return null;

    const event = data.event;
    return {
        eventId: event.id,
        homeTeam: event.homeTeam.name,
        homeTeamId: event.homeTeam.id,
        homeLogo: `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image`,
        awayTeam: event.awayTeam.name,
        awayTeamId: event.awayTeam.id,
        awayLogo: `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image`,
        league: event.tournament.name,
        startTime: new Date(event.startTimestamp * 1000).toISOString(),
        status: event.status.type,
        period: event.status.period || null,
        minute: event.status.minute || null,
        homeScore: event.homeScore?.current ?? null,
        awayScore: event.awayScore?.current ?? null
    };
  }
}
