import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { formatInTimeZone } from 'date-fns-tz';

@Injectable()
export class SofascoreService {
  private readonly logger = new Logger(SofascoreService.name);
  private readonly baseUrl = 'https://www.sofascore.com/api/v1';
  // User-Agent Desktop para mimetizar um navegador real
  private readonly userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  private async fetchWithRateLimit(url: string, skipDelay = false) {
    if (!skipDelay) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Origin': 'https://www.sofascore.com',
          'Referer': 'https://www.sofascore.com/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (response.status === 429 || response.status === 403) {
        this.logger.error(`BLOQUEIO SOFASCORE: IP da VPS bloqueado (${response.status}) na URL: ${url}`);
        // Log extra para depuração de headers se necessário
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

      // 1. Pegar IDs de times e eventos diretos
      const teams = searchData.results.filter((r: any) => r.type === 'team' && r.entity?.id);
      const directEvents = searchData.results.filter((r: any) => r.type === 'event' && r.entity);

      const allEvents: any[] = [];
      const seenIds = new Set();

      // Adicionar eventos diretos encontrados na pesquisa global
      for (const r of directEvents) {
        if (!seenIds.has(r.entity.id)) {
          allEvents.push(r.entity);
          seenIds.add(r.entity.id);
        }
      }

      // 2. Buscar próximos eventos dos times encontrados
      const teamIds = teams.slice(0, 5).map((r: any) => r.entity.id);
      if (teamIds.length > 0) {
        const eventPromises = teamIds.map((id: number) => 
          this.fetchWithRateLimit(`${this.baseUrl}/team/${id}/events/next/0`, true)
        );

        const eventsData = await Promise.all(eventPromises);
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
      }

      // 3. Filtrar por tempo (apenas próximos 7 dias) e ordenar
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysLater = now + (7 * 24 * 60 * 60);

      const filteredEvents = allEvents.filter(event => 
        event.startTimestamp >= (now - 3600 * 4) && 
        event.startTimestamp <= sevenDaysLater
      );

      filteredEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);
      return this.formatEvents(filteredEvents);
    } catch (error) {
      this.logger.error(`Erro na busca refinada Sofascore: ${error.message}`);
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
        // Uso de formatInTimeZone para garantir exibição correta em America/Sao_Paulo
        startTime: formatInTimeZone(new Date(event.startTimestamp * 1000), 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ssXXX"),
        status: event.status.type,
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
        startTime: formatInTimeZone(new Date(event.startTimestamp * 1000), 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ssXXX"),
        status: event.status.type,
        period: event.status.period || null,
        minute: event.status.minute || null,
        homeScore: event.homeScore?.current ?? null,
        awayScore: event.awayScore?.current ?? null
    };
  }
}
