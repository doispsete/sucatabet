"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  History,
  Ticket,
  ArrowUpRight,
  Plus,
  Timer,
  ExternalLink,
  Target,
  PieChart,
  CircleDollarSign,
  ArrowRight,
  BarChart3,
  X,
  Pencil,
  Check,
  Target as TargetIcon
} from "lucide-react";
import Link from "next/link";
import { useDashboardSummary, useDashboardClub, useOperations, useUpdateBankGoal } from "@/lib/hooks";
import { SkeletonCard, CustomDatePicker, CustomDateRangePicker } from "@/components/ui/components";
import { OperationDetailsModal } from "@/components/modals/OperationDetailsModal";
import { MatchIndicator } from "@/components/MatchIndicator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BankSummaryCard } from "@/components/BankSummaryCard";
import { DepositWithdrawModal } from "@/components/modals/DepositWithdrawModal";
import { OnboardingModal } from "@/components/modals/OnboardingModal";
import { PlansModal } from "@/components/modals/PlansModal";
import { MatchDetailsModal } from "@/components/modals/MatchDetailsModal";

// --- Utility functions and Sub-components moved outside to prevent re-mounting and re-evaluating ---

const groupPerformanceData = (data: any[]) => {
  if (!data || data.length === 0) return [];

  // Choose targetPoints based on period length
  const days = data.length;
  let targetPoints;

  if (days <= 15) targetPoints = days; // 1 to 15 points
  else if (days <= 35) targetPoints = 15; // ~Monthly: 15 points
  else if (days <= 65) targetPoints = 20; // ~2 Months: 20 points
  else if (days <= 95) targetPoints = 25; // ~3 Months: 25 points
  else targetPoints = 30; // Longer periods: 30 points (e.g. 120 days)

  // Ensure we don't have more points than days
  if (targetPoints > days) targetPoints = days;

  const groups = [];
  const groupSize = data.length / targetPoints;

  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * groupSize);
    const end = (i === targetPoints - 1) ? data.length : Math.floor((i + 1) * groupSize);
    const slice = data.slice(start, end);

    if (slice.length === 0) continue;

    const sum = slice.reduce((acc, curr) => acc + (curr.value || 0), 0);
    const count = slice.reduce((acc, curr) => acc + (curr.count || 0), 0);
    const volume = slice.reduce((acc, curr) => acc + (curr.volume || 0), 0);

    const bestDay = slice.reduce((prev, curr) => (curr.value || 0) > (prev.value || 0) ? curr : prev, slice[0]);

    const label = slice.length > 1
      ? `${slice[0].label} - ${slice[slice.length - 1].label}`
      : `${slice[0].label}`;

    groups.push({
      label,
      value: sum,
      count,
      volume,
      bestDay,
      items: slice
    });
  }
  return groups;
};

// --- Sub-components moved outside to prevent re-mounting on every render ---

