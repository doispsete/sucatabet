"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal, LoadingButton, toast, CustomSelect, Input } from "@/components/ui/components";
import { GameSearch } from "@/components/GameSearch";
import { MatchIndicator } from "@/components/MatchIndicator";
import { OperationType, Operation } from "@/lib/api/types";
import { useOperations, useAccounts, useDashboardSummary, useFreebets } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { AddAccountModal } from "./AddAccountModal";

interface NewOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operationToEdit?: Operation | null;
  initialData?: {
    type?: OperationType;
    notes?: string;
    bets?: Array<{
      accountId?: string;
      stake: string;
      odds: string;
      side?: 'BACK' | 'LAY';
      type?: 'Normal' | 'Freebet' | 'Aumento';
      commission?: number;
    }>;
    freebetId?: string;
  };
  onSuccess?: () => void;
}

export function NewOperationModal({ isOpen, onClose, operationToEdit, initialData, onSuccess }: NewOperationModalProps) {
  const { create: createOperation, update: updateOperation, isMutating: isMutatingOps } = useOperations();
  const { create: createFreebet, update: updateFreebet } = useFreebets();
  const { data: accounts, refetch: refetchAccounts } = useAccounts();
  const { refetch: refetchSummary } = useDashboardSummary();
  const { refetch: refetchFreebets } = useFreebets();

  const [type, setType] = useState<OperationType>(OperationType.NORMAL);
  const [notes, setNotes] = useState("");
  const [generatedFbValue, setGeneratedFbValue] = useState("");
  const [freebetId, setFreebetId] = useState<string | null>(null);
  const { data: allFreebets } = useFreebets();
  const [bets, setBets] = useState<Array<{
    id: string;
    accountId: string;
    stake: string;
    odds: string;
    side: 'BACK' | 'LAY';
    isBenefit: boolean;
    commission: string;
  }>>([
    { id: '1', accountId: '', stake: '', odds: '', side: 'BACK', isBenefit: false, commission: '0' }
  ]);
  const [sofascoreEventId, setSofascoreEventId] = useState<string | null>(null);
  const [sofascoreData, setSofascoreData] = useState<any>(null);
  const [showGameSearch, setShowGameSearch] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refetchAccounts();

      if (operationToEdit) {
        setType(operationToEdit.type as OperationType);
        setNotes(operationToEdit.description || "");
        setGeneratedFbValue(operationToEdit.generatedFbValue?.toString() || "");
        setFreebetId(operationToEdit.freebet?.id || operationToEdit.freebetId || null);
        setSofascoreEventId((operationToEdit as any).sofascoreEventId || null);
        setSofascoreData(operationToEdit); // Tenta usar a própria operação como base de dados
        setBets((operationToEdit.bets || []).map((b, i) => ({
          id: b.id || (Date.now() + i).toString(),
          accountId: b.accountId,
          stake: b.stake.toString(),
          odds: b.odds.toString(),
          side: b.side as 'BACK' | 'LAY',
          isBenefit: !!(b.type === 'Freebet' || b.type === 'Aumento' || b.isBenefit),
          commission: (b as any).commission?.toString() || '0'
        })));
        return;
      }

      if (initialData) {
        if (initialData.type) setType(initialData.type);
        if (initialData.bets && initialData.bets.length > 0) {
          setBets(initialData.bets.map((b, i) => ({
            id: Date.now().toString() + i,
            accountId: b.accountId || '',
            stake: b.stake,
            odds: b.odds,
            side: b.side || 'BACK',
            isBenefit: b.type === 'Freebet' || b.type === 'Aumento',
            commission: b.commission?.toString() || '0'
          })));
        } else {
          setBets([{ id: '1', accountId: '', stake: '', odds: '', side: 'BACK', isBenefit: false, commission: '0' }]);
        }
        if (initialData.freebetId) {
          setFreebetId(initialData.freebetId);
          setType(OperationType.EXTRACAO);
        }
      } else {
        setType(OperationType.NORMAL);
        setGeneratedFbValue("");
        setNotes("");
        setBets([{ id: '1', accountId: '', stake: '', odds: '', side: 'BACK', isBenefit: false, commission: '0' }]);
      }
    }
  }, [isOpen, initialData, operationToEdit]);

  const handleAddBet = () => {
    if (bets.length < 10) {
      setBets([...bets, { id: Math.random().toString(), accountId: '', stake: '', odds: '', side: 'BACK', isBenefit: false, commission: '0' }]);
    }
  };

  const handleRemoveBet = (id: string) => {
    if (bets.length > 1) setBets(bets.filter(b => b.id !== id));
  };

  const handleUpdateBet = (id: string, field: string, value: any) => {
    setBets(bets.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalidBet = bets.find(b => !b.accountId || !b.stake || !b.odds);
    if (invalidBet) {
      toast.error("Preencha todos os campos de cada bet");
      return;
    }

    try {
      const payload = {
        type,
        freebetId: freebetId || undefined,
        description: notes || undefined,
        bets: bets.map(b => {
          const s = parseFloat(b.stake) || 0;
          const o = parseFloat(b.odds) || 1;
          let betType: 'Normal' | 'Freebet' | 'Aumento' = 'Normal';
          if (b.isBenefit) {
            if (type === OperationType.EXTRACAO) betType = 'Freebet';
            else if (type === OperationType.BOOST_25 || type === OperationType.BOOST_30 || type === OperationType.BOOST_50) betType = 'Aumento';
          }
          return {
            accountId: b.accountId,
            stake: parseFloat(s.toFixed(2)),
            odds: parseFloat(o.toFixed(2)),
            commission: parseFloat(b.commission) || 0,
            side: b.side,
            type: betType,
            isBenefit: b.isBenefit
          };
        }),
        generatedFbValue: type === OperationType.FREEBET_GEN ? parseFloat(generatedFbValue) : undefined
      };

      if (operationToEdit) {
        await updateOperation(operationToEdit.id, {
            ...payload,
            sofascoreEventId: sofascoreEventId || undefined,
            sofascoreStatus: sofascoreData?.status || undefined,
            sofascoreHomeScore: sofascoreData?.homeScore || undefined,
            sofascoreAwayScore: sofascoreData?.awayScore || undefined,
            sofascoreHomeName: sofascoreData?.homeTeam || undefined,
            sofascoreAwayName: sofascoreData?.awayTeam || undefined,
            sofascoreLeague: sofascoreData?.league || undefined,
            sofascoreStartTime: sofascoreData?.sofascoreStartTime || undefined,
            sofascoreHomeLogo: sofascoreData?.homeLogo || undefined,
            sofascoreAwayLogo: sofascoreData?.awayLogo || undefined
        });
      } else {
        await createOperation({
            ...payload,
            sofascoreEventId: sofascoreEventId || undefined,
            sofascoreStatus: sofascoreData?.status || undefined,
            sofascoreHomeScore: sofascoreData?.homeScore || undefined,
            sofascoreAwayScore: sofascoreData?.awayScore || undefined,
            sofascoreHomeName: sofascoreData?.homeTeam || undefined,
            sofascoreAwayName: sofascoreData?.awayTeam || undefined,
            sofascoreLeague: sofascoreData?.league || undefined,
            sofascoreStartTime: sofascoreData?.sofascoreStartTime || undefined,
            sofascoreHomeLogo: sofascoreData?.homeLogo || undefined,
            sofascoreAwayLogo: sofascoreData?.awayLogo || undefined
        });
      }

      if (freebetId) refetchFreebets();

      toast.success(operationToEdit ? "Operação atualizada com sucesso" : "Operação criada com sucesso");
      refetchSummary();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro ao processar operação");
    }
  };

  const accountOptions = React.useMemo(() => {
    return (Array.isArray(accounts) ? [...accounts] : [])
      .sort((a, b) => {
        const houseA = a.bettingHouse?.name?.toUpperCase() || "";
        const houseB = b.bettingHouse?.name?.toUpperCase() || "";
        if (houseA !== houseB) return houseA.localeCompare(houseB, 'pt-BR');
        return (a.cpfProfile?.name?.toUpperCase() || "").localeCompare(b.cpfProfile?.name?.toUpperCase() || "", 'pt-BR');
      })
      .map(acc => ({
        value: acc.id,
        label: `${acc.bettingHouse?.name?.toUpperCase()} — ${acc.cpfProfile?.name?.toUpperCase()}`
      }));
  }, [accounts]);
  
  const availableFreebets = React.useMemo(() => {
    if (type !== OperationType.EXTRACAO || !Array.isArray(allFreebets)) return [];
    
    // Identifica a conta que foi marcada como benefício
    const benefitAccount = bets.find(b => b.isBenefit)?.accountId;
    
    return allFreebets
      .filter(fb => {
        // Apenas pendentes/expirando (não usadas/expiradas)
        if (fb.status !== 'PENDENTE' && fb.status !== 'EXPIRANDO') return false;
        // Se houver conta de benefício selecionada, filtra por ela
        if (benefitAccount) return fb.accountId === benefitAccount;
        return true;
      })
      .map(fb => ({
        value: fb.id,
        label: `R$ ${formatCurrency(fb.value)} — ${fb.account?.bettingHouse?.name?.toUpperCase()} (${fb.account?.cpfProfile?.name?.split(' ')[0]})`
      }));
  }, [allFreebets, type, bets]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={operationToEdit ? "Editar Operação" : "Cadastrar Nova Operação"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo + Notas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60">Tipo de Operação</label>
            <CustomSelect
              value={type}
              onChange={val => setType(val as OperationType)}
              options={[
                { value: OperationType.NORMAL, label: "NORMAL" },
                { value: OperationType.FREEBET_GEN, label: "GERAR FREEBET" },
                { value: OperationType.EXTRACAO, label: "EXTRAÇÃO" },
                { value: OperationType.BOOST_25, label: "AUMENTO 25%" },
                { value: OperationType.BOOST_30, label: "AUMENTO 30%" },
                { value: OperationType.BOOST_50, label: "AUMENTO 50%" },
              ]}
              placeholder="SELECIONE O TIPO"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60">Notas / Descrição</label>
            <Input
              type="text" value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="EX: JOGO DO FLAMENGO"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#03D791]">Vincular Jogo (Sofascore)</label>
            <div className="flex flex-col gap-2">
              {sofascoreEventId ? (
                <div className="glass-card p-3 rounded-xl border border-[#03D791]/30 flex items-center justify-between">
                   <MatchIndicator operation={operationToEdit || { sofascoreEventId } as any} />
                   <button 
                    type="button" 
                    onClick={() => { setSofascoreEventId(null); setShowGameSearch(true); }}
                    className="text-[9px] font-bold text-red-400 hover:text-red-500 uppercase tracking-widest"
                   >
                     Trocar
                   </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGameSearch(true)}
                  className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl py-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:border-[#03D791]/30 hover:text-[#03D791] transition-all"
                >
                  {showGameSearch ? "Buscando jogo..." : "+ Vincular Jogo para Placar ao Vivo"}
                </button>
              )}
              
              {showGameSearch && (
                <div className="glass-card p-4 rounded-2xl border border-[#03D791]/20 animate-in fade-in zoom-in-95">
                   <GameSearch 
                     onSelect={(game) => {
                       setSofascoreEventId(game.eventId);
                       setSofascoreData(game);
                       setShowGameSearch(false);
                       // Se a descrição estiver vazia, usa o nome do jogo
                       if (!notes) setNotes(`${game.homeTeam} x ${game.awayTeam}`);
                     }} 
                   />
                   <button 
                    type="button"
                    onClick={() => setShowGameSearch(false)}
                    className="w-full mt-2 py-2 text-[9px] font-black text-white/20 hover:text-white/40 uppercase tracking-widest"
                   >
                     Cancelar busca
                   </button>
                </div>
              )}
            </div>
          </div>
          {type === OperationType.FREEBET_GEN && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#03D791]">Valor da Freebet (R$)</label>
              <Input
                type="number" step="0.01" value={generatedFbValue}
                onChange={e => setGeneratedFbValue(e.target.value)}
                placeholder="0.00"
                className="text-[#03D791] font-black border-[#03D791]/30"
              />
            </div>
          )}
          {type === OperationType.EXTRACAO && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#14d1ff]">Vincular Freebet</label>
              <CustomSelect
                value={freebetId || ""}
                onChange={val => setFreebetId(val)}
                options={availableFreebets}
                placeholder={availableFreebets.length > 0 ? "SELECIONE A FREEBET" : "NENHUMA FREEBET DISPONÍVEL"}
              />
            </div>
          )}
        </div>

        {/* Bets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-[#03D791]">Bets da Operação</h5>
            <button
              type="button"
              onClick={handleAddBet}
              disabled={bets.length >= 10}
              className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#03D791]/30 hover:text-[#03D791] disabled:opacity-30 transition-all flex items-center gap-1.5"
            >
              <Plus size={12} /> Adicionar Bet
            </button>
          </div>

          {bets.map((bet) => {
            const showBenefit = type !== OperationType.NORMAL;
            const showResp = bet.side === 'LAY';

            return (
              <div key={bet.id} className="glass-card p-4 rounded-2xl border border-white/5 hover:border-[#03D791]/20 transition-all duration-300 space-y-3">
                {/* Conta + Delete */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/40 italic">Conta</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <CustomSelect
                          value={bet.accountId}
                          onChange={val => handleUpdateBet(bet.id, 'accountId', val)}
                          options={accountOptions}
                          placeholder="ESCOLHER CONTA"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAccountModalOpen(true)}
                        className="h-10 w-10 shrink-0 flex items-center justify-center border border-white/10 hover:border-[#03D791]/30 hover:text-[#03D791] rounded-xl transition-all text-white/30"
                        title="Adicionar Conta"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBet(bet.id)}
                    disabled={bets.length === 1}
                    className="w-10 h-10 shrink-0 flex items-center justify-center text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Stake + Odds + Comissão */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/40 italic">Stake</label>
                    <Input
                      type="number" step="0.01" value={bet.stake}
                      onChange={e => handleUpdateBet(bet.id, 'stake', e.target.value)}
                      placeholder="0.00"
                      className="text-[#03D791] font-black py-2.5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/40 italic">Odds</label>
                    <Input
                      type="number" step="0.01" value={bet.odds}
                      onChange={e => handleUpdateBet(bet.id, 'odds', e.target.value)}
                      placeholder="1.00"
                      className="text-[#14d1ff] font-black py-2.5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/40 italic">Comissão %</label>
                    <Input
                      type="number" step="0.1" value={bet.commission}
                      onChange={e => handleUpdateBet(bet.id, 'commission', e.target.value)}
                      placeholder="0"
                      className="text-[#ffcc00] font-black py-2.5"
                    />
                  </div>
                </div>

                {/* Back/Lay + Responsabilidade + Benefício */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleUpdateBet(bet.id, 'side', bet.side === 'BACK' ? 'LAY' : 'BACK')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                      ${bet.side === 'BACK' ? 'bg-[#03d791]/20 text-[#03d791] border border-[#03d791]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                  >
                    {bet.side === 'BACK' ? '▲ BACK' : '▼ LAY'}
                  </button>

                  {showResp && (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                      <span className="text-[9px] font-black text-red-500/60 uppercase">Resp:</span>
                      <span className="text-xs font-black text-red-500">
                        {((parseFloat(bet.odds || "1") - 1) * (parseFloat(bet.stake || "0"))).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {showBenefit && (
                    <label className="flex items-center gap-2 cursor-pointer ml-auto">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#03D791]">Benefício</span>
                      <input
                        type="checkbox"
                        checked={bet.isBenefit}
                        onChange={e => handleUpdateBet(bet.id, 'isBenefit', e.target.checked)}
                        className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-[#03D791] focus:ring-[#03D791]/30 cursor-pointer"
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Previsão de Resultados */}
        <div className="glass-card p-5 rounded-2xl border-white/5 bg-[#03D791]/5 space-y-4">
          <h6 className="text-[10px] font-black uppercase tracking-widest text-[#03D791] flex justify-between items-center">
            Previsão de Resultados {operationToEdit && <span className="text-[#ffcc00]">(EDIÇÃO)</span>}
          </h6>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {bets.map((b, i) => {
              const getEffectiveOdd = (betObj: typeof b) => {
                const rawO = parseFloat(betObj.odds) || 1;
                if (betObj.isBenefit) {
                  if (type === OperationType.BOOST_25) return (rawO - 1) * 1.25 + 1;
                  if (type === OperationType.BOOST_30) return (rawO - 1) * 1.30 + 1;
                  if (type === OperationType.BOOST_50) return (rawO - 1) * 1.50 + 1;
                }
                return rawO;
              };

              const stakeTotal = bets.reduce((sum, bet) => {
                const bs = parseFloat(bet.stake) || 0;
                const bo = getEffectiveOdd(bet);
                const bl = bet.side === 'LAY' ? (bo - 1) * bs : 0;
                if (type === OperationType.EXTRACAO && bet.isBenefit) return sum;
                return sum + (bet.side === 'LAY' ? bl : bs);
              }, 0);

              let totalReturn = 0;
              const winningBackExists = bets.some((_, idx) => bets[idx].side === 'BACK' && idx === i);

              bets.forEach((otherB, j) => {
                const os = parseFloat(otherB.stake) || 0;
                const oo = getEffectiveOdd(otherB);
                const oc = (parseFloat(otherB.commission) || 0) / 100;
                if (otherB.side === 'BACK') {
                  if (i === j) {
                    if (type === OperationType.EXTRACAO && otherB.isBenefit) totalReturn += os * (oo - 1) * (1 - oc);
                    else totalReturn += os + (os * oo - os) * (1 - oc);
                  }
                } else {
                  if (!winningBackExists && i === j) {
                    totalReturn += (os * (1 - oc)) + ((oo - 1) * os);
                  }
                }
              });

              const profit = totalReturn - stakeTotal;
              return (
                <div key={b.id} className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Cenário #{i + 1}</p>
                  <p className={`text-sm font-black italic ${profit >= 0 ? 'text-[#03D791]' : 'text-red-500'}`}>
                    R$ {formatCurrency(profit)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <LoadingButton
          type="submit"
          isLoading={isMutatingOps}
          className={`w-full ${operationToEdit ? 'bg-[#ffcc00]' : 'bg-[#03D791]'} text-[#002110] font-black uppercase tracking-[0.4em] py-5 rounded-2xl text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg italic`}
        >
          {operationToEdit ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR OPERAÇÃO'}
        </LoadingButton>
      </form>

      <AddAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </Modal>
  );
}
