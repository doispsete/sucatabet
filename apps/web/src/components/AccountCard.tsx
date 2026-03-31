import React, { useState } from "react";
import { 
  MoreVertical, 
  Circle,
  Trash2,
  AlertTriangle
} from "lucide-react";
import * as T from "@/lib/api/types";
import { useAccounts } from "@/lib/hooks";
import { toast, Modal, LoadingButton, ConfirmDialog, Input } from "@/components/ui/components";
import { formatCurrency } from "@/lib/utils";
import { History } from "lucide-react";
import { AccountHistoryModal } from "./modals/AccountHistoryModal";

interface AccountCardProps {
  account: T.Account;
  profileName?: string;
  onUnlink?: () => void;
}

export function AccountCard({ account, profileName, onUnlink }: AccountCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isUnlinkConfirmOpen, setIsUnlinkConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [amountType, setAmountType] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [amount, setAmount] = useState("");

  const { remove: removeAccount, deposit, withdraw, update: updateAccount, isMutating } = useAccounts();
  const houseName = account.bettingHouse?.name || "Desconhecida";

  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    try {
      if (amountType === "DEPOSIT") {
        await deposit(account.id, val);
        toast.success(`Depósito de R$ ${formatCurrency(val)} realizado`);
      } else {
        await withdraw(account.id, val);
        toast.success(`Saque de R$ ${formatCurrency(val)} realizado`);
      }
      setIsAmountModalOpen(false);
      setAmount("");
      if (onUnlink) onUnlink(); // This also refetches summary/profiles
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar");
    }
  };

  const handleUnlink = async () => {
    try {
      await removeAccount(account.id);
      toast.success("Conta encerrada com sucesso");
      if (onUnlink) onUnlink();
    } catch (err: any) {
      toast.error(err.message || "Erro ao encerrar conta");
    } finally {
      setIsMenuOpen(false);
      setIsUnlinkConfirmOpen(false);
    }
  };

  const handleLimit = async () => {
    try {
      await updateAccount(account.id, { status: T.AccountStatus.LIMITED });
      toast.success("Conta marcada como limitada");
      if (onUnlink) onUnlink();
    } catch (err: any) {
      toast.error(err.message || "Erro ao limitar conta");
    } finally {
      setIsMenuOpen(false);
    }
  };
  
  const getHouseBranding = (name: string) => {
    const lowName = name.toLowerCase();
    if (lowName.includes('bet365')) return { bg: "bg-[#005a41]", text: "text-white", glow: "hover:shadow-[0_20px_40px_-12px_rgba(3,215,145,0.15)]" };
    if (lowName.includes('betano')) return { bg: "bg-[#ff6700]", text: "text-white", glow: "hover:shadow-[0_20px_40px_-12px_rgba(255,103,0,0.15)]" };
    if (lowName.includes('stake')) return { bg: "bg-[#2a2a2a]", text: "text-[#14d1ff]", glow: "hover:shadow-[0_20px_40px_-12px_rgba(20,209,255,0.15)]" };
    return { bg: "bg-[#1a1a1a]", text: "text-white", glow: "hover:shadow-[0_20px_40px_-12px_rgba(255,255,255,0.05)]" };
  };

  const branding = getHouseBranding(houseName);

  return (
    <div className={`glass-card rounded-2xl p-6 group transition-all duration-500 card-interact relative overflow-hidden ${branding.glow}`}>
      
      {/* Card Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[12px] uppercase tracking-tighter shadow-xl ${branding.bg} ${branding.text}`}>
            {account.bettingHouse?.logoUrl ? (
              <img src={account.bettingHouse.logoUrl} alt={houseName} className="w-8 h-8 object-contain" />
            ) : (
              houseName.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-[#e5e2e1] font-bold text-sm font-headline tracking-tight">{houseName}</p>
            <span className="text-[9px] text-[#00ff88] font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              {account.status === T.AccountStatus.ACTIVE ? (
                <>
                  <Circle className="w-1.5 h-1.5 fill-[#00ff88] animate-pulse" />
                  Ativa
                </>
              ) : account.status === T.AccountStatus.LIMITED ? (
                <>
                  <Circle className="w-1.5 h-1.5 fill-yellow-400" />
                  Limitada
                </>
              ) : (
                <>
                  <Circle className="w-1.5 h-1.5 fill-gray-500" />
                  Cancelada
                </>
              )}
            </span>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#b9cbbc] opacity-40 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/5"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 py-1 animate-in fade-in zoom-in-95 duration-150">
                {account.status === T.AccountStatus.ACTIVE && (
                  <button
                    onClick={handleLimit}
                    disabled={isMutating}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-yellow-500 hover:bg-yellow-500/10 transition-colors text-left"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    LIMITAR CONTA
                  </button>
                )}
                <button
                  onClick={() => setIsUnlinkConfirmOpen(true)}
                  disabled={isMutating}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  {isMutating ? "ENCERRANDO..." : "ENCERRAR CONTA"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Balance Section - Clickable for history */}
      <div 
        onClick={() => setIsHistoryOpen(true)}
        className="mb-8 p-4 -mx-4 rounded-[25px] hover:bg-white/[0.03] cursor-pointer transition-all group/balance relative"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[#b9cbbc] text-[9px] uppercase font-black tracking-[0.2em] opacity-40 mb-1 italic">Saldo Disponível</p>
            <h6 className="text-3xl font-headline font-black text-[#e5e2e1] italic tracking-tighter uppercase">
              R$ {formatCurrency(Math.max(0, account.balance ?? 0))}
            </h6>
          </div>
          <History className="w-4 h-4 text-[#b9cbbc]/20 group-hover/balance:text-[#03D791] transition-colors mt-1" />
        </div>
        
        {Number(account.inOperation) > 0 && (
          <p className="text-[10px] text-blue-400 font-bold mt-1 italic uppercase tracking-tighter">
            R$ {formatCurrency(Number(account.inOperation))} em operação
          </p>
        )}
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => { setAmountType("DEPOSIT"); setIsAmountModalOpen(true); }}
          className="bg-[#2a2a2a] text-[#14d1ff] text-[9px] font-black py-2.5 rounded-lg border border-[#14d1ff]/20 uppercase tracking-widest btn-interact italic"
        >
          Depositar
        </button>
        <button 
          onClick={() => { setAmountType("WITHDRAW"); setIsAmountModalOpen(true); }}
          className="bg-[#00ff88]/10 text-[#00ff88] text-[9px] font-black py-2.5 rounded-lg border border-[#00ff88]/20 uppercase tracking-widest btn-interact italic"
        >
          Sacar
        </button>
      </div>

      <Modal 
        isOpen={isAmountModalOpen} 
        onClose={() => setIsAmountModalOpen(false)} 
        title={amountType === "DEPOSIT" ? `Depositar em ${houseName}` : `Sacar de ${houseName}`}
      >
        <form onSubmit={handleAmountSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/40 italic">Valor da Transação (R$)</label>
              {amountType === "WITHDRAW" && (
                <span className="text-[9px] font-black text-[#03D791] uppercase tracking-widest italic opacity-60">
                  LIMITE: R$ {formatCurrency(account.balance)}
                </span>
              )}
            </div>
            <Input 
              type="text" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              autoFocus
              required
              className="font-black text-center text-xl tracking-widest text-[#03D791]"
            />
          </div>
          <LoadingButton 
            type="submit" 
            isLoading={isMutating}
            className={`w-full font-black uppercase tracking-[0.3em] py-5 rounded-2xl text-[10px] hover:scale-[1.02] active:scale-95 transition-all mt-4 italic shadow-2xl ${
              amountType === "DEPOSIT" ? "bg-[#14d1ff] text-[#001a21] shadow-blue-500/10" : "bg-[#03D791] text-[#002110] shadow-[#03d791]/10"
            }`}
          >
            {amountType === "DEPOSIT" ? "CONFIRMAR DEPÓSITO" : "CONFIRMAR SAQUE"}
          </LoadingButton>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isUnlinkConfirmOpen}
        onClose={() => setIsUnlinkConfirmOpen(false)}
        onConfirm={handleUnlink}
        title="Encerrar Conta"
        message={`Tem certeza que deseja encerrar a conta da ${houseName}? Esta ação mudará o status para CANCELADA, mas manterá o histórico de lucros.`}
        confirmLabel="ENCERRAR"
        cancelLabel="MANTER"
        type="danger"
      />

      <AccountHistoryModal 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        account={account}
      />
    </div>
  );
}
