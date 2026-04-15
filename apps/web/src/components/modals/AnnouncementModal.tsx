"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Zap,
  Smartphone,
  Calculator,
  Gamepad2,
  Ticket,
  Crown,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const DEPLOY_VERSION = "2.1.0"; // Versão do deploy para controle do modal

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("sucatabet_last_news_version");
    if (lastSeenVersion !== DEPLOY_VERSION) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("sucatabet_last_news_version", DEPLOY_VERSION);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const features = [
    {
      title: "Novos Planos Pagos",
      description: "Lançamento oficial dos planos BÁSICO e SUCATA PRO para maior controle profissional.",
      icon: Crown,
      color: "text-[#ffdd65]",
      bg: "bg-[#ffdd65]/10"
    },
    {
      title: "Otimização Mobile",
      description: "Interface mobile 40% mais leve e adaptada para facilitar o uso no campo.",
      icon: Smartphone,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      title: "Super Calculadora",
      description: "Rework completo na calculadora, garantindo velocidade e precisão.",
      icon: Calculator,
      color: "text-[#03d791]",
      bg: "bg-[#03d791]/10"
    },
    {
      title: "Cassino",
      description: "Módulo de cassino agora em produção para monitoramento e integração no sistema.",
      icon: Gamepad2,
      color: "text-[#00d1ff]",
      bg: "bg-[#00d1ff]/10"
    },
    {
      title: "Alertas de Freebets",
      description: "Sistema inteligente de alertas para freebets perto do vencimento.",
      icon: Ticket,
      color: "text-pink-500",
      bg: "bg-pink-500/10"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-[#03d791]/10 animate-in zoom-in-95 duration-500">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#03d791]/5 blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] -ml-32 -mb-32" />

        {/* Header */}
        <div className="relative p-8 pb-4 text-center">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-white/40 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#03d791]/10 border border-[#03d791]/20 mb-6 group">
            <Sparkles className="w-3.5 h-3.5 text-[#03d791] group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black text-[#03d791] uppercase tracking-[0.3em] italic">UPDATE DISPONÍVEL • V{DEPLOY_VERSION}</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-2">
            GRANDES <span className="text-[#03d791]">MUDANÇAS</span> CHEGARAM!
          </h2>
          <p className="text-sm text-[#b9cbbc] font-medium italic opacity-60">Confira o que preparamos para o seu próximo nível profissional.</p>
        </div>

        {/* Content */}
        <div className="p-8 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="group flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.04]"
              >
                <div className={`w-12 h-12 shrink-0 rounded-2xl ${f.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase italic tracking-tight mb-1">{f.title}</h4>
                  <p className="text-[11px] text-[#b9cbbc] font-medium leading-relaxed opacity-50">{f.description}</p>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-2xl bg-[#03d791]/5 border border-[#03d791]/10 flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-[#03d791]/10 transition-all hover:border-[#03d791]/20">
              <Zap className="w-6 h-6 text-[#03d791] mb-2 animate-bounce" />
              <p className="text-[10px] font-black text-[#03d791] uppercase tracking-widest italic">Prepare sua operação!</p>
              <p className="text-[11px] text-[#03d791]/60 font-medium">O jogo de verdade começa agora.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <button
            onClick={handleClose}
            className="w-full h-14 bg-[#03d791] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(3,215,145,0.3)]"
          >
            ENTENDI, VAMOS OPERAR!
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