const TiltCard = ({ children, className, glowColor = "#00ff88" }: { children: React.ReactNode, className?: string, glowColor?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;

    cardRef.current.style.setProperty("--rx", `${rotateX}deg`);
    cardRef.current.style.setProperty("--ry", `${rotateY}deg`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--rx", "0deg");
    cardRef.current.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-card p-6 rounded-3xl transition-all duration-300 card-interact ${className}`}
      style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))", transformStyle: "preserve-3d", perspective: "1000px" } as any}
    >
      {children}
    </div>
  );
};

export default function DashboardPage() {
  const [startDate, setStartDate] = useState<string | null>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  });
  const [endDate, setEndDate] = useState<string | null>(new Date().toISOString());
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [settlementDrillDown, setSettlementDrillDown] = useState<string | null>(null);
  const [detailOperation, setDetailOperation] = useState<any>(null);
  const [perfPeriod, setPerfPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txMode, setTxMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isMatchDetailsModalOpen, setIsMatchDetailsModalOpen] = useState(false);
  const [selectedMatchOp, setSelectedMatchOp] = useState<any>(null);

  const updateGoal = useUpdateBankGoal();

  const { data: summary, isLoading: isSummaryLoading, error: errorSummary, refetch: refetchSummary } = useDashboardSummary({
    startDate: startDate || undefined,
    endDate: endDate || undefined
  });
  const { data: club, isLoading: isClubLoading, error: errorClub, refetch: refetchClub } = useDashboardClub();

  // Handle Onboarding logic
  useEffect(() => {
    if (summary && typeof window !== 'undefined') {
      const hasSeen = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeen) {
        setIsOnboardingOpen(true);
        localStorage.setItem('hasSeenOnboarding', 'true');
      }
    }
  }, [summary]);

  // ⚠️ Hooks DEVEM estar antes de qualquer early return (Rules of Hooks)
  const currentPerformance = useMemo(() => {
    if (!summary?.performance?.[perfPeriod]) return [];
    return groupPerformanceData(summary.performance[perfPeriod]);
  }, [summary, perfPeriod]);

  const maxPerfValue = useMemo(() =>
    Math.max(...(currentPerformance.length > 0 ? currentPerformance.map((p: any) => Math.abs(p.value)) : [1]), 1),
  [currentPerformance]);

  if (errorSummary || errorClub) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 flex items-center gap-3">
          <History className="w-5 h-5" />
          <p className="text-sm font-bold uppercase tracking-tight">Erro ao carregar dashboard: {errorSummary || errorClub}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => { refetchSummary(); refetchClub(); }}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Tentar Novamente
          </button>

          {(String(errorSummary).includes('autenticado') || String(errorClub).includes('autenticado')) && (
            <button
              onClick={() => {
                document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                window.location.href = '/login';
              }}
              className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/20"
            >
              Fazer Login Novamente
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!summary || !club) return null;

  return (
    <div className="space-y-8 px-3 md:px-6 animate-glide">
      {/* Top Row — KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Banca + Meta */}
        <div className="md:col-span-2 lg:col-span-5 flex flex-col gap-6 h-full">
          {/* NOVO CARD — BANCA TOTAL */}
          <div className="glass-card rounded-[32px] p-6 md:p-8 border-l border-primary/20 flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-40 mb-2 italic">BANCA TOTAL</p>
              <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">
                R$ {formatCurrency((summary.disponivel || 0) + (summary.emOperacao || 0))}
              </h3>
              
              <div className="mt-6 mb-8">
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 flex">
                  <div 
                    className="h-full bg-[#00ff88] transition-all duration-1000 ease-out"
                    style={{ width: `${((summary.disponivel || 0) / ((summary.disponivel || 0) + (summary.emOperacao || 0) || 1)) * 100}%` }}
                    title={`Disponível: R$ ${formatCurrency(summary.disponivel || 0)}`}
                  />
                  <div 
                    className="h-full bg-white transition-all duration-1000 ease-out"
                    style={{ width: `${((summary.emOperacao || 0) / ((summary.disponivel || 0) + (summary.emOperacao || 0) || 1)) * 100}%` }}
                    title={`Em Operação: R$ ${formatCurrency(summary.emOperacao || 0)}`}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                  <span className="text-[8px] font-black text-[#00ff88] uppercase italic">DISPONÍVEL</span>
                  <span className="text-[8px] font-black text-white uppercase italic">EM OPERAÇÃO</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[8px] font-black text-white/20 uppercase mb-1 italic">DISPONÍVEL</p>
                  <p className="text-sm font-black italic text-[#00ff88]">
                    R$ {formatCurrency(summary.disponivel || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-white/20 uppercase mb-1 italic">EM OPERAÇÃO</p>
                  <p className="text-sm font-black italic text-white/70">
                    R$ {formatCurrency(summary.emOperacao || 0)}
                  </p>
                </div>
              </div>
            </div>
            <Wallet className="absolute -bottom-6 -right-6 w-32 h-32 text-primary/5 pointer-events-none opacity-20 group-hover:rotate-12 transition-all duration-700" />
          </div>

          {/* NOVO CARD — META DO MÊS */}
          <div className="glass-card rounded-[32px] p-6 md:p-8 group relative overflow-hidden border-l border-primary/20 flex-1">
            <div className="relative z-10 flex flex-col h-full justify-between">
              {summary.monthlyGoal && summary.monthlyGoal > 0 ? (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TargetIcon className="w-3 h-3 text-primary" />
                          <p className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-40 italic">META DO MÊS</p>
                          <button
                            onClick={() => {
                              setGoalInput(summary.monthlyGoal.toString());
                              setIsEditingGoal(true);
                            }}
                            className="p-1 hover:bg-white/5 rounded transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-2.5 h-2.5 text-white/40" />
                          </button>
                        </div>
                        <p className="text-2xl font-black text-white italic tracking-tight">
                          R$ {formatCurrency(summary.monthlyGoal)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-white/30 uppercase mb-1 tracking-widest">PROGRESSO</p>
                        <p className="text-base font-black italic text-primary">
                          {((summary.lucroMes / summary.monthlyGoal) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${(summary.lucroMes / summary.monthlyGoal) >= 1 ? 'bg-[#00ff88] shadow-[0_0_15px_#00ff88]' :
                            (summary.lucroMes / summary.monthlyGoal) >= 0.5 ? 'bg-[#03D791]' :
                              (summary.lucroMes / summary.monthlyGoal) >= 0.25 ? 'bg-amber-500' :
                                'bg-red-500'
                            }`}
                          style={{ width: `${Math.min((summary.lucroMes / summary.monthlyGoal) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black italic uppercase">
                        <span className="text-white/40">R$ {formatCurrency(summary.lucroMes)} ATUAL</span>
                        {(summary.lucroMes / summary.monthlyGoal) >= 1 && (
                          <span className="text-[#00ff88] animate-pulse">🎯 META ATINGIDA!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="w-full py-6 px-6 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 group/goal">
                    {!isEditingGoal ? (
                      <>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">Nenhuma meta definida</p>
                        <button
                          onClick={() => {
                            setGoalInput("");
                            setIsEditingGoal(true);
                          }}
                          className="px-6 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-[9px] font-black text-primary uppercase tracking-widest transition-all active:scale-95"
                        >
                          DEFINIR META
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex items-center gap-2">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 italic">R$</span>
                          <input
                            type="number"
                            autoFocus
                            value={goalInput}
                            onChange={(e) => setGoalInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateGoal.updateGoal(Number(goalInput)).then(() => setIsEditingGoal(false))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-8 py-2 text-sm font-black italic outline-none focus:border-primary/50 transition-all font-mono"
                            placeholder="0,00"
                          />
                        </div>
                        <button
                          disabled={updateGoal.isMutating}
                          onClick={() => updateGoal.updateGoal(Number(goalInput)).then(() => setIsEditingGoal(false))}
                          className="p-2.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl transition-all border border-primary/20"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsEditingGoal(false)}
                          className="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 rounded-xl transition-all border border-white/5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <TargetIcon className="absolute -bottom-6 -right-6 w-32 h-32 text-primary/5 pointer-events-none opacity-20 group-hover:rotate-12 transition-transform duration-700" />
          </div>
        </div>

        {/* CARD 2 — ASSISTENTE FINANCEIRO (Módulo Banco Summary) */}
        <div className="lg:col-span-7 h-full">
          <BankSummaryCard
            onDeposit={() => { setTxMode('deposit'); setIsTxModalOpen(true); }}
            onWithdraw={() => { setTxMode('withdraw'); setIsTxModalOpen(true); }}
          />
        </div>
      </div>

      {/* Second Row — Performance & Clube365 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 animate-glide [animation-delay:200ms]">
        {/* Performance KPI (SVG Area Chart) */}
        <div className="md:col-span-2 lg:col-span-6 glass-card rounded-[40px] p-6 md:p-8 border-l border-[#00d1ff]/10 relative overflow-visible group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d1ff]/5 blur-[80px] rounded-full -mr-16 -mt-16 group-hover:bg-[#00d1ff]/10 transition-all duration-700"></div>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 relative z-10">
            <div>
              <p className="text-[9px] font-bold text-[#b9cbbc] uppercase tracking-widest mb-1 italic">RELATÓRIO DE LUCROS</p>
              <h3 className="text-2xl md:text-4xl font-extrabold text-[#00d1ff] tracking-tight italic">
                R$ {formatCurrency(startDate || endDate ? summary?.lucroPeriodo : (perfPeriod === 'weekly' ? summary?.lucroSemana : summary?.lucroMes))}
              </h3>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                <CustomDateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(s: string | null, e: string | null) => {
                    setStartDate(s);
                    setEndDate(e);
                  }}
                  className="w-[220px] h-8 text-[8px]"
                />
              </div>
            </div>
          </div>

          <div className="relative h-40 mb-4 group/chart">
            {/* SVG Area Chart */}
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00d1ff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#00d1ff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map(val => (
                <line
                  key={val} x1="0" y1={val} x2="100" y2={val}
                  stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"
                />
              ))}

              {/* Restore a thin line and subtle area */}
              {currentPerformance.length > 1 && (
                <g className="transition-all duration-700 ease-out">
                  {/* Area (Subtle but visible) */}
                  <path
                    d={`M 0 100 ${currentPerformance.map((p: any, i: number) =>
                      `L ${(i / (currentPerformance.length - 1)) * 100} ${100 - (Math.max(0, p.value) / maxPerfValue) * 80}`
                    ).join(' ')} L 100 100 Z`}
                    fill="url(#areaGradient)"
                    fillOpacity="0.12"
                    className="pointer-events-none"
                  />
                  {/* Line (Thin 1px) */}
                  <path
                    d={currentPerformance.map((p: any, i: number) =>
                      `${i === 0 ? 'M' : 'L'} ${(i / (currentPerformance.length - 1)) * 100} ${100 - (Math.max(0, p.value) / maxPerfValue) * 80}`
                    ).join(' ')}
                    fill="none"
                    stroke="#00d1ff"
                    strokeWidth="1"
                    strokeOpacity="0.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                  />
                </g>
              )}

              {/* Click Triggers only in SVG */}
              {currentPerformance.map((p: any, i: number) => (
                <rect
                  key={i}
                  x={(i / (currentPerformance.length - 1)) * 100 - 3}
                  y="0" width="6" height="100"
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => setSelectedPoint(p)}
                />
              ))}
            </svg>

            {/* Data Points as CSS circles to avoid SVG stretching (flattening) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {currentPerformance.map((p: any, i: number) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 -ml-1 -mt-1 bg-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,209,255,0.6)]"
                  style={{
                    left: `${(i / (currentPerformance.length - 1)) * 100}%`,
                    top: `${100 - (Math.max(0, p.value) / maxPerfValue) * 80}%`,
                    opacity: 0.5
                  }}
                />
              ))}
            </div>

            {/* Tooltip Overlay (Invisible triggers) */}
            <div className="absolute inset-0 flex items-stretch">
              {currentPerformance.map((p: any, i: number) => (
                <div
                  key={i}
                  className="flex-1 group/tip relative cursor-pointer"
                  onClick={() => setSelectedPoint(p)}
                >
                  <div className="opacity-0 group-hover/tip:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/80 backdrop-blur-xl px-2 py-1 rounded-lg text-[8px] font-black z-50 pointer-events-none border border-white/10 whitespace-nowrap transition-all duration-300 transform scale-90 group-hover/tip:scale-100">
                    {p.label}: R$ {formatCurrency(p.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-[#b9cbbc] uppercase font-bold tracking-widest opacity-40 italic">Performance de Lucros em Tempo Real</p>
        </div>

        {/* New Row — Settlement Types (Now inside Second Row) */}
        <div
          className="md:col-span-1 lg:col-span-3 glass-card rounded-[40px] p-6 border-l border-[#fbbf24]/10 flex flex-col items-center justify-between group hover:bg-white/[0.02] transition-all cursor-pointer overflow-visible"
          onClick={() => setSettlementDrillDown('ALL')}
        >
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#fbbf24]/10 rounded-lg">
                <PieChart className="w-3.5 h-3.5 text-[#fbbf24]" />
              </div>
              <h3 className="text-xs font-black italic uppercase tracking-tight leading-none text-white/80">Modos de finalização</h3>
            </div>
            <ArrowUpRight className="w-3 h-3 text-[#fbbf24] opacity-20 group-hover:opacity-100 transition-all" />
          </div>

          <div className="relative py-2">
            <SettlementDonutChart data={summary.distribuicaoPorResultado || {}} compact />
          </div>

          <div className="space-y-1 w-full pt-3 border-t border-white/5">
            {[
              { label: 'Normal', value: summary.distribuicaoPorResultado?.NORMAL || 0, color: '#00ff88' },
              { label: 'Proteção', value: summary.distribuicaoPorResultado?.PROTECAO || 0, color: '#00d1ff' },
              { label: 'Duplo', value: summary.distribuicaoPorResultado?.DUPLO || 0, color: '#fbbf24' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <p className="text-[9px] font-black text-[#b9cbbc] uppercase opacity-40 italic">{item.label}</p>
                </div>
                <p className="text-[10px] font-black text-white italic">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Clube365 Progress */}
        <Link
          href="/alertas"
          className="md:col-span-1 lg:col-span-3 glass-card rounded-[40px] p-6 md:p-8 border-l border-[#00d1ff]/10 hover:scale-[1.02] transition-all group/clube"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img
                src="https://www.google.com/s2/favicons?domain=bet365.com&sz=64"
                alt="Bet365"
                className="w-5 h-5 rounded-md"
              />
              <h4 className="text-base font-black uppercase tracking-[0.1em] italic text-white leading-none">Clube365</h4>
            </div>
            <span className="text-[#00d1ff] font-black italic text-xs">
              {club?.stats?.completed || 0} / {club?.stats?.total || 0}
            </span>
          </div>
          <div className="space-y-6">
            {(club?.items || []).slice(0, 4).map((a: any) => (
              <div key={a.accountId} className="group/item">
                <div className="flex justify-between items-center text-sm mb-3 font-black uppercase tracking-tight">
                  <span className={`${a.percentual === 100 ? 'text-[#00d1ff]' : 'text-[#b9cbbc]/60'} truncate max-w-[140px] italic`}>
                    {a.profileName}
                  </span>
                  <div className="text-right">
                    <span className="text-[#e5e2e1] block">R$ {formatCurrency(a.atual)}</span>
                    <span className="text-[10px] text-white/20 block">META: R$ {formatCurrency(a.meta)}</span>
                  </div>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`${a.percentual === 100 ? 'bg-[#00d1ff] shadow-[0_0_15px_rgba(0,209,255,0.3)]' : 'bg-white/10'} h-full transition-all duration-1000 cubic-bezier(0.23, 1, 0.32, 1)`}
                    style={{ width: `${a.percentual}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Link>
      </div>

      <section className="glass-card rounded-[40px] border border-white/5 overflow-visible shadow-2xl group/table animate-glide [animation-delay:400ms]">
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00ff88]/10 rounded-xl">
              <History className="w-5 h-5 text-[#00ff88]" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-extrabold font-headline italic uppercase tracking-tight leading-none mb-1">Atividade Recente</h3>
              <p className="text-[10px] text-[#b9cbbc]/40 font-black uppercase tracking-widest">Últimas operações realizadas</p>
            </div>
          </div>
          <Link href="/operacoes" className="flex items-center gap-2 text-[#00ff88] text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all px-3 md:px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <span className="hidden sm:inline">HISTÓRICO</span> <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Mobile: cards compactos sincronizados */}
        <div className="block md:hidden divide-y divide-white/5">
          {(Array.isArray(summary.atividadeRecente) ? summary.atividadeRecente : []).filter((op: any) => !!op).map((op: any) => {
            const totalStake = op.bets?.reduce((sum: number, bet: any) => sum + Number(bet.cost || 0), 0) || 0;
            const statusStyle = op.status === 'FINISHED' 
                ? "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20"
                : op.status === 'CASHOUT' ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : op.status === 'VOID' ? "bg-red-500/10 text-red-500 border-red-500/20"
                : "bg-[#FFDD65]/10 text-[#FFDD65] border-[#FFDD65]/30";
            const statusLabel = op.status === 'FINISHED' ? 'Finalizada' : op.status === 'CASHOUT' ? 'Cashout' : op.status === 'VOID' ? 'Anulada' : 'Pendente';

            return (
              <div 
                key={op.id} 
                className="p-5 border-b border-white/5 space-y-4 cursor-pointer hover:bg-white/[0.02] transition-all"
                onClick={() => {
                  setSelectedMatchOp(op);
                  setIsMatchDetailsModalOpen(true);
                }}
              >
                  {/* Header: Date + Status */}
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer size={12} className="text-white/20" />
                        <span className="text-[10px] font-black text-white/40 tabular-nums uppercase">{formatDate(op.createdAt)}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border-2 tracking-widest ${statusStyle}`}>{statusLabel}</span>
                  </div>

                  {/* Body: Match Indicator */}
                  <div className="bg-black/20 rounded-[25px] p-4 border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <div className="flex -space-x-1.5">
                          {(op.bets || []).slice(0, 3).map((bet: any, i: number) => (
                            <img key={i} src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=32`} className="w-4 h-4 rounded-full border border-black" alt="" />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-black text-[#03D791] uppercase italic tracking-[0.2em] bg-[#03D791]/5 px-3 py-0.5 rounded-full border border-[#03D791]/10">
                          {op.type?.replace('_', ' ')}
                        </span>
                        <MatchIndicator 
                          operation={op} 
                          className="scale-125 my-2"
                          onMatchClick={(e) => {
                            e.stopPropagation();
                            setSelectedMatchOp(op);
                            setIsMatchDetailsModalOpen(true);
                          }}
                        />
                      </div>
                  </div>

                  {/* Footer: Financial Details */}
                  <div className="flex items-center justify-between px-2 pt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">STAKE TOTAL</span>
                        <span className="text-sm font-black text-white/60 tabular-nums italic">R$ {formatCurrency(totalStake)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Link href={`/operacoes?id=${op.id}`} className="p-2 bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                            <ExternalLink size={14} />
                         </Link>
                         <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-[#03D791]/40 uppercase tracking-widest mb-1">RESULTADO</span>
                            <span className={`text-xl font-black italic tracking-tighter tabular-nums ${
                              op.status === 'PENDING' ? 'text-[#FFDD65]' : 
                              (op.realProfit > 0 ? 'text-[#00ff88]' : op.realProfit < 0 ? 'text-red-400' : 'text-white/40')
                            }`}>
                              {op.status === 'PENDING'
                                ? (op.expectedProfit != null ? `+R$${formatCurrency(op.expectedProfit)}` : '—')
                                : (op.realProfit != null ? `${op.realProfit >= 0 ? '+' : ''}R$${formatCurrency(op.realProfit)}` : '—')}
                            </span>
                         </div>
                      </div>
                  </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: tabela sincronidada com Operações */}
        <div className="hidden md:block">
          {/* Header */}
          <div className="grid grid-cols-12 px-8 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 bg-white/[0.02] border-b border-white/5">
            <div className="col-span-2 flex items-center justify-start">Data / Hora</div>
            <div className="col-span-2 flex items-center justify-center">Operação</div>
            <div className="col-span-5 flex items-center justify-center text-center">Jogo</div>
            <div className="col-span-1 flex items-center justify-center">Status</div>
            <div className="col-span-2 flex items-center justify-end">Resultado Financeiro</div>
          </div>

          <div className="divide-y divide-white/5">
            {(Array.isArray(summary.atividadeRecente) ? summary.atividadeRecente : []).filter((op: any) => !!op).map((op: any) => {
               const totalStake = op.bets?.reduce((sum: number, bet: any) => sum + Number(bet.cost || 0), 0) || 0;
               const statusStyle = op.status === 'FINISHED' 
                ? "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20"
                : op.status === 'CASHOUT' ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : op.status === 'VOID' ? "bg-red-500/10 text-red-500 border-red-500/20"
                : "bg-[#FFDD65]/10 text-[#FFDD65] border-[#FFDD65]/30";
              const statusLabel = op.status === 'FINISHED' ? 'Finalizada' : op.status === 'CASHOUT' ? 'Cashout' : op.status === 'VOID' ? 'Anulada' : 'Pendente';

              return (
                <div 
                  key={op.id} 
                  className="grid grid-cols-12 px-8 py-3 items-center hover:bg-white/[0.03] transition-all group min-h-[90px] cursor-pointer"
                  onClick={() => {
                    setSelectedMatchOp(op);
                    setIsMatchDetailsModalOpen(true);
                  }}
                >
                  <div className="col-span-2 flex flex-col justify-center items-start border-l-2 border-transparent group-hover:border-[#03D791] pl-4 transition-all">
                    <span className="text-sm font-black text-white italic tracking-tighter uppercase leading-none mb-1">{formatDate(op.createdAt)}</span>
                    <span className="text-[10px] text-[#b9cbbc]/30 font-black uppercase tracking-widest">#{op.id.substring(0, 8)}</span>
                  </div>
                  
                  <div className="col-span-2 flex flex-col items-center justify-center gap-2">
                    <span className="text-[10px] text-[#03D791] font-black uppercase tracking-[0.2em] bg-[#03D791]/5 px-2 py-0.5 rounded border border-[#03D791]/10 italic">
                        {op.type?.replace('_', ' ')}
                    </span>
                    <div className="flex -space-x-1.5">
                      {(op.bets || []).slice(0, 3).map((bet: any, i: number) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-black bg-black flex items-center justify-center overflow-hidden">
                          <img src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=32`} className="w-3 h-3 object-contain" alt="" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-5 flex flex-col justify-center items-center">
                    <MatchIndicator 
                      operation={op} 
                      className="opacity-100 py-1 scale-110 md:scale-125 transition-transform hover:scale-[1.4]" 
                      onMatchClick={(e) => {
                        e.stopPropagation();
                        setSelectedMatchOp(op);
                        setIsMatchDetailsModalOpen(true);
                      }}
                    />
                    {op.description && (
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest truncate max-w-[80%] mt-1 italic">
                        {op.description}
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-center items-center">
                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase border-2 tracking-[0.1em] italic transition-all duration-300 ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="col-span-2 flex justify-end items-center pr-4">
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#b9cbbc]/30 uppercase tracking-widest italic leading-none">
                          <span>STAKE: R${formatCurrency(totalStake)}</span>
                        </div>
                        <span className={`text-xl font-black italic tracking-tighter leading-none ${
                          op.status === 'PENDING' ? 'text-amber-500' : 
                          (op.realProfit > 0 ? 'text-[#03D791]' : op.realProfit < 0 ? 'text-red-500/60' : 'text-white/20')
                        }`}>
                          {op.status === 'PENDING'
                            ? (op.expectedProfit != null ? `+ R$ ${formatCurrency(op.expectedProfit)}` : '—')
                            : (op.realProfit != null ? `${op.realProfit >= 0 ? '+ ' : '- '} R$ ${formatCurrency(Math.abs(op.realProfit))}` : '—')}
                        </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {selectedPoint && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedPoint(null)}
          />
          <div
            className="glass-card w-full max-w-2xl rounded-[40px] overflow-hidden border border-white/10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300"
          >
            {/* Modal Header/Report Card */}
            <div className="p-8 bg-gradient-to-br from-[#00d1ff]/10 to-transparent border-b border-white/5 relative">
              <div className="absolute top-0 right-0 p-8">
                <div className="p-3 bg-[#00d1ff]/10 rounded-2xl border border-[#00d1ff]/20">
                  <BarChart3 className="w-6 h-6 text-[#00d1ff] drop-shadow-[0_0_8px_rgba(0,209,255,0.4)]" />
                </div>
              </div>

              <p className="text-[10px] font-black text-[#00d1ff] uppercase tracking-[0.3em] mb-2 italic">Analytics Report</p>
              <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-8">{selectedPoint.label}</h4>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-[#b9cbbc] uppercase opacity-40">Lucro Total</p>
                  <p className={`text-xl font-black italic ${selectedPoint.value >= 0 ? 'text-[#00ff88]' : 'text-red-500'}`}>
                    R$ {formatCurrency(selectedPoint.value)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-[#b9cbbc] uppercase opacity-40">Volume total</p>
                  <p className="text-xl font-black italic text-white/90">
                    R$ {formatCurrency(selectedPoint.volume)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-[#b9cbbc] uppercase opacity-40">ROI Médio</p>
                  <p className="text-xl font-black italic text-[#00d1ff]">
                    {selectedPoint.volume > 0 ? ((selectedPoint.value / selectedPoint.volume) * 100).toFixed(2) : '0.00'}%
                  </p>
                </div>
              </div>
            </div>

            {/* Data Breakdown */}
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h5 className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-60 mb-1">Performance por Dia</h5>
                  <p className="text-[11px] text-[#b9cbbc]/40 font-medium">Breakdown detalhado do bloco selecionado</p>
                </div>
                <div className="text-right">
                  {selectedPoint.bestDay && (
                    <span className="text-[9px] font-black text-[#00ff88] uppercase bg-[#00ff88]/5 px-2 py-1 rounded-md border border-[#00ff88]/10 italic">
                      Melhor dia: {selectedPoint.bestDay.label?.split(' ')[0]} (+R${formatCurrency(selectedPoint.bestDay.value || 0)})
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pt-2 px-2 pr-4 custom-scrollbar">
                {selectedPoint.items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-4 bg-white/[0.03] rounded-[20px] border border-white/5 hover:border-[#00d1ff]/20 hover:bg-[#00d1ff]/5 transition-all group/item cursor-pointer active:scale-98"
                    onClick={() => setSelectedDay(item.fullDate)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.value > 0 ? 'bg-[#00ff88]' : item.value < 0 ? 'bg-red-500' : 'bg-white/20'}`} />
                      <span className="text-[11px] font-black text-[#b9cbbc] uppercase italic group-hover/item:text-white transition-colors">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-[#b9cbbc]/40 uppercase">V: R$ {formatCurrency(item.volume || 0)}</p>
                        <p className={`text-sm font-black italic tracking-tight ${item.value >= 0 ? 'text-[#00ff88]' : 'text-red-500'}`}>
                          {item.value >= 0 ? '+' : '-'} R$ {formatCurrency(Math.abs(item.value))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-[#1a1c1e] bg-[#00d1ff]/20 flex items-center justify-center">
                        <TrendingUp size={10} className="text-[#00d1ff]" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-[#b9cbbc] uppercase italic opacity-40">
                    {selectedPoint.count} operações finalizadas
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="px-10 py-3 bg-[#00d1ff] hover:bg-[#00e0ff] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:shadow-[0_0_30px_rgba(0,209,255,0.5)] active:scale-95"
                >
                  FECHAR RELATÓRIO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDay && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
          <DayDetails date={selectedDay} onClose={() => setSelectedDay(null)} onSelectOperation={(op) => setDetailOperation(op)} />
        </div>
      )}

      {settlementDrillDown && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSettlementDrillDown(null)} />
          <SettlementDrillDown
            type={settlementDrillDown}
            startDate={startDate}
            endDate={endDate}
            onClose={() => setSettlementDrillDown(null)}
            onSelectOperation={(op) => setDetailOperation(op)}
          />
        </div>
      )}

      <OperationDetailsModal
        isOpen={!!detailOperation}
        onClose={() => setDetailOperation(null)}
        operation={detailOperation}
        primaryColor="#00d1ff"
      />

      <DepositWithdrawModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        mode={txMode}
        onSuccess={() => {
          refetchSummary();
          refetchClub();
        }}
      />

      <OnboardingModal 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)} 
        onOpenPlans={() => setIsPlansModalOpen(true)}
      />

      <PlansModal 
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
      />

      <MatchDetailsModal
        isOpen={isMatchDetailsModalOpen}
        onClose={() => {
          setIsMatchDetailsModalOpen(false);
          setSelectedMatchOp(null);
        }}
        operation={selectedMatchOp}
      />
    </div>
  );
}

function SettlementDonutChart({ data, compact }: { data: Record<string, number>, compact?: boolean }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const slices = [
    { label: 'Normal', value: data['NORMAL'] || 0, color: '#00ff88' },
    { label: 'Proteção', value: data['PROTECAO'] || 0, color: '#00d1ff' },
    { label: 'Duplo', value: data['DUPLO'] || 0, color: '#fbbf24' },
  ].filter(s => s.value >= 0);

  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  const sizeClass = compact ? "w-28 h-28" : "w-48 h-48";

  return (
    <div className={`relative ${sizeClass} group/donut`}>
      <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full drop-shadow-2xl transition-transform duration-700 group-hover/donut:rotate-0">
        {slices.map((slice, i) => {
          if (slice.value === 0) return null;
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
          cumulativePercent += slice.value / total;
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
          const largeArcFlag = slice.value / total > 0.5 ? 1 : 0;
          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ');
          return (
            <path
              key={i}
              d={pathData}
              fill={slice.color}
              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
            >
              <title>{`${slice.label}: ${slice.value}`}</title>
            </path>
          );
        })}
        {/* Simple check for empty data */}
        {Object.values(data).every(v => v === 0) && (
          <circle r="1" fill="rgba(255,255,255,0.05)" />
        )}
        <circle r="0.75" fill="#0b0c0d" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {compact ? (
          <span className="text-xl font-black text-white italic tracking-tighter">{total === 1 && Object.values(data).every(v => v === 0) ? 0 : total}</span>
        ) : (
          <>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic mb-1">Encerradas</span>
            <span className="text-3xl font-black text-white italic tracking-tighter">{total === 1 && Object.values(data).every(v => v === 0) ? 0 : total}</span>
          </>
        )}
      </div>
    </div>
  );
}

function SettlementDrillDown({ type, startDate, endDate, onClose, onSelectOperation }: { type: string, startDate: string | null, endDate: string | null, onClose: () => void, onSelectOperation: (op: any) => void }) {
  const [filter, setFilter] = useState<string>(type);
  const { data: opsData, isLoading } = useOperations({
    startDate: startDate?.split('T')[0],
    endDate: endDate?.split('T')[0],
    status: 'FINISHED',
    limit: 100
  });

  const filteredOps = useMemo(() => {
    if (!opsData?.data) return [];
    if (filter === 'ALL') return opsData.data;
    return opsData.data.filter((op: any) => op.result === filter);
  }, [opsData, filter]);

  const stats = useMemo(() => {
    return {
      total: filteredOps.length,
      lucro: filteredOps.reduce((acc: number, op: any) => acc + Number(op.realProfit || 0), 0),
      volume: filteredOps.reduce((acc: number, op: any) => acc + (op.bets?.reduce((s: number, b: any) => s + Number(b.stake || 0), 0) || 0), 0)
    };
  }, [filteredOps]);

  return (
    <div className="glass-card w-full max-w-2xl rounded-[40px] overflow-hidden border border-white/10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 bg-[#0b0c0d]">
      <div className="p-8 border-b border-white/5 bg-gradient-to-br from-[#fbbf24]/5 to-transparent">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[10px] font-black text-[#fbbf24] uppercase tracking-[0.3em] mb-1 italic">Detalhes do modo de finalização</p>
            <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              Relatório Geral
            </h4>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-2xl w-fit">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'NORMAL', label: 'Normal' },
            { id: 'PROTECAO', label: 'Proteção' },
            { id: 'DUPLO', label: 'Duplo' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === btn.id
                ? 'bg-[#fbbf24] text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                : 'text-[#b9cbbc]/40 hover:text-white hover:bg-white/5'
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-[#b9cbbc] uppercase opacity-40">Operações</p>
            <p className="text-xl font-black text-white italic">{stats.total}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-[#b9cbbc] uppercase opacity-40">Volume</p>
            <p className="text-xl font-black text-white italic">R$ {formatCurrency(stats.volume)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-[#b9cbbc] uppercase opacity-40">Lucro</p>
            <p className={`text-xl font-black italic ${stats.lucro >= 0 ? 'text-[#00ff88]' : 'text-red-500'}`}>
              R$ {formatCurrency(stats.lucro)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-h-[400px] overflow-y-auto pt-2 px-2 custom-scrollbar space-y-3 bg-[#0b0c0d]">
        {isLoading ? (
          <div className="py-20 text-center opacity-20 animate-pulse">
            <History className="w-8 h-8 mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Carregando...</p>
          </div>
        ) : filteredOps.length === 0 ? (
          <div className="py-20 text-center opacity-20">
            <History className="w-8 h-8 mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma operação encontrada</p>
          </div>
        ) : (
          filteredOps.map((op: any) => (
            <div
              key={op.id}
              className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-[24px] border border-white/5 transition-all group cursor-pointer active:scale-98"
              onClick={() => onSelectOperation(op)}
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {op.bets?.slice(0, 2).map((bet: any, bi: number) => (
                    <div key={bi} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:border-[#fbbf24]/30 transition-all">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=64`}
                        className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-black text-white italic uppercase tracking-tight group-hover:text-[#fbbf24] transition-colors line-clamp-1 pr-1.5">
                      {op.type.replace('_', ' ')}
                    </p>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-sm uppercase italic border ${op.result === 'NORMAL' ? 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20' :
                      op.result === 'PROTECAO' ? 'bg-[#00d1ff]/10 text-[#00d1ff] border-[#00d1ff]/20' :
                        'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20'
                      }`}>
                      {op.result}
                    </span>
                  </div>
                  <p className="text-[9px] text-[#b9cbbc]/40 font-black uppercase tracking-widest italic leading-none">#{op.id.substring(0, 8)} • {new Date(op.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-black italic tracking-tighter ${Number(op.realProfit) > 0 ? 'text-[#00ff88]' : Number(op.realProfit) < 0 ? 'text-red-500' : 'text-[#b9cbbc]/20'}`}>
                  {Number(op.realProfit) > 0 ? '+' : ''} R$ {formatCurrency(op.realProfit || 0)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-white/[0.01] border-t border-white/5">
        <button
          onClick={onClose}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/5"
        >
          FECHAR RELATÓRIO
        </button>
      </div>
    </div>
  );
}

function DayDetails({ date, onClose, onSelectOperation }: { date: string, onClose: () => void, onSelectOperation: (op: any) => void }) {
  const { data: opsData, isLoading } = useOperations({
    startDate: date,
    endDate: date,
    limit: 50
  });

  const dayLucro = Number(opsData?.data?.reduce((acc: number, op: any) => acc + Number(op.realProfit || 0), 0) || 0);
  const dayVolume = Number(opsData?.data?.reduce((acc: number, op: any) => acc + (op.bets?.reduce((s: number, b: any) => s + Number(b.stake || 0), 0) || 0), 0) || 0);

  const displayDate = useMemo(() => {
    if (!date) return "";
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }, [date]);

  return (
    <div className="glass-card w-full max-w-xl rounded-[40px] overflow-hidden border border-white/10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300 bg-[#0b0c0d]">
      <div className="p-8 border-b border-white/5 bg-gradient-to-br from-[#00d1ff]/5 to-transparent">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black text-[#00d1ff] uppercase tracking-[0.3em] mb-1 italic">Detalhamento Diário</p>
            <h4 className="text-2xl font-black text-white italic truncate">
              {displayDate}
            </h4>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 text-center">
            <p className="text-[8px] font-bold text-[#b9cbbc] uppercase opacity-40 mb-1">Operações</p>
            <p className="text-lg font-black text-white italic leading-tight">{opsData?.total || 0}</p>
          </div>
          <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 text-center">
            <p className="text-[8px] font-bold text-[#b9cbbc] uppercase opacity-40 mb-1">Volume</p>
            <p className="text-lg font-black text-white italic leading-tight">R$ {formatCurrency(dayVolume)}</p>
          </div>
          <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 text-center">
            <p className="text-[8px] font-bold text-[#b9cbbc] uppercase opacity-40 mb-1">Lucro</p>
            <p className={`text-lg font-black italic shadow-sm leading-tight ${dayLucro > 0 ? 'text-[#00ff88]' : dayLucro < 0 ? 'text-red-500' : 'text-white'}`}>
              R$ {formatCurrency(dayLucro)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-h-[400px] overflow-y-auto pt-2 px-2 custom-scrollbar space-y-3">
        {isLoading ? (
          <div className="py-20 text-center opacity-20 animate-pulse">
            <History className="w-8 h-8 mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Carregando...</p>
          </div>
        ) : opsData?.data?.length === 0 ? (
          <div className="py-20 text-center opacity-20">
            <History className="w-8 h-8 mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma operação</p>
          </div>
        ) : (
          opsData?.data?.map((op: any) => (
            <div
              key={op.id}
              className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-[24px] border border-white/5 transition-all group cursor-pointer active:scale-98"
              onClick={() => onSelectOperation(op)}
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {op.bets?.slice(0, 2).map((bet: any, bi: number) => (
                    <div key={bi} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:border-[#00d1ff]/30 transition-all">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.url || bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=64`}
                        className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-black text-white italic uppercase tracking-tight line-clamp-1 group-hover:text-[#00d1ff] transition-colors pr-1.5">
                    {op.type.replace('_', ' ')}
                  </p>
                  <p className="text-[9px] text-[#b9cbbc]/40 font-black uppercase tracking-widest italic leading-none">ID: #{op.id.substring(0, 8)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-black italic tracking-tighter ${Number(op.realProfit) > 0 ? 'text-[#00ff88]' : Number(op.realProfit) < 0 ? 'text-red-500' : 'text-[#b9cbbc]/20'}`}>
                  {Number(op.realProfit) > 0 ? '+' : ''} R$ {formatCurrency(op.realProfit || 0)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-white/[0.01] border-t border-white/5">
        <button
          onClick={onClose}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/5"
        >
          VOLTAR AO RELATÓRIO
        </button>
      </div>
    </div>
  );
}
