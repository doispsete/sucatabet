"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  TrendingUp,
  Activity,
  Search,
  Clock,
  ArrowUpRight,
  Database,
  FileText,
  Shovel
} from "lucide-react";
import { MatchIndicator } from "@/components/MatchIndicator";
import { useOperations, useDashboardSummary } from "@/lib/hooks";
import { SkeletonOperationRow, EmptyState, CustomSelect } from "@/components/ui/components";
import { OperationStatus } from "@/lib/api/types";
import { NewOperationModal } from "@/components/modals/NewOperationModal";
import { FinishOperationModal } from "@/components/modals/FinishOperationModal";
import { OperationDetailsModal } from "@/components/modals/OperationDetailsModal";
import { useModal } from "@/lib/context/modal-context";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

function OperationsContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get('id');
  const search = searchParams.get('search') || undefined;
  const [status, setStatus] = useState<OperationStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { openNewOperation } = useModal();

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data: summary, refetch: refetchSummary } = useDashboardSummary();
  const {
    data: opsResponse,
    isLoading,
    refetch,
  } = useOperations({
    status: status === 'ALL' ? undefined : status,
    page,
    limit: 20,
    search
  });

  // Handle deep linking from dashboard
  useEffect(() => {
    if (targetId && opsResponse?.data) {
      const op = opsResponse.data.find((o: any) => o.id === targetId);
      if (op) {
        setSelectedOperation(op);
        if (op.status === OperationStatus.PENDING) {
          setIsFinishModalOpen(true);
        } else {
          setIsDetailsModalOpen(true);
        }
      }
    }
  }, [targetId, opsResponse]);

  // Listen for global operation creation to refetch

  const getStatusStyle = (status: OperationStatus) => {
    switch (status) {
      case OperationStatus.PENDING:
        return "bg-[#FFDD65]/10 text-[#FFDD65] border-[#FFDD65]/30";
      case OperationStatus.FINISHED:
        return "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20";
      case OperationStatus.CASHOUT:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case OperationStatus.VOID:
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-white/5 text-[#b9cbbc] border-white/10";
    }
  };

  const getStatusLabel = (status: OperationStatus) => {
    switch (status) {
      case OperationStatus.PENDING: return "Pendente";
      case OperationStatus.FINISHED: return "Finalizada";
      case OperationStatus.CASHOUT: return "Cashout";
      case OperationStatus.VOID: return "Anulada";
      default: return status;
    }
  };

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case 'NORMAL': return 'Normal';
      case 'FREEBET_GEN': return 'Gerar Freebet';
      case 'EXTRACAO': return 'Extração';
      case 'BOOST_25': return 'Aumento 25';
      case 'BOOST_30': return 'Aumento 30';
      case 'BOOST_50': return 'Aumento 50';
      default: return type.replace('_', ' ');
    }
  };

  useEffect(() => {
    const handler = () => {
      refetch();
      refetchSummary();
    };
    window.addEventListener('operation-created', handler);
    return () => window.removeEventListener('operation-created', handler);
  }, [refetch, refetchSummary]);

  return (
    <div className="space-y-8 px-3 md:px-6">
      {/* Page Header & Filters */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px] bg-[#03D791] rounded-full shadow-[0_0_15px_rgba(3,215,145,0.5)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#03D791] italic">hub de operações</h2>
          </div>
          <h1 className="text-3xl md:text-7xl font-black text-white tracking-tighter leading-[0.8] italic uppercase">
            Fluxo de<br /><span className="text-[#03D791]">Operações</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px]">
            <CustomSelect
              value={status}
              onChange={val => {
                setStatus(val as OperationStatus | 'ALL');
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: "TODOS OS STATUS" },
                { value: OperationStatus.PENDING, label: "PENDENTES" },
                { value: OperationStatus.FINISHED, label: "FINALIZADAS" },
                { value: OperationStatus.CASHOUT, label: "CASHOUT" },
              ]}
              placeholder="FILTRAR STATUS"
            />
          </div>

          <button
            onClick={() => openNewOperation()}
            className="group relative flex items-center justify-center bg-[#03D791] text-black h-[60px] px-14 rounded-[22px] text-[11px] font-black uppercase italic hover:scale-[1.05] hover:shadow-[0_20px_40px_rgba(0,215,145,0.2)] active:scale-95 transition-all overflow-hidden"
          >
            {/* Consolidated Icon + Text Group */}
            <div className="flex items-center gap-3 -translate-x-[1px]">
              <Plus size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="tracking-[0.3em] pl-[0.3em] whitespace-nowrap">
                Nova Operação
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-1 lg:col-span-8 glass-card rounded-[32px] md:rounded-[45px] p-6 md:p-10 relative overflow-hidden flex items-center justify-between border-white/5 shadow-3xl group">
          <div className="relative z-10">
            <p className="text-[#b9cbbc] text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-30 italic">BANCA TOTAL</p>
            <h3 className="text-3xl md:text-6xl font-black text-white tracking-tighter italic">
              R$ {formatCurrency(summary?.bancaTotal ?? 0)}
            </h3>
            <div className="flex items-center gap-3 mt-6">
              <span className="flex items-center text-[10px] font-black bg-[#03D791]/10 text-[#03D791] px-4 py-1.5 rounded-full border border-[#03D791]/20 italic">
                <TrendingUp className="w-3.5 h-3.5 mr-2" /> +{(((summary?.lucroMes ?? 0) / (summary?.bancaTotal || 1)) * 100).toFixed(1)}%
              </span>
              <span className="text-[#b9cbbc]/20 text-[9px] font-black tracking-[0.4em] uppercase">Rentabilidade Mensal</span>
            </div>
          </div>
          <div className="hidden lg:block opacity-[0.03] group-hover:opacity-[0.05] transform translate-x-10 translate-y-10 group-hover:scale-110 transition-all duration-1000">
            <Activity size={240} className="text-[#03D791]" />
          </div>
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-4 glass-card rounded-[32px] md:rounded-[45px] p-6 md:p-10 flex flex-col justify-between border-l-4 border-[#03D791] border-white/5 shadow-3xl bg-[#03D791]/5">
          <div>
            <p className="text-[#b9cbbc] text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-30 italic">VALOR EM OPERAÇÃO</p>
            <h3 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter">
              R$ {formatCurrency(summary?.emOperacao ?? 0)}
            </h3>
          </div>
          <div className="mt-10">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[9px] font-black text-[#03D791] uppercase tracking-[0.3em] italic">Saldo DISPONÍVEL</span>
              <span className="text-[11px] font-black text-[#03D791] italic">R$ {formatCurrency(summary?.disponivel ?? 0)}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#03D791] transition-all duration-1000 shadow-[0_0_20px_rgba(3,215,145,0.4)]"
                style={{ width: `${((summary?.emOperacao ?? 0) / (summary?.bancaTotal || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations List Container */}
      <div className="glass-card rounded-[40px] overflow-hidden border-white/5">
        {/* Table Header - somente desktop */}
        <div className="hidden md:grid grid-cols-12 px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 bg-white/[0.02] border-b border-white/5">
          <div className="col-span-4 lg:col-span-2">Data / Hora</div>
          <div className="col-span-4 lg:col-span-2">Operação</div>
          <div className="hidden lg:flex col-span-2 justify-center items-center">Descrição</div>
          <div className="hidden lg:block col-span-2 text-center">Status</div>
          <div className="col-span-4 lg:col-span-2 text-center">Resultado</div>
          <div className="hidden lg:block col-span-2 text-center">ID</div>
        </div>

        {/* Rows Container */}
        <div className="divide-y divide-white/5">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <SkeletonOperationRow key={i} />)
          ) : (Array.isArray(opsResponse?.data) ? opsResponse.data : []).length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.01]">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
                <Shovel className="w-10 h-10 text-[#b9cbbc] opacity-20" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#b9cbbc] italic">Nenhuma operação encontrada</p>
                <div className="w-12 h-1 bg-white/5 rounded-full mx-auto" />
              </div>
            </div>
          ) : (
            (Array.isArray(opsResponse?.data) ? opsResponse.data : []).map((op) => {
              const totalStake = op.bets?.reduce((sum: number, bet: any) => sum + Number(bet.cost || 0), 0) || 0;
              const profitColor = op.realProfit != null && op.realProfit > 0 ? 'text-[#03D791]' : op.realProfit != null && op.realProfit < 0 ? 'text-red-400' : 'text-[#FFDD65]';
              const statusStyle = getStatusStyle(op.status as OperationStatus);
              const statusLabel = getStatusLabel(op.status as OperationStatus);

              return (
                <div
                  key={op.id}
                  onClick={() => {
                    setSelectedOperation(op);
                    if (op.status === OperationStatus.PENDING) {
                      setIsFinishModalOpen(true);
                    } else {
                      setIsDetailsModalOpen(true);
                    }
                  }}
                  className="cursor-pointer hover:bg-white/[0.02] transition-all group"
                >
                  {/* Mobile Card */}
                  <div className="md:hidden grid grid-cols-[auto_1fr_auto] gap-x-3 px-4 py-4 border-b border-white/5 items-center">
                    {/* Col esquerda: data */}
                    <div className="flex flex-col items-center min-w-[44px]">
                      <span className="text-[9px] text-white/35 font-black tabular-nums text-center leading-snug">{formatDate(op.createdAt)}</span>
                    </div>

                    {/* Col centro: favicons + tipo + descrição */}
                    <div className="flex flex-col items-center gap-1 min-w-0 px-1">
                      <div className="flex -space-x-1.5">
                        {op.bets?.slice(0, 4).map((bet: any, i: number) => (
                          <div key={i} className="w-5 h-5 rounded-full border border-black/60 bg-black/60 flex items-center justify-center overflow-hidden" title={bet.account?.bettingHouse?.name}>
                            <img src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=32`} alt="" className="w-3 h-3 object-contain" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-black text-[#03D791] italic truncate w-full text-center">{getOperationTypeLabel(op.type)}</span>
                      {op.description && (
                        <span className="text-[11px] font-semibold text-white/60 truncate w-full text-center">{op.description}</span>
                      )}
                      <MatchIndicator operation={op} className="mt-1 justify-center" />
                    </div>

                    {/* Col direita: status → stake → resultado */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ${statusStyle}`}>{statusLabel}</span>
                      <span className="text-[9px] text-white/30 font-black tabular-nums">R${formatCurrency(totalStake)}</span>
                      {op.status === OperationStatus.FINISHED || op.status === OperationStatus.CASHOUT ? (
                        <span className={`text-sm font-black italic leading-tight ${
                          op.realProfit != null && op.realProfit > 0 ? 'text-[#03D791]'
                          : op.realProfit != null && op.realProfit < 0 ? 'text-red-400'
                          : 'text-white/40'
                        }`}>
                          {op.realProfit != null ? `${op.realProfit >= 0 ? '+' : ''}R$${formatCurrency(op.realProfit)}` : '—'}
                        </span>
                      ) : (
                        <span className="text-sm font-black italic leading-tight text-[#FFDD65]">
                          {op.expectedProfit != null ? `+R$${formatCurrency(op.expectedProfit)}` : '—'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desktop Row: grid original */}
                  <div className="hidden md:grid grid-cols-12 px-8 py-6 items-center group">
                    <div className="col-span-4 lg:col-span-2 flex flex-col">
                      <span className="text-sm font-black text-white italic tracking-tighter uppercase">{formatDate(op.createdAt)}</span>
                      <span className="text-[9px] text-[#b9cbbc] font-black uppercase tracking-widest opacity-30">{formatTime(op.createdAt)}</span>
                    </div>
                    <div className="col-span-4 lg:col-span-2 flex flex-col gap-1">
                      <div className="flex -space-x-2 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {op.bets?.map((bet: any, i: number) => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-black/40 flex items-center justify-center overflow-hidden" title={bet.account?.bettingHouse?.name}>
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=32`}
                              alt=""
                              className="w-3.5 h-3.5 object-contain"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#03D791] font-black uppercase tracking-[0.2em] leading-none italic">
                          {getOperationTypeLabel(op.type)}
                        </span>
                      </div>
                    </div>
                    <div className="hidden lg:flex flex-col col-span-2 justify-center items-center">
                      <span className="text-[11px] text-white/40 font-black italic tracking-tighter uppercase inline-block whitespace-nowrap" title={op.description}>
                        {op.description || "-"}
                      </span>
                      <MatchIndicator operation={op} className="mt-1" />
                    </div>
                    <div className="hidden lg:block col-span-2 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-[0.2em] italic transition-all duration-500 ${statusStyle}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="col-span-4 lg:col-span-2 text-center">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.2em] italic mb-1 block">
                          Stake: <span className="text-white/60">R$ {formatCurrency(totalStake)}</span>
                        </span>
                        {op.status === OperationStatus.FINISHED || op.status === OperationStatus.CASHOUT ? (
                          <span className={`text-sm font-black italic tracking-tighter ${op.realProfit != null && op.realProfit > 0 ? 'text-[#03D791]' : 'text-red-500/60'}`}>
                            {op.realProfit != null ? `${op.realProfit >= 0 ? '+' : ''} R$ ${formatCurrency(op.realProfit)}` : 'Encerrada'}
                          </span>
                        ) : (
                          <span className="text-sm font-black text-[#FFDD65] italic tracking-tighter">
                            {op.expectedProfit != null ? `${op.expectedProfit >= 0 ? '+' : ''} R$ ${formatCurrency(op.expectedProfit)}` : 'R$ 0,00'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="hidden lg:block col-span-2 text-center">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter tabular-nums truncate max-w-[80px] inline-block">
                        #{op.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      {opsResponse && opsResponse.total > opsResponse.limit && (
        <div className="mt-12 flex justify-between items-center px-4 opacity-40 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span>Página {page} de {Math.ceil(opsResponse.total / opsResponse.limit)}</span>
          <div className="flex gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="hover:text-[#00ff88] transition-colors disabled:opacity-20"
            >
              Anterior
            </button>
            <button
              disabled={page >= Math.ceil(opsResponse.total / opsResponse.limit)}
              onClick={() => setPage(p => p + 1)}
              className="hover:text-[#00ff88] transition-colors text-[#00ff88] disabled:opacity-20"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      <FinishOperationModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        operation={selectedOperation}
        onSuccess={() => {
          refetch();
          refetchSummary();
        }}
        onEdit={(op) => {
          setIsFinishModalOpen(false);
          openNewOperation(null, op);
        }}
      />

      <OperationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        operation={selectedOperation}
      />

    </div>
  );
}

export default function OperationsPage() {
  return (
    <Suspense fallback={<div>Carregando Operações...</div>}>
      <OperationsContent />
    </Suspense>
  );
}
