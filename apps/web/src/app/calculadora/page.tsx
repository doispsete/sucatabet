"use client";
import React, { useState, useEffect, useMemo } from "react";
import { NewOperationModal } from "@/components/modals/NewOperationModal";
import { OperationType } from "@/lib/api/types";
import { toast, CustomSelect, ConfirmDialog, LoadingButton } from "@/components/ui/components";
import { formatCurrency } from "@/lib/utils";
import {
  RefreshCw,
  Save,
  Trash2,
  Lock,
  Unlock,
  PlusCircle,
  HelpCircle,
  TrendingUp,
  Wallet,
  Percent,
  Calculator
} from "lucide-react";

type BetType = 'Normal' | 'Freebet' | 'Aumento';

interface BetRow {
  id: string;
  odd: string;
  stake: string;
  type: BetType;
  side: 'BACK' | 'LAY';
  boostPercent: string;
  commission: string;
  isLocked: boolean;
}

export default function CalculadoraPage() {
  const [bets, setBets] = useState<BetRow[]>([
    { id: '1', odd: "2.10", stake: "100", type: 'Normal', side: 'BACK', boostPercent: "0", commission: "0", isLocked: false },
    { id: '2', odd: "1.95", stake: "100", type: 'Normal', side: 'BACK', boostPercent: "0", commission: "0", isLocked: false },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [activeFreebetId, setActiveFreebetId] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

  // Check for pending freebet from Central
  useEffect(() => {
    const raw = localStorage.getItem('active_freebet');
    if (raw) {
      try {
        const fb = JSON.parse(raw);
        if (fb && fb.value) {
          // Update first bet row with freebet details
          setBets(prev => {
            const newBets = [...prev];
            newBets[0] = {
              ...newBets[0],
              stake: fb.value.toString(),
              type: 'Freebet',
              isLocked: true
            };
            return newBets;
          });
          setActiveFreebetId(fb.id);
          setActiveAccountId(fb.accountId);
          toast.success(`Freebet de R$ ${fb.value} carregada com sucesso!`);
        }
      } catch (e) {
        console.error("Erro ao carregar freebet", e);
      }
      localStorage.removeItem('active_freebet');
    }
  }, []);

  const addBet = () => {
    if (bets.length < 5) {
      setBets([...bets, {
        id: Math.random().toString(),
        odd: "2.00",
        stake: "0",
        type: 'Normal',
        side: 'BACK',
        boostPercent: "0",
        commission: "0",
        isLocked: false
      }]);
    }
  };

  const removeBet = (id: string) => {
    if (bets.length > 2) {
      setBets(bets.filter(b => b.id !== id));
    }
  };

  const updateBet = (index: number, field: keyof BetRow, value: any) => {
    setBets(prev => {
      const newBets = [...prev];
      if (field === 'isLocked' && value === true) {
        newBets.forEach(b => b.isLocked = false);
      }
      newBets[index] = { ...newBets[index], [field]: value };
      return newBets;
    });
  };

  const results = useMemo(() => {
    const processedBets = bets.map(b => {
      const rawOdd = parseFloat(b.odd) || 1;
      const rawStake = parseFloat(b.stake) || 0;
      const boost = parseFloat(b.boostPercent) || 0;
      const comm = parseFloat(b.commission) || 0;

      let effectiveOdd = rawOdd;
      if (b.type === 'Aumento' && boost > 0) {
        effectiveOdd = (rawOdd - 1) * (1 + boost / 100) + 1;
      }

      const benefitOdd = b.type === 'Freebet' ? (effectiveOdd - 1) : (effectiveOdd - 1);
      const liability = b.side === 'LAY' ? (effectiveOdd - 1) * rawStake : 0;

      return { ...b, rawOdd, rawStake, effectiveOdd, comm, benefitOdd, liability };
    });

    const stakeTotal = processedBets.reduce((sum, b) => {
      if (b.type === 'Freebet') return sum;
      // Na calculadora, o investimento para LAY é apenas a Responsabilidade (Liability)
      // O Stake é o que você recebe do backer (não é desembolso inicial na Exchange)
      return sum + (b.side === 'LAY' ? b.liability : b.rawStake);
    }, 0);

    const outcomes = processedBets.map((_, scenarioIndex) => {
      let totalReturn = 0;
      
      // Identifica se alguma BACK está vencendo neste cenário
      const winningBackExists = processedBets.some((b, idx) => b.side === 'BACK' && idx === scenarioIndex);

      processedBets.forEach((b, betIndex) => {
        const isWinningScenarioForBet = scenarioIndex === betIndex;
        const commFactor = 1 - (b.comm / 100);

        if (b.side === 'BACK') {
          if (isWinningScenarioForBet) {
            if (b.type === 'Freebet') {
              totalReturn += (b.rawStake * (b.effectiveOdd - 1)) * commFactor;
            } else {
              totalReturn += (b.rawStake * b.effectiveOdd) * commFactor;
            }
          }
        } else {
          // Lógica de LAY:
          // Se alguma BACK vence, o LAY perde (responsabilidade não volta)
          // Se nenhuma BACK vence OU se este é o próprio cenário do LAY, o LAY ganha.
          // Nota: Em arbitragem/matched, o desfecho do LAY é o oposto do BACK.
          if (winningBackExists) {
            // Uma BACK venceu, então o LAY (que é contra as BACKs) perde.
            totalReturn += 0;
          } else {
            // Nenhuma BACK venceu (ou este é o cenário do próprio LAY), LAY ganha.
            // Retorna responsabilidade + stake do backer
            totalReturn += b.liability + (b.rawStake * commFactor);
          }
        }
      });

      return totalReturn - stakeTotal;
    });

    const lowestOutcome = Math.min(...outcomes);
    const roi = stakeTotal > 0 ? (lowestOutcome / stakeTotal) * 100 : 0;

    return { outcomes, stakeTotal, lowestOutcome, roi, processedBets };
  }, [bets]);

  // Balancing logic
  useEffect(() => {
    const lockedIndex = bets.findIndex(b => b.isLocked);
    if (lockedIndex === -1) return;

    const lockedBet = bets[lockedIndex];
    const lockedStake = parseFloat(lockedBet.stake) || 0;

    const calculateEffective = (b: BetRow): number => {
      const odd = (parseFloat(b.odd) || 1);
      const boost = (parseFloat(b.boostPercent) || 0);
      const comm = (parseFloat(b.commission) || 0);
      const commFactor = 1 - (comm / 100);
      
      let effectiveOdd = odd;
      if (b.type === 'Aumento' && boost > 0) {
        effectiveOdd = (odd - 1) * (1 + boost / 100) + 1;
      }

      if (b.type === 'Freebet') {
        // Para balancear: S_f * (O_f - 1) * comm = K
        return (effectiveOdd - 1) * commFactor;
      }

      if (b.side === 'LAY') {
        // Matemática p/ balancear Lucro Real:
        // S_back * (O_back * comm - 1) = S_lay * comm
        // S_back * Factor_BACK = S_lay * Factor_LAY
        // Factor_BACK = O_back * comm
        // Factor_LAY = O_lay - 1 + comm
        return (effectiveOdd - 1 + commFactor);
      }

      return (effectiveOdd * commFactor);
    };

    const lockedEffOdd = calculateEffective(lockedBet);

    const timer = setTimeout(() => {
      setBets(prev => prev.map((bet, i) => {
        if (i === lockedIndex) return bet;
        const targetEffOdd = calculateEffective(bet);
        const newStake = (lockedStake * lockedEffOdd) / targetEffOdd;
        return { ...bet, stake: newStake.toFixed(2) };
      }));
    }, 50);

    return () => clearTimeout(timer);
  }, [
    bets.map(b => b.odd).join(','),
    bets.map(b => b.boostPercent).join(','),
    bets.map(b => b.type).join(','),
    bets.map(b => b.commission).join(','),
    bets.map(b => b.isLocked).join(','),
    bets.find(b => b.isLocked)?.stake
  ]);

  const getInitialData = () => {
    const hasFreebet = bets.some(b => b.type === 'Freebet');
    const hasBoost25 = bets.some(b => b.type === 'Aumento' && b.boostPercent === '25');
    const hasBoost50 = bets.some(b => b.type === 'Aumento' && b.boostPercent === '50');

    let type = OperationType.NORMAL;
    if (hasFreebet) type = OperationType.EXTRACAO;
    else if (hasBoost25) type = OperationType.BOOST_25;
    else if (hasBoost50) type = OperationType.BOOST_50;

    return {
      type,
      bets: bets.map((b, i) => ({
        stake: (b.stake || "0").toString(),
        odds: (b.odd || "1").toString(),
        accountId: i === 0 && activeAccountId ? activeAccountId : "",
        side: b.side,
        type: b.type,
        commission: parseFloat(b.commission) || 0
      })),
      freebetId: activeFreebetId || undefined
    };
  };

  const clearCalculator = () => {
    setBets([
      { id: '1', odd: "2.10", stake: "0", type: 'Normal', side: 'BACK', boostPercent: "0", commission: "0", isLocked: false },
      { id: '2', odd: "1.95", stake: "0", type: 'Normal', side: 'BACK', boostPercent: "0", commission: "0", isLocked: false },
    ]);
    setIsClearDialogOpen(false);
  };

  return (
    <div className="space-y-8 px-3 md:px-6 pb-24 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <Calculator className="w-7 h-7 text-[#03d791]" />
            CALCULADORA SUCATABET
          </h1>
          <p className="text-[11px] text-[#b9cbbc] font-black uppercase tracking-[0.3em] mt-2 opacity-40 italic">Calcule todas as suas entradas</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsClearDialogOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl glass-card text-[#B9CBBC] text-[10px] font-black uppercase tracking-widest hover:text-white transition-all border border-white/5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Limpar
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#03d791] to-[#00D1FF] text-black text-[10px] font-black uppercase tracking-widest shadow-[0_8px_24px_rgba(3,215,145,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar Operação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card rounded-[40px] p-8 overflow-hidden relative">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 mb-6 text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-[0.2em] italic">
            <div className="col-span-1">Aposta</div>
            <div className="col-span-1">Odd</div>
            <div className="col-span-2">Stake (R$)</div>
            <div className="col-span-2">Tipo</div>
            <div className="col-span-1 text-center">Aumento</div>
            <div className="col-span-1 text-center">Comissão</div>
            <div className="col-span-1 text-center">Back/Lay</div>
            <div className="col-span-1 text-center">Responsab.</div>
            <div className="col-span-1 text-center">Fixar</div>
            <div className="col-span-1 text-right">Mesa / Lucro</div>
          </div>

          <div className="space-y-4">
            {bets.map((bet, index) => (
              <div
                key={bet.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-5 items-center p-6 rounded-3xl border transition-all duration-500 relative group
                  ${bet.isLocked ? 'bg-[#03d791]/5 border-[#03d791]/20 shadow-[0_0_25px_rgba(3,215,145,0.08)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
                `}
              >
                <div className={`col-span-1 font-black italic flex items-center gap-3 ${index === 0 ? 'text-[#03d791]' : (index === 1 ? 'text-[#00D1FF]' : 'text-[#FFDD65]')}`}>
                  <span className="text-2xl">#0{index + 1}</span>
                </div>

                <div className="col-span-1">
                  <input
                    type="number" step="0.01" value={bet.odd}
                    onChange={e => updateBet(index, 'odd', e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-3.5 text-base text-center font-black text-white focus:border-[#03d791] focus:ring-1 focus:ring-[#03d791]/30 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="col-span-2">
                  <div className="relative">
                    <input
                      type="number" step="0.01" value={bet.stake}
                      onChange={e => updateBet(index, 'stake', e.target.value)}
                      className={`w-full bg-black/40 border border-white/5 rounded-2xl p-3.5 text-base text-center font-black outline-none transition-all shadow-inner
                        ${bet.isLocked ? 'text-[#03d791] border-[#03d791]/30' : 'text-white focus:border-[#03d791] focus:ring-1 focus:ring-[#03d791]/30'}
                      `}
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <CustomSelect
                    value={bet.type}
                    onChange={val => updateBet(index, 'type', val)}
                    options={[
                      { value: "Normal", label: "NORMAL" },
                      { value: "Freebet", label: "FREEBET" },
                      { value: "Aumento", label: "AUMENTO" }
                    ]}
                    className="w-full"
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="number" value={bet.boostPercent}
                    onChange={e => updateBet(index, 'boostPercent', e.target.value)}
                    disabled={bet.type !== 'Aumento'}
                    className={`w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-xs text-center font-black outline-none transition-all
                      ${bet.type === 'Aumento' ? 'text-[#FFDD65] border-[#FFDD65]/30' : 'opacity-20'}
                    `}
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="number" value={bet.commission}
                    onChange={e => updateBet(index, 'commission', e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-2.5 text-xs text-center font-black text-[#00D1FF] outline-none transition-all"
                    placeholder="%"
                  />
                </div>

                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => updateBet(index, 'side', bet.side === 'BACK' ? 'LAY' : 'BACK')}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${bet.side === 'BACK' ? 'bg-[#03d791]/20' : 'bg-red-500/20'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center text-[7px] font-black
                       ${bet.side === 'BACK' ? 'left-1 bg-[#03d791] text-black' : 'left-7 bg-red-500 text-white'}`}>
                      {bet.side[0]}
                    </div>
                  </button>
                </div>

                <div className="col-span-1 flex justify-center">
                  <div className={`px-2 py-1.5 rounded-xl bg-black/40 border text-[10px] font-black italic transition-all duration-500 min-w-[60px] text-center
                    ${bet.side === 'LAY' ? 'border-red-500/20 text-red-500' : 'border-white/5 text-white/10 opacity-20'}
                  `}>
                    {bet.side === 'LAY' ? `R$ ${formatCurrency(results.processedBets[index].liability)}` : '---'}
                  </div>
                </div>

                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => updateBet(index, 'isLocked', !bet.isLocked)}
                    className={`transition-all duration-300 ${bet.isLocked ? 'text-[#03d791] scale-110' : 'text-white/20 hover:text-white/40'}`}
                  >
                    {bet.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </button>
                </div>

                <div className="col-span-1 flex flex-col items-end justify-center">
                  <div className={`px-3 py-1.5 rounded-xl bg-black/40 border transition-all duration-500 ${results.outcomes[index] >= 0 ? 'border-[#03d791]/10' : 'border-red-500/10'}`}>
                    <span className={`text-[11px] font-black italic tracking-tighter ${results.outcomes[index] >= 0 ? 'text-[#03d791]' : 'text-red-500'}`}>
                      R$ {formatCurrency(results.outcomes[index])}
                    </span>
                  </div>
                  <span className={`text-[7px] font-black mt-1 uppercase tracking-widest opacity-40 italic ${results.outcomes[index] >= 0 ? 'text-[#03d791]' : 'text-red-500'}`}>
                    {results.stakeTotal > 0 ? (results.outcomes[index] / results.stakeTotal * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>

                {bets.length > 2 && (
                  <button
                    onClick={() => removeBet(bet.id)}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-300 transform scale-75 group-hover:scale-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={addBet}
              disabled={bets.length >= 5}
              className="group flex items-center gap-3 px-12 py-4 rounded-[30px] border border-white/5 bg-white/5 text-[#03d791] text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-white/10 hover:border-[#03d791]/30 disabled:opacity-20 transition-all active:scale-95"
            >
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              Adicionar Aposta
            </button>
          </div>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-[32px] p-8 border-l-blue-500/20 group">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-widest italic opacity-40">Investimento Total</p>
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-3xl font-black text-white italic tracking-tighter">R$ {formatCurrency(results.stakeTotal)}</h3>
            <div className="mt-5 flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10">Exposição</span>
            </div>
          </div>

          <div className="glass-card rounded-[32px] p-8 border-l-[#03d791]/20 group">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-widest italic opacity-40">Retorno Mínimo</p>
              <TrendingUp className="w-5 h-5 text-[#03d791]" />
            </div>
            <h3 className="text-3xl font-black text-[#03d791] italic tracking-tighter">R$ {formatCurrency(results.lowestOutcome)}</h3>
            <div className="mt-5 flex items-center gap-2">
              <span className="text-[10px] font-black text-[#03d791] uppercase tracking-widest bg-[#03d791]/10 px-3 py-1 rounded-full border border-[#03d791]/10">Lucro Garantido</span>
            </div>
          </div>

          <div className="glass-card rounded-[32px] p-8 border-l-[#FFDD65]/20 group">
            <div className="flex justify-between items-start mb-6">
              <p className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-widest italic opacity-40">Lucro da Operação</p>
              <Percent className="w-5 h-5 text-[#FFDD65]" />
            </div>
            <h3 className="text-3xl font-black text-[#FFDD65] italic tracking-tighter">{results.roi.toFixed(2)}%</h3>
            <div className="mt-5 flex items-center gap-2">
              <span className="text-[10px] font-black text-[#FFDD65] uppercase tracking-widest bg-[#FFDD65]/10 px-3 py-1 rounded-full border border-[#FFDD65]/10">Eficiência de ROI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-card px-8 py-3 rounded-full border border-white/10 shadow-3xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#03d791] animate-pulsar shadow-[0_0_10px_#03d791]"></div>
          <p className="text-[9px] text-[#b9cbbc] font-black uppercase tracking-[0.5em] italic">Sistema Ativo • Sincronia ao vivo</p>
        </div>
      </div>



      <NewOperationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={getInitialData()}
      />

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        onClose={() => setIsClearDialogOpen(false)}
        onConfirm={clearCalculator}
        title="Limpar Motor"
        message="Deseja realmente resetar todos os campos da calculadora? Esta ação não pode ser desfeita."
        confirmLabel="RESETAR ENGINE"
        cancelLabel="MANTER DADOS"
      />
    </div>
  );
}
