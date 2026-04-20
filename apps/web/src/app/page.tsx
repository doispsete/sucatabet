"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  Database,
  ArrowRight,
  ChevronRight,
  Monitor,
  Layout,
  Activity,
  Zap,
  CheckCircle2,
  Lock,
  Globe
} from "lucide-react";
import Link from "next/link";

// Animation variants for "physics-based" feel
const springTransition: any = {
  type: "spring",
  stiffness: 100,
  damping: 10,
  mass: 1
};

const fadeIn: any = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// --- Sub-components for better organization ---
// Reusable Component: Pixel-Perfect Dashboard Clone (v3.14)
const DashboardMockup = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 120Hz feel
  const springX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  // Parallax offsets
  const gridX = useTransform(springX, [-500, 500], [10, -10]);
  const gridY = useTransform(springY, [-500, 500], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-full h-full bg-[#0a0a0a] flex overflow-hidden font-sans text-white/90 relative text-[10px] group/dashboard"
    >
      {/* 120Hz Interactive Parallax Background */}
      <motion.div
        style={{ x: gridX, y: gridY }}
        className="absolute inset-[-20px] pointer-events-none opacity-[0.06] z-0 overflow-hidden"
      >
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#03d791 1px, transparent 1px), linear-gradient(90deg, #03d791 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </motion.div>

      {/* Mouse Spotlight */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          left: '50%',
          top: '50%'
        }}
        className="absolute w-[600px] h-[600px] -ml-[300px] -mt-[300px] bg-[#03d791]/10 blur-[120px] rounded-full pointer-events-none z-0"
      />

      <motion.div
        animate={{ y: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#03d791]/20 to-transparent blur-sm z-0 pointer-events-none"
      />

      {/* Full Sidebar Clone with Clickable Items */}
      <div className="w-16 md:w-52 border-r border-white/5 flex flex-col p-3 gap-1 bg-black/40 backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-7 h-7 bg-[#03d791] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(3,215,145,0.4)]">
            <Zap className="text-black w-4 h-4 fill-black/20" />
          </div>
          <div className="hidden md:flex flex-col leading-none">
            <span className="font-black tracking-tighter uppercase italic text-[11px]">Sucata<span className="text-[#03d791]">Bet</span></span>
            <span className="text-[7px] font-bold text-white/30 tracking-widest uppercase">Sistema de Surebet</span>
          </div>
        </div>

        {[
          { icon: Layout, label: 'Dashboard', href: '/dashboard', active: true },
          { icon: Activity, label: 'Operações', href: '/operacoes' },
          { icon: Database, label: 'Banco', href: '/banco' },
          { icon: Zap, label: 'Freebets', href: '/freebets' },
          { icon: Monitor, label: 'Cassino', href: '/cassino' },
          { icon: ShieldCheck, label: 'Contas', href: '/contas' },
          { icon: ShieldCheck, label: 'Gerenciar Assinatura', href: '/assinatura' },
        ].map((item, i) => (
          <Link key={i} href={item.href} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${item.active ? 'bg-[#03d791]/10 text-[#03d791]' : 'hover:bg-white/5 text-white/40'}`}>
            <item.icon className="w-4 h-4" />
            <span className="hidden md:block font-bold uppercase tracking-tight text-[9px]">{item.label}</span>
          </Link>
        ))}

        <Link href="/operacoes/nova" className="mt-4 p-3 bg-[#03d791] text-black rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#03d791]/10">
          <div className="w-4 h-4 border-2 border-black rounded-sm flex items-center justify-center font-black text-[10px]">+</div>
          <span className="hidden md:block font-black uppercase text-[10px]">Nova Operação</span>
        </Link>

        {/* User Profile Badge */}
        <div className="mt-auto p-2 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#03d791]/20 to-black" />
          </div>
          <div className="hidden md:block flex-1 leading-tight overflow-hidden text-left">
            <div className="font-black uppercase truncate text-white/90">Demo Dashboard</div>
            <div className="text-[8px] font-black uppercase text-[#03d791]">Plano Pro</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-transparent z-10">
        {/* Topbar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md">
          <div className="flex gap-3">
            <Link href="/calculadora" className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase text-[#b9cbbc] flex items-center gap-2 hover:bg-white/10 transition-colors">
              <Layout className="w-3 h-3" /> Calculadora
            </Link>
            <Link href="/alertas" className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase text-[#b9cbbc] flex items-center gap-2 hover:bg-white/10 transition-colors">
              <Activity className="w-3 h-3" /> Alertas
            </Link>
          </div>
          <div className="text-[8px] font-black text-white/20 tracking-widest uppercase">Sistema Sincronizado</div>
        </div>

        {/* Actual Dashboard Layout from Screenshot (Mockup Data) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto overflow-x-hidden">
          {/* Row 1 */}
          <div className="md:col-span-5 space-y-5">
            <div className="p-5 glass-card rounded-[32px] border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Banca Total</span>
              </div>
              <div className="text-3xl font-black italic tracking-tighter text-white mb-3">R$ 15.420,00</div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                <motion.div animate={{ width: '92%' }} className="h-full bg-[#03d791] shadow-[0_0_15px_#03d791]" />
              </div>
              <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-white/20">
                <span>Disponível</span>
                <span>Em Operação</span>
              </div>
              <div className="flex justify-between text-[9px] font-black italic text-[#03d791] mt-1">
                <span>R$ 12.140,00</span>
                <span className="text-white/60">R$ 3.280,00</span>
              </div>
            </div>

            <div className="p-5 glass-card rounded-[32px] border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[8px] font-black uppercase text-[#03d791] tracking-widest">Meta do Mês</span>
                <span className="text-[#03d791] font-black italic">42.5%</span>
              </div>
              <div className="text-2xl font-black italic tracking-tighter text-white mb-2">R$ 5.700,00</div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="w-[42.5%] h-full bg-[#03d791]" />
              </div>
              <span className="text-[7px] font-black uppercase text-white/20">R$ 2.410,00 Atual</span>
            </div>
          </div>

          <div className="md:col-span-4 space-y-5">
            <div className="p-5 glass-card rounded-[32px] border-white/5 bg-[#03d791]/[0.02] relative overflow-hidden">
              <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#03d791] text-black">
                <ArrowRight className="w-3 h-3 rotate-[-45deg]" />
              </div>
              <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1 italic">Assistente Financeiro</div>
              <div className="text-3xl font-black italic text-[#03d791] tracking-tighter">R$ 0,00</div>
              <div className="text-[7px] font-black text-white/20 uppercase tracking-widest mt-1">Saldo em Banco</div>

              <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[7px] font-black text-white/20 uppercase mb-1">Patrimônio Total</div>
                  <div className="text-lg font-black italic">R$ 15.420,00</div>
                  <span className="text-[7px] font-black text-[#03d791]">+12.4%</span>
                </div>
                <div>
                  <div className="text-[7px] font-black text-white/20 uppercase mb-1">Lucro desse mês</div>
                  <div className="text-lg font-black italic text-[#03d791]">+R$ 2.410,00</div>
                </div>
              </div>
            </div>

            <div className="p-5 glass-card rounded-[32px] border-white/5 bg-white/[0.01]">
              <div className="text-[8px] font-black uppercase text-white/30 mb-6">Resumo das despesas</div>
              <div className="space-y-3">
                <div className="flex justify-between text-[8px] font-black uppercase">
                  <span className="text-white/40">Total desse mês</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase">
                  <span className="text-[#03d791]/40">Já pago</span>
                  <span className="text-[#03d791]">R$ 0,00</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 text-[9px] font-black uppercase text-[#03d791] tracking-widest italic">TUDO PAGO</div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-5">
            <div className="p-5 glass-card rounded-[32px] border-white/5 bg-white/[0.01] h-full flex flex-col justify-between">
              <div>
                <div className="text-[8px] font-black uppercase text-white/30 mb-4 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Próximos vencimentos
                </div>
                <div className="flex flex-col items-center justify-center py-10 opacity-20">
                  <div className="text-[8px] font-black uppercase italic tracking-widest">Nenhuma despesa pendente</div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 p-2.5 rounded-2xl bg-[#03d791]/10 border border-[#03d791]/20 text-[7px] font-black uppercase text-[#03d791] text-center">Entrada</div>
                <div className="flex-1 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-[7px] font-black uppercase text-white/40 text-center">Saída</div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="md:col-span-7">
            <div className="p-6 glass-card rounded-[32px] border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="text-[8px] font-black uppercase text-white/30 mb-1">Relatório de Lucros</div>
                  <div className="text-2xl font-black italic text-[#00eeff]">R$ 417,85</div>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[7px] font-black text-white/30">01/04/2026</div>
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[7px] font-black text-white/30">19/04/2026</div>
                </div>
              </div>
              <svg className="w-full h-32" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path d="M0 100 L 350 95 L 400 60 L 400 100 Z" fill="url(#chartGrad)" opacity="0.2" />
                <path d="M0 100 L 350 95 L 400 60" fill="none" stroke="#00eeff" strokeWidth="2" strokeLinecap="round" />
                <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00eeff" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
              </svg>
              <div className="mt-4 text-[7px] font-black uppercase text-white/20 tracking-widest text-center">Performance de lucros em tempo real</div>
            </div>
          </div>

          <div className="md:col-span-5 flex gap-5">
            <div className="flex-1 p-5 glass-card rounded-[32px] border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-3 h-3 text-[#FFDD65]" />
                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Modos de Finalização</span>
              </div>
              <div className="flex justify-center relative scale-110">
                <svg className="w-20 h-20" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#00ff88" strokeWidth="8" strokeDasharray="251" strokeDashoffset="40" />
                  <text x="50" y="55" textAnchor="middle" className="fill-white text-[18px] font-black italic">7</text>
                </svg>
              </div>
              <div className="mt-8 space-y-1">
                <div className="flex justify-between text-[6px] font-black uppercase"><span className="text-white/20">• Normal</span><span>6</span></div>
                <div className="flex justify-between text-[6px] font-black uppercase"><span className="text-blue-400">• Proteção</span><span>1</span></div>
                <div className="flex justify-between text-[6px] font-black uppercase"><span className="text-[#FFDD65]">• Duplo</span><span>0</span></div>
              </div>
            </div>

            <div className="flex-1 p-5 glass-card rounded-[32px] border-white/5 bg-white/[0.02]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Monitor className="w-3 h-3 text-[#00ff88]" />
                  <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Clube365</span>
                </div>
                <span className="text-[#00eeff] text-[9px] font-black italic">0/1</span>
              </div>
              <div className="mb-4">
                <div className="text-[7px] font-black text-white/40 uppercase mb-1">Conta 1</div>
                <div className="flex justify-between items-baseline">
                  <div className="font-black italic text-sm text-white">R$ 1.107,33</div>
                  <div className="text-[6px] font-black text-white/20 uppercase">Meta: R$ 1.500,00</div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div className="w-[70%] h-full bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NodeTooltip = ({ title, desc, icon: Icon, color }: any) => (
  <motion.div
    variants={{
      initial: { opacity: 0, scale: 0.8, y: 15, visibility: 'hidden' as any },
      hover: { opacity: 1, scale: 1, y: 0, visibility: 'visible' as any }
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 w-60 p-6 glass-card border-white/20 bg-black/95 backdrop-blur-3xl z-[300] pointer-events-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <span className="text-[12px] font-black uppercase tracking-[0.1em] text-white decoration-[#00ff88]/50 underline underline-offset-8 decoration-2">{title}</span>
    </div>
    <p className="text-[11px] text-[#b9cbbc] leading-relaxed font-semibold opacity-80">{desc}</p>
    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/95 border-r border-b border-white/20 rotate-45" />
  </motion.div>
);

// Add Pixel-Perfect Live Match Ticker Component (Madrid x Barcelona)
const LiveMatchTicker = () => {
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [status, setStatus] = useState("LIVE 12'");
  const [showGoal, setShowGoal] = useState<string | null>(null);

  useEffect(() => {
    const goals = [
      { home: 1, away: 0, msg: "REAL MADRID!", status: "LIVE 22'" },
      { home: 1, away: 1, msg: "BARCELONA!", status: "LIVE 41'" },
      { home: 2, away: 1, msg: "REAL MADRID!", status: "LIVE 68'" },
      { home: 2, away: 2, msg: "BARCELONA!", status: "LIVE 83'" },
      { home: 3, away: 2, msg: "MADRID NO FIM!", status: "LIVE 90+2'" },
    ];
    let i = 0;
    const interval = setInterval(() => {
      const goal = goals[i % goals.length];
      setShowGoal(goal.msg);
      setStatus(goal.status);
      setTimeout(() => {
        setScore({ home: goal.home, away: goal.away });
        setShowGoal(null);
      }, 3000);
      i++;
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const renderTeamView = () => {
    return (
      <div className="p-4 h-full flex items-center justify-between gap-2 relative z-10 px-6 max-w-4xl mx-auto w-full">
        {/* Compact Linear Design - Operations Style */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-[11px] md:text-[12px] font-black uppercase text-white truncate italic tracking-tighter">Real Madrid</span>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white flex-shrink-0 shadow-lg border border-white/10 overflow-hidden flex items-center justify-center p-1.5">
            <img
              src="https://api.sofascore.app/api/v1/team/2829/image"
              className="w-full h-full object-contain"
              alt="RM"
              onError={(e) => (e.currentTarget.src = 'https://www.sofascore.com/static/images/team-logo/football_2829.png')}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5 bg-black/60 px-4 md:px-8 py-2.5 rounded-2xl border border-white/5 shadow-inner shrink-0">
          <span className="text-xl md:text-3xl font-black italic tracking-tighter text-white tabular-nums">{score.home}</span>
          <span className="text-white/20 font-bold text-xs uppercase px-1">x</span>
          <span className="text-xl md:text-3xl font-black italic tracking-tighter text-[#03d791] tabular-nums">{score.away}</span>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white flex-shrink-0 shadow-lg border border-white/10 overflow-hidden flex items-center justify-center p-1.5">
            <img
              src="https://api.sofascore.app/api/v1/team/2817/image"
              className="w-full h-full object-contain"
              alt="FCB"
              onError={(e) => (e.currentTarget.src = 'https://www.sofascore.com/static/images/team-logo/football_2817.png')}
            />
          </div>
          <span className="text-[11px] md:text-[12px] font-black uppercase text-white truncate italic tracking-tighter">Barcelona</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#03d791]/10 border border-[#03d791]/20 ml-4">
          <span className="text-[10px] font-black text-[#03d791] uppercase tracking-widest">{status.includes('LIVE') ? 'LIVE' : status}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-24 bg-black/40 backdrop-blur-xl rounded-[32px] border border-white/5 relative overflow-hidden flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={score.home + score.away}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full h-full"
        >
          {renderTeamView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const plans = [
    {
      name: "GRÁTIS",
      subtitle: "EXPERIÊNCIA ESSENCIAL",
      price: { monthly: 0, quarterly: 0, yearly: 0 },
      features: ["Sem API", "1 CPF", "30 Operações por mês", "Calculadora Profissional"],
      cta: "Testar Grátis",
      popular: false
    },
    {
      name: "SUCATA BÁSICO",
      subtitle: "GESTÃO EFICIENTE",
      price: { monthly: 24.90, quarterly: 64.90, yearly: 223.90 },
      features: ["API de 60s", "Até 4 CPF's", "120 Operações por mês", "Calculadora Profissional", "Suporte"],
      cta: "Assinar Básico",
      popular: false
    },
    {
      name: "SUCATA PRO",
      subtitle: "DOMÍNIO TOTAL",
      price: { monthly: 54.90, quarterly: 144.90, yearly: 497.90 },
      features: ["API de 3s", "CPF's Ilimitados", "Operações Ilimitadas", "Calculadora Profissional", "Suporte Preferencial", "Acesso ao Banco"],
      cta: "Garantir Pro",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e2e1] overflow-x-hidden selection:bg-[#00ff88]/30 selection:text-[#00ff88]">
      {/* Dynamic Background Sync - Igual ao Sistema */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            x: `${(mousePos.x - 50) * 0.5}%`,
            y: `${(mousePos.y - 50) * 0.5}%`
          }}
          className="absolute w-[800px] h-[800px] bg-[#03d791]/10 blur-[160px] rounded-full -top-1/4 -left-1/4 will-change-transform"
        />
        <motion.div
          animate={{
            x: `${(50 - mousePos.x) * 0.5}%`,
            y: `${(50 - mousePos.y) * 0.5}%`
          }}
          className="absolute w-[600px] h-[600px] bg-[#03d791]/5 blur-[140px] rounded-full -bottom-1/4 -right-1/4 will-change-transform"
        />
        {/* Noise & Grid Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-100 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
      </div>

      {/* Navbar - Igual ao Sistema */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-[56px] transition-all duration-300 ${scrolled ? 'bg-black/40 backdrop-blur-3xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-[#03d791] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(3,215,145,0.3)] group-hover:scale-105 transition-all">
                <Zap className="text-black w-5 h-5 fill-black/20" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic text-white leading-none">Sucata<span className="text-[#03d791]">Bet</span></span>
                <span className="hidden md:block text-[8px] font-bold text-[#b9cbbc]/40 tracking-[0.2em] uppercase leading-none mt-0.5">Elite Management</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center bg-white/5 rounded-full p-1 border border-white/10 ml-4">
              <a href="#features" className="px-6 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#b9cbbc] hover:text-white transition-all">Funcionalidades</a>
              <a href="#pro" className="px-6 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#b9cbbc] hover:text-white transition-all">Gestão Pro</a>
              <a href="#pricing" className="px-6 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#b9cbbc] hover:text-white transition-all">Preços</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl transition-all hover:border-[#03d791]/20 group mr-4">
              <span className="text-[10px] font-black text-[#B9CBBC] opacity-60 tracking-[0.2em] italic uppercase tabular-nums">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
            </div>
            <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-[#b9cbbc] hover:text-white transition-colors px-4">Login</Link>
            <Link href="/cadastro" className="bg-[#03d791] text-black px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_20px_rgba(3,215,145,0.2)]">Começar</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springTransition}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Zap className="w-4 h-4 text-[#FFDD65] fill-[#FFDD65]/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDD65]">Plataforma V3.8 — Desenvolvida para Escala</span>
          </motion.div>

          <motion.h1
            {...fadeIn}
            className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tighter italic mb-8"
          >
            GESTÃO DE <span className="text-[#00ff88] drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">ELITE</span> PARA OPERADORES PROFISSIONAIS.
          </motion.h1>

          <motion.p
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#b9cbbc] font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Esqueça planilhas complexas. Domine o mercado com um ERP completo para apostas,
            gestão de bancas multi-contas e api em tempo real sem delay.
          </motion.p>

          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/cadastro" className="group relative bg-[#00ff88] text-black px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-tighter flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,255,136,0.2)]">
              Garantir Acesso
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-tighter text-[#b9cbbc] hover:text-white hover:bg-white/5 transition-all">Ver Detalhes</a>
          </motion.div>
        </div>

        {/* Dashboard Mockup - Physics-based 3D Tilt */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          style={{ perspective: "2000px" }}
          className="max-w-7xl mx-auto mt-24 relative px-4"
        >
          <motion.div
            whileHover={{ rotateX: 10, rotateY: -10, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative p-2 glass-card rounded-[44px] border-white/10 bg-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] transform-gpu h-[500px] md:h-[650px] overflow-hidden"
          >
            <DashboardMockup />

            {/* Overlay Grid for Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            {/* Floating UI Elements with Parallax */}


          </motion.div>

          {/* Depth Shadow */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-[#00ff88]/10 blur-[100px] rounded-full -z-10" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-gradient-to-b from-transparent to-black/50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="text-[#00ff88] text-sm font-black uppercase tracking-[0.4em] block mb-4">Eficiência Máxima</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic max-w-2xl">
              POR QUE O SUCATABET É O <span className="text-[#FFDD65]">PADRÃO OURO</span>?
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: <Clock className="w-10 h-10 text-[#00ff88]" />,
                title: "PROCESSAMENTO PARALELO",
                desc: "Nossa infraestrutura escala horizontalmente para processar milhares de requisições por segundo sem degradação de performance."
              },
              {
                icon: <Database className="w-10 h-10 text-blue-400" />,
                title: "Gestão Multibanca",
                desc: "Controle centenas de casas de apostas em uma única interface profissional e centralizada."
              },
              {
                icon: <ShieldCheck className="w-10 h-10 text-[#FFDD65]" />,
                title: "Privacidade de Dados",
                desc: "Suas estratégias e dados bancários são protegidos por camadas de criptografia que nem mesmo nossa equipe consegue acessar."
              },
              {
                icon: <Monitor className="w-10 h-10 text-purple-400" />,
                title: "Dashboard em Tempo Real",
                desc: "Sincronização 1:1 com o servidor. O que acontece na nossa API reflete instantaneamente na sua tela."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                whileHover={{ y: -10 }}
                className="p-8 glass-card rounded-[40px] border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group flex flex-col items-start gap-4"
              >
                <div className="p-4 rounded-2xl bg-white/5 inline-block group-hover:scale-110 transition-transform w-fit">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black italic mb-4 leading-none uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-[#b9cbbc] font-medium leading-relaxed text-sm opacity-60 group-hover:opacity-100 transition-opacity">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* NEW: API & Infrastructure Showcase */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#00ff88]/20 rounded-2xl flex items-center justify-center">
                <Zap className="text-[#00ff88] w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[#00ff88] text-sm font-black uppercase tracking-[0.4em]">API Zero Delay</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic mb-8">
              O TIME QUE <span className="text-[#00ff88]">MUDOU O JOGO</span>.
            </h2>
            <p className="text-xl text-[#b9cbbc] mb-12 opacity-80 leading-relaxed font-medium">
              Nossa API é conectada diretamente aos provedores de feed globais. Isso significa que você vê o gol antes de qualquer outro lugar, garantindo a vantagem competitiva necessária para operar com precisão cirúrgica.
            </p>
            <div className="p-1 glass-card border-white/10 bg-white/5 rounded-[32px] overflow-hidden max-w-md">
              <LiveMatchTicker />
            </div>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#00ff88]/10 blur-[120px] rounded-full" />
            <div className="relative glass-card border-white/5 bg-black/40 p-12 rounded-[56px] shadow-2xl">
              <div className="grid grid-cols-1 gap-12">
                {[
                  {
                    icon: Globe, title: "IP RESIDENCIAL ISOLADO",
                    desc: "Cada cliente utiliza um túnel dedicado de IP residencial para evitar detecções de scraping e cruzamento de metadados das casas."
                  },
                  {
                    icon: Clock, title: "LATÊNCIA < 100MS",
                    desc: "Nossos servidores estão estrategicamente posicionados ao redor do mundo para garantir que a informação chegue em milissegundos."
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center shrink-0 group-hover:bg-[#00ff88]/20 transition-all border border-white/10">
                      <item.icon className="w-8 h-8 text-[#00ff88]" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black italic uppercase mb-3 text-white">{item.title}</h4>
                      <p className="text-[#b9cbbc] text-sm leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity italic font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Security & Encryption Section */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-[#FFDD65] text-sm font-black uppercase tracking-[0.4em] block mb-4">Segurança Militar</span>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic text-white leading-none">
              BLINDAGEM DE <span className="text-[#FFDD65]">DADOS</span> COMPLETA.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "CRIPTOGRAFIA AES-256",
                desc: "Utilizamos o mesmo padrão de criptografia adotado por bancos e agências de inteligência para proteger seus dados sensíveis.",
                icon: Lock
              },
              {
                title: "IP ISOLATION PROTOCOL",
                desc: "A arquitetura SucataBet garante que sua sessão de navegador seja única e impossível de ser vinculada a outros usuários.",
                icon: ShieldCheck
              },
              {
                title: "AUDITORIA DE ACESSOS",
                desc: "Cada requisição é monitorada por inteligência artificial para detectar atividades suspeitas e proteger sua conta 24/7.",
                icon: Activity
              }
            ].map((item, i) => (
              <div key={i} className="p-10 glass-card border-white/5 bg-white/[0.02] rounded-[48px] relative group hover:bg-[#FFDD65]/5 transition-all">
                <div className="w-16 h-16 bg-[#FFDD65]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#FFDD65]/20 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-[#FFDD65]" />
                </div>
                <h3 className="text-2xl font-black italic uppercase mb-6 text-white tracking-tight leading-none">{item.title}</h3>
                <p className="text-[#b9cbbc] text-sm leading-relaxed font-semibold opacity-60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Management Concept */}
      <section id="pro" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-amber-500 text-sm font-black uppercase tracking-[0.4em] block mb-6">Foco em Performance</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic mb-10">
              O SISTEMA QUE <span className="text-white">OPERADORES</span> DE VERDADE USAM.
            </h2>

            <div className="space-y-8">
              {[
                { title: "Calculadora Integrada", desc: "Arredondamentos inteligentes e cálculos de lucro real em milissegundos." },
                { title: "Alertas Inteligentes", desc: "Notificações para encerramentos, freebets expirando, lucros e metas batidas." },
                { title: "Auditoria Completa", desc: "Logs cirúrgicos de cada centavo que entra e sai da sua operação." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className="w-12 h-12 rounded-2xl bg-[#03d791]/10 flex items-center justify-center shrink-0 group-hover:bg-[#03d791]/20 transition-colors">
                    <CheckCircle2 className="text-[#03d791] w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black italic uppercase italic mb-1">{item.title}</h4>
                    <p className="text-[#b9cbbc] text-sm opacity-60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <motion.div className="mt-16">
              <Link href="/cadastro" className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
                Explorar Ferramentas
                <ChevronRight className="w-5 h-5 text-[#03d791]" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 50 }}
            style={{ perspective: "1000px" }}
            className="relative p-12"
          >
            <motion.div
              whileHover={{ rotateX: 10, rotateY: -10 }}
              className="aspect-square relative flex items-center justify-center transform-gpu"
            >
              <div className="absolute inset-0 bg-[#03d791]/20 blur-[100px] rounded-full animate-pulse" />

              {/* Central Shield Wheel */}
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-[#03d791]/30 rounded-full"
                />

                <div className="relative z-[0] w-48 h-48 bg-black border-4 border-[#03d791] rounded-[40px] flex items-center justify-center shadow-[0_0_50px_#03d79160]">
                  <ShieldCheck className="w-20 h-20 text-[#03d791]" />
                </div>

                {/* Satellite Feature Nodes */}
                {[
                  { icon: Database, color: "#00ff88", title: "CONTROLE TOTAL", desc: "Gestão unificada de saldo e ativos" },
                  { icon: Activity, color: "#00eeff", title: "API LIVE", desc: "Dados de milissegundos direto do feed" },
                  { icon: Lock, color: "#FFDD65", title: "BLINDAGEM", desc: "Criptografia de ponta a ponta" },
                  { icon: TrendingUp, color: "#ff4d4d", title: "SCALING", desc: "Performance de nível institucional" }
                ].map((node, i) => (
                  <motion.div
                    key={i}
                    initial="initial"
                    whileHover="hover"
                    className="absolute"
                    style={{
                      top: `${50 + 40 * Math.sin((i * 90 * Math.PI) / 180)}%`,
                      left: `${50 + 40 * Math.cos((i * 90 * Math.PI) / 180)}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <NodeTooltip {...node} />
                    <div
                      className="w-16 h-16 bg-black border-2 border-white/10 rounded-2xl flex items-center justify-center cursor-help hover:border-[#03d791] hover:scale-110 transition-all shadow-xl"
                      style={{ boxShadow: `0 0 20px ${node.color}20` }}
                    >
                      <node.icon className="w-6 h-6" style={{ color: node.color }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic mb-8">
              ESCOLHA SEU <span className="text-[#03d791]">NÍVEL</span>.
            </h2>

            <div className="inline-flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'quarterly' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Trimestral <span className="text-[8px] opacity-60 ml-1">(-15%)</span>
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'yearly' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
              >
                Anual <span className="text-[8px] opacity-60 ml-1">(-25%)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative p-10 rounded-[48px] flex flex-col border transition-all duration-500 ${plan.popular ? 'bg-white text-black border-transparent shadow-[0_40px_100px_rgba(3,215,145,0.3)] scale-105 z-10' : 'bg-white/[0.02] border-white/5 text-white hover:border-[#03d791]/30 hover:bg-[#03d791]/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)]'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#03d791] text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(3,215,145,0.4)]">
                    Mais Assinado
                  </div>
                )}

                <div className="mb-8">
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${plan.popular ? 'text-black/40' : 'text-[#03d791]'}`}>{plan.subtitle}</span>
                  <h3 className="text-4xl font-black italic tracking-tighter uppercase mt-2 leading-none">{plan.name}</h3>
                </div>

                <div className="mb-10 flex items-baseline gap-1 relative">
                  <span className="text-2xl font-black italic tracking-tight">R$</span>
                  <span className="text-7xl font-black italic tracking-tighter leading-none">
                    {billingCycle === 'monthly' ? plan.price.monthly : billingCycle === 'quarterly' ? plan.price.quarterly : plan.price.yearly}
                  </span>
                  <span className={`text-sm font-bold uppercase tracking-widest ${plan.popular ? 'text-black/40' : 'text-white/20'}`}>
                    / {billingCycle === 'monthly' ? 'mês' : billingCycle === 'quarterly' ? 'tri' : 'ano'}
                  </span>
                </div>

                <div className="space-y-4 mb-12 flex-1">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-black/5' : 'bg-[#03d791]/10'}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${plan.popular ? 'text-black' : 'text-[#03d791]'}`} />
                      </div>
                      <span className={`text-xs font-semibold ${plan.popular ? 'text-black/70' : 'text-white/60'}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/cadastro"
                  className={`w-full py-5 rounded-2xl text-center font-black uppercase tracking-widest text-xs transition-all shadow-xl ${plan.popular ? 'bg-black text-white hover:bg-black/90 active:scale-95' : 'bg-white text-black hover:bg-[#03d791] active:scale-95'}`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 relative bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-[#03d791] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(3,215,145,0.2)]">
                <Zap className="text-black w-4 h-4 fill-black/20" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic text-white">Sucata<span className="text-[#03d791]">Bet</span></span>
            </Link>
            <p className="text-[10px] font-bold text-[#b9cbbc]/40 uppercase tracking-[0.2em]">O padrão ouro em gestão de apostas profisionais.</p>
          </div>

          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[.3em] text-[#b9cbbc]/60">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Telegram</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[.3em] text-[#b9cbbc]/20">
            © 2026 SucataBet. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
