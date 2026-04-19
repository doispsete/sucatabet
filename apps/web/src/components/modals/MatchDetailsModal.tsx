"use client";
import React, { useState, useEffect } from "react";
import { 
  X, 
  Trophy, 
  Timer, 
  Layout, 
  AlertCircle,
  ChevronRight,
  ShieldCheck
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
      
      // Definitively check sport
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
      // Basketball incidents vary, let's include major ones
      return ['foul', 'technical', 'scoreChange', 'periodStart', 'periodEnd'].includes(type) || inc.description?.toLowerCase().includes('ponto');
    }
    return ['goal', 'card', 'var', 'penalty'].includes(type);
  }).reverse(); // Mais recente primeiro

  const getIncidentIcon = (inc: any) => {
    switch (inc.incidentType) {
      case 'goal': return <span className="text-lg">⚽</span>;
      case 'card': 
        return inc.incidentClass === 'yellow' 
          ? <div className="w-3 h-4 bg-yellow-400 rounded-sm border border-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          : <div className="w-3 h-4 bg-red-500 rounded-sm border border-red-700 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />;
      case 'var': return <span className="text-lg">📺</span>;
      case 'penalty': return <span className="text-lg">🥅</span>;
      case 'foul': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'technical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'scoreChange': return <Trophy className="w-4 h-4 text-[#03D791]" />;
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
      <div className="space-y-8 py-2">
        {/* Header Header */}
        <div className="flex flex-col items-center gap-6 p-8 glass-card rounded-[35px] border-white/5 bg-white/[0.02]">
           <p className="text-[10px] font-black text-[#b9cbbc]/20 uppercase tracking-[0.5em] italic">{eventDetails?.tournament?.name || operation?.sofascoreLeague || 'PARTIDA'}</p>
           
           <div className="flex items-center justify-between w-full max-w-2xl">
              <div className="flex flex-col items-center gap-3 flex-1">
                <img src={operation?.sofascoreHomeLogo || ''} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full border-2 border-white/10 bg-black shadow-2xl" alt="" />
                <span className="text-xs font-black uppercase tracking-widest text-center text-white/80">{operation?.sofascoreHomeName}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-6">
                   <span className="text-6xl font-black italic tracking-tighter tabular-nums text-white">
                     {eventDetails?.homeScore?.current ?? operation?.sofascoreHomeScore ?? 0}
                   </span>
                   <span className="text-2xl font-black text-white/5 italic">×</span>
                   <span className="text-6xl font-black italic tracking-tighter tabular-nums text-white">
                     {eventDetails?.awayScore?.current ?? operation?.sofascoreAwayScore ?? 0}
                   </span>
                </div>
                 {(() => {
                   const status = eventDetails?.status;
                   const p = status?.period;
                   const desc = (status?.description || '').toLowerCase();
                   let headerPeriod = operation?.sofascorePeriod;
                   
                   // Se tivermos detalhes frescos do evento, usamos eles preferencialmente
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
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-[#03D791]/10 rounded-full border-2 border-[#03D791]/30 shadow-[0_0_15px_rgba(3,215,145,0.2)]">
                      <span className="text-xs font-black text-[#03D791] uppercase italic tracking-[0.2em] animate-pulse">
                        {displayPeriod} {operation?.sofascoreMinute ? `• ${operation?.sofascoreMinute}${String(operation?.sofascoreMinute).includes(':') ? '' : "'"}` : ''}
                      </span>
                    </div>
                   );
                 })()}
              </div>

              <div className="flex flex-col items-center gap-3 flex-1">
                <img src={operation?.sofascoreAwayLogo || ''} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full border-2 border-white/10 bg-black shadow-2xl" alt="" />
                <span className="text-xs font-black uppercase tracking-widest text-center text-white/50">{operation?.sofascoreAwayName}</span>
              </div>
           </div>
        </div>

        {/* Dynamic Content */}
        {loading && !eventDetails ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
            <Timer className="w-10 h-10 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Sofascore...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-red-500/40">
            <AlertCircle className="w-10 h-10" />
            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Esquerda: Placar por tempo / Quarto */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <Layout className="w-4 h-4 text-[#03D791] animate-pulse" />
                <h3 className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-[0.4em] italic">Resumo do Placar</h3>
              </div>

              {isBasketball ? (
                <div className="p-6 glass-card rounded-[35px] border-white/5 bg-white/[0.02]">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="py-3 text-[9px] font-black text-[#b9cbbc]/30 uppercase tracking-widest text-left">QUARTOS</th>
                        <th className="py-3 text-[9px] font-black text-white/40">Q1</th>
                        <th className="py-3 text-[9px] font-black text-white/40">Q2</th>
                        <th className="py-3 text-[9px] font-black text-white/40">Q3</th>
                        <th className="py-3 text-[9px] font-black text-white/40">Q4</th>
                        {eventDetails?.homeScore?.period5 !== undefined && <th className="py-3 text-[9px] font-black text-white/40">OT</th>}
                        <th className="py-3 text-[9px] font-black text-[#03D791]">TOT</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-black italic tracking-tighter tabular-nums">
                      <tr className="border-b border-white/5">
                        <td className="py-4 text-left text-white/60 truncate max-w-[80px]">{eventDetails?.homeTeam?.name || 'Casa'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.homeScore?.period1 ?? '-'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.homeScore?.period2 ?? '-'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.homeScore?.period3 ?? '-'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.homeScore?.period4 ?? '-'}</td>
                        {eventDetails?.homeScore?.period5 !== undefined && <td className="py-4 text-white/30">{eventDetails?.homeScore?.period5}</td>}
                        <td className="py-4 text-[#03D791] text-lg">{eventDetails?.homeScore?.current ?? 0}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-4 text-left text-white/60 truncate max-w-[80px]">{eventDetails?.awayTeam?.name || 'Fora'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.awayScore?.period1 ?? '-'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.awayScore?.period2 ?? '-'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.awayScore?.period3 ?? '-'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.awayScore?.period4 ?? '-'}</td>
                        {eventDetails?.awayScore?.period5 !== undefined && <td className="py-4 text-white/30">{eventDetails?.awayScore?.period5}</td>}
                        <td className="py-4 text-[#03D791] text-lg">{eventDetails?.awayScore?.current ?? 0}</td>
                      </tr>
                      <tr className="bg-white/[0.02]">
                        <td className="py-4 text-left px-2">
                           <span className="text-[9px] font-black text-[#FFDD65]/50 uppercase tracking-widest italic">VANTAGEM</span>
                        </td>
                        {[1, 2, 3, 4].map(q => {
                          const h = eventDetails?.homeScore?.[`period${q}`];
                          const a = eventDetails?.awayScore?.[`period${q}`];
                          if (h === undefined || a === undefined) return <td key={q} className="py-4 text-[#FFDD65]/10">-</td>;
                          const diff = h - a;
                          if (diff === 0) return <td key={q} className="py-4 text-[#FFDD65]/40 text-[10px]">E</td>;
                          return (
                            <td key={q} className="py-4">
                              <div className="flex flex-col items-center">
                                <span className={`text-[7px] font-black leading-none mb-0.5 ${diff > 0 ? 'text-[#03D791]' : 'text-[#ff4d4d]'}`}>
                                  {diff > 0 ? 'CASA' : 'FORA'}
                                </span>
                                <span className="text-[11px] font-black text-white tabular-nums">
                                  +{Math.abs(diff)}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                        {eventDetails?.homeScore?.period5 !== undefined && (
                          <td className="py-4">
                            <div className="flex flex-col items-center">
                              {(() => {
                                const h = eventDetails.homeScore.period5;
                                const a = eventDetails.awayScore.period5;
                                const diff = h - a;
                                return (
                                  <>
                                    <span className={`text-[7px] font-black leading-none mb-0.5 ${diff > 0 ? 'text-[#03D791]' : 'text-[#ff4d4d]'}`}>
                                      {diff > 0 ? 'CASA' : 'FORA'}
                                    </span>
                                    <span className="text-[11px] font-black text-white tabular-nums">+{Math.abs(diff)}</span>
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                        )}
                        <td className="py-4 bg-[#FFDD65]/10 rounded-r-[20px]">
                           {(() => {
                              const h = eventDetails?.homeScore?.current || 0;
                              const a = eventDetails?.awayScore?.current || 0;
                              const diff = h - a;
                              return (
                                <div className="flex flex-col items-center">
                                  <span className="text-[8px] font-bold text-[#FFDD65] uppercase leading-none mb-1">{diff > 0 ? 'CASA' : diff < 0 ? 'FORA' : 'EMP'}</span>
                                  <span className="text-[15px] font-black text-[#FFDD65] drop-shadow-[0_0_10px_rgba(255,221,101,0.3)]">+{Math.abs(diff)}</span>
                                </div>
                              );
                           })()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Maior Vantagem Geral */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between px-2">
                    <span className="text-[9px] font-black text-[#b9cbbc]/20 uppercase tracking-widest italic">Estatísticas Especiais</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFDD65]/5 rounded-xl border border-[#FFDD65]/10">
                      <Trophy className="w-3.5 h-3.5 text-[#FFDD65] animate-bounce-subtle" />
                      <span className="text-[11px] font-black text-white italic tracking-tight">
                         Maior Atropelo: <span className="text-[#FFDD65]">+{calculateMaxAdvantage()} PTS</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 glass-card rounded-[35px] border-white/5 bg-white/[0.02] space-y-4">
                   <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between text-[11px] font-black italic tracking-tighter">
                         <span className="text-[#b9cbbc]/40 uppercase tracking-[0.4em] not-italic text-[9px]">1º TEMPO</span>
                         <span className="text-3xl tabular-nums text-white/80">{eventDetails?.homeScore?.period1 ?? 0} × {eventDetails?.awayScore?.period1 ?? 0}</span>
                      </div>
                      <div className="w-full h-px bg-white/5" />
                      <div className="flex items-center justify-between text-[11px] font-black italic tracking-tighter">
                         <span className="text-[#b9cbbc]/40 uppercase tracking-[0.4em] not-italic text-[9px]">2º TEMPO</span>
                         <span className="text-3xl tabular-nums text-white/80">{eventDetails?.homeScore?.period2 ?? 0} × {eventDetails?.awayScore?.period2 ?? 0}</span>
                      </div>
                      <div className="w-full h-1 bg-[#03D791]/20 rounded-full mt-4" />
                      <div className="flex items-center justify-between text-base font-black italic tracking-tighter text-[#03D791]">
                         <span className="uppercase tracking-[0.4em] not-italic text-[10px] text-[#03D791]/60">PLACAR FINAL</span>
                         <span className="text-5xl tabular-nums drop-shadow-[0_0_20px_rgba(3,215,145,0.4)]">{eventDetails?.homeScore?.current ?? 0} × {eventDetails?.awayScore?.current ?? 0}</span>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Direita: Incidents */}
            <div className="space-y-6">
               <div className="flex items-center gap-3 px-2">
                <Trophy className="w-4 h-4 text-[#03D791]" />
                <h3 className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-[0.4em] italic">Eventos Importantes</h3>
              </div>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredIncidents.length === 0 ? (
                  <div className="p-12 text-center glass-card rounded-[30px] border-white/5 opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-widest italic">Aguardando lances reais...</p>
                  </div>
                ) : filteredIncidents.map((inc, i) => {
                  const isGoal = inc.incidentType === 'goal';
                  const highlightColor = (isGoal || inc.isHome) ? '#03D791' : 'transparent';
                  const dotColor = (isGoal || inc.isHome) ? 'bg-[#03D791]' : 'bg-white/10';
                  const logoBorder = (isGoal || inc.isHome) ? 'border-[#03D791] shadow-[0_0_15px_rgba(3,215,145,0.3)]' : 'border-white/10 opacity-40';
                  
                  return (
                    <div 
                      key={i} 
                      className={`flex items-center gap-5 p-5 glass-card rounded-[25px] border-white/5 hover:bg-white/[0.04] transition-all group relative overflow-hidden ${isGoal ? 'bg-[#03D791]/[0.02]' : ''}`} 
                      style={{ borderLeft: (isGoal || inc.isHome) ? `4px solid #03D791` : '1px solid rgba(255,255,255,0.05)' }}
                    >
                      {/* Glow Overlay for Goals */}
                      {isGoal && <div className="absolute inset-0 bg-gradient-to-r from-[#03D791]/5 to-transparent pointer-events-none" />}
                      
                      {/* Minute Box */}
                      <div className="w-10 h-10 flex items-center justify-center shrink-0 tabular-nums text-[12px] font-black text-[#03D791] bg-[#03D791]/5 border border-[#03D791]/20 rounded-xl group-hover:scale-110 transition-transform italic shadow-inner">
                        {inc.time || '?'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3 mb-1">
                            {getIncidentIcon(inc)}
                            <span className="text-[13px] font-black uppercase italic tracking-tighter text-white">
                              {inc.incidentType === 'goal' ? 'GOL!' : 
                               inc.incidentType === 'card' ? (inc.incidentClass === 'yellow' ? 'AMARELO' : 'VERMELHO') :
                               inc.incidentType === 'var' ? 'VAR' :
                               inc.incidentType === 'penalty' ? 'PÊNALTI' :
                               inc.incidentType === 'foul' ? 'FALTA' :
                               inc.incidentType === 'technical' ? 'TÉCNICA' :
                               inc.incidentType === 'scoreChange' ? 'PONTUOU' :
                               inc.description || inc.incidentType.toUpperCase()}
                            </span>
                         </div>
                         <p className="text-[11px] font-bold text-[#b9cbbc]/40 truncate group-hover:text-white/60 transition-colors uppercase italic tracking-tight">
                           {inc.player?.name || inc.description || (inc.isOwnGoal ? 'Gol Contra' : inc.playerName) || 'Lance de Jogo'}
                         </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                         <div className="flex flex-col items-end mr-1">
                            <span className={`text-[8px] font-black uppercase italic tracking-widest ${(isGoal || inc.isHome) ? 'text-[#03D791]' : 'text-[#b9cbbc]/20'}`}>
                               {inc.isHome ? (operation?.sofascoreHomeName || 'CASA') : (operation?.sofascoreAwayName || 'FORA')}
                            </span>
                         </div>
                         <div className="relative">
                            <img 
                              src={(inc.isHome ? operation?.sofascoreHomeLogo : operation?.sofascoreAwayLogo) || ''} 
                              className={`w-8 h-8 rounded-full border-2 bg-black transition-all ${logoBorder}`} 
                              alt="" 
                            />
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${dotColor}`} />
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Footer info */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-6 opacity-20">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-[#03D791] animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-widest">Sincronização em tempo real</span>
           </div>
           <div className="flex items-center gap-2">
             <Layout className="w-3 h-3" />
             <span className="text-[8px] font-black uppercase tracking-widest text-[#b9cbbc]">ID: {operation?.id?.substring(0,8)}</span>
           </div>
        </div>
      </div>
    </Modal>
  );
}
