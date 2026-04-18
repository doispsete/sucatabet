import { Injectable, Logger } from '@nestjs/common';
import { formatInTimeZone } from 'date-fns-tz';

@Injectable()
export class SofascoreService {
  private readonly logger = new Logger(SofascoreService.name);
  private cache = new Map<string, { data: any, cachedAt: number, ttl: number }>();

  getEventFromCache(eventId: string) {
    const cached = this.cache.get(eventId);
    if (!cached) return null;

    const now = Date.now();
    const age = now - cached.cachedAt;

    if (age > cached.ttl) {
      this.cache.delete(eventId);
      return null;
    }

    return cached.data;
  }

  setEventCache(eventId: string, data: any) {
    let ttl = 60000; // 60s default (notstarted)
    
    if (data.status === 'inprogress') {
      ttl = 3000; // 3s for live games
    } else if (data.status === 'finished') {
      ttl = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years (v15 requirement: infinite)
    }

    this.cache.set(eventId, {
      data,
      cachedAt: Date.now(),
      ttl
    });
  }

  async getEventDetails(eventId: string) {
    try {
      const response = await fetch(`https://api.sofascore.com/api/v1/event/${eventId}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          this.logger.error(`ERRO SOFASCORE PROXY: IP bloqueado (403) ao buscar evento ${eventId}`);
        } else {
          this.logger.error(`ERRO SOFASCORE PROXY: falha na requisição status ${response.status}`);
        }
        return null;
      }

      const data: any = await response.json();
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
        league: event.tournament?.name || 'Futebol',
        startTime: formatInTimeZone(new Date(event.startTimestamp * 1000), 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ssXXX"),
        status: event.status.type,
        period: event.status.period || null,
        minute: event.status.minute || null,
        homeScore: event.homeScore?.current ?? null,
        awayScore: event.awayScore?.current ?? null
      };
    } catch (error) {
      this.logger.error(`ERRO SOFASCORE PROXY: falha na requisição: ${error.message}`);
      return null;
    }
  }
}
