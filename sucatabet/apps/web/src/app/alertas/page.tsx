"use client";
import React from "react";
import {
  Timer,
  Activity,
  User,
  Clock,
  AlertCircle,
  Bell,
  ChevronRight
} from "lucide-react";
import { useDashboardSummary, useDashboardClub, useFreebets } from "@/lib/hooks";
import { SkeletonCard, EmptyState } from "@/components/ui/components";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default function AlertasPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: club, isLoading: clubLoading } = useDashboardClub();
  const { data: allFreebets } = useFreebets();
 
  const summaryAlerts = summary?.freebetsExpirando || [];
  
  // Combine with client-side filtered freebets (< 48h) to catch missed alerts
  const alerts = React.useMemo(() => {
    const now = Date.now();
    const clientFiltered = (Array.isArray(allFreebets) ? allFreebets : [])
      .filter((fb: any) => {
        if (!fb.expiresAt) return false;
        const diff = (new Date(fb.expiresAt).getTime() - now) / 3600000;
        return diff > 0 && diff <= 48; // Only future freebets within 48h
      });

    const map = new Map();
    [...summaryAlerts, ...clientFiltered].forEach(fb => map.set(fb.id, fb));
    return Array.from(map.values());
  }, [summaryAlerts, allFreebets]);

  return (
    <div className="px-3 md:px-6 space-y-12 pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#03d791]">
            <Bell className="w-4 h-4 shadow-[0_0_10px_rgba(3,215,145,0.3)]" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black italic">NOTIFICAÇÕES DE PRIORIDADE DO SISTEMA</span>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
            CENTRO DE <span className="text-[#03d791]">MONITORAMENTO</span>
          </h1>
        </div>
        <div className="glass-card px-6 py-2 rounded-2xl border border-white/10">
          <span className="text-[10px] text-[#b9cbbc] font-bold uppercase tracking-widest opacity-60">
            {(Array.isArray(alerts) ? alerts.length : 0) + (club?.items?.length || 0)} Pontos de Atenção
          </span>
        </div>
      </div>

      {/* Section 1: Freebets Vencendo */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffdd65] bg-[#ffdd65]/10 px-4 py-1.5 rounded-full border border-[#ffdd65]/20">
            Freebets em Risco
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory">
          {summaryLoading ? (
            Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (Array.isArray(alerts) ? alerts : []).length === 0 ? (
            <div className="col-span-full">
              <div className="glass-card py-20 rounded-[32px] text-center border-dashed border-white/10 opacity-30">
                <AlertCircle className="w-12 h-12 text-[#b9cbbc] mx-auto mb-4" />
                <p className="text-[11px] font-black uppercase tracking-widest text-[#b9cbbc] italic">Nenhum risco</p>
              </div>
            </div>
          ) : (
            (Array.isArray(alerts) ? alerts : []).map((fb) => {
              const expiresAt = fb.expiresAt ? new Date(fb.expiresAt) : null;
              if (!expiresAt || isNaN(expiresAt.getTime())) return null;

              const diffHours = Math.ceil((expiresAt.getTime() - Date.now()) / 3600000);

              const isFastRed = diffHours <= 2;
              const isSlowRed = diffHours <= 24;
              const isSlowOrange = diffHours <= 48;
              const isCritical = diffHours <= 24;

              return (
                <div key={fb.id} className={`glass-card p-6 min-w-[320px] max-w-[320px] snap-center rounded-[32px] border-l-4 transition-all duration-500 group ${isCritical ? 'border-l-red-500 bg-red-500/[0.03]' : 'border-l-[#ffdd65] bg-[#ffdd65]/[0.02]'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-white/5 p-2.5 rounded-2xl border border-white/5">
                      <Clock className={`w-4 h-4 ${isCritical ? 'text-red-500 animate-neon-pulse' : 'text-[#ffdd65]'}`} />
                    </div>
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border border-white/10 bg-black/40 ${isCritical ? 'text-red-500' : 'text-[#ffdd65]'}`}>
                      {isCritical ? 'ATIVO CRÍTICO' : 'TAREFA URGENTE'}
                    </span>
                  </div>

                  <div className="mb-6">
                    <p className="text-[9px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-40 mb-1.5 italic">
                      {fb.account?.bettingHouse?.name || 'ENTRADA DISPONÍVEL'}
                    </p>
                    <h3 className={`text-3xl font-black italic tracking-tighter mb-2 ${isCritical ? 'text-red-400' : 'text-white'}`}>
                      R$ {formatCurrency(fb.value ?? 0)}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-60 italic">
                        CASA: <span className="text-[#03d791]">{fb.account?.bettingHouse?.name || 'N/A'}</span>
                      </p>
                      <p className="text-[9px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-60 italic">
                        CPF VINCULADO: <span className="text-white">{fb.account?.cpfProfile?.cpf || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-40">Tempo Restante</span>
                      <span className={`text-xl font-black italic tracking-tighter ${isCritical ? 'text-red-500 animate-pulse' : 'text-[#ffdd65]'}`}>
                        {diffHours}h
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full transition-all duration-1000 ${isCritical ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-[#ffdd65] shadow-[0_0_15px_rgba(255,221,101,0.3)]'}`} style={{ width: `${Math.max(10, 100 - (diffHours * 2))}%` }}></div>
                    </div>
                  </div>

                  <Link
                    href="/freebets"
                    className={`mt-6 w-full py-3.5 rounded-2xl border transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] italic flex items-center justify-center gap-2 group-hover:scale-[1.02] 
                      ${isFastRed
                        ? 'animate-blink-red text-white border-red-500'
                        : isSlowRed
                          ? 'animate-blink-red-slow text-white border-red-500'
                          : isSlowOrange
                            ? 'animate-blink-orange text-white border-orange-500'
                            : 'bg-white/10 text-white border-white/10 hover:border-[#ffdd65] hover:text-[#ffdd65]'
                      }`}
                  >
                    IR PARA FREEBETS →
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Section 2: Club365 Monitor */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#00d1ff] bg-[#00d1ff]/10 px-5 py-2 rounded-full border border-[#00d1ff]/20">
            Metas Club365
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        <div className="glass-card rounded-[32px] p-8 md:p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00d1ff]/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-transform group-hover:scale-125 duration-1000"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <Activity className="w-6 h-6 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Eficiência do Clube</h3>
                    <p className="text-[11px] text-[#b9cbbc] font-black uppercase tracking-widest opacity-40 italic">SINCRONIA GLOBAL DE DADOS</p>
                  </div>
                </div>
                <p className="text-sm text-[#b9cbbc] font-medium leading-relaxed italic border-l-2 border-white/5 pl-5">
                  Sincronização global de apostas para garantir concluir o Club365 em todas as contas Bet365 cadastradas.
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-3xl p-8 rounded-[32px] border border-white/5 group-hover:border-blue-500/20 transition-all">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#b9cbbc] font-black opacity-30 mb-3">STATUS DA META</p>
                <div className="flex items-baseline gap-4">
                  <span className="text-6xl font-black text-blue-500 italic tracking-tighter animate-in fade-in slide-in-from-bottom-4">
                    {club?.stats?.completed || 0}
                  </span>
                  <div className="space-y-1">
                    <span className="block text-2xl text-white/20 font-black italic leading-none">/ {club?.stats?.total || 0}</span>
                    <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full">CONCLUÍDAS</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {clubLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="h-40 w-full glass-card rounded-[32px] animate-pulse" />
                ))
              ) : (club?.items || []).length === 0 ? (
                <div className="col-span-full border-2 border-dashed border-white/5 rounded-[32px] p-20 text-center opacity-20 italic font-black uppercase tracking-widest text-[11px]">
                  Nenhuma conta ativa no monitor
                </div>
              ) : (
                (club?.items || []).map((acc: any) => (
                  <div key={acc.accountId} className={`glass-card p-7 rounded-[32px] border transition-all duration-500 group-item ${acc.percentual === 100 ? 'border-blue-500/30 bg-blue-500/[0.03]' : 'bg-black/40 border-white/5 hover:border-white/20'}`}>
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${acc.percentual === 100 ? 'bg-blue-500/20 border-blue-500/40' : 'bg-white/5 border-white/10'}`}>
                          <User className={`w-6 h-6 ${acc.percentual === 100 ? 'text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-white/40'}`} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-black italic uppercase tracking-tighter leading-none mb-1.5 ${acc.percentual === 100 ? 'text-blue-500' : 'text-white'}`}>
                            {acc.profileName}
                          </h4>
                          <p className="text-[10px] text-[#b9cbbc] font-black uppercase tracking-widest opacity-25 truncate max-w-[140px] italic">{acc.accountName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-black italic tracking-tighter ${acc.percentual === 100 ? 'text-blue-400' : 'text-white'}`}>
                          {(acc.percentual ?? 0).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="h-2 w-full bg-black/60 rounded-full border border-white/5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${acc.percentual === 100 ? 'bg-blue-500 shadow-[0_0_15px_rgba(0,209,255,0.4)]' : 'bg-white/40'}`}
                          style={{ width: `${acc.percentual}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] italic">
                        <span className="text-[#b9cbbc] opacity-50">APOSTADO: R$ {formatCurrency(acc.atual)}</span>
                        <span className={acc.percentual === 100 ? 'text-blue-400' : 'text-[#b9cbbc] opacity-20'}>
                          META: R$ {formatCurrency(acc.meta)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
