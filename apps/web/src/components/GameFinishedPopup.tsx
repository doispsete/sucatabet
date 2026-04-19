"use client";
import React, { useState, useEffect } from "react";
import { 
  X, 
  Trophy, 
  ArrowRight, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Gift,
  DollarSign
} from "lucide-react";
import { OperationType } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

export interface PendingNotification {
  operationId: string;
  operationType: OperationType;
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homeLogo: string;
  awayLogo: string;
  league: string;
}

interface GameFinishedPopupProps {
  notifications: PendingNotification[];
  onClose: (id: string) => void;
  onAction: (notif: PendingNotification) => void;
}

export function GameFinishedPopup({ notifications, onClose, onAction }: GameFinishedPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= notifications.length && notifications.length > 0) {
      setCurrentIndex(notifications.length - 1);
    }
  }, [notifications.length, currentIndex]);

  if (notifications.length === 0) return null;

  const current = notifications[currentIndex];

  const getActionLabels = (type: OperationType) => {
    switch (type) {
      case OperationType.FREEBET_GEN:
        return {
          title: "🎁 Jogo Encerrado — Freebet",
          question: "Sua freebet foi gerada?",
          primary: "SIM — Encerrar",
          secondary: "NÃO — Anular"
        };
      case OperationType.EXTRACAO:
        return {
          title: "💰 Jogo Encerrado — Extração",
          question: "Marque a casa vencedora para calcular o % da extração",
          primary: "Ver Detalhes",
          secondary: "Ignorar"
        };
      default:
        return {
          title: "⚽ Jogo Encerrado!",
          question: "A partida terminou. Deseja encerrar a operação agora?",
          primary: "Encerrar Operação",
          secondary: "Ignorar"
        };
    }
  };

  const labels = getActionLabels(current.operationType);

  return (
    <div className="fixed bottom-8 right-8 z-[9999] w-full max-w-[380px] animate-in slide-in-from-right-8 duration-500">
      <div className="relative glass-card rounded-[35px] border-2 border-[#00ff88]/30 bg-[#111]/90 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,136,0.1)] p-6 overflow-hidden">
        
        {/* Progress Dots/Counter */}
        {notifications.length > 1 && (
          <div className="absolute top-4 right-14 flex items-center gap-2">
            <span className="text-[8px] font-black text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded-full border border-[#00ff88]/20 tracking-widest">
              {currentIndex + 1} / {notifications.length}
            </span>
          </div>
        )}

        {/* Close Button */}
        <button 
          onClick={() => onClose(current.operationId)}
          className="absolute top-4 right-6 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col gap-5">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#00ff88]/10 flex items-center justify-center border border-[#00ff88]/20 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                {current.operationType === OperationType.FREEBET_GEN ? <Gift size={16} className="text-[#00ff88]" /> : 
                 current.operationType === OperationType.EXTRACAO ? <DollarSign size={16} className="text-[#00ff88]" /> : 
                 <Trophy size={16} className="text-[#00ff88]" />}
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-white italic">{labels.title}</h3>
           </div>

           {/* Match Info */}
           <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 flex flex-col items-center gap-3">
              <p className="text-[8px] font-black text-[#b9cbbc]/20 uppercase tracking-[0.4em] italic">{current.league}</p>
              
              <div className="flex items-center justify-between w-full">
                 <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <img src={current.homeLogo} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-white/10 bg-black" alt="" />
                    <span className="text-[9px] font-black uppercase text-white/40 truncate w-full text-center">{current.homeName}</span>
                 </div>
                 
                 <div className="flex items-center gap-3 px-4">
                    <span className="text-2xl font-black italic tracking-tighter tabular-nums text-white">{current.homeScore}</span>
                    <span className="text-xs font-black text-white/5">×</span>
                    <span className="text-2xl font-black italic tracking-tighter tabular-nums text-white">{current.awayScore}</span>
                 </div>

                 <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <img src={current.awayLogo} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-white/10 bg-black" alt="" />
                    <span className="text-[9px] font-black uppercase text-white/40 truncate w-full text-center">{current.awayName}</span>
                 </div>
              </div>
           </div>

           <p className="text-[10px] font-bold text-[#b9cbbc]/60 px-2 italic text-center">
             {labels.question}
           </p>

           <div className="flex flex-col gap-2">
              <button 
                onClick={() => onAction(current)}
                className="w-full bg-[#00ff88] text-[#002110] font-black uppercase tracking-widest py-3.5 rounded-xl text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,255,136,0.2)] italic flex items-center justify-center gap-2 group"
              >
                {labels.primary}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => onClose(current.operationId)}
                className="w-full bg-white/5 text-[#b9cbbc] font-black uppercase tracking-widest py-3 rounded-xl text-[10px] hover:bg-white/10 transition-all italic"
              >
                {labels.secondary}
              </button>
           </div>

           {/* Navigation */}
           {notifications.length > 1 && (
             <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/5">
                <button 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="p-1.5 text-white/20 hover:text-[#00ff88] disabled:opacity-0 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                   {notifications.map((_, i) => (
                      <div key={i} className={`w-1 h-1 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-[#00ff88]' : 'bg-white/10'}`} />
                   ))}
                </div>
                <button 
                  disabled={currentIndex === notifications.length - 1}
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="p-1.5 text-white/20 hover:text-[#00ff88] disabled:opacity-0 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
