"use client";
import React, { useState, useEffect } from "react";
import { 
  X, 
  Trophy, 
  Timer, 
  Layout, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Clock
} from "lucide-react";
import { Modal } from "@/components/ui/components";
import { Operation } from "@/lib/api/types";
import { formatTime } from "@/lib/utils";

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation;
}

export function MatchDetailsModal({ isOpen, onClose, operation }: MatchDetailsModalProps) {
  if (!isOpen || !operation) return null;

  const [incidents, setIncidents] = useState<any[]>([]);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventId = operation?.sofascoreEventId;
  const homeScore = operation?.sofascoreHomeScore;
  const awayScore = operation?.sofascoreAwayScore;

  const [isBasketball, setIsBasketball] = useState(false);

  useEffect(() => {
    if (isOpen && operation) {
      const league = (operation?.sofascoreLeague || '').toLowerCase();
      setIsBasketball(
        league.includes('nba') || 
        league.includes('nbb') ||
        league.includes('basket') ||
        league.includes('b1 league')
      );
    }
  }, [isOpen, operation?.id]);

  const fetchData = async () => {
    if (!eventId || !isOpen) return;
    setLoading(true);
    setError(null);
    try {
      const [incRes, eventRes] = await Promise.all([
        fetch(`https://api.sofascore.com/api/v1/event/${eventId}/incidents`, { referrerPolicy: 'no-referrer' }),
        fetch(`https://api.sofascore.com/api/v1/event/${eventId}`, { referrerPolicy: 'no-referrer' })
      ]);

      if (!incRes.ok || !eventRes.ok) throw new Error("Erro ao buscar dados do Sofascore");

      const incData = await incRes.json();
      const eventData = await eventRes.json();

      setIncidents(incData.incidents || []);
      setEventDetails(eventData.event || null);
      
      if (eventData.event?.tournament?.category?.sport?.slug === 'basketball') {
        setIsBasketball(true);
      } else {
        setIsBasketball(false);
      }
    } catch (err: any) {
      console.error("[MatchDetailsModal] Error:", err);
      setError("Não foi possível carregar os detalhes da partida.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, eventId, homeScore, awayScore]);

  const filteredIncidents = incidents.filter(inc => {
    const type = inc.incidentType;
    if (isBasketball) {
      return ['foul', 'technical', 'scoreChange', 'periodStart', 'periodEnd'].includes(type) || inc.description?.toLowerCase().includes('ponto');
    }
    return ['goal', 'card', 'var', 'penalty'].includes(type);
  }).reverse();

  const getIncidentIcon = (inc: any) => {
    switch (inc.incidentType) {
      case 'goal': return <span className="text-base">⚽</span>;
      case 'card': 
        return inc.incidentClass === 'yellow' 
          ? <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm border border-yellow-600 shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
          : <div className="w-2.5 h-3.5 bg-red-500 rounded-sm border border-red-700 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />;
      case 'var': return <span className="text-base">📺</span>;
      case 'penalty': return <span className="text-base">🥅</span>;
      case 'foul': return <AlertCircle className="w-3 h-3 text-amber-500" />;
      case 'technical': return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'scoreChange': return <Trophy className="w-3 h-3 text-[#03D791]" />;
      default: return null;
    }
  };

  const calculateMaxAdvantage = () => {
    if (!eventDetails?.homeScore || !eventDetails?.awayScore) return 0;
    const scores = [1, 2, 3, 4, 5].map(p => ({
      h: eventDetails.homeScore[`period${p}`] || 0,
      a: eventDetails.awayScore[`period${p}`] || 0
    }));
    
    let maxDiff = 0;
    let currentH = 0;
    let currentA = 0;
    
    scores.forEach(s => {
      currentH += s.h;
      currentA += s.a;
      maxDiff = Math.max(maxDiff, Math.abs(currentH - currentA));
    });
    
    return maxDiff || Math.abs((eventDetails.homeScore.current || 0) - (eventDetails.awayScore.current || 0));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Partida"
      size="lg"
    >
      <div className="space-y-6 py-1 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header: Scoreboard - Mais Compacto */}
        <div className="flex flex-col items-center gap-4 p-6 glass-card rounded-[24px] border-white/5 bg-white/[0.01]">
           <p className="text-[9px] font-black text-[#b9cbbc]/20 uppercase tracking-[0.4em] italic truncate max-w-full">
             {eventDetails?.tournament?.name || operation?.sofascoreLeague || 'PARTIDA'}
           </p>
           
           <div className="flex items-center justify-between w-full max-w-xl gap-4">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <div className="relative">
                  <img src={operation?.sofascoreHomeLogo || ''} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full border border-white/10 bg-black shadow-xl" alt="" />
                  {eventDetails?.homeScore?.current > eventDetails?.awayScore?.current && (
                    <div className="absolute -top-1 -right-1 bg-[#03D791] rounded-full p-0.5 shadow-[0_0_10px_rgba(3,215,145,0.5)]">
                      <ShieldCheck size={10} className="text-black" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-center text-white/70 truncate w-full">{operation?.sofascoreHomeName}</span>
              </div>

              {/* Score Center */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                   <span className={`text-4xl font-black italic tracking-tighter tabular-nums ${eventDetails?.homeScore?.current > eventDetails?.awayScore?.current ? 'text-[#03D791] drop-shadow-[0_0_10px_rgba(3,215,145,0.3)]' : 'text-white'}`}>
                     {eventDetails?.homeScore?.current ?? operation?.sofascoreHomeScore ?? 0}
                   </span>
                   <span className="text-xl font-black text-white/5 italic">×</span>
                   <span className={`text-4xl font-black italic tracking-tighter tabular-nums ${eventDetails?.awayScore?.current > eventDetails?.homeScore?.current ? 'text-[#03D791] drop-shadow-[0_0_10px_rgba(3,215,145,0.3)]' : 'text-white'}`}>
                     {eventDetails?.awayScore?.current ?? operation?.sofascoreAwayScore ?? 0}
                   </span>
                </div>
                 {(() => {
                   const status = eventDetails?.status;
                   const p = status?.period;
                   const desc = (status?.description || '').toLowerCase();
                   let headerPeriod = operation?.sofascorePeriod;
                   
                   if (isBasketball && p) {
                     if (p === 1) headerPeriod = 'Q1';
                     else if (p === 2) headerPeriod = 'Q2';
                     else if (p === 3) headerPeriod = 'Q3';
                     else if (p === 4) headerPeriod = 'Q4';
                     else if (p >= 5) headerPeriod = `OT${p - 4 > 1 ? p - 4 : ''}`;
                   } else if (isBasketball && desc.includes('quarter')) {
                      headerPeriod = desc.includes('1st') ? 'Q1' : desc.includes('2nd') ? 'Q2' : desc.includes('3rd') ? 'Q3' : 'Q4';
                   }

                   const displayPeriod = headerPeriod || operation?.sofascorePeriod;
                   if (!displayPeriod || displayPeriod === 'LIVE' && !operation?.sofascoreMinute) return null;

                   return (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-[#03D791]/10 rounded-full border border-[#03D791]/20">
                      <span className="text-[9px] font-black text-[#03D791] uppercase italic tracking-widest animate-pulse">
                        {displayPeriod} {operation?.sofascoreMinute ? `• ${operation?.sofascoreMinute}${String(operation?.sofascoreMinute).includes(':') ? '' : "'"}` : ''}
                      </span>
                    </div>
                   );
                 })()}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <div className="relative">
                  <img src={operation?.sofascoreAwayLogo || ''} referrerPolicy="no-referrer" className="w-12 h-12 rounded-full border border-white/10 bg-black shadow-xl" alt="" />
                  {eventDetails?.awayScore?.current > eventDetails?.homeScore?.current && (
                    <div className="absolute -top-1 -right-1 bg-[#03D791] rounded-full p-0.5 shadow-[0_0_10px_rgba(3,215,145,0.5)]">
                      <ShieldCheck size={10} className="text-black" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-center text-white/40 truncate w-full">{operation?.sofascoreAwayName}</span>
              </div>
           </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {loading && !eventDetails ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 opacity-20">
              <Timer className="w-8 h-8 animate-spin" />
              <p className="text-[9px] font-black uppercase tracking-widest">Sincronizando estatísticas...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-500/40">
              <AlertCircle className="w-8 h-8" />
              <p className="text-[9px] font-black uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
              {/* Left Column: Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Layout className="w-3.5 h-3.5 text-[#03D791] opacity-50" />
                  <h3 className="text-[9px] font-black text-[#b9cbbc]/60 uppercase tracking-[0.3em] italic">Resumo do Placar</h3>
                </div>

                <div className="p-5 glass-card rounded-[24px] border-white/5 bg-white/[0.01]">
                {isBasketball ? (
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="py-2 text-[8px] font-black text-[#b9cbbc]/20 uppercase tracking-widest text-left">QUARTOS</th>
                          <th className="py-2 text-[8px] font-black text-white/20">Q1</th>
                          <th className="py-2 text-[8px] font-black text-white/20">Q2</th>
                          <th className="py-2 text-[8px] font-black text-white/20">Q3</th>
                          <th className="py-2 text-[8px] font-black text-white/20">Q4</th>
                          <th className="py-2 text-[8px] font-black text-[#03D791]/60">TOT</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] font-black italic tracking-tighter tabular-nums">
                        <tr className="border-b border-white/5">
                          <td className="py-3 text-left text-white/40 truncate max-w-[70px] uppercase">{operation?.sofascoreHomeName?.split(' ')[0]}</td>
                          <td className="py-3 text-white/20">{eventDetails?.homeScore?.period1 ?? '-'} <span className="text-[8px] text-[#03D791]/30 ml-1">{(eventDetails?.homeScore?.period1 || 0) > (eventDetails?.awayScore?.period1 || 0) ? `+${(eventDetails?.homeScore?.period1 || 0) - (eventDetails?.awayScore?.period1 || 0)}` : ''}</span></td>
                          <td className="py-3 text-white/20">{eventDetails?.homeScore?.period2 ?? '-'} <span className="text-[8px] text-[#03D791]/30 ml-1">{(eventDetails?.homeScore?.period2 || 0) > (eventDetails?.awayScore?.period2 || 0) ? `+${(eventDetails?.homeScore?.period2 || 0) - (eventDetails?.awayScore?.period2 || 0)}` : ''}</span></td>
                          <td className="py-3 text-white/20">{eventDetails?.homeScore?.period3 ?? '-'} <span className="text-[8px] text-[#03D791]/30 ml-1">{(eventDetails?.homeScore?.period3 || 0) > (eventDetails?.awayScore?.period3 || 0) ? `+${(eventDetails?.homeScore?.period3 || 0) - (eventDetails?.awayScore?.period3 || 0)}` : ''}</span></td>
                          <td className="py-3 text-white/20">{eventDetails?.homeScore?.period4 ?? '-'} <span className="text-[8px] text-[#03D791]/30 ml-1">{(eventDetails?.homeScore?.period4 || 0) > (eventDetails?.awayScore?.period4 || 0) ? `+${(eventDetails?.homeScore?.period4 || 0) - (eventDetails?.awayScore?.period4 || 0)}` : ''}</span></td>
                          <td className="py-3 text-[#03D791] text-sm tabular-nums">{eventDetails?.homeScore?.current ?? 0}</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3 text-left text-white/40 truncate max-w-[70px] uppercase">{operation?.sofascoreAwayName?.split(' ')[0]}</td>
                          <td className="py-3 text-white/20">{eventDetails?.awayScore?.period1 ?? '-'} <span className="text-[8px] text-[#FFDD65]/30 ml-1">{(eventDetails?.awayScore?.period1 || 0) > (eventDetails?.homeScore?.period1 || 0) ? `+${(eventDetails?.awayScore?.period1 || 0) - (eventDetails?.homeScore?.period1 || 0)}` : ''}</span></td>
                          <td className="py-3 text-white/20">{eventDetails?.awayScore?.period2 ?? '-'} <span className="text-[8px] text-[#FFDD65]/30 ml-1">{(eventDetails?.awayScore?.period2 || 0) > (eventDetails?.homeScore?.period2 || 0) ? `+${(eventDetails?.awayScore?.period2 || 0) - (eventDetails?.homeScore?.period2 || 0)}` : ''}</span></td>
                          <td className="py-3 text-white/20">{eventDetails?.awayScore?.period3 ?? '-'} <span className="text-[8px] text-[#FFDD65]/30 ml-1">{(eventDetails?.awayScore?.period3 || 0) > (eventDetails?.homeScore?.period3 || 0) ? `+${(eventDetails?.awayScore?.period3 || 0) - (eventDetails?.homeScore?.period3 || 0)}` : ''}</span></td>
                          <td className="py-3 text-white/20">{eventDetails?.awayScore?.period4 ?? '-'} <span className="text-[8px] text-[#FFDD65]/30 ml-1">{(eventDetails?.awayScore?.period4 || 0) > (eventDetails?.homeScore?.period4 || 0) ? `+${(eventDetails?.awayScore?.period4 || 0) - (eventDetails?.homeScore?.period4 || 0)}` : ''}</span></td>
                          <td className="py-3 text-[#03D791] text-sm tabular-nums">{eventDetails?.awayScore?.current ?? 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between opacity-60">
                         <span className="text-[10px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.3em]">1º Tempo</span>
                         <span className="text-2xl font-black text-white/60 italic tabular-nums">{eventDetails?.homeScore?.period1 ?? 0} × {eventDetails?.awayScore?.period1 ?? 0}</span>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex items-center justify-between opacity-60">
                         <span className="text-[10px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.3em]">2º Tempo</span>
                         <span className="text-2xl font-black text-white/60 italic tabular-nums">{eventDetails?.homeScore?.period2 ?? 0} × {eventDetails?.awayScore?.period2 ?? 0}</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex flex-col items-center justify-center bg-[#03D791]/5 p-5 rounded-2xl border border-[#03D791]/10 gap-2">
                           <span className="text-[10px] font-black text-[#03D791] uppercase tracking-[0.4em] italic mb-1">Resultado Final</span>
                           <span className="text-5xl font-black text-[#03D791] italic tabular-nums drop-shadow-[0_0_20px_rgba(3,215,145,0.4)]">{eventDetails?.homeScore?.current ?? 0} × {eventDetails?.awayScore?.current ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isBasketball && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[8px] font-black text-[#b9cbbc]/20 uppercase tracking-widest italic">Análise Técnica</span>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#FFDD65]/5 rounded-lg border border-[#FFDD65]/10">
                        <Trophy size={10} className="text-[#FFDD65]" />
                        <span className="text-[10px] font-black text-white/80 italic">
                           Vantagem Máx: <span className="text-[#FFDD65]">+{calculateMaxAdvantage()}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Incidents or Basketball Advantages */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Trophy className="w-3.5 h-3.5 text-[#03D791] opacity-50" />
                  <h3 className="text-[9px] font-black text-[#b9cbbc]/60 uppercase tracking-[0.3em] italic">
                    {isBasketball ? 'Vantagens por Quarto' : 'Cronologia'}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {isBasketball ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(q => {
                        const h = eventDetails?.homeScore?.[`period${q}`] || 0;
                        const a = eventDetails?.awayScore?.[`period${q}`] || 0;
                        const diff = Math.abs(h - a);
                        const leader = h > a ? operation?.sofascoreHomeName : a > h ? operation?.sofascoreAwayName : null;
                        const leaderLogo = h > a ? operation?.sofascoreHomeLogo : a > h ? operation?.sofascoreAwayLogo : null;

                        return (
                          <div key={q} className="p-4 glass-card rounded-[22px] border-white/5 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[11px] font-black italic border border-white/5 group-hover:border-[#FFDD65]/30">
                                   Q{q}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                   <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Maior Vantagem</span>
                                   <span className="text-lg font-black text-white italic tracking-tighter tabular-nums">+{diff} <span className="text-[10px] text-white/20 ml-1">pts</span></span>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-3 bg-white/[0.03] p-2 pl-4 rounded-xl border border-white/5">
                                <span className="text-[9px] font-black text-[#03D791] uppercase tracking-widest italic">
                                   {leader ? leader.split(' ')[0] : 'EMPATE'}
                                </span>
                                {leaderLogo && (
                                  <img src={leaderLogo} className="w-6 h-6 rounded-full border border-white/10 bg-black" alt="" />
                                )}
                             </div>
                          </div>
                        );
                      })}
                      
                      <div className="mt-4 p-5 bg-[#03D791]/5 rounded-[28px] border border-[#03D791]/20 flex items-center justify-between overflow-hidden relative group">
                         <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:scale-125 transition-transform duration-700">
                           <Trophy size={60} className="text-[#03D791]" />
                         </div>
                         <div className="flex flex-col gap-1 relative z-10">
                            <span className="text-[10px] font-black text-[#03D791] uppercase tracking-[0.3em] italic">Destaque da Partida</span>
                            <span className="text-xl font-black text-white italic tracking-tighter">
                              {calculateMaxAdvantage() > 0 ? `Vantagem de +${calculateMaxAdvantage()} pts` : 'Equilíbrio Total'}
                            </span>
                         </div>
                         <Trophy size={20} className="text-[#03D791] relative z-10" />
                      </div>
                    </div>
                  ) : (
                    filteredIncidents.length === 0 ? (
                      <div className="p-10 text-center glass-card rounded-[20px] border-white/5 opacity-10">
                        <p className="text-[9px] font-black uppercase tracking-widest italic">Sem eventos registrados</p>
                      </div>
                    ) : filteredIncidents.map((inc, i) => {
                      const isGoal = inc.incidentType === 'goal' || inc.incidentType === 'scoreChange';
                      const itemStyle = isGoal 
                        ? "bg-[#03D791]/[0.05] border-[#03D791]/20" 
                        : "bg-white/[0.01] border-white/5 opacity-60 hover:opacity-100";
                      const minuteColor = isGoal ? "text-[#03D791]" : "text-white/20";

                      return (
                        <div 
                          key={i} 
                          className={`flex items-center gap-3 p-3 glass-card rounded-[18px] transition-all group relative overflow-hidden ${itemStyle}`}
                        >
                          <div className={`w-8 h-8 flex items-center justify-center shrink-0 tabular-nums text-[11px] font-black border rounded-lg italic shadow-inner ${isGoal ? 'border-[#03D791]/30 bg-[#03D791]/10' : 'border-white/5 bg-white/5'} ${minuteColor}`}>
                            {inc.time || '0'}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-0.5">
                                {getIncidentIcon(inc)}
                                <span className={`text-[11px] font-black uppercase italic tracking-tighter ${isGoal ? 'text-white' : 'text-white/40'}`}>
                                  {inc.incidentType === 'goal' ? 'GOL!' : 
                                   inc.incidentType === 'card' ? (inc.incidentClass === 'yellow' ? 'AMARELO' : 'VERMELHO') :
                                   inc.description || inc.incidentType.toUpperCase()}
                                </span>
                             </div>
                             <p className="text-[10px] font-bold text-[#b9cbbc]/30 truncate uppercase italic tracking-tight">
                               {inc.player?.name || inc.description || (inc.isOwnGoal ? 'Gol Contra' : inc.playerName) || 'Ação de Jogo'}
                             </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-2 px-3 py-1 bg-white/[0.03] rounded-lg border border-white/5">
                             <img src={(inc.isHome ? operation?.sofascoreHomeLogo : operation?.sofascoreAwayLogo) || ''} className={`w-5 h-5 rounded-full border border-white/10 bg-black`} alt="" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer: Diagnostic Info */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between px-2 opacity-10">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#03D791] animate-pulse" />
             <span className="text-[7px] font-black uppercase tracking-[0.3em]">Live Feed Active</span>
           </div>
           <span className="text-[7px] font-black uppercase tracking-[0.3em] font-mono">OP-{operation?.id?.substring(0,8)}</span>
        </div>
      </div>
    </Modal>
  );
}
