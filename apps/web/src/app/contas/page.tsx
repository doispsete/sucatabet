"use client";
import React, { useState } from "react";
import {
  UserPlus,
  Wallet,
  Users,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Activity,
  ChevronRight,
  Shield
} from "lucide-react";
import { AccountCard } from "@/components/AccountCard";
import { AccountCarousel } from "@/components/AccountCarousel";
import { useCpfProfiles, useDashboardSummary, useAccounts, useHouses, useAuth } from "@/lib/hooks";
import { SkeletonCard, SkeletonDivRow, EmptyState, Modal, LoadingButton, toast, CustomSelect, ConfirmDialog, Input } from "@/components/ui/components";
import { formatCurrency } from "@/lib/utils";

function formatCpf6(cpf: string): string {
  if (!cpf) return "---.---";
  const digits = cpf.replace(/\D/g, '').slice(0, 6);
  return digits.replace(/(\d{3})(\d{0,3})/, (_, p1, p2) => p1 + (p2 ? '.' + p2 : ''));
}

function AddCpfModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const { create: createCpf, isMutating } = useCpfProfiles();

  const handleCpfChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCpf(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.length < 6) {
      toast.error("O prefixo do documento deve ter pelo menos 6 dígitos");
      return;
    }
    try {
      await createCpf({ name, cpf });
      toast.success("Perfil de operador inicializado");
      onSuccess();
      onClose();
      setName("");
      setCpf("");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Falha na inicialização do perfil");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Perfil de Operador">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Nome do Titular</label>
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="NOME COMPLETO"
            required
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Prefixo Documento (6 Dig.)</label>
          <Input
            type="text"
            value={formatCpf6(cpf)}
            onChange={e => handleCpfChange(e.target.value)}
            className="text-[#03D791] font-black tracking-widest text-center"
            placeholder="000.000"
            required
          />
        </div>
        <LoadingButton
          type="submit"
          isLoading={isMutating}
          className="w-full bg-[#03D791] text-black font-black uppercase tracking-[0.3em] italic py-5 rounded-[20px] text-[10px] shadow-[0_10px_30px_rgba(3,215,145,0.2)] hover:scale-[1.02] active:scale-95 transition-all mt-4"
        >
          INICIALIZAR PERFIL
        </LoadingButton>
      </form>
    </Modal>
  );
}

function HousesManagementModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { data: houses, create, update, remove, isMutating } = useHouses();
  const { isAdmin } = useAuth();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: string, name: string } | null>(null);

  const resetForm = () => {
    setName("");
    setDomain("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      if (editingId) {
        await update(editingId, { name, domain });
        toast.success("Parâmetros da casa atualizados");
      } else {
        await create({ name, domain });
        toast.success("Nova casa injetada no hub");
      }
      resetForm();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro na operação do hub");
    }
  };

  const confirmDeleteHouse = async () => {
    if (!deleteConfirm) return;
    try {
      await remove(deleteConfirm.id);
      toast.success("Casa removida do ecossistema");
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err.message || "Falha na exclusão");
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Hub de Casas de Aposta" size="lg">
        <div className="space-y-8">
          {isAdmin && (
            isAdding ? (
              <div className="glass-card p-8 rounded-[35px] border-[#03D791]/20 animate-in fade-in slide-in-from-top-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-[#03D791]" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#03D791] italic">{editingId ? 'Sincronizar Parâmetros' : 'Novo Ponto de Entrada'}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Rótulo da Casa</label>
                      <Input
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Ex: Bet365" required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Domínio Primário</label>
                      <Input
                        type="text" value={domain} onChange={e => setDomain(e.target.value)}
                        placeholder="bet365.com" required
                      />
                    </div>
                  </div>
                  {domain && (
                    <div className="flex items-center gap-4 p-5 bg-black/40 rounded-3xl border border-white/5">
                      <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center border border-white/10 shadow-2xl">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                          alt="Logo"
                          className="w-7 h-7 rounded"
                          onError={e => e.currentTarget.style.display = 'none'}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#03D791] italic">Identidade Detectada</p>
                        <p className="text-[9px] font-medium text-[#b9cbbc] opacity-30 italic">Logo identificado via endpoint de nuvem.</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-4 pt-2">
                    <button type="button" onClick={resetForm} className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/40 hover:text-white transition-colors px-4 italic">CANCELAR</button>
                    <LoadingButton type="submit" isLoading={isMutating} className="bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-white/20 transition-all">
                      {editingId ? 'SALVAR ALTERAÇÕES' : 'IMPLANTAR CASA'}
                    </LoadingButton>
                  </div>
                </form>
              </div>
            ) : (
              <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-3 p-8 rounded-[30px] border-2 border-dashed border-white/5 text-[#b9cbbc]/30 hover:text-[#03D791] hover:border-[#03D791]/20 hover:bg-[#03D791]/5 transition-all text-[11px] font-black uppercase tracking-[0.4em] italic group">
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                Registrar Nova Casa de Apostas
              </button>
            )
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pt-2 px-2 pr-4 custom-scrollbar lg:no-scrollbar pb-6">
            {(Array.isArray(houses) ? [...houses].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })) : []).map(h => (
              <div key={h.id} className="group flex items-center justify-between p-5 glass-card rounded-3xl border border-white/5 hover:border-[#03D791]/20 group-item">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-black/60 flex items-center justify-center border border-white/5 shadow-2xl">
                    <img src={`https://www.google.com/s2/favicons?domain=${h.domain}&sz=64`} alt={h.name} className="w-8 h-8 rounded-lg opacity-80 group-hover:opacity-100 transition-all group-hover:scale-110" />
                  </div>
                  <div>
                    <h5 className="text-white text-md font-black italic uppercase tracking-tight">{h.name}</h5>
                    <p className="text-[10px] text-[#b9cbbc] font-black opacity-20 uppercase tracking-widest">{h.domain}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => { setEditingId(h.id); setName(h.name); setDomain(h.domain || ""); setIsAdding(true); }} className="p-2.5 rounded-xl bg-white/5 text-[#b9cbbc] hover:text-[#03D791] transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, id: h.id, name: h.name })} className="p-2.5 rounded-xl bg-red-500/5 text-[#b9cbbc] hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm?.isOpen}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteHouse}
        title="Excluir Casa"
        message={`Deseja realmente excluir a casa ${deleteConfirm?.name}?`}
        type="danger"
      />
    </>
  );
}

function AddAccountModal({ isOpen, onClose, onSuccess, initialProfileId, profiles }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, initialProfileId?: string, profiles: any[] }) {
  const [cpfProfileId, setCpfProfileId] = useState<string | null>(null);
  const [bettingHouseId, setBettingHouseId] = useState<string | null>(null);
  const { data: houses, isLoading: isHousesLoading } = useHouses();
  const { create: createAccount, isMutating } = useAccounts();

  React.useEffect(() => {
    if (initialProfileId) setCpfProfileId(initialProfileId);
    if (!isOpen) {
      setCpfProfileId(null);
      setBettingHouseId(null);
    }
  }, [initialProfileId, isOpen]);

  const selectedProfile = (Array.isArray(profiles) ? profiles : []).find(p => p.id === cpfProfileId);
  const linkedHouseIds = selectedProfile?.accounts?.map((acc: any) => acc.bettingHouseId) || [];

  const houseOptions = (Array.isArray(houses) ? [...houses] : [])
    .filter(h => !linkedHouseIds.includes(h.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
    .map(h => ({
      value: h.id,
      label: h.name.toUpperCase()
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfProfileId || !bettingHouseId) {
      toast.error("Vínculo incompleto: Ativo e Casa necessários");
      return;
    }

    try {
      await createAccount({
        cpfProfileId,
        bettingHouseId,
        balance: 0
      });
      toast.success("Ativo vinculado com sucesso");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Falha na vinculação");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialProfileId && selectedProfile ? `Vincular Casa para ${selectedProfile.name.split(' ')[0]}` : "Vinculação de Ativo"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!initialProfileId && (
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Detentor Primário</label>
            <CustomSelect
              value={cpfProfileId ?? ""}
              onChange={val => {
                setCpfProfileId(val);
                setBettingHouseId(null); // Reset house when profile changes
              }}
              options={(Array.isArray(profiles) ? profiles : []).map((p: any) => ({
                value: p.id,
                label: `${p.name.toUpperCase()} — ${formatCpf6(p.cpf)}`
              }))}
              placeholder="ESCOLHER OPERADOR"
            />
          </div>
        )}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Casa de Destino</label>
          <CustomSelect
            value={bettingHouseId ?? ""}
            onChange={val => setBettingHouseId(val)}
            options={houseOptions}
            placeholder={isHousesLoading ? "ACESSANDO HUB..." : (houseOptions.length === 0 && cpfProfileId ? "TODAS AS CASAS JÁ VINCULADAS" : "SELECIONAR DESTINO")}
          />
        </div>
        <LoadingButton
          type="submit"
          isLoading={isMutating}
          disabled={!cpfProfileId || !bettingHouseId || isMutating}
          className="w-full bg-gradient-to-r from-[#03D791] to-[#00D1FF] text-black font-black uppercase tracking-[0.3em] italic py-5 rounded-[25px] text-[10px] hover:shadow-[0_15px_40px_rgba(3,215,145,0.3)] hover:scale-[1.02] active:scale-95 transition-all mt-6 disabled:opacity-20"
        >
          {isMutating ? "VINCULANDO..." : "VINCULAR CONTA NO HUB"}
        </LoadingButton>
      </form>
    </Modal>
  );
}

export default function AccountsPage() {
  const { data: profiles, isLoading: profilesLoading, refetch: refetchProfiles, remove: removeCpf } = useCpfProfiles();
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useDashboardSummary();
  const { user } = useAuth();

  const [isCpfModalOpen, setIsCpfModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isHousesModalOpen, setIsHousesModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean, id: string, name: string } | null>(null);

  const handleDeleteCpf = async (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, id, name });
  };

  const confirmDeleteCpf = async () => {
    if (!deleteDialog) return;
    try {
      await removeCpf(deleteDialog.id);
      toast.success("Perfil de operador encerrado");
      setDeleteDialog(null);
      refetchSummary();
    } catch (err: any) {
      toast.error(err.message || "Falha ao encerrar perfil");
    }
  };

  const summaryStats = React.useMemo(() => [
    {
      label: "BANCA TOTAL",
      value: `R$ ${formatCurrency(summary?.bancaTotal ?? 0)}`,
      icon: Wallet,
      color: "text-white",
      accent: "#03D791"
    },
    {
      label: "DISPONÍVEL PARA OPERAR",
      value: `R$ ${formatCurrency(summary?.disponivel ?? 0)}`,
      icon: TrendingUp,
      color: "text-[#14d1ff]",
      accent: "#14d1ff"
    },
    {
      label: "VALOR EM OPERAÇÃO",
      value: `R$ ${formatCurrency(summary?.emOperacao ?? 0)}`,
      icon: Activity,
      color: "text-[#03D791]",
      accent: "#03D791"
    },
  ], [summary]);

  return (
    <div className="space-y-12 pb-20 pt-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px] bg-[#03D791] rounded-full shadow-[0_0_15px_rgba(3,215,145,0.5)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#03D791] italic">Hub de Ativos</h2>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.8] italic uppercase">
            Central de<br /><span className="text-[#03D791]">Contas</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsCpfModalOpen(true)}
            className="group flex items-center gap-3 bg-white/5 hover:bg-[#03D791]/10 border border-white/10 hover:border-[#03D791]/30 px-8 py-5 rounded-[22px] transition-all duration-500 shadow-2xl"
          >
            <UserPlus size={18} className="text-[#03D791] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Novo CPF</span>
          </button>
          <button
            onClick={() => setIsHousesModalOpen(true)}
            className="group flex items-center gap-3 bg-white/5 hover:bg-[#14d1ff]/10 border border-white/10 hover:border-[#14d1ff]/30 px-8 py-5 rounded-[22px] transition-all duration-500 shadow-2xl"
          >
            <Building2 size={18} className="text-[#14d1ff] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Gerenciar Casas</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryLoading ? (
          Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          summaryStats.map((stat, i) => (
            <div key={i} className="glass-card group p-8 rounded-[40px] border-white/5 hover:border-white/10 transition-all duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#03D791]/5 transition-all duration-1000" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-2xl bg-black/40 border border-white/5 ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                    <stat.icon size={22} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/20 italic group-hover:text-white/40 transition-colors">Sincronia ao vivo</div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 mb-2 italic">{stat.label}</p>
                  <h3 className={`text-4xl font-black ${stat.color} tracking-tighter italic`}>{stat.value}</h3>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white italic">CPF's Ativos</h3>
            <p className="text-[10px] font-medium text-[#b9cbbc]/30 italic uppercase tracking-widest">Monitoramento em tempo real de CPFs vinculados</p>
          </div>
        </div>

        {profilesLoading ? (
          <div className="grid grid-cols-1 gap-12">
            {[1, 2].map(i => (
              <div key={i} className="space-y-8">
                <SkeletonDivRow />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(j => <SkeletonCard key={j} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (Array.isArray(profiles) ? [...profiles].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')) : []).length === 0 ? (
          <EmptyState
            message="NENHUMA IDENTIDADE DETECTADA NO HUB"
          />
        ) : (
          (Array.isArray(profiles) ? [...profiles].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')) : []).map((profile) => (
            <div key={profile.id} className="group/profile space-y-6">
              <div className="flex items-center gap-6 px-4">
                <div className="w-16 h-16 rounded-3xl bg-black/40 flex items-center justify-center border border-white/10 shadow-2xl group-hover/profile:border-[#03d791]/40 group-hover/profile:shadow-[0_0_20px_rgba(3,215,145,0.1)] transition-all duration-500">
                  <span className="text-xl font-black text-[#03d791] italic">{profile.name[0].toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h5 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{profile.name}</h5>
                    <span className="text-[10px] font-black bg-[#03d791]/10 text-[#03d791] px-4 py-1.5 rounded-full border border-[#03d791]/20 uppercase tracking-[0.2em] leading-none italic">{profile.accounts?.length || 0} ATIVOS</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 opacity-50">
                    <p className="text-[11px] text-[#b9cbbc] font-black uppercase tracking-[0.2em] italic leading-none">
                      CPF: {formatCpf6(profile.cpf)}
                    </p>
                    <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                    <p className="text-[11px] text-[#b9cbbc] font-bold uppercase tracking-widest italic leading-none">CONTA VERIFICADA</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteCpf(profile.id, profile.name)}
                    className="w-12 h-12 rounded-2xl bg-white/5 text-[#b9cbbc]/20 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 flex items-center justify-center transition-all duration-500"
                    title="Encerrar Perfil de Operador"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <AccountCarousel
                accounts={(Array.isArray(profile.accounts) ? [...profile.accounts] : [])
                  .sort((a, b) => (a.bettingHouse?.name || "").localeCompare(b.bettingHouse?.name || "", 'pt-BR'))}
                profileName={profile.name}
                onAddAccount={() => {
                  setSelectedProfileId(profile.id);
                  setIsAccountModalOpen(true);
                }}
                onUnlink={() => {
                  refetchProfiles();
                  refetchSummary();
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <AddCpfModal
        isOpen={isCpfModalOpen}
        onClose={() => setIsCpfModalOpen(false)}
        onSuccess={() => refetchProfiles()}
      />

      <AddAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setSelectedProfileId("");
        }}
        initialProfileId={selectedProfileId}
        profiles={profiles || []}
        onSuccess={() => {
          refetchProfiles();
          refetchSummary();
        }}
      />

      <HousesManagementModal
        isOpen={isHousesModalOpen}
        onClose={() => setIsHousesModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={!!deleteDialog?.isOpen}
        onClose={() => setDeleteDialog(null)}
        onConfirm={confirmDeleteCpf}
        title="Encerrar cpf"
        message={`Tem certeza que deseja excluir o perfil de ${deleteDialog?.name}? Esta ação é irreversível e removerá todas as contas vinculadas.`}
        confirmLabel="continuar e excluir"
        cancelLabel="CANCELAR"
        type="danger"
      />
    </div>
  );
}
