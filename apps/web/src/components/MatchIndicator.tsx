import React from 'react';
import { formatDateShort, formatTime } from '../lib/utils';

interface MatchIndicatorProps {
  operation: {
    sofascoreEventId?: string | null;
    sofascoreStatus?: string | null;
    sofascoreHomeScore?: number | null;
    sofascoreAwayScore?: number | null;
    sofascoreHomeName?: string | null;
    sofascoreAwayName?: string | null;
    sofascoreLeague?: string | null;
    sofascoreStartTime?: string | Date | null | undefined;
    sofascoreHomeLogo?: string | null | undefined;
    sofascoreAwayLogo?: string | null | undefined;
    sofascorePeriod?: string | null | undefined;
    sofascoreMinute?: number | null | undefined;
  };
  className?: string;
}

export const MatchIndicator: React.FC<MatchIndicatorProps> = ({ operation, className = "" }) => {
  if (!operation.sofascoreEventId) return null;

  const {
    sofascoreStatus: status,
    sofascoreHomeScore: homeScore,
    sofascoreAwayScore: awayScore,
    sofascoreHomeName: homeName,
    sofascoreAwayName: awayName,
    sofascoreStartTime: startTime,
    sofascoreHomeLogo: homeLogo,
    sofascoreAwayLogo: awayLogo,
    sofascorePeriod: period,
    sofascoreMinute: minute,
  } = operation;

  const abbreviate = (name: string | null | undefined) => name ? name.substring(0, 3).toUpperCase() : '???';

  // NOT STARTED
  if (status === 'notstarted' || (!status && !['inprogress', 'finished'].includes(status || ''))) {
    const now = new Date();
    const start = startTime ? new Date(startTime) : null;
    const hoursUntilStart = start ? (start.getTime() - now.getTime()) / (1000 * 60 * 60) : null;
    const isSoon = hoursUntilStart !== null && hoursUntilStart <= 3 && hoursUntilStart > 0;
    
    const badgeLabel = isSoon ? 'EM BREVE' : 'PROX';
    const badgeColor = isSoon 
      ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' 
      : 'text-primary bg-primary/10 border-primary/20';

    const dateStr = start && !isNaN(start.getTime()) 
      ? new Intl.DateTimeFormat('pt-BR', { 
          timeZone: 'America/Sao_Paulo', 
          day: '2-digit', 
          month: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }).format(start)
      : '--/-- --:--';
    
    return (
      <div className={`flex items-center gap-4 text-xs font-black text-[#b9cbbc] flex-1 ${className}`}>
        <div className="flex -space-x-1.5 shrink-0">
          <img 
            src={homeLogo || ''} 
            referrerPolicy="no-referrer"
            onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22><text y=%229%22 font-size=%2210%22>⚽</text></svg>')}
            className="w-6 h-6 rounded-full border-2 border-black bg-black shadow-lg" 
            alt="Casa"
          />
          <img 
            src={awayLogo || ''} 
            referrerPolicy="no-referrer"
            onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22><text y=%229%22 font-size=%2210%22>⚽</text></svg>')}
            className="w-6 h-6 rounded-full border-2 border-black bg-black shadow-lg" 
            alt="Visitante"
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-black italic text-sm tracking-tight truncate">
                {homeName} x {awayName}
              </span>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest shrink-0 ${badgeColor}`}>
                {badgeLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 opacity-50 text-[9px] font-black uppercase tracking-[0.2em]">
              <span>{dateStr}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="truncate">{operation.sofascoreLeague || 'Campeonato'}</span>
            </div>
        </div>
      </div>
    );
  }

  // IN PROGRESS
  if (status === 'inprogress') {
    return (
      <div className={`flex items-center gap-1.5 text-[10px] font-black text-[#00ff88] animate-pulse ${className}`}>
        <span className="bg-[#00ff88]/10 px-1 rounded uppercase tracking-tighter">
          {period || 'LIVE'} {minute ? `${minute}'` : ''}
        </span>
        <span className="flex items-center gap-1">
          <span>{abbreviate(homeName)}</span>
          <span className="bg-white/10 px-1 rounded min-w-[2.5em] text-center font-mono">
            {homeScore ?? 0} x {awayScore ?? 0}
          </span>
          <span>{abbreviate(awayName)}</span>
        </span>
      </div>
    );
  }

  // FINISHED
  if (status === 'finished') {
    return (
        <div className={`flex items-center gap-1.5 text-[10px] font-bold text-white/50 ${className}`}>
          <span className="flex items-center gap-1">
            <span>{abbreviate(homeName)}</span>
            <span className="bg-white/5 px-1 rounded min-w-[2.5em] text-center font-mono">
              {homeScore ?? 0} x {awayScore ?? 0}
            </span>
            <span>{abbreviate(awayName)}</span>
          </span>
          <span className="text-[8px] opacity-40 uppercase tracking-widest">• FIM</span>
        </div>
      );
  }

  return null;
};
