"use client";
import React from "react";
import { createPortal } from "react-dom";
import { X, Shield, Check, Zap, Star, Crown } from "lucide-react";
import { toast } from "@/components/ui/components";

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlansModal({ isOpen, onClose }: PlansModalProps) {
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

  const plans = [
    {
      name: "FREE",
      icon: Shield,
      price: "R$ 0",
      description: "Para quem está começando.",
      features: [
        "Limite de 1 CPF",
        "Operações Básicas",
        "Dashboard básico",
      ],
      color: "#b9cbbc",
      highlight: false
    },
    {
      name: "BASIC",
      icon: Star,
      price: "Consulte",
      description: "Mais flexibilidade operacional.",
      features: [
        "Limite de 3 CPFs",
        "Operações ilimitadas",
        "Prioridade básica",
      ],
      color: "#00ff88",
      highlight: false
    },
    {
      name: "PRO",
      icon: Crown,
      price: "Consulte",
      description: "O poder total do sistema.",
      features: [
        "CPFs Ilimitados",
        "Módulo BANCO Completo",
        "Balance Check Automático",
        "Suporte Prioritário 24h",
        "Acesso ao CASSINO",
      ],
      color: "#facc15",
      highlight: true
    }
  ];

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        ref={modalRef}
        className="w-full max-w-4xl bg-[#0a0a0a] rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff88]/5 blur-[100px] -mr-32 -mt-32" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 md:p-12 w-full">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-[#00ff88] w-4 h-4 fill-[#00ff88]" />
              <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.3em]">Upgrade seu jogo</span>
            </div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Planos de Assinatura</h2>
            <p className="text-[#b9cbbc]/60 text-sm mt-2 max-w-md">Escolha o plano ideal para sua operação e maximize seus lucros com o SucataBet.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div 
                  key={plan.name}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col
                    ${plan.highlight 
                      ? "bg-white/[0.03] border-[#00ff88]/30 shadow-[0_0_40px_rgba(0,255,136,0.05)] scale-105" 
                      : "bg-white/[0.01] border-white/5 hover:border-white/10"}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff88] text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Mais Popular
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl border flex items-center justify-center"
                      style={{ borderColor: `${plan.color}20`, backgroundColor: `${plan.color}05` }}
                    >
                      <Icon size={20} style={{ color: plan.color }} />
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-white/40 font-bold uppercase tracking-widest">A partir de</span>
                      <span className="text-xl font-black text-white italic">{plan.price}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white uppercase italic">{plan.name}</h3>
                  <p className="text-[10px] text-white/40 font-medium mb-6 uppercase tracking-wider">{plan.description}</p>

                  <div className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[#00ff88]" />
                        <span className="text-[11px] text-white/70 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => toast.success("Entre em contato com o suporte para upgrade.")}
                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                      ${plan.highlight 
                        ? "bg-[#00ff88] text-black hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]" 
                        : "bg-white/5 text-white hover:bg-white/10"}`}
                  >
                    Selecionar Plano
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
