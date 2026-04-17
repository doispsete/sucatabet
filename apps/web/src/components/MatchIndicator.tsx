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
  if (status === 'notstarted' || (status !== 'inprogress' && status !== 'finished')) {
    const dateStr = startTime ? `${formatDateShort(startTime)} ${formatTime(startTime)}` : '--/-- --:--';
    return (
      <div className={`flex items-center gap-2 text-[10px] font-bold text-[#b9cbbc] ${className}`}>
        <div className="flex -space-x-1">
          <img 
            src={homeLogo || ''} 
            onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22><text y=%229%22 font-size=%228%22>⚽</text></svg>')}
            className="w-4 h-4 rounded-full border border-white/10" 
            alt="Casa"
          />
          <img 
            src={awayLogo || ''} 
            onError={(e) => (e.currentTarget.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/xml%22 viewBox=%220 0 10 10%22><text y=%229%22 font-size=%228%22>⚽</text></svg>')}
            className="w-4 h-4 rounded-full border border-white/10" 
            alt="Visitante"
          />
        </div>
        <span>{dateStr}</span>
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
