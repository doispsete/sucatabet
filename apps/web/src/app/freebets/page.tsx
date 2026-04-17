"use client";
import React, { useState, useMemo } from "react";
import { FreebetCard } from "@/components/FreebetCard";
import { FreebetCarousel } from "@/components/FreebetCarousel";
import {
  Plus,
  Calculator,
  Wallet,
  Clock,
  BarChart3,
  Gift,
  PlusCircle,
  TrendingUp,
  Percent
} from "lucide-react";
import { useFreebets, useDashboardSummary, useAccounts, useOperations } from "@/lib/hooks";
import { SkeletonCard, EmptyState, Modal, LoadingButton, toast, CustomSelect, ConfirmDialog, Input, CustomDatePicker } from "@/components/ui/components";
import * as T from "@/lib/api/types";
import { FreebetStatus } from "@/lib/api/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default function FreebetsPage() {
  const {
    data: freebets,
    isLoading: freebetsLoading,
    refetch: refetchFreebets,
    create: createFreebet,
    update: updateFreebet,
    remove: deleteFreebet,
    isMutating: isCreating
  } = useFreebets();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean,
    id: string,
    action: 'use' | 'expire' | 'delete',
    title: string,
    message: string
  } | null>(null);

  const handleUse = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      id,
      action: 'use',
      title: "Utilizar Ativo",
      message: "Confirmar utilização deste reward no ecossistema?"
    });
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      id,
      action: 'delete',
      title: "Deletar Freebet",
      message: "Remover permanentemente esta freebet da sua conta?"
    });
  };

  const executeAction = async () => {
    if (!confirmDialog) return;
    try {
      const { id, action } = confirmDialog;
      if (action === 'delete') {
        await deleteFreebet(id);
        toast.success("Freebet excluída!");
      }
      refetchFreebets();
    } catch (err) {
      toast.error("Erro ao processar ação");
    } finally {
      setConfirmDialog(null);
    }
  };

  const { data: summary } = useDashboardSummary();
  const { data: accounts } = useAccounts();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accId, setAccId] = useState("");
  const [fbValue, setFbValue] = useState("");
  const [fbOrigin, setFbOrigin] = useState("");
  const [fbExpiresAt, setFbExpiresAt] = useState("");

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFb, setEditingFb] = useState<T.Freebet | null>(null);
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editId, setEditId] = useState(""); // Added editId state

  const handleCreateFreebet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('fbExpiresAt value:', fbExpiresAt);
      await createFreebet({
        accountId: accId,
        value: parseFloat(fbValue),
        expiresAt: new Date(fbExpiresAt + 'T23:59:59-03:00').toISOString(),
        origin: fbOrigin,
      });
      toast.success("Freebet cadastrada com sucesso");
      setIsModalOpen(false);
      setAccId("");
      setFbValue("");
      setFbOrigin("");
      setFbExpiresAt("");
      refetchFreebets();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro ao faturar freebet");
    }
  };

  const handleEditOpen = (fb: T.Freebet) => {
    setEditingFb(fb);
    setEditId(fb.id); // Set the id for editing
    setEditValue(fb.value.toString());
    setEditExpiresAt(fb.expiresAt); // Keep ISO
    setIsEditModalOpen(true);
  };

  const handleUpdateFB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await updateFreebet(editId, { value: parseFloat(editValue), expiresAt: new Date(editExpiresAt + 'T23:59:59-03:00').toISOString() });
      toast.success("Ativo atualizado com sucesso");
      setIsEditModalOpen(false);
      refetchFreebets();
    } catch (err) {
      toast.error("Erro ao atualizar freebet");
    }
  };

  const { data: opData } = useOperations({ limit: 1000 });
  const operations = opData?.data || [];

  // Used and Expired Freebets (History)
  const historyFreebets = useMemo(() => {
    const list = Array.isArray(freebets) ? freebets : [];
    return list.filter(f =>
      f.status === FreebetStatus.USADA ||
      f.status === FreebetStatus.EXPIRADA ||
      new Date(f.expiresAt).getTime() <= Date.now()
    );
  }, [freebets]);

  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'USADA' | 'EXPIRADA'>('ALL');

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'ALL') return historyFreebets;
    if (historyFilter === 'USADA') return historyFreebets.filter(f => f.status === FreebetStatus.USADA);
    return historyFreebets.filter(f => f.status === FreebetStatus.EXPIRADA || new Date(f.expiresAt).getTime() <= Date.now());
  }, [historyFreebets, historyFilter]);

  // Calculations for Stats
  const usedFreebets = (Array.isArray(freebets) ? freebets : []).filter(f => f.status === FreebetStatus.USADA);

  // Real Profit from operations using freebets
  const lucroComFreebets = useMemo(() => {
    return usedFreebets.reduce((acc, fb) => acc + (Number((fb as any).operation?.realProfit) || 0), 0);
  }, [usedFreebets]);

  const conversaoTotal = useMemo(() => {
    if (usedFreebets.length === 0) return 0;
    const totalStake = usedFreebets.reduce((acc, fb) => acc + Number(fb.value), 0);
    if (totalStake === 0) return 0;
    return (lucroComFreebets / totalStake) * 100;
  }, [usedFreebets, lucroComFreebets]);

  const totalEmCarteira = useMemo(() => {
    return (Array.isArray(freebets) ? freebets : [])
      .filter(f =>
        (f.status === FreebetStatus.PENDENTE || f.status === FreebetStatus.EXPIRANDO) &&
        new Date(f.expiresAt).getTime() > Date.now()
      )
      .reduce((acc, f) => acc + Number(f.value), 0);
  }, [freebets]);

  const stats = [
    {
      label: "LUCRO COM FREEBETS",
      value: `R$ ${formatCurrency(lucroComFreebets)}`,
      subValue: `${conversaoTotal.toFixed(1)}% Conversão`,
      icon: TrendingUp,
      color: "text-[#03d791]",
      accent: "#03d791"
    },
    {
      label: "ALERTAS CRÍTICOS",
      value: (summary?.freebetsExpirando ?? []).length.toString(),
      icon: Clock,
      color: "text-[#ffdd65]",
      accent: "#ffdd65"
    },
    {
      label: "TOTAL EM CARTEIRA",
      value: `R$ ${formatCurrency(totalEmCarteira)}`,
      icon: Wallet,
      color: "text-[#00D1FF]",
      accent: "#00D1FF"
    },
  ];

  return (
    <div className="px-3 md:px-6 space-y-12 pb-24 h-full flex flex-col">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px] bg-[#03D791] rounded-full shadow-[0_0_15px_rgba(3,215,145,0.5)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#03D791] italic">Hub de Freebets</h2>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.8] italic uppercase">
            Central de<br /><span className="text-[#03D791]">Freebets</span>
          </h1>
        </div>
        {/* Removed button "Implantar Freebet" as requested */}
      </header>

      {/* Asset Reward Hub Carousel */}
      <div className="mb-20 opacity-100">
        <FreebetCarousel
          freebets={freebets || []}
          onAddFreebet={() => setIsModalOpen(true)}
          onUse={handleUse}
          onExpire={() => { }} // No longer needed
          onDelete={handleDelete}
          onEdit={handleEditOpen}
        />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-10 rounded-[45px] relative group overflow-hidden border-white/5 border-l-4" style={{ borderLeftColor: stat.accent }}>
            <div className="absolute -right-8 -top-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 group-hover:scale-125 group-hover:-rotate-12 pointer-events-none">
              <stat.icon size={160} />
            </div>
            <p className="text-[#b9cbbc] text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-30 italic">{stat.label}</p>
            <div className="flex items-baseline gap-4 mb-2">
              <h3 className={`text-4xl font-black italic tracking-tighter ${stat.color}`}>
                {stat.value}
              </h3>
              {stat.subValue && (
                <span className="text-[10px] font-black text-[#03d791] bg-[#03d791]/10 px-2 py-1 rounded-lg italic">
                  {stat.subValue}
                </span>
              )}
            </div>
            <div className="w-12 h-1 bg-white/5 rounded-full mt-4 group-hover:w-24 group-hover:bg-[#03d791]/30 transition-all duration-500"></div>
          </div>
        ))}
      </div>

      {/* History Section: Reward Archive */}
      <div className="space-y-8 pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#b9cbbc]/40" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 italic">Freebets Utilizadas</h2>
            </div>
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Histórico de <span className="text-[#03D791]">Operações</span></h3>
          </div>

          <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
            {(['ALL', 'USADA', 'EXPIRADA'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setHistoryFilter(filter)}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${historyFilter === filter
                  ? 'bg-[#03D791] text-black shadow-[0_10px_20px_rgba(3,215,145,0.2)]'
                  : 'text-[#b9cbbc]/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                {filter === 'ALL' ? 'TODAS' : filter === 'USADA' ? 'USADAS' : 'EXPIRADAS'}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[40px] overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.3em] italic">Data de Registro</th>
                  <th className="px-8 py-6 text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.3em] italic">Operador / CPF</th>
                  <th className="px-8 py-6 text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.3em] italic">Casa</th>
                  <th className="px-8 py-6 text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.3em] italic">Valor Orig.</th>
                  <th className="px-8 py-6 text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.3em] italic">Lucro Real</th>
                  <th className="px-8 py-6 text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.3em] italic">Conversão</th>
                  <th className="px-8 py-6 text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.3em] italic">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-12 text-center text-[10px] font-black text-[#b9cbbc]/20 uppercase tracking-widest italic">
                      Nenhum registro encontrado no arquivo
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((fb) => {
                    // Use the linked operation from the relation
                    const linkedOp = (fb as any).operation;
                    const conv = linkedOp ? ((Number(linkedOp.realProfit || 0) / Number(fb.value)) * 100) : 0;

                    return (
                      <tr key={fb.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-[11px] font-black text-white italic tracking-tighter">
                            {formatDate(fb.usedAt || fb.expiresAt)}
                          </p>
                          <p className="text-[9px] text-[#b9cbbc]/40 font-bold uppercase tracking-widest">
                            {formatTime(fb.usedAt || fb.expiresAt)}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-[11px] font-black text-[#03D791] italic tracking-tight uppercase">
                            {fb.account?.cpfProfile?.name.split(' ')[0]}
                          </p>
                          <p className="text-[9px] text-[#b9cbbc]/40 font-bold tracking-[0.2em]">
                            ({fb.account?.cpfProfile?.cpf.substring(0, 6)})
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-[11px] font-black text-white uppercase tracking-widest italic opacity-60">
                            {fb.account?.bettingHouse?.name || "CASA"}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-[11px] font-black text-white italic tracking-tighter">
                            R$ {formatCurrency(fb.value)}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          {fb.status === FreebetStatus.USADA ? (
                            <p className="text-[11px] font-black text-[#03D791] italic tracking-tighter">
                              + R$ {formatCurrency(linkedOp?.realProfit || 0)}
                            </p>
                          ) : (
                            <p className="text-[11px] font-black text-[#ff6b6b] italic tracking-tighter opacity-40">
                              ---
                            </p>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          {fb.status === FreebetStatus.USADA && conv > 0 ? (
                            <span className="text-[10px] font-black text-[#03D791] bg-[#03D791]/10 px-3 py-1 rounded-lg italic">
                              {conv.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-[#b9cbbc]/20 italic">0.0%</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] ${fb.status === FreebetStatus.USADA
                            ? 'bg-[#14d1ff]/10 text-[#14d1ff] border border-[#14d1ff]/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {fb.status === FreebetStatus.USADA ? 'Utilizada' : 'Expirada'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar Nova Freebet"
      >
        <form onSubmit={handleCreateFreebet} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Conta de Destino</label>
            <CustomSelect
              value={accId}
              onChange={val => setAccId(val)}
              options={(Array.isArray(accounts) ? accounts : []).map(acc => ({
                value: acc.id,
                label: `${acc.bettingHouse?.name.toUpperCase()} — ${acc.cpfProfile?.name.toUpperCase()}`
              }))}
              placeholder="SELECIONAR CONTA"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Valor da Freebet (R$)</label>
            <Input
              type="number"
              step="0.01"
              required
              value={fbValue}
              onChange={e => setFbValue(e.target.value)}
              placeholder="0.00"
              className="text-[#03d791] font-black text-center text-xl"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Origem da freebet</label>
            <Input
              type="text"
              required
              value={fbOrigin}
              onChange={e => setFbOrigin(e.target.value)}
              placeholder="EX: Clube365, Promoção Sporty"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Data de Expiração</label>
            <div className="relative group/input">
              <CustomDatePicker
                value={fbExpiresAt}
                onChange={val => setFbExpiresAt(val)}
                className="h-[52px]"
              />
            </div>
          </div>
          <div className="pt-4">
            <LoadingButton
              type="submit"
              isLoading={isCreating}
              disabled={!accId || !fbValue || !fbOrigin || !fbExpiresAt}
              className="w-full bg-[#03d791] text-black font-black uppercase tracking-[0.4em] italic py-6 rounded-[25px] text-[10px] hover:shadow-[0_20px_40px_rgba(3,215,145,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20"
            >
              Cadastrar freebet
            </LoadingButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDialog?.isOpen}
        onClose={() => setConfirmDialog(null)}
        onConfirm={executeAction}
        title={confirmDialog?.title || "Ação"}
        message={confirmDialog?.message || ""}
        type={confirmDialog?.action === 'delete' ? 'danger' : 'info'}
        confirmLabel="PROCEDER"
        cancelLabel="CANCELAR"
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ajustar Freebet"
      >
        <form onSubmit={handleUpdateFB} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Valor da Freebet (R$)</label>
            <Input
              type="number"
              step="0.01"
              required
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="text-[#03d791] font-black text-center text-xl"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Nova Data de Expiração</label>
            <div className="relative group/input">
              <CustomDatePicker
                value={editExpiresAt}
                onChange={val => setEditExpiresAt(val)}
                className="h-[52px]"
              />
            </div>
          </div>
          <div className="pt-4">
            <LoadingButton
              type="submit"
              isLoading={freebetsLoading}
              className="w-full bg-[#ffdd65] text-black font-black uppercase tracking-[0.4em] italic py-6 rounded-[25px] text-[10px] hover:shadow-[0_20px_40px_rgba(255,221,101,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              ATUALIZAR REGISTRO
            </LoadingButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
