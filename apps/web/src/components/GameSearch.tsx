import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Calendar, Trophy } from 'lucide-react';

interface GameSearchProps {
  onSelect: (game: any) => void;
  onClose?: () => void;
}

export const GameSearch: React.FC<GameSearchProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // PASSO 1 — Buscar ID do time
      const searchRes = await fetch(
        `https://api.sofascore.com/api/v1/search/all?q=${encodeURIComponent(q)}`,
        { 
          headers: { 'Accept': 'application/json' },
          referrerPolicy: "no-referrer"
        }
      );
      
      if (!searchRes.ok) throw new Error('Search failed');
      const searchData = await searchRes.json();
      const team = searchData.results?.find((r: any) => r.type === 'team')?.entity;

      if (!team) {
        setResults([]);
        return;
      }

      // PASSO 2 — Buscar próximos jogos
      const evRes = await fetch(
        `https://api.sofascore.com/api/v1/team/${team.id}/events/next/0`,
        { 
          headers: { 'Accept': 'application/json' },
          referrerPolicy: "no-referrer"
        }
      );
      
      if (!evRes.ok) throw new Error('Events fetch failed');
      const evData = await evRes.json();
      const allEvents = evData.events ?? [];

      // PASSO 3 — Filtrar 7 dias
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysLater = now + 7 * 24 * 60 * 60;
      const events = allEvents.filter(
        (e: any) => e.startTimestamp >= now && e.startTimestamp <= sevenDaysLater
      );

      // PASSO 4 — Formatar para exibição
      const formatted = events.map((e: any) => {
        const date = new Date(e.startTimestamp * 1000);
        
        // Exibição amigável no frontend (America/Sao_Paulo)
        const displayTime = new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(date);

        return {
          sofascoreEventId: e.id.toString(),
          sofascoreHomeName: e.homeTeam.name,
          homeTeamId: e.homeTeam.id,
          sofascoreHomeLogo: `https://api.sofascore.com/api/v1/team/${e.homeTeam.id}/image`,
          sofascoreAwayName: e.awayTeam.name,
          awayTeamId: e.awayTeam.id,
          sofascoreAwayLogo: `https://api.sofascore.com/api/v1/team/${e.awayTeam.id}/image`,
          sofascoreLeague: e.tournament?.name || 'Futebol',
          displayTime: displayTime,
          sofascoreStartTime: date.toISOString(), // Para o backend e MatchIndicator
          startTimestamp: e.startTimestamp,
          sofascoreStatus: e.status?.type ?? 'notstarted',
          sofascoreHomeScore: e.homeScore?.current ?? null,
          sofascoreAwayScore: e.awayScore?.current ?? null,
        };
      });

      setResults(formatted);
    } catch (err) {
      console.error('Erro na busca do Sofascore:', err);
      setError('Erro ao buscar jogos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          autoFocus
          type="text"
          placeholder="Buscar time ou jogo (ex: Flamengo, Real Madrid...)"
          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff88] animate-spin" />
        )}
      </div>

      <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
        {error ? (
          <div className="py-8 text-center text-red-400/80 text-sm">
            {error}
          </div>
        ) : results.length > 0 ? (
          results.map((game) => (
            <button
              key={game.eventId}
              onClick={() => onSelect(game)}
              className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-white/5 text-left border border-transparent hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase font-bold">
                  <Trophy className="w-3 h-3" />
                  {game.sofascoreLeague}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-medium">
                  <Calendar className="w-3 h-3" />
                  {game.displayTime}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 max-w-[45%]">
                    <img 
                      src={game.sofascoreHomeLogo} 
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 object-contain" 
                      alt="" 
                    />
                    <span className="truncate text-sm font-semibold">{game.sofascoreHomeName}</span>
                  </div>
                  <span className="text-white/20 text-xs font-black italic">VS</span>
                  <div className="flex items-center gap-2 max-w-[45%]">
                    <img 
                      src={game.sofascoreAwayLogo} 
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 object-contain" 
                      alt="" 
                    />
                    <span className="truncate text-sm font-semibold">{game.sofascoreAwayName}</span>
                  </div>
                </div>
                <div className="bg-[#00ff88]/10 text-[#00ff88] text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  VINCULAR
                </div>
              </div>
            </button>
          ))
        ) : query.length >= 3 && !loading ? (
          <div className="py-8 text-center text-white/30 text-sm">
            Nenhum jogo encontrado para este critério de busca.
          </div>
        ) : query.length > 0 && query.length < 3 ? (
          <div className="py-8 text-center text-white/20 text-xs">
            Digite pelo menos 3 caracteres...
          </div>
        ) : (
          <div className="py-8 text-center text-white/20 text-xs">
            Digite o nome de um time para buscar partidas agendadas.
          </div>
        )}
      </div>
    </div>
  );
};
