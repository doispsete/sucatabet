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
    try {
      const searchTerm = encodeURIComponent(term);
      const searchData: any = await this.fetchWithRateLimit(`${this.baseUrl}/search/all?q=${searchTerm}&page=0`, true);
      
      if (!searchData?.results) return [];

      // 1. Pegar os IDs dos times encontrados
      const teamIds = searchData.results
        .filter((r: any) => r.type === 'team' && r.entity?.id)
        .slice(0, 3) // Limita aos 3 principais times para não sobrecarregar
        .map((r: any) => r.entity.id);

      if (teamIds.length === 0) {
        // Se não achou time, tenta buscar eventos diretos (fallback)
        const events = searchData.results
          .filter((r: any) => r.type === 'event' && r.entity)
          .map((r: any) => r.entity);
        return this.formatEvents(events);
      }

      // 2. Buscar próximos eventos de cada time em paralelo
      const eventPromises = teamIds.map((id: number) => 
        this.fetchWithRateLimit(`${this.baseUrl}/team/${id}/events/next/0`, true)
      );

      const eventsData = await Promise.all(eventPromises);
      const allEvents: any[] = [];
      const seenIds = new Set();

      for (const data of eventsData) {
        if (data?.events) {
          for (const event of data.events) {
            if (!seenIds.has(event.id)) {
              allEvents.push(event);
              seenIds.add(event.id);
            }
          }
        }
      }

      // 3. Ordenar por data e formatar
      allEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);
      return this.formatEvents(allEvents);
    } catch (error) {
      this.logger.error(`Erro na busca híbrida Sofascore: ${error.message}`);
      return [];
    }
  }

  private formatEvents(events: any[]) {
    return events.map((event: any) => ({
        eventId: event.id,
        homeTeam: event.homeTeam.name,
        homeTeamId: event.homeTeam.id,
        homeLogo: `https://api.sofascore.com/api/v1/team/${event.homeTeam.id}/image`,
        awayTeam: event.awayTeam.name,
        awayTeamId: event.awayTeam.id,
        awayLogo: `https://api.sofascore.com/api/v1/team/${event.awayTeam.id}/image`,
        league: event.tournament?.name || 'Futebol',
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
