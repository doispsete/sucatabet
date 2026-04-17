import React, { useState, useEffect, useCallback } from 'react';
import { sofascoreService } from '../lib/api/services';
import { Search, Loader2, Calendar, Trophy } from 'lucide-react';

interface GameSearchProps {
  onSelect: (game: any) => void;
  onClose?: () => void;
}

export const GameSearch: React.FC<GameSearchProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await sofascoreService.search(q);
      setResults(data);
    } catch (error) {
      console.error('Erro na busca do Sofascore:', error);
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
        {results.length > 0 ? (
          results.map((game) => (
            <button
              key={game.eventId}
              onClick={() => onSelect(game)}
              className="group flex flex-col gap-1 p-3 rounded-lg hover:bg-white/5 text-left border border-transparent hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase font-bold">
                  <Trophy className="w-3 h-3" />
                  {game.league}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-medium">
                  <Calendar className="w-3 h-3" />
                  {new Date(game.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} 
                  {' '}
                  {new Date(game.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 max-w-[45%]">
                    <img src={game.homeLogo} className="w-5 h-5 object-contain" alt="" />
                    <span className="truncate text-sm font-semibold">{game.homeTeam}</span>
                  </div>
                  <span className="text-white/20 text-xs font-black italic">VS</span>
                  <div className="flex items-center gap-2 max-w-[45%]">
                    <img src={game.awayLogo} className="w-5 h-5 object-contain" alt="" />
                    <span className="truncate text-sm font-semibold">{game.awayTeam}</span>
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
