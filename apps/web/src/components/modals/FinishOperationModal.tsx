"use client";
import React, { useState, useEffect } from "react";
import { Check, AlertCircle, Edit2 } from "lucide-react";
import { Modal, LoadingButton, toast, CustomSelect, Input } from "@/components/ui/components";
import { useOperations, useDashboardSummary, useFreebets } from "@/lib/hooks";
import { OperationStatus, OperationResult, Operation, OperationType } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

interface FinishOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation | null;
  onSuccess?: () => void;
  onEdit?: (operation: Operation) => void;
}

export function FinishOperationModal({ isOpen, onClose, operation, onSuccess, onEdit }: FinishOperationModalProps) {
  const { close: closeOperation, isMutating: isClosing } = useOperations();
  const { refetch: refetchSummary } = useDashboardSummary();
  const { create: createFreebet, refetch: refetchFreebets } = useFreebets();

  const [status, setStatus] = useState<OperationStatus>(OperationStatus.FINISHED);
  const [result, setResult] = useState<OperationResult>(OperationResult.NORMAL);
  const [realProfit, setRealProfit] = useState("0.00");
  const [fbValueToGenerate, setFbValueToGenerate] = useState("");
  const [fbOrigin, setFbOrigin] = useState("");
  const [winningBetIds, setWinningBetIds] = useState<string[]>([]);
  const [protectionOdd, setProtectionOdd] = useState<string>("2.00");
  const [localCommissions, setLocalCommissions] = useState<Record<string, string>>({});
  const [loadingCache, setLoadingCache] = useState(false);

  // Sync: Carregar dados de planejamento do localStorage ou fallback para lucro esperado
  useEffect(() => {
    if (isOpen && operation && operation.type === OperationType.FREEBET_GEN) {
      setLoadingCache(true);
      const cachedVal = localStorage.getItem(`pending_fb_val_${operation.id}`);
      const cachedOrigin = localStorage.getItem(`pending_fb_origin_${operation.id}`);
      
      if (cachedVal) {
        setFbValueToGenerate(cachedVal);
      } else {
        setFbValueToGenerate(operation.expectedProfit.toString());
      }
      
      if (cachedOrigin) {
        setFbOrigin(cachedOrigin);
      } else {
        setFbOrigin(`Gerada via Operação #${operation.id.substring(0, 8)}`);
      }
      setLoadingCache(false);
    }
  }, [isOpen, operation]);

  useEffect(() => {
    if (isOpen && operation) {
      setStatus(OperationStatus.FINISHED);
      setResult(OperationResult.NORMAL);
      setWinningBetIds([]);
      setRealProfit("0.00");
      setProtectionOdd("2.00");

      const initial: Record<string, string> = {};
      operation.bets?.forEach(b => {
        initial[b.id] = (b.commission || 0).toString();
      });
      setLocalCommissions(initial);
    }
  }, [isOpen, operation]);

  const getEffectiveOdd = (bet: any) => {
    const rawO = parseFloat(bet.odds.toString()) || 1;
    if (!operation) return rawO;
    const type = operation.type as OperationType;
    const isBoostOperation = type === OperationType.BOOST_25 || type === OperationType.BOOST_50;
    const isBoostBet = bet.type === 'Aumento' || bet.expectedProfit === -1;

    if (isBoostOperation && isBoostBet) {
      if (type === OperationType.BOOST_25) return (rawO - 1) * 1.25 + 1;
      if (type === OperationType.BOOST_50) return (rawO - 1) * 1.50 + 1;
    }
    return rawO;
  };

  const getBetReturn = (bet: any) => {
    const oo = getEffectiveOdd(bet);
    const commStr = localCommissions[bet.id] || bet.commission?.toString() || '0';
    const oc = parseFloat(commStr) / 100;
    const isF = bet.type === 'Freebet' || bet.isBenefit;
    const SIDE = (bet.side || 'BACK').toUpperCase();
    const stake = parseFloat(bet.stake?.toString() || '0');
    const cost = parseFloat(bet.cost?.toString() || '0');

    if (SIDE === 'BACK') {
      if (isF) {
        return (stake * (oo - 1)) * (1 - oc);
      }
      return stake + (stake * oo - stake) * (1 - oc);
    }
    // LAY retorna Liability (cost) + Stake do Backer * (1 - C)
    return cost + (stake * (1 - oc));
  };

  // Autocalculate real profit based on winners or protection
  useEffect(() => {
    if (!operation) return;

    const betsList = operation.bets || [];

    // Cálculo do Custo Real da Operação
    const totalCostValue = (operation.bets || []).reduce((sum, bet) => {
      const isF = bet.type === 'Freebet' || bet.isBenefit;
      if (isF) return sum;
      return sum + (parseFloat(bet.cost?.toString() || bet.stake?.toString() || '0'));
    }, 0);

    if (result === OperationResult.PROTECAO) {
      if (winningBetIds.length === 0) {
        setRealProfit("0.00");
        return;
      }

      const winningBet = betsList.find(b => winningBetIds.includes(b.id));
      if (!winningBet) return;

      const oo = getEffectiveOdd(winningBet);
      const oddValue = parseFloat(protectionOdd) || 1;
      // Lógica de Proteção: Baseada no Retorno Total Esperado (Stake + Lucro)
      const totalPayoutOriginal = totalCostValue + parseFloat(operation.expectedProfit.toString());
      const suggestedStake = totalPayoutOriginal / oddValue;
      const finalProfit = suggestedStake * (oddValue - 1);

      setRealProfit(finalProfit.toFixed(2));
      return;
    }

    let totalReturn = 0;
    betsList.forEach(bet => {
      if (winningBetIds.includes(bet.id)) {
        totalReturn += getBetReturn(bet);
      }
    });

    const finalResult = totalReturn - totalCostValue;
    setRealProfit(finalResult.toFixed(2));
  }, [winningBetIds, operation, result, protectionOdd, localCommissions]);

  const toggleWinner = (betId: string) => {
    if (result === OperationResult.NORMAL || result === OperationResult.PROTECAO) {
      setWinningBetIds([betId]);
    } else if (result === OperationResult.DUPLO) {
      if (winningBetIds.includes(betId)) {
        setWinningBetIds(winningBetIds.filter(id => id !== betId));
      } else if (winningBetIds.length < 2) {
        setWinningBetIds([...winningBetIds, betId]);
      } else {
        toast.error("Para resultado DUPLO, selecione no máximo 2 casas");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operation) return;

    if (winningBetIds.length === 0) {
      toast.error(result === OperationResult.PROTECAO ? "Selecione a casa do Pagamento Antecipado" : "Selecione ao menos uma casa vencedora");
      return;
    }

    try {
      await closeOperation(operation!.id, {
        status,
        result,
        winningBetIds,
        realProfit: parseFloat(realProfit)
      });

      toast.success("Operação finalizada com sucesso");

      // Automação: Gerar Freebet se for o tipo correto (e não for anulada)
      // Agora 100% automático e invisível
      if (operation.type === OperationType.FREEBET_GEN && status !== OperationStatus.VOID) {
        // Garantia de Beneficiário: Busca o marcado OU usa o primeiro da lista como fallback
        const beneficiaryBet = operation.bets?.find(b => b.isBenefit) || operation.bets?.[0];
        const fbVal = parseFloat(fbValueToGenerate) || operation.expectedProfit;
        
        if (beneficiaryBet && !isNaN(fbVal)) {
          await createFreebet({
            accountId: beneficiaryBet.accountId,
            value: fbVal,
            origin: fbOrigin || `Gerada via Operação #${operation.id.substring(0, 8)}`,
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          });
          refetchFreebets();
        }

        // Limpar cache após sucesso
        localStorage.removeItem(`pending_fb_val_${operation.id}`);
        localStorage.removeItem(`pending_fb_origin_${operation.id}`);
      }
      refetchSummary();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro ao finalizar operação");
    }
  };

  if (!operation) return null;

  const totalCostValue = (operation.bets || []).reduce((sum, bet) => {
    const isF = bet.type === 'Freebet' || bet.isBenefit;
    if (isF) return sum;
    return sum + (parseFloat(bet.cost?.toString() || bet.stake?.toString() || '0'));
  }, 0);

  const winningPayout = (operation.bets || [])
    .filter(b => winningBetIds.includes(b.id))
    .reduce((acc, b) => acc + getBetReturn(b), 0);

  const suggestedProtectionStake = winningPayout / (parseFloat(protectionOdd) || 1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Encerrar Operação"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Edit Button Area */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => operation && onEdit && onEdit(operation)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#03D791]/10 hover:border-[#03D791]/30 text-[#b9cbbc] hover:text-[#03D791] transition-all group/edit"
          >
            <Edit2 size={16} className="group-hover/edit:animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Editar Dados da Operação</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 pl-4 italic">Status Final</label>
            <CustomSelect
              value={status}
              onChange={val => setStatus(val as OperationStatus)}
              options={[
                { value: OperationStatus.FINISHED, label: "FINALIZADA" },
                { value: OperationStatus.CASHOUT, label: "CASHOUT" },
              ]}
              placeholder="SELECIONE STATUS"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 pl-4 italic">Lógica de Encerramento</label>
            <CustomSelect
              value={result}
              onChange={val => {
                setResult(val as OperationResult);
                setWinningBetIds([]);
              }}
              options={[
                { value: OperationResult.NORMAL, label: "VENCEDOR ÚNICO" },
                { value: OperationResult.DUPLO, label: "DUPLO (2 GREENS)" },
                { value: OperationResult.PROTECAO, label: "PROTEÇÃO" },
              ]}
              placeholder="SELECIONE LÓGICA"
            />
          </div>
        </div>

        {result === OperationResult.PROTECAO && winningBetIds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
            <div className="p-5 glass-card rounded-2xl border-[#03D791]/20 bg-[#03D791]/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#03D791] pl-4 italic mb-2 block">Odd de Proteção</label>
              <Input
                type="number"
                step="0.01"
                value={protectionOdd}
                onChange={e => setProtectionOdd(e.target.value)}
                placeholder="Ex: 1.15"
                className="text-xl font-black text-[#03D791]"
              />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 mb-1">Stake de Proteção Sugerida</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white italic">R$ {formatCurrency(suggestedProtectionStake)}</span>
                <span className="text-[9px] text-[#00ff88] font-bold uppercase tracking-widest">(Cobre OP)</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#03D791]">
              {result === OperationResult.PROTECAO ? 'Casa do Pagamento Antecipado' : 'Selecione a(s) Casa(s) Vencedora(s)'}
            </h5>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {(operation.bets || []).map((bet) => {
              const bReturn = getBetReturn(bet);
              const isWinner = winningBetIds.includes(bet.id);
              const scenarioProfit = bReturn - totalCostValue;

              return (
                <div
                  key={bet.id}
                  onClick={() => toggleWinner(bet.id)}
                  className={`flex flex-col gap-4 p-6 glass-card rounded-[35px] border-2 transition-all duration-300 cursor-pointer ${isWinner ? 'border-[#03D791]/40 bg-[#03D791]/5 shadow-2xl scale-[1.02]' : 'border-white/5 hover:border-white/10 opacity-60 hover:opacity-100'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border relative ${isWinner ? 'bg-[#03D791]/20 border-[#03D791]' : 'bg-white/5 border-white/5'
                        }`}>
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=64`}
                          alt=""
                          className="w-7 h-7 object-contain rounded-md"
                        />
                        <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black italic border-2 transition-all ${isWinner ? 'bg-black text-[#03D791] border-[#03D791]' : 'bg-[#111] text-white/40 border-white/10'
                          }`}>
                          {bet.side === 'LAY' ? 'L' : 'B'}
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-white italic tracking-tighter uppercase truncate border-b border-[#03D791]/20 pb-0.5">
                              {bet.account?.bettingHouse?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-[#03D791]/60 font-black italic uppercase tracking-wider">
                              {bet.account?.cpfProfile?.name || "Operador"}
                            </span>
                            <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                            <span className="text-[9px] text-[#b9cbbc]/40 font-black italic">ODD {bet.odds}</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                            <span className="text-[9px] text-[#b9cbbc]/40 font-black italic opacity-30">{bet.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-[#b9cbbc]/30 uppercase tracking-widest mb-1 italic">Comissão %</p>
                        <Input
                          type="number"
                          step="0.01"
                          value={localCommissions[bet.id] || ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            setLocalCommissions({ ...localCommissions, [bet.id]: e.target.value });
                          }}
                          className="h-7 w-16 text-right px-2 text-[10px] bg-white/5 border-white/5 font-black text-[#03D791]"
                        />
                      </div>
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isWinner ? 'bg-[#03D791] border-[#03D791]' : 'border-white/10'
                        }`}>
                        {isWinner && <Check size={14} className="text-[#002110]" strokeWidth={4} />}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div className="text-left">
                      <p className="text-[9px] uppercase font-black text-[#b9cbbc]/40 italic tracking-widest leading-none mb-1.5">Retorno Individual</p>
                      <p className={`text-xs font-black italic tracking-tighter ${isWinner ? 'text-white' : 'text-white/40'}`}>
                        R$ {formatCurrency(bReturn)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[9px] uppercase font-black italic tracking-widest leading-none mb-1.5 ${isWinner ? 'text-[#03D791]' : 'text-[#b9cbbc]/40'}`}>Lucro Projeção Op</p>
                      <p className={`text-sm font-black italic tracking-tighter ${isWinner ? 'text-[#03D791]' : 'text-white/20'}`}>
                        R$ {formatCurrency(scenarioProfit)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#03D791]/60 mb-1 italic">
              {result === OperationResult.PROTECAO ? 'Lucro Consolidado c/ Proteção' : 'Lucro Líquido Real'}
            </p>
            <h4 className={`text-3xl font-black font-headline italic tracking-tighter ${parseFloat(realProfit) >= 0 ? 'text-[#03D791]' : 'text-red-500'}`}>
              R$ {formatCurrency(parseFloat(realProfit))}
            </h4>
          </div>
          <div className="text-right space-y-2 relative z-10">
            <div className="flex items-center justify-end gap-1.5 text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.2em] mb-2">
              <AlertCircle size={10} /> Ajuste Manual
            </div>
            <Input
              type="number"
              step="0.01"
              value={realProfit}
              onChange={e => setRealProfit(e.target.value)}
              className="text-right py-1 text-sm font-black text-white"
              placeholder="0.00"
            />
          </div>
          <div className={`absolute inset-0 opacity-10 ${parseFloat(realProfit) >= 0 ? 'bg-gradient-to-r from-[#03D791]/20 to-transparent' : 'bg-gradient-to-r from-red-500/20 to-transparent'}`}></div>
        </div>

        <div className="pt-4">
          <LoadingButton
            type="submit"
            isLoading={isClosing}
            className="w-full bg-[#03D791] text-[#002110] font-black uppercase tracking-widest py-4 rounded-xl text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(3,215,145,0.1)] hover:shadow-[#03D791]/20"
          >
            CONFIRMAR ENCERRAMENTO
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
