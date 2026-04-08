"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal, LoadingButton, toast, CustomSelect, Input } from "@/components/ui/components";
import { OperationType, Operation } from "@/lib/api/types";
import { useOperations, useAccounts, useDashboardSummary, useFreebets } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";

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

  useEffect(() => {
    if (isOpen) {
      refetchAccounts();
      
      if (operationToEdit) {
        setType(operationToEdit.type as OperationType);
        setNotes(operationToEdit.description || "");
        setGeneratedFbValue(operationToEdit.generatedFbValue?.toString() || "");
        setFreebetId(operationToEdit.freebetId || null);
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
    if (bets.length > 1) {
      setBets(bets.filter(b => b.id !== id));
    }
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

      let operationResponse;
      if (operationToEdit) {
        operationResponse = await updateOperation(operationToEdit.id, payload);
      } else {
        operationResponse = await createOperation(payload);
      }

      if (freebetId) {
        refetchFreebets();
      }
      
      toast.success(operationToEdit ? "Operação atualizada com sucesso" : "Operação criada com sucesso");
      
      refetchSummary();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro ao processar operação");
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={operationToEdit ? "Editar Operação" : "Cadastrar Nova Operação"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Notas / Descrição</label>
            <Input 
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="EX: JOGO DO FLAMENGO - BRASILEIRÃO"
            />
          </div>
          {type === OperationType.FREEBET_GEN && (
            <div className={`space-y-3 animate-in fade-in slide-in-from-top-4 duration-500`}>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#03D791] italic flex items-center gap-2">
                Valor da Freebet a Gerar (R$)
                <span className="text-[8px] opacity-40 lowercase font-normal">(Será preenchido ao finalizar)</span>
              </label>
              <Input 
                type="number" 
                step="0.01"
                value={generatedFbValue}
                onChange={e => setGeneratedFbValue(e.target.value)}
                placeholder="0.00"
                className="text-[#03D791] font-black border-[#03D791]/30"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
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

          <div className="space-y-3">
            {bets.map((bet) => {
              const showBenefit = type !== OperationType.NORMAL;
              const showResp = bet.side === 'LAY';

              return (
                <div key={bet.id} className="grid grid-cols-12 gap-3 items-end glass-card p-5 rounded-[25px] border-white/5 group/bet hover:border-[#03D791]/20 transition-all duration-500">
                  {/* CONTA */}
                  <div className={`${showBenefit ? 'md:col-span-3' : 'md:col-span-4'} col-span-12 space-y-2`}>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b9cbbc]/40 italic">Conta</label>
                    <CustomSelect 
                      value={bet.accountId}
                      onChange={val => handleUpdateBet(bet.id, 'accountId', val)}
                      options={(Array.isArray(accounts) ? [...accounts] : [])
                        .sort((a, b) => {
                          const houseA = a.bettingHouse?.name?.toUpperCase() || "";
                          const houseB = b.bettingHouse?.name?.toUpperCase() || "";
                          if (houseA !== houseB) return houseA.localeCompare(houseB, 'pt-BR');
                          const profileA = a.cpfProfile?.name?.toUpperCase() || "";
                          const profileB = b.cpfProfile?.name?.toUpperCase() || "";
                          return profileA.localeCompare(profileB, 'pt-BR');
                        })
                        .map(acc => ({
                        value: acc.id,
                        label: `${acc.bettingHouse?.name?.toUpperCase()} — ${acc.cpfProfile?.name?.toUpperCase()}`
                      }))}
                      placeholder="ESCOLHER CONTA"
                    />
                  </div>
                  
                  {/* BENEFIT CHECKBOX */}
                  {showBenefit && (
                    <div className="md:col-span-1 col-span-12 flex flex-col items-center justify-center space-y-2 pb-2">
                      <label className="text-[8px] font-black uppercase tracking-[0.2em] text-[#03D791] italic text-center leading-none">
                        BENEF.
                      </label>
                      <div className="h-6 flex items-center justify-center">
                        <input 
                          type="checkbox"
                          checked={bet.isBenefit}
                          onChange={e => handleUpdateBet(bet.id, 'isBenefit', e.target.checked)}
                          className="w-5 h-5 rounded-lg border-white/10 bg-black/40 text-[#03D791] focus:ring-[#03D791]/30 transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* SIDE SWITCH */}
                  <div className="md:col-span-1 col-span-4 flex flex-col items-center justify-center space-y-2 pb-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b9cbbc]/40 italic">Lado</label>
                    <button
                      type="button"
                      onClick={() => handleUpdateBet(bet.id, 'side', bet.side === 'BACK' ? 'LAY' : 'BACK')}
                      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${bet.side === 'BACK' ? 'bg-[#03d791]/20' : 'bg-red-500/20'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center text-[7px] font-black
                        ${bet.side === 'BACK' ? 'left-1 bg-[#03d791] text-black' : 'left-7 bg-red-500 text-white'}`}>
                        {bet.side[0]}
                      </div>
                    </button>
                  </div>

                  {/* STAKE */}
                  <div className={`${showResp ? 'md:col-span-1' : 'md:col-span-2'} col-span-4 space-y-2`}>
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b9cbbc]/40 italic">Stake</label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={bet.stake}
                      onChange={e => handleUpdateBet(bet.id, 'stake', e.target.value)}
                      placeholder="0.00"
                      className="text-[#03D791] font-black py-2.5"
                    />
                  </div>

                  {/* RESPONSABILIDADE */}
                  {showResp && (
                    <div className="md:col-span-1 col-span-4 space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500/40 italic text-center block">RESP.</label>
                      <div className="h-[42px] flex items-center justify-center bg-black/40 border border-red-500/20 rounded-xl px-2 text-[10px] font-black italic text-red-500 overflow-hidden">
                        {((parseFloat(bet.odds || "1") - 1) * (parseFloat(bet.stake || "0"))).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* ODDS */}
                  <div className="md:col-span-2 col-span-6 space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b9cbbc]/40 italic">Odds</label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={bet.odds}
                      onChange={e => handleUpdateBet(bet.id, 'odds', e.target.value)}
                      placeholder="1.00"
                      className="text-[#14d1ff] font-black py-2.5"
                    />
                  </div>

                  {/* COMMISSION */}
                  <div className="md:col-span-2 col-span-6 space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b9cbbc]/40 italic">Comissão (%)</label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={bet.commission}
                      onChange={e => handleUpdateBet(bet.id, 'commission', e.target.value)}
                      placeholder="0"
                      className="text-[#ffcc00] font-black py-2.5"
                    />
                  </div>

                  {/* DELETE BTN */}
                  <div className="md:col-span-1 col-span-12 pb-1 flex justify-center">
                    <button 
                      type="button"
                      onClick={() => handleRemoveBet(bet.id)}
                      disabled={bets.length === 1}
                      className="w-10 h-10 flex items-center justify-center text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-0"
                      title="Remover Bet"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-8 space-y-6">
          {/* Result Summary */}
          <div className="glass-card p-6 rounded-[30px] border-white/5 bg-[#03D791]/5">
            <h6 className="text-[10px] font-black uppercase tracking-widest text-[#03D791] mb-6 italic border-b border-[#03D791]/10 pb-3 flex justify-between items-center">
              Previsão de Resultados {operationToEdit && <span className="text-[#ffcc00] ml-2">(MODO EDIÇÃO)</span>}
              <span className="text-[8px] opacity-40 lowercase font-normal">Baseado na calculadora</span>
            </h6>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {bets.map((b, i) => {
                const s = parseFloat(b.stake) || 0;
                const o = parseFloat(b.odds) || 1;
                
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
                const winningBackExistsInScenario = bets.some((_, idx) => {
                  const betObj = bets[idx];
                  return betObj.side === 'BACK' && idx === i;
                });

                bets.forEach((otherB, j) => {
                  const os = parseFloat(otherB.stake) || 0;
                  const oo = getEffectiveOdd(otherB);
                  const oc = (parseFloat(otherB.commission) || 0) / 100;
                  
                  if (otherB.side === 'BACK') {
                    if (i === j) {
                      if (type === OperationType.EXTRACAO && otherB.isBenefit) {
                        totalReturn += os * (oo - 1) * (1 - oc);
                      } else {
                        totalReturn += os + (os * oo - os) * (1 - oc);
                      }
                    }
                  } else {
                    if (!winningBackExistsInScenario && i === j) {
                      const ol = (oo - 1) * os;
                      totalReturn += (os * (1 - oc)) + ol;
                    }
                  }
                });

                const profit = totalReturn - stakeTotal;

                return (
                  <div key={b.id} className="space-y-1.5 p-3 rounded-2xl bg-black/20 border border-white/5">
                    <p className="text-[7px] font-black uppercase tracking-tighter opacity-40">Cenário Bet #{i+1}</p>
                    <p className={`text-sm font-black italic tracking-tighter ${profit >= 0 ? 'text-[#03D791]' : 'text-red-500'}`}>
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
            className={`w-full ${operationToEdit ? 'bg-[#ffcc00]' : 'bg-[#03D791]'} text-[#002110] font-black uppercase tracking-[0.4em] py-6 rounded-[30px] text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg italic`}
          >
            {operationToEdit ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR OPERAÇÃO'}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
