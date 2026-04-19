"use client";
import React, { useState, useEffect } from "react";
import { 
  X, 
  Trophy, 
  ArrowRight, 
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
  disabled?: boolean;
}

export function GameFinishedPopup({ notifications, onClose, onAction, disabled }: GameFinishedPopupProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Regras de exibição: Online + Não desativado por outros modais
  if (notifications.length === 0 || !isOnline || disabled) return null;

  // Sempre mostramos a primeira notificação (Fila Sequencial)
  const current = notifications[0];

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[450px] glass-card rounded-[45px] border-2 border-[#00ff88]/40 bg-[#0a0a0b]/95 shadow-[0_50px_100px_rgba(0,0,0,0.9),0_0_40px_rgba(0,255,136,0.15)] p-10 overflow-hidden transform scale-100 animate-in zoom-in-95 duration-500">
        
        {/* Progress Counter */}
        {notifications.length > 1 && (
          <div className="absolute top-6 right-20 flex items-center gap-2">
            <span className="text-[10px] font-black text-[#00ff88] bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/20 tracking-[0.2em] italic">
              1 / {notifications.length}
            </span>
          </div>
        )}

         {/* Close Button */}
         <button 
           onClick={() => onClose(current?.operationId)}
           className="absolute top-6 right-8 p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all"
         >
           <X size={20} />
         </button>

         <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#00ff88]/10 flex items-center justify-center border border-[#00ff88]/20 shadow-[0_0_20px_rgba(0,255,136,0.3)] animate-pulse">
                 {current?.operationType === OperationType.FREEBET_GEN ? <Gift size={24} className="text-[#00ff88]" /> : 
                  current?.operationType === OperationType.EXTRACAO ? <DollarSign size={24} className="text-[#00ff88]" /> : 
                  <Trophy size={24} className="text-[#00ff88]" />}
               </div>
               <div className="flex flex-col">
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white italic leading-tight">{labels.title}</h3>
                 <span className="text-[10px] font-bold text-[#00ff88]/60 uppercase tracking-widest">Ação Necessária</span>
               </div>
            </div>

            {/* Match Info Box */}
            <div className="p-8 bg-black/40 rounded-[35px] border border-white/5 flex flex-col items-center gap-6 shadow-inner">
               <p className="text-[10px] font-black text-[#b9cbbc]/20 uppercase tracking-[0.5em] italic">{current?.league}</p>
               
               <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                     <img src={current?.homeLogo} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full border-2 border-white/10 bg-black shadow-2xl" alt="" />
                     <span className="text-[11px] font-black uppercase text-white/60 truncate w-full text-center tracking-tighter">{current?.homeName}</span>
                  </div>
                  
                  <div className="flex items-center gap-6 px-4">
                     <span className="text-5xl font-black italic tracking-tighter tabular-nums text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{current?.homeScore}</span>
                     <span className="text-2xl font-black text-white/5 italic">×</span>
                     <span className="text-5xl font-black italic tracking-tighter tabular-nums text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{current?.awayScore}</span>
                  </div>

                  <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
                     <img src={current?.awayLogo} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full border-2 border-white/10 bg-black shadow-2xl" alt="" />
                     <span className="text-[11px] font-black uppercase text-white/60 truncate w-full text-center tracking-tighter">{current?.awayName}</span>
                  </div>
               </div>
            </div>

           <div className="px-4 text-center">
             <p className="text-sm font-black text-[#b9cbbc] italic tracking-tight leading-relaxed">
               {labels.question}
             </p>
           </div>

           <div className="flex flex-col gap-3">
              <button 
                onClick={() => onAction(current)}
                className="w-full bg-[#00ff88] text-[#002110] font-black uppercase tracking-[0.2em] py-5 rounded-[20px] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,255,136,0.3)] italic flex items-center justify-center gap-3 group"
              >
                {labels.primary}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => onClose(current.operationId)}
                className="w-full bg-white/5 text-[#b9cbbc] font-black uppercase tracking-[0.2em] py-4 rounded-[18px] text-[10px] hover:bg-white/10 transition-all italic"
              >
                {labels.secondary}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
