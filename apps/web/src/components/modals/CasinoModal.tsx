"use client";
import React from "react";
import { createPortal } from "react-dom";
import { X, Gamepad2, Sparkles, Timer, Lock } from "lucide-react";

interface CasinoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CasinoModal({ isOpen, onClose }: CasinoModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        className="w-full max-w-[400px] bg-[#0a0a0a] rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#00ff88]/10 blur-[60px] -mt-20" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-center mx-auto mb-6 relative">
            <Gamepad2 className="text-[#00ff88] w-10 h-10" />
            <div className="absolute -top-2 -right-2 bg-[#00ff88] p-1.5 rounded-lg shadow-[0_0_15px_rgba(0,255,136,0.3)]">
              <Sparkles className="text-black w-3 h-3" />
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Módulo Cassino</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <Timer className="text-[#00ff88] w-3 h-3" />
              <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-widest">Em Desenvolvimento</span>
            </div>
          </div>

          <p className="text-[#b9cbbc]/60 text-sm mb-8 leading-relaxed">
            Estamos preparando a melhor experiência de gestão para cassino. Em breve você terá acesso a ferramentas avançadas de análise e monitoramento.
          </p>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 flex items-center justify-center shrink-0">
              <Lock className="text-[#00ff88] w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-tight">Acesso Exclusivo</h4>
              <p className="text-[10px] text-white/40 font-medium">Este módulo estará disponível apenas para usuários do plano PRO.</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-8 py-4 bg-white text-black font-black uppercase tracking-widest italic rounded-xl text-[10px] hover:bg-white/90 transition-all"
          >
            Entendi, avisar quando lançar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
