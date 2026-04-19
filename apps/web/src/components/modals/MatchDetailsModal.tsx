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
  const [incidents, setIncidents] = useState<any[]>([]);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventId = operation.sofascoreEventId;
  const homeScore = operation.sofascoreHomeScore;
  const awayScore = operation.sofascoreAwayScore;

  const [isBasketball, setIsBasketball] = useState(
    operation.sofascoreLeague?.toLowerCase().includes('nba') || 
    operation.sofascoreLeague?.toLowerCase().includes('nbb') ||
    operation.sofascoreLeague?.toLowerCase().includes('basket') ||
    operation.sofascoreLeague?.toLowerCase().includes('b1 league')
  );

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
           <p className="text-[10px] font-black text-[#b9cbbc]/20 uppercase tracking-[0.5em] italic">{eventDetails?.tournament?.name || operation.sofascoreLeague || 'PARTIDA'}</p>
           
           <div className="flex items-center justify-between w-full max-w-2xl">
              <div className="flex flex-col items-center gap-3 flex-1">
                <img src={operation.sofascoreHomeLogo || ''} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full border-2 border-white/10 bg-black shadow-2xl" alt="" />
                <span className="text-xs font-black uppercase tracking-widest text-center text-white/80">{operation.sofascoreHomeName}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-6">
                   <span className="text-6xl font-black italic tracking-tighter tabular-nums text-white">
                     {eventDetails?.homeScore?.current ?? operation.sofascoreHomeScore ?? 0}
                   </span>
                   <span className="text-2xl font-black text-white/5 italic">×</span>
                   <span className="text-6xl font-black italic tracking-tighter tabular-nums text-white">
                     {eventDetails?.awayScore?.current ?? operation.sofascoreAwayScore ?? 0}
                   </span>
                </div>
                {operation.sofascorePeriod && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#03D791]/10 rounded-full border border-[#03D791]/20">
                    <span className="text-[10px] font-black text-[#03D791] uppercase italic tracking-widest">
                      {operation.sofascorePeriod} {operation.sofascoreMinute ? `• ${operation.sofascoreMinute}'` : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-3 flex-1">
                <img src={operation.sofascoreAwayLogo || ''} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full border-2 border-white/10 bg-black shadow-2xl" alt="" />
                <span className="text-xs font-black uppercase tracking-widest text-center text-white/80">{operation.sofascoreAwayName}</span>
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
                <Layout className="w-4 h-4 text-[#03D791]" />
                <h3 className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-[0.3em]">Resumo do Placar</h3>
              </div>

              {isBasketball ? (
                <div className="p-6 glass-card rounded-[25px] border-white/5 bg-white/[0.02]">
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
                      <tr>
                        <td className="py-4 text-left text-white/60 truncate max-w-[80px]">{eventDetails?.awayTeam?.name || 'Fora'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.awayScore?.period1 ?? '-'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.awayScore?.period2 ?? '-'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.awayScore?.period3 ?? '-'}</td>
                        <td className="py-4 text-white/30">{eventDetails?.awayScore?.period4 ?? '-'}</td>
                        {eventDetails?.awayScore?.period5 !== undefined && <td className="py-4 text-white/30">{eventDetails?.awayScore?.period5}</td>}
                        <td className="py-4 text-[#03D791] text-lg">{eventDetails?.awayScore?.current ?? 0}</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  {/* Maior Vantagem */}
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between px-2">
                    <span className="text-[9px] font-black text-[#b9cbbc]/20 uppercase tracking-widest italic">Estatísticas</span>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3 h-3 text-[#FFDD65]" />
                      <span className="text-[10px] font-bold text-white italic">
                         Maior Vantagem: +{calculateMaxAdvantage()} pts
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 glass-card rounded-[25px] border-white/5 bg-white/[0.02] space-y-4">
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between text-[11px] font-black italic tracking-tighter">
                         <span className="text-[#b9cbbc]/40 uppercase tracking-widest not-italic">1º Tempo</span>
                         <span className="text-2xl tabular-nums">{eventDetails?.homeScore?.period1 ?? 0} × {eventDetails?.awayScore?.period1 ?? 0}</span>
                      </div>
                      <div className="w-full h-px bg-white/5" />
                      <div className="flex items-center justify-between text-[11px] font-black italic tracking-tighter">
                         <span className="text-[#b9cbbc]/40 uppercase tracking-widest not-italic">2º Tempo</span>
                         <span className="text-2xl tabular-nums">{eventDetails?.homeScore?.period2 ?? 0} × {eventDetails?.awayScore?.period2 ?? 0}</span>
                      </div>
                      <div className="w-full h-1 bg-[#03D791]/10 rounded-full mt-2" />
                      <div className="flex items-center justify-between text-base font-black italic tracking-tighter text-[#03D791]">
                         <span className="uppercase tracking-[0.2em] not-italic text-[10px]">Placar Final</span>
                         <span className="text-4xl tabular-nums">{eventDetails?.homeScore?.current ?? 0} × {eventDetails?.awayScore?.current ?? 0}</span>
                      </div>
                   </div>
                </div>
              )}
            </div>

            {/* Direita: Incidents */}
            <div className="space-y-6">
               <div className="flex items-center gap-3 px-2">
                <Trophy className="w-4 h-4 text-[#03D791]" />
                <h3 className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-[0.3em]">Eventos Importantes</h3>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
                {filteredIncidents.length === 0 ? (
                  <div className="p-8 text-center glass-card rounded-[25px] border-white/5 opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-widest">Aguardando eventos...</p>
                  </div>
                ) : filteredIncidents.map((inc, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 glass-card rounded-[20px] border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 tabular-nums text-[11px] font-black text-[#03D791] border border-[#03D791]/20 rounded-lg group-hover:scale-110 transition-transform">
                      {inc.time || '?'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-0.5">
                          {getIncidentIcon(inc)}
                          <span className="text-xs font-black uppercase italic tracking-tighter text-white/90 truncate">
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
                       <p className="text-[10px] font-bold text-[#b9cbbc]/60 truncate group-hover:text-white/80 transition-colors">
                         {inc.player?.name || inc.description || (inc.isOwnGoal ? 'Gol Contra' : inc.playerName) || 'Evento no jogo'}
                       </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                       <span className={`w-1.5 h-1.5 rounded-full ${inc.isHome ? 'bg-[#03D791]' : 'bg-white/10'}`} />
                       <ShieldCheck className={`w-4 h-4 ${inc.isHome ? 'text-[#03D791]' : 'text-white/10'}`} />
                    </div>
                  </div>
                ))}
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
             <span className="text-[8px] font-black uppercase tracking-widest text-[#b9cbbc]">ID: {operation.id.substring(0,8)}</span>
           </div>
        </div>
      </div>
    </Modal>
  );
}
