"use client";
import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { useModal } from '@/lib/context/modal-context';
import { PlansModal } from '../modals/PlansModal';

interface UpgradeOverlayProps {
  title?: string;
  message?: string;
  highlightIcon?: boolean;
}

export function UpgradeOverlay({ title = "Recurso Premium", message = "Faça o upgrade de plano para ter acesso a essa funcionalidade.", highlightIcon = true }: UpgradeOverlayProps) {
  const [isPlansOpen, setIsPlansOpen] = React.useState(false);

  return (
    <>
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md bg-black/40 rounded-inherit pointer-events-auto">
        <div className="flex flex-col items-center max-w-sm gap-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative">
            <div className={`w-16 h-16 rounded-3xl bg-black/50 border flex items-center justify-center shadow-2xl relative z-10 
              ${highlightIcon ? 'border-[#facc15]/30' : 'border-white/10'}`}>
              <Lock className={`w-8 h-8 ${highlightIcon ? 'text-[#facc15]' : 'text-white'}`} />
            </div>
            {highlightIcon && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-[#facc15]/20 blur-xl rounded-full" />
            )}
          </div>
          
          <div>
            <h3 className={`text-xl font-black italic uppercase tracking-tighter ${highlightIcon ? 'text-[#facc15]' : 'text-white'}`}>
              {title}
            </h3>
            <p className="text-[10px] text-[#B9CBBC] mt-2 mb-6 font-bold uppercase tracking-[0.2em] italic max-w-[280px] mx-auto leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={() => setIsPlansOpen(true)}
            className={`w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all duration-300 will-change-transform hover:scale-105 active:scale-95
              ${highlightIcon ? 'bg-[#facc15] text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'bg-white text-black'}`}
          >
            <Crown size={14} /> Fazer Upgrade
          </button>
        </div>
      </div>

      <PlansModal 
        isOpen={isPlansOpen}
        onClose={() => setIsPlansOpen(false)}
      />
    </>
  );
}
