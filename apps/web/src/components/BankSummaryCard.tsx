"use client";

import React from 'react';
import { 
  ArrowUpRight, 
  CalendarClock,
  PiggyBank,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { useBankSummary } from "@/lib/hooks";
import { formatCurrency, formatDateShort, formatMonthAbbr } from "@/lib/utils";
import Link from "next/link";

interface BankSummaryCardProps {
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export function BankSummaryCard({ onDeposit, onWithdraw }: BankSummaryCardProps) {
  const { data: summary, isLoading } = useBankSummary();

  if (isLoading || !summary) {
    return (
      <div className="glass-card rounded-[32px] p-7 h-[240px] animate-pulse bg-white/5 border border-white/5" />
    );
  }

  // Agrupar e priorizar despesas (não pagas primeiro)
  const allExpenses = summary.nextExpenses || [];
  const unpaidExpenses = allExpenses.filter((e: any) => e.status !== 'PAID');
  const paidExpensesList = allExpenses.filter((e: any) => e.status === 'PAID');
  const sortedExpenses = [...unpaidExpenses, ...paidExpensesList];

  const groupedExpenses = sortedExpenses.reduce((acc: any, exp: any) => {
    const date = exp.nextDueAt.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(exp);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => {
    const aHasUnpaid = groupedExpenses[a].some((e: any) => e.status !== 'PAID');
    const bHasUnpaid = groupedExpenses[b].some((e: any) => e.status !== 'PAID');
    if (aHasUnpaid && !bHasUnpaid) return -1;
    if (!aHasUnpaid && bHasUnpaid) return 1;
    return a.localeCompare(b);
  });

  // Cálculos de Despesas do Mês Atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const pendingExpensesCurrentMonth = unpaidExpenses.filter((e: any) => {
    const d = new Date(e.nextDueAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const amountPaidMonth = Number(summary.monthlyExpenses) || 0;
  const amountPendingMonth = pendingExpensesCurrentMonth.reduce((acc: number, e: any) => acc + (parseFloat(String(e.amount)) || 0), 0);
  const totalMonth = Number(amountPaidMonth) + Number(amountPendingMonth);

  // Cálculos de Banca e Patrimônio
  const bancaTotal = summary.totalInAccounts || 0;
  const saldoBanco = summary.balance || 0;
  const patrimonioTotal = saldoBanco + bancaTotal;
  const lucroMes = summary.monthlyGrossProfit || 0;
  const lucroPct = patrimonioTotal > 0 ? (lucroMes / patrimonioTotal) * 100 : 0;

  const getStatusColor = (date: string, hasUnpaid: boolean) => {
    if (!hasUnpaid) return { dot: 'bg-primary/40', text: 'text-primary/40', label: 'PAGO', pulse: false, border: 'border-white/5' };
    
    const due = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { dot: 'bg-red-500', text: 'text-red-500', label: 'ATRASADO', pulse: true, border: 'border-red-500/30 shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)]' };
    if (diffDays <= 0) return { dot: 'bg-red-500', text: 'text-red-500', label: 'HOJE', pulse: true, border: 'border-red-500/30' };
    return { 
      dot: 'bg-amber-500', 
      text: 'text-amber-500', 
      label: diffDays === 1 ? 'AMANHÃ' : `EM ${diffDays} DIAS`, 
      pulse: false,
      border: 'border-amber-500/30 shadow-[0_0_15px_-5px_rgba(245,158,11,0.2)]'
    };
  };

  const hasCriticalExpense = pendingExpensesCurrentMonth.some((e: any) => {
    const due = new Date(e.nextDueAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 1;
  });

  return (
    <div className="glass-card rounded-[32px] p-8 h-full flex flex-col justify-between group overflow-hidden relative border-l border-primary/20">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Esquerda: Saldo e Métricas */}
        <div className="space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-40 mb-2 italic">ASSISTENTE FINANCEIRO</p>
              <h3 className="text-4xl font-black text-[#00ff88] italic tracking-tighter">
                R$ {formatCurrency(saldoBanco)}
              </h3>
              <p className="text-[10px] font-bold text-[#00ff88] uppercase italic opacity-60 tracking-wider">SALDO EM BANCO</p>
            </div>
            <Link href="/banco" className="p-2.5 bg-primary/10 rounded-2xl hover:bg-primary/20 transition-all text-primary border border-primary/20 group-hover:scale-110">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="bg-white/5 rounded-3xl p-5 border border-white/5 relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic font-black">PATRIMÔNIO TOTAL</p>
                  <p className="text-3xl font-black text-white italic tracking-tight">
                    R$ {formatCurrency(patrimonioTotal)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full">
                  <span className="text-[10px] font-black text-[#00ff88] italic">+{lucroPct.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] font-black text-white/30 uppercase mb-1 italic">LUCRO DESSE MÊS</p>
                <p className={`text-xl font-black italic ${lucroMes >= 0 ? 'text-[#00ff88]' : 'text-red-500'}`}>
                  {lucroMes >= 0 ? '+' : '-'}R$ {formatCurrency(Math.abs(lucroMes))}
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 blur-3xl rounded-full -mr-16 -mt-16" />
          </div>

          <div className="pt-6 border-t border-white/5">
            <p className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-40 mb-4 italic">RESUMO DAS DESPESAS</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black italic uppercase">
                <span className="text-white/30">TOTAL DESSE MÊS</span>
                <span className="text-white/60 text-xs">R$ {formatCurrency(totalMonth)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black italic uppercase pb-2">
                <span className="text-[#00ff88]/40">JÁ PAGO</span>
                <span className="text-[#00ff88]/80 text-xs text-[#00ff88]">R$ {formatCurrency(amountPaidMonth)}</span>
              </div>
              <div className={`flex justify-between items-center text-[13px] font-black italic uppercase pt-3 border-t border-white/5 transition-all
                ${amountPendingMonth > 0 ? (hasCriticalExpense ? 'text-red-500 animate-blink-red-slow' : 'text-amber-500') : 'text-primary'}`}>
                <span>{amountPendingMonth > 0 ? 'FALTA PAGAR' : 'TUDO PAGO'}</span>
                <span className="text-base">R$ {formatCurrency(amountPendingMonth)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direita: Próximos Vencimentos e Ações */}
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="w-4 h-4 text-primary" />
              <p className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-40 italic">PRÓXIMOS VENCIMENTOS</p>
            </div>
            
            <div className="space-y-3">
              {sortedDates.length === 0 ? (
                <div className="py-10 text-center opacity-10 text-[9px] font-black uppercase tracking-widest italic border border-dashed border-white/10 rounded-3xl">
                  Nenhuma despesa pendente
                </div>
              ) : (
                sortedDates.slice(0, 3).map((date) => {
                  const exps = groupedExpenses[date];
                  const hasUnpaid = exps.some((e: any) => e.status !== 'PAID');
                  const status = getStatusColor(date, hasUnpaid);
                  
                  return (
                    <Link 
                      key={date} 
                      href="/banco?tab=expenses"
                      className={`flex flex-col gap-2 p-4 bg-white/[0.02] rounded-2xl border transition-all group/venc block hover:bg-white/[0.05]
                        ${status.pulse ? 'animate-blink-red-slow' : ''} ${status.border}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <div className={`w-1.5 h-1.5 rounded-full ${status.dot} shadow-[0_0_8px_currentColor]`} />
                           <p className="text-[11px] font-black text-[#e5e2e1] uppercase italic tracking-tight truncate max-w-[150px]">
                             {exps.length > 1 
                               ? `${exps.length} DESPESAS` 
                               : exps[0].name.toUpperCase()}
                           </p>
                        </div>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border border-white/5 ${status.text} bg-white/5`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <div className="flex items-center gap-1.5 text-white/20">
                          <Clock size={10} />
                          <span className="text-[10px] font-black italic tracking-wider">
                            {formatDateShort(date).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs font-black text-white italic">
                          R$ {formatCurrency(exps.reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0))}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
            <button 
              onClick={onDeposit}
              className="flex-1 py-4 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/20 rounded-2xl text-[9px] font-black text-[#00ff88] uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              REGISTRAR ENTRADA
            </button>
            <button 
              onClick={onWithdraw}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] font-black text-white uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              REGISTRAR SAÍDA
            </button>
          </div>
        </div>
      </div>

      <PiggyBank className="absolute -bottom-10 -right-10 w-48 h-48 text-primary/5 pointer-events-none group-hover:scale-110 group-hover:text-primary/10 transition-all duration-700 opacity-10" />
    </div>
  );
}
