"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, ChevronLeft, Shield, Zap, Target, Crown, X, Star } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPlans: () => void;
}

export function OnboardingModal({ isOpen, onClose, onOpenPlans }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Prevenir scroll quando aberto
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const steps = [
    {
      title: "Bem-vindo ao SucataBet!",
      subtitle: "A plataforma inteligente para extrair lucros sem risco.",
      icon: Target,
      content: "Você acaba de entrar no sistema mais avançado para gerenciamento de Surebets e Arbitragem Esportiva. Aqui você não aposta com a sorte, você investe com inteligência."
    },
    {
      title: "Controle Total",
      subtitle: "Gestão inteligente de banca e CPFs.",
      icon: Shield,
      content: "No SucataBet, você administra múltiplas bancas, controla o saldo de bancos reais (como Nubank, Inter) e gerencia os lucros projetados sem planilhas complexas."
    },
    {
      title: "Acelere seus Resultados",
      subtitle: "Automação e rapidez nos registros.",
      icon: Zap,
      content: "Nossa interface foi construída para você fechar operações de Extração e Freebets em segundos, maximizando seu tempo e evitando o 'derretimento' das odds."
    },
    {
      title: "Escolha seu Nível",
      subtitle: "Para crescer, você precisa das ferramentas certas.",
      icon: Crown,
      content: (
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-sm text-[#b9cbbc]/70 mb-2">
            No <strong>Plano Gratuito</strong> você está limitado a apenas 1 CPF e não possui acesso ao Módulo Banco Automático. 
          </p>
          <div className="bg-[#facc15]/10 border border-[#facc15]/30 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#facc15]/20 blur-[50px] -mr-16 -mt-16 transition-all group-hover:bg-[#facc15]/40" />
            <h4 className="font-black italic text-[#facc15] text-lg uppercase tracking-tight flex items-center gap-2">
              <Crown size={16} /> Plano Sucata Pro
            </h4>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-xs font-medium text-white/80"><Star size={10} className="text-[#facc15]" /> CPFs e Contas Ilimitadas</li>
              <li className="flex items-center gap-2 text-xs font-medium text-white/80"><Star size={10} className="text-[#facc15]" /> Balance Check & Banco Simplificado</li>
              <li className="flex items-center gap-2 text-xs font-medium text-white/80"><Star size={10} className="text-[#facc15]" /> Suporte Prioritário</li>
            </ul>
            <p className="text-xs text-[#facc15]/80 italic mt-2">Não perca dinheiro operando no escuro. Profissionalize sua gestão.</p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onClose();
      onOpenPlans(); // Abre o modal de planos no final do onboarding
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const CurrentIcon = steps[currentStep].icon;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a0a] rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Decorativo */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00ff88]/10 blur-[100px] pointer-events-none" />
        
        <button 
          onClick={handleSkip}
          className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header Progress */}
        <div className="flex gap-2 p-8 pb-0">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                idx <= currentStep ? 'bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.5)]' : 'bg-white/10'
              }`} 
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="px-8 py-10 md:px-12 flex-grow min-h-[300px] flex flex-col justify-center">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-[#00ff88]">
            <CurrentIcon size={32} className={currentStep === 3 ? "text-[#facc15]" : ""} />
          </div>
          
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-[#00ff88] text-sm font-bold uppercase tracking-widest mb-6">
            {steps[currentStep].subtitle}
          </p>
          
          <div className="text-base text-[#b9cbbc]/80 font-medium leading-relaxed">
            {steps[currentStep].content}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 md:px-12 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs font-black uppercase tracking-widest text-[#b9cbbc]/40 hover:text-white transition-colors"
          >
            Pular Tutorial
          </button>
          
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button
              onClick={handleNext}
              className={`px-8 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                currentStep === steps.length - 1 
                ? 'bg-[#facc15] text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:scale-105'
                : 'bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:scale-105'
              }`}
            >
              {currentStep === steps.length - 1 ? 'Ver Planos & Upgrade' : 'Próximo Passo'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
