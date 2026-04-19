"use client";
import React, { useState, useEffect } from 'react';
import { Trophy, Timer } from 'lucide-react';

export function GameStartOverlay() {
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleGameStart = (e: any) => {
      const data = e.detail;
      setActiveNotification(data);
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setActiveNotification(null), 1000);
      }, 5000);
    };

    window.addEventListener('game-started', handleGameStart);
    return () => window.removeEventListener('game-started', handleGameStart);
  }, []);

  if (!activeNotification) return null;

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background Flash */}
      <div className={`absolute inset-0 bg-[#00ff88]/5 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'} animate-pulse-slow`} />
      
      {/* Content Container */}
      <div className={`relative flex flex-col items-center gap-6 p-12 transition-all duration-700 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}>
        
        {/* Animated Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-[500px] h-[500px] rounded-full border border-[#00ff88]/20 animate-ping-slow opacity-20" />
           <div className="w-[400px] h-[400px] rounded-full border border-[#00ff88]/10 animate-ping-slower opacity-10" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
           <div className="flex items-center gap-4 px-6 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-full backdrop-blur-md animate-bounce-subtle">
              <Timer size={16} className="text-[#00ff88]" />
              <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.5em] italic">Partida Iniciada</span>
           </div>

           <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] text-center">
              A Posta está <br />
              <span className="text-[#00ff88] drop-shadow-[0_0_50px_rgba(0,255,136,0.6)] animate-pulse">EM JOGO!</span>
           </h2>

           <div className="flex items-center gap-8 mt-8 bg-black/60 p-8 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-2xl animate-float">
              <div className="flex flex-col items-center gap-3 w-32">
                 <img src={activeNotification?.homeLogo} className="w-16 h-16 rounded-full border-2 border-[#00ff88]/50 shadow-[0_0_20px_rgba(0,255,136,0.3)]" alt="" />
                 <span className="text-xs font-black text-white/60 uppercase truncate w-full text-center">{activeNotification?.homeName}</span>
              </div>

              <div className="text-4xl font-black text-white/5 italic">VS</div>

              <div className="flex flex-col items-center gap-3 w-32">
                 <img src={activeNotification?.awayLogo} className="w-16 h-16 rounded-full border-2 border-[#00ff88]/50 shadow-[0_0_20px_rgba(0,255,136,0.3)]" alt="" />
                 <span className="text-xs font-black text-white/60 uppercase truncate w-full text-center">{activeNotification?.awayName}</span>
              </div>
           </div>

           <p className="mt-6 text-[10px] font-black text-[#b9cbbc]/30 uppercase tracking-[0.8em] italic">
              {activeNotification?.league}
           </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes ping-slow {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes ping-slower {
          0% { transform: scale(0.3); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
        .animate-ping-slow { animation: ping-slow 3s infinite cubic-bezier(0, 0, 0.2, 1); }
        .animate-ping-slower { animation: ping-slower 4s infinite cubic-bezier(0, 0, 0.2, 1); }
        .animate-bounce-subtle { animation: bounce-subtle 2s infinite ease-in-out; }
        .animate-float { animation: float 6s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
