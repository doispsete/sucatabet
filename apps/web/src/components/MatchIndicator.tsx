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
    sofascoreMinute?: string | number | null | undefined;
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

  const isFinished = status === 'finished' || 
    (status === 'inprogress' && 
     ['ended','after extra time','after penalties']
     .some(s => (period || '').toLowerCase().includes(s)));

  const abbreviate = (name: string | null | undefined) => name ? name.substring(0, 3).toUpperCase() : '???';

  // NOT STARTED
  if (!isFinished && (status === 'notstarted' || (!status && !['inprogress'].includes(status || '')))) {
    const now = new Date();
    const start = startTime ? new Date(startTime) : null;
    const hoursUntilStart = start ? (start.getTime() - now.getTime()) / (1000 * 60 * 60) : null;
    const isSoon = hoursUntilStart !== null && hoursUntilStart <= 2 && hoursUntilStart > 0;
    
    const badgeColor = 'text-amber-400 bg-amber-400/10 border-amber-400/20';

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

    if (!isSoon) {
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

    const badgeLabel = 'EM BREVE';
    
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

  // INLINE RENDERER (V27)
  const renderInlineMatch = (showLiveBadge: boolean) => {
    const minuteStr = (minute !== undefined && minute !== null && minute !== "") ? String(minute) : "";

    return (
      <div className={`flex items-center gap-3 bg-white/[0.04] px-4 py-2.5 rounded-2xl border border-white/10 whitespace-nowrap max-w-full shadow-lg ${className}`}>
        {/* Home Team */}
        <span className="text-white font-black text-[13px] uppercase tracking-tight truncate max-w-[120px] text-right">
          {homeName}
        </span>
        <img 
          src={homeLogo || ''} 
          referrerPolicy="no-referrer"
          onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22><text y=%229%22 font-size=%2210%22>⚽</text></svg>')}
          className="w-6 h-6 object-contain shrink-0 border border-white/10 rounded-full p-0.5 bg-black/20" 
          alt=""
        />

        {/* Score */}
        <div className="flex items-center gap-2 px-3 py-1 bg-black/60 rounded-xl border border-white/10 font-mono shadow-inner scale-110">
           <span className="text-lg font-black italic text-white leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
             {homeScore ?? 0}
           </span>
           <span className="text-xs text-white/20 font-black italic">x</span>
           <span className="text-lg font-black italic text-[#00ff88] leading-none drop-shadow-[0_0_8px_rgba(0,255,136,0.4)]">
             {awayScore ?? 0}
           </span>
        </div>

        {/* Away Team */}
        <img 
          src={awayLogo || ''} 
          referrerPolicy="no-referrer"
          onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22><text y=%229%22 font-size=%2210%22>⚽</text></svg>')}
          className="w-6 h-6 object-contain shrink-0 border border-white/10 rounded-full p-0.5 bg-black/20" 
          alt=""
        />
        <span className="text-white font-black text-[13px] uppercase tracking-tight truncate max-w-[120px] text-left">
          {awayName}
        </span>

        {/* Live Indicator (only for progress) */}
        {showLiveBadge && (
          <div className="flex items-center gap-2 ml-2">
            {minuteStr !== "" ? (
              <span className="text-[11px] font-black italic text-[#00ff88] animate-pulse">
                {minuteStr}{minuteStr.includes('+') ? '' : '\''}
              </span>
            ) : null}
            {period && !minuteStr.includes(period) ? (
              <span className="text-[9px] font-black text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/20 uppercase italic">
                {period}
              </span>
            ) : null}
            {minuteStr === "" && !period && <span className="text-[10px] font-black text-[#00ff88] animate-pulse">LIVE</span>}
          </div>
        )}
      </div>
    );
  };

  if (isFinished) return renderInlineMatch(false);
  if (status === 'inprogress') return renderInlineMatch(true);

  return null;
};
