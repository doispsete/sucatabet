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
import { MatchDetailsModal } from "@/components/modals/MatchDetailsModal";
import { GameFinishedPopup, PendingNotification } from "@/components/GameFinishedPopup";
import { useOperations, useDashboardSummary, useSofascorePolling } from "@/lib/hooks";
import { SkeletonOperationRow, EmptyState, CustomSelect } from "@/components/ui/components";
import { OperationStatus, OperationType } from "@/lib/api/types";
import { NewOperationModal } from "@/components/modals/NewOperationModal";
import { FinishOperationModal } from "@/components/modals/FinishOperationModal";
import { OperationDetailsModal } from "@/components/modals/OperationDetailsModal";
import { GameStartOverlay } from "@/components/GameStartOverlay";
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
  const [selectedMatchOp, setSelectedMatchOp] = useState<any>(null);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isMatchDetailsModalOpen, setIsMatchDetailsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<PendingNotification[]>([]);
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
        // Limpar o ID da URL para não reabrir no polling
        const newParams = new URLSearchParams(window.location.search);
        newParams.delete('id');
        window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
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
    window.addEventListener('refetch-data', handler);
    return () => {
      window.removeEventListener('operation-created', handler);
      window.removeEventListener('refetch-data', handler);
    };
  }, [refetch, refetchSummary]);

  // Handle game finished events
  useEffect(() => {
    const handleGameFinished = (e: any) => {
      const notif = e.detail as PendingNotification;
      setNotifications(prev => {
        if (prev.some(n => n.operationId === notif.operationId)) return prev;
        return [...prev, notif];
      });
    };

    window.addEventListener('game-finished', handleGameFinished);
    return () => window.removeEventListener('game-finished', handleGameFinished);
  }, []);

  const handlePopupAction = (notif: PendingNotification) => {
    const op = opsResponse?.data?.find((o: any) => o.id === notif.operationId);
    if (op) {
      setSelectedOperation(op);
      setIsFinishModalOpen(true);
      setNotifications(prev => prev.filter(n => n.operationId !== notif.operationId));
    }
  };

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
        <div className="hidden md:grid grid-cols-12 px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 bg-white/[0.02] border-b border-white/5">
          <div className="col-span-2 flex items-center justify-start">Data / Hora</div>
          <div className="col-span-2 flex items-center justify-center">Operação</div>
          <div className="col-span-5 flex items-center justify-center">Descrição do Jogo</div>
          <div className="col-span-1 flex items-center justify-center">Status</div>
          <div className="col-span-2 flex items-center justify-end">Resultado Financeiro</div>
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
                  {/* Mobile Structured Card */}
                  <div className="md:hidden p-5 border-b border-white/5 space-y-4">
                    {/* Header: Date + Status */}
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Clock size={12} className="text-white/20" />
                          <span className="text-[10px] font-black text-white/40 tabular-nums uppercase">{formatDate(op.createdAt)} • {formatTime(op.createdAt)}</span>
                       </div>
                       <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border-2 tracking-widest ${statusStyle}`}>{statusLabel}</span>
                    </div>

                    {/* Body: Match Indicator (Full Width) */}
                    <div className="bg-black/20 rounded-[25px] p-4 border border-white/5 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-3 opacity-10">
                          <div className="flex -space-x-1.5">
                            {op.bets?.slice(0, 3).map((bet: any, i: number) => (
                              <img key={i} src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=32`} className="w-4 h-4 rounded-full border border-black" alt="" />
                            ))}
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-center gap-2">
                          <span className="text-xs font-black text-[#03D791] uppercase italic tracking-[0.2em] bg-[#03D791]/5 px-3 py-0.5 rounded-full border border-[#03D791]/10">
                            {getOperationTypeLabel(op.type)}
                          </span>
                          <MatchIndicator 
                            operation={op} 
                            className="w-full justify-center scale-110 py-2" 
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
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">STAKE TOTAL</span>
                          <span className="text-sm font-black text-white/60 tabular-nums italic">R$ {formatCurrency(totalStake)}</span>
                       </div>
                       <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black text-[#03D791]/40 uppercase tracking-widest leading-none mb-1">RESULTADO</span>
                          {op.status === OperationStatus.FINISHED || op.status === OperationStatus.CASHOUT ? (
                            <span className={`text-xl font-black italic tracking-tighter tabular-nums ${
                              op.realProfit != null && op.realProfit > 0 ? 'text-[#03D791]'
                              : op.realProfit != null && op.realProfit < 0 ? 'text-red-400'
                              : 'text-white/40'
                            }`}>
                              {op.realProfit != null ? `${op.realProfit >= 0 ? '+' : ''}R$${formatCurrency(op.realProfit)}` : '—'}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#FFDD65]/40 animate-pulse" />
                               <span className="text-xl font-black italic tracking-tighter tabular-nums text-[#FFDD65]">
                                 {op.expectedProfit != null ? `+R$${formatCurrency(op.expectedProfit)}` : '—'}
                               </span>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>

                  {/* Desktop Row: Re-Balanced Grid */}
                  <div className="hidden md:grid grid-cols-12 px-8 py-3 items-center group min-h-[90px]">
                    {/* Column 1: Date/Time */}
                    <div className="col-span-2 flex flex-col justify-center items-start border-l-2 border-transparent group-hover:border-[#03D791] pl-4 transition-all">
                      <span className="text-sm font-black text-white italic tracking-tighter uppercase leading-none mb-1">{formatDate(op.createdAt)}</span>
                      <div className="flex items-center gap-1.5">
                        <Clock size={10} className="text-[#b9cbbc]/20" />
                        <span className="text-[10px] text-[#b9cbbc]/40 font-black uppercase tracking-widest">{formatTime(op.createdAt)}</span>
                      </div>
                    </div>

                    {/* Column 2: Operação (TIPO + HOUSES) - Increased Size */}
                    <div className="col-span-2 flex flex-col items-center justify-center gap-3">
                        <span className="text-xs text-[#03D791] font-black uppercase tracking-[0.3em] italic bg-[#03D791]/5 px-3 py-1 rounded-lg border border-[#03D791]/10">
                          {getOperationTypeLabel(op.type)}
                        </span>
                        <div className="flex -space-x-2">
                          {op.bets?.map((bet: any, i: number) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-black flex items-center justify-center shadow-lg" title={bet.account?.bettingHouse?.name}>
                              <img src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=32`} className="w-3.5 h-3.5 object-contain" alt="" />
                            </div>
                          ))}
                        </div>
                    </div>

                    {/* Column 3: Game Section (MatchIndicator) */}
                    <div className="col-span-5 flex flex-col justify-center items-center">
                       <MatchIndicator 
                        operation={op} 
                        className="scale-105 opacity-100 py-1" 
                        onMatchClick={(e) => {
                          e.stopPropagation();
                          setSelectedMatchOp(op);
                          setIsMatchDetailsModalOpen(true);
                        }}
                      />
                      {op.description && (
                        <span className="text-[9px] text-white/20 font-black uppercase tracking-widest truncate max-w-[90%] mt-1" title={op.description}>
                          {op.description}
                        </span>
                      )}
                    </div>

                    {/* Column 4: Status - Increased Size */}
                    <div className="col-span-1 flex justify-center items-center">
                      <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase border-2 tracking-[0.2em] italic transition-all duration-300 ${statusStyle}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Column 5: Financial Results (Increased Stake) */}
                    <div className="col-span-2 flex justify-end items-center pr-4">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2 text-xs font-black text-[#b9cbbc]/40 uppercase tracking-widest italic leading-none bg-white/[0.03] px-3 py-1 rounded-md">
                          <span className="opacity-30">STAKE:</span>
                          <span className="text-white/60">R${formatCurrency(totalStake)}</span>
                        </div>
                        
                        {op.status === OperationStatus.FINISHED || op.status === OperationStatus.CASHOUT ? (
                          <span className={`text-2xl font-black italic tracking-tighter leading-none ${op.realProfit != null && op.realProfit > 0 ? 'text-[#03D791]' : 'text-red-500/60'}`}>
                            {op.realProfit != null ? `${op.realProfit >= 0 ? '+' : ''} R$ ${formatCurrency(op.realProfit)}` : 'ENCERRADA'}
                          </span>
                        ) : (
                          <div className="flex flex-col items-end">
                             <span className="text-2xl font-black text-[#FFDD65] italic tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(255,221,101,0.2)]">
                              {op.expectedProfit != null ? `+ R$ ${formatCurrency(op.expectedProfit)}` : 'R$ 0,00'}
                            </span>
                             <span className="text-[10px] font-black text-[#FFDD65]/40 uppercase tracking-widest italic animate-pulse mt-1">EM CURSO</span>
                          </div>
                        )}
                      </div>
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

      <MatchDetailsModal
        isOpen={isMatchDetailsModalOpen}
        onClose={() => {
          setIsMatchDetailsModalOpen(false);
          setSelectedMatchOp(null);
        }}
        operation={selectedMatchOp}
      />

      <GameFinishedPopup 
        notifications={notifications}
        onClose={(id) => setNotifications(prev => prev.filter(n => n.operationId !== id))}
        onAction={handlePopupAction}
        disabled={isFinishModalOpen || isDetailsModalOpen || isMatchDetailsModalOpen}
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
