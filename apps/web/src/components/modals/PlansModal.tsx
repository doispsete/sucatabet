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
  type BillingCycle = "monthly" | "quarterly" | "annual";
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("annual");

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
      pricing: {
        monthly: { price: "R$ 0", billedText: "Grátis para sempre", discount: null, link: null },
        quarterly: { price: "R$ 0", billedText: "Grátis para sempre", discount: null, link: null },
        annual: { price: "R$ 0", billedText: "Grátis para sempre", discount: null, link: null }
      },
      description: "Para quem está começando.",
      features: [
        "Limite de 1 CPF",
        "Operações Básicas",
        "Dashboard básico",
      ],
      color: "#b9cbbc",
      highlight: false,
    },
    {
      name: "BÁSICO",
      icon: Star,
      pricing: {
        monthly: { price: "R$ 24,90", billedText: "Cobrado mensalmente", discount: null, link: "https://buy.stripe.com/7sYfZb0o1fZE5qFg8Eak002" },
        quarterly: { price: "R$ 21,63", billedText: "R$ 64,90 a cada 3 meses", discount: "-13%", link: "https://buy.stripe.com/28EaER4Eh7t8f1f7C8ak004" },
        annual: { price: "R$ 18,65", billedText: "R$ 223,90 a cada 12 meses", discount: "-25%", link: "https://buy.stripe.com/aFa9AN6MpbJobP3cWsak003" }
      },
      description: "Mais flexibilidade operacional.",
      features: [
        "Limite de 3 CPFs",
        "Operações ilimitadas",
        "Prioridade básica",
      ],
      color: "#00ff88",
      highlight: false,
    },
    {
      name: "SUCATA PRO",
      icon: Crown,
      pricing: {
        monthly: { price: "R$ 54,90", billedText: "Cobrado mensalmente", discount: null, link: "https://buy.stripe.com/28EeV79YB14K5qF5u0ak000" },
        quarterly: { price: "R$ 48,30", billedText: "R$ 144,90 a cada 3 meses", discount: "-12%", link: "https://buy.stripe.com/fZudR38Ux4gW3ixaOkak005" },
        annual: { price: "R$ 41,49", billedText: "R$ 497,90 a cada 12 meses", discount: "-24%", link: "https://buy.stripe.com/7sY28l4Eh14Kg5j5u0ak001" }
      },
      description: "O poder total do sistema.",
      features: [
        "CPFs Ilimitados",
        "Módulo BANCO Completo",
        "Balance Check Automático",
        "Suporte Prioritário 24h",
        "Acesso ao CASSINO",
      ],
      color: "#facc15",
      highlight: true,
      monthlyLink: "https://buy.stripe.com/28EeV79YB14K5qF5u0ak000",
      annualLink: "https://buy.stripe.com/7sY28l4Eh14Kg5j5u0ak001"
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
          <div className="mb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-[#00ff88] w-4 h-4 fill-[#00ff88]" />
                <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.3em]">Upgrade seu jogo</span>
              </div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Planos de Assinatura</h2>
              <p className="text-[#b9cbbc]/60 text-sm mt-2 max-w-md">Escolha o plano ideal para sua operação e maximize seus lucros com o SucataBet.</p>
            </div>

            {/* Toggle Switch - 3 Options */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 relative overflow-hidden">
              <div
                className="absolute top-1 bottom-1 bg-[#00ff88]/20 border border-[#00ff88]/30 rounded-xl transition-all duration-300 ease-in-out"
                style={{
                  width: billingCycle === 'monthly' ? '96px' : billingCycle === 'quarterly' ? '112px' : '96px',
                  left: billingCycle === 'monthly' ? '4px' : billingCycle === 'quarterly' ? '100px' : '212px',
                }}
              />

              <button
                onClick={() => setBillingCycle("monthly")}
                className={`relative z-10 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors w-24 ${billingCycle === "monthly" ? "text-white" : "text-white/40"}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle("quarterly")}
                className={`relative z-10 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors w-28 ${billingCycle === "quarterly" ? "text-white" : "text-white/40"}`}
              >
                Trimestral
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`relative z-10 px-4 py-2 flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors w-24 ${billingCycle === "annual" ? "text-[#00ff88]" : "text-white/40"}`}
              >
                Anual
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-2xl border transition-all duration-500 ease-out flex flex-col will-change-transform
                    ${plan.highlight
                      ? "bg-white/[0.03] border-[#00ff88]/30 shadow-[0_0_40px_rgba(0,255,136,0.05)] scale-105 hover:scale-110"
                      : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:scale-105"}`}
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
                      {plan.name !== "FREE" ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-white italic">{plan.pricing[billingCycle].price}</span>
                            <span className="text-[10px] text-white/40 font-bold uppercase">/mês</span>
                          </div>
                          <span className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5">
                            {plan.pricing[billingCycle].billedText}
                          </span>
                          {plan.pricing[billingCycle].discount && (
                            <div className="text-[8px] text-black font-black uppercase tracking-wider mt-1.5 bg-[#00ff88] inline-block px-2 py-0.5 rounded shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                              {plan.pricing[billingCycle].discount}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-black text-white italic">R$ 0</span>
                          <span className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5">Grátis para sempre</span>
                        </div>
                      )}
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
                    onClick={async () => {
                      const currentPricing = plan.pricing[billingCycle];
                      if (currentPricing.link) {
                        toast.success(`Redirecionando para o Checkout do Plano ${plan.name}...`);
                        try {
                          const { authService } = await import('@/lib/api/services');
                          const user = await authService.me();
                          window.location.href = `${currentPricing.link}?client_reference_id=${user.id}`;
                        } catch (err) {
                          console.error(err);
                          window.location.href = currentPricing.link;
                        }
                      } else {
                        toast.success("Você já está no Plano Inicial.");
                      }
                    }}
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
