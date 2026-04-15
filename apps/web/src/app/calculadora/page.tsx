"use client";
import React, { useState, useEffect, useMemo } from "react";
import { NewOperationModal } from "@/components/modals/NewOperationModal";
import { OperationType } from "@/lib/api/types";
import { toast, CustomSelect, ConfirmDialog } from "@/components/ui/components";
import { formatCurrency } from "@/lib/utils";
import {
  RefreshCw,
  Save,
  Trash2,
  Lock,
  Unlock,
  PlusCircle,
  TrendingUp,
  Wallet,
  Percent,
  Calculator,
  ChevronDown,
  ChevronUp
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
  const [expandedBet, setExpandedBet] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('active_freebet');
    if (raw) {
      try {
        const fb = JSON.parse(raw);
        if (fb && fb.value) {
          setBets(prev => {
            const newBets = [...prev];
            newBets[0] = { ...newBets[0], stake: fb.value.toString(), type: 'Freebet', isLocked: true };
            return newBets;
          });
          setActiveFreebetId(fb.id);
          setActiveAccountId(fb.accountId);
          toast.success(`Freebet de R$ ${fb.value} carregada!`);
        }
      } catch (e) { console.error(e); }
      localStorage.removeItem('active_freebet');
    }
  }, []);

  const addBet = () => {
    if (bets.length < 5) {
      const newId = Math.random().toString();
      setBets([...bets, { id: newId, odd: "2.00", stake: "0", type: 'Normal', side: 'BACK', boostPercent: "0", commission: "0", isLocked: false }]);
      setExpandedBet(newId);
    }
  };

  const removeBet = (id: string) => {
    if (bets.length > 2) setBets(bets.filter(b => b.id !== id));
  };

  const updateBet = (index: number, field: keyof BetRow, value: any) => {
    setBets(prev => {
      const newBets = [...prev];
      if (field === 'isLocked' && value === true) newBets.forEach(b => b.isLocked = false);
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
      if (b.type === 'Aumento' && boost > 0) effectiveOdd = (rawOdd - 1) * (1 + boost / 100) + 1;
      const liability = b.side === 'LAY' ? (effectiveOdd - 1) * rawStake : 0;
      return { ...b, rawOdd, rawStake, effectiveOdd, comm, benefitOdd: effectiveOdd - 1, liability };
    });

    const stakeTotal = processedBets.reduce((sum, b) => {
      if (b.type === 'Freebet') return sum;
      return sum + (b.side === 'LAY' ? b.liability : b.rawStake);
    }, 0);

    const outcomes = processedBets.map((_, scenarioIndex) => {
      let totalReturn = 0;
      const winningBackExists = processedBets.some((b, idx) => b.side === 'BACK' && idx === scenarioIndex);
      processedBets.forEach((b, betIndex) => {
        const isWinning = scenarioIndex === betIndex;
        const commFactor = 1 - (b.comm / 100);
        if (b.side === 'BACK') {
          if (isWinning) {
            if (b.type === 'Freebet') totalReturn += (b.rawStake * (b.effectiveOdd - 1)) * commFactor;
            else totalReturn += (b.rawStake * b.effectiveOdd) * commFactor;
          }
        } else {
          if (winningBackExists) totalReturn += 0;
          else totalReturn += b.liability + (b.rawStake * commFactor);
        }
      });
      return totalReturn - stakeTotal;
    });

    const lowestOutcome = Math.min(...outcomes);
    const roi = stakeTotal > 0 ? (lowestOutcome / stakeTotal) * 100 : 0;
    return { outcomes, stakeTotal, lowestOutcome, roi, processedBets };
  }, [bets]);

  useEffect(() => {
    const lockedIndex = bets.findIndex(b => b.isLocked);
    if (lockedIndex === -1) return;
    const lockedBet = bets[lockedIndex];
    const lockedStake = parseFloat(lockedBet.stake) || 0;
    const calculateEffective = (b: BetRow): number => {
      const odd = parseFloat(b.odd) || 1;
      const boost = parseFloat(b.boostPercent) || 0;
      const comm = parseFloat(b.commission) || 0;
      const commFactor = 1 - (comm / 100);
      let effectiveOdd = odd;
      if (b.type === 'Aumento' && boost > 0) effectiveOdd = (odd - 1) * (1 + boost / 100) + 1;
      if (b.type === 'Freebet') return (effectiveOdd - 1) * commFactor;
      if (b.side === 'LAY') return (effectiveOdd - 1 + commFactor);
      return (effectiveOdd * commFactor);
    };
    const lockedEffOdd = calculateEffective(lockedBet);
    const timer = setTimeout(() => {
      setBets(prev => prev.map((bet, i) => {
        if (i === lockedIndex) return bet;
        const targetEffOdd = calculateEffective(bet);
        return { ...bet, stake: ((lockedStake * lockedEffOdd) / targetEffOdd).toFixed(2) };
      }));
    }, 50);
    return () => clearTimeout(timer);
  }, [bets.map(b => b.odd).join(','), bets.map(b => b.boostPercent).join(','), bets.map(b => b.type).join(','), bets.map(b => b.commission).join(','), bets.map(b => b.isLocked).join(','), bets.find(b => b.isLocked)?.stake]);

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
      bets: bets.map((b, i) => ({ stake: (b.stake || "0").toString(), odds: (b.odd || "1").toString(), accountId: i === 0 && activeAccountId ? activeAccountId : "", side: b.side, type: b.type, commission: parseFloat(b.commission) || 0 })),
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

  const betColors = ['text-[#03d791]', 'text-[#00D1FF]', 'text-[#FFDD65]', 'text-purple-400', 'text-pink-400'];

  return (
    <div className="space-y-4 pb-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#03d791] shrink-0" />
          <h1 className="text-lg font-black text-white italic tracking-tighter uppercase">Calculadora</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsClearDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card text-[#B9CBBC] text-[10px] font-black uppercase tracking-wider border border-white/5 active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#03d791] text-black text-[10px] font-black uppercase tracking-wider shadow-[0_4px_16px_rgba(3,215,145,0.3)] active:scale-95 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar
          </button>
        </div>
      </div>

      {/* Bets - Mobile Card Layout + Desktop Grid Header */}
      <div className="space-y-3">
        {/* Desktop Header */}
        <div className="hidden md:grid grid-cols-[30px_1fr] gap-3 px-4 mb-2">
            <div /> {/* ID Spacer */}
            <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-2 text-[9px] text-[#b9cbbc]/30 font-black uppercase tracking-widest text-center">Odd</span>
                <span className="col-span-2 text-[9px] text-[#b9cbbc]/30 font-black uppercase tracking-widest text-center">Stake</span>
                <span className="col-span-2 text-[9px] text-[#b9cbbc]/30 font-black uppercase tracking-widest text-center">Tipo</span>
                <span className="col-span-1 text-[9px] text-[#b9cbbc]/30 font-black uppercase tracking-widest text-center">%</span>
                <span className="col-span-2 text-[9px] text-[#b9cbbc]/30 font-black uppercase tracking-widest text-center">Modo</span>
                <span className="col-span-1 text-[9px] text-[#b9cbbc]/30 font-black uppercase tracking-widest text-center">Com%</span>
                <span className="col-span-1 text-[9px] text-[#b9cbbc]/30 font-black uppercase tracking-widest text-right">Lucro</span>
                <div className="col-span-1" /> {/* Actions Spacer */}
            </div>
        </div>

        {bets.map((bet, index) => {
          const isExpanded = expandedBet === bet.id;
          const outcome = results.outcomes[index];
          const liability = results.processedBets[index]?.liability ?? 0;
          const colorClass = betColors[index] || 'text-white';

          return (
            <div
              key={bet.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden
                ${bet.isLocked ? 'bg-[#03d791]/5 border-[#03d791]/20' : 'bg-white/5 border-white/5'}`}
            >
              {/* Card Header — campos principais expostos no PC */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer group/header"
                onClick={() => setExpandedBet(isExpanded ? null : bet.id)}
              >
                <span className={`text-base font-black italic ${colorClass} shrink-0 w-[30px]`}>#0{index + 1}</span>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-12 gap-3 items-center">
                  {/* Odd */}
                  <div className="md:col-span-2 min-w-0">
                    <input
                      type="number" step="0.01" value={bet.odd}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateBet(index, 'odd', e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm text-center font-black text-white focus:border-[#03d791] outline-none transition-all"
                      placeholder="Odd"
                    />
                  </div>

                  {/* Stake (Dividida internamente se LAY) */}
                  <div className={`md:col-span-2 min-w-0 ${bet.side === 'LAY' ? 'grid grid-cols-[1fr_auto] gap-2 items-center' : ''}`}>
                    <input
                      type="number" step="0.01" value={bet.stake}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateBet(index, 'stake', e.target.value)}
                      className={`w-full bg-black/40 border rounded-xl px-3 py-2 text-sm text-center font-black outline-none transition-all
                        ${bet.isLocked ? 'text-[#03d791] border-[#03d791]/30' : 'text-white border-white/5 focus:border-[#03d791]'}`}
                      placeholder="Stake"
                    />
                    {bet.side === 'LAY' && (
                      <div className="flex flex-col items-center justify-center bg-red-500/20 border border-red-500/40 rounded-xl px-2.5 h-full min-w-[85px] py-1.5 shadow-lg shadow-red-900/10">
                        <span className="text-[8px] text-red-500 font-black uppercase tracking-[0.2em] leading-none mb-1 opacity-70">Risco</span>
                        <span className="text-xs md:text-sm font-black text-red-500 italic leading-none">R${formatCurrency(liability)}</span>
                      </div>
                    )}
                  </div>

                  {/* Desktop Only: Tipo e Aumento */}
                  <div className="hidden md:block md:col-span-2 min-w-0" onClick={e => e.stopPropagation()}>
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

                  <div className="hidden md:block md:col-span-1 min-w-0" onClick={e => e.stopPropagation()}>
                    <input
                      type="number" value={bet.boostPercent}
                      onChange={e => updateBet(index, 'boostPercent', e.target.value)}
                      disabled={bet.type !== 'Aumento'}
                      className={`w-full bg-black/40 border border-white/5 rounded-xl px-2 py-2.5 text-xs text-center font-black outline-none transition-all
                        ${bet.type === 'Aumento' ? 'text-[#FFDD65] bg-[#FFDD65]/5 border-[#FFDD65]/20' : 'opacity-20'}`}
                      placeholder="%"
                    />
                  </div>

                  {/* Side (Back/Lay) */}
                  <div className="hidden md:block md:col-span-2 min-w-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => updateBet(index, 'side', bet.side === 'BACK' ? 'LAY' : 'BACK')}
                      className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all
                        ${bet.side === 'BACK' ? 'bg-[#03d791]/20 text-[#03d791] border border-[#03d791]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                    >
                      {bet.side === 'BACK' ? '▲ BACK' : '▼ LAY'}
                    </button>
                  </div>

                  {/* Commission */}
                  <div className="hidden md:block md:col-span-1 min-w-0" onClick={e => e.stopPropagation()}>
                    <input
                      type="number" value={bet.commission}
                      onChange={e => updateBet(index, 'commission', e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-2 py-2.5 text-xs text-center font-black text-white/60 focus:text-white outline-none transition-all"
                      placeholder="%"
                    />
                  </div>

                  {/* Resultado mini */}
                  <div className={`text-sm font-black italic md:col-span-1 text-right ${outcome >= 0 ? 'text-[#03d791]' : 'text-red-400'}`}>
                    R${formatCurrency(outcome)}
                  </div>

                  {/* Desktop Only: Fixar / Excluir */}
                  <div className="hidden md:flex md:col-span-1 items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                       onClick={() => updateBet(index, 'isLocked', !bet.isLocked)}
                       className={`p-2 rounded-lg transition-all ${bet.isLocked ? 'bg-[#03d791]/20 text-[#03d791] border border-[#03d791]/30' : 'bg-white/5 text-white/30 border border-white/5 hover:text-white'}`}
                       title={bet.isLocked ? "Desafixar" : "Fixar"}
                    >
                      {bet.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    {bets.length > 2 && (
                      <button
                        onClick={() => removeBet(bet.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expand (hidden on desktop because fields are already there, or keep for other fields) */}
                <button 
                  onClick={e => { e.stopPropagation(); setExpandedBet(isExpanded ? null : bet.id); }} 
                  className="text-white/30 hover:text-white shrink-0 md:hidden"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded Options — Hidden on Desktop */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 md:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Tipo */}
                    <div>
                      <label className="text-[9px] text-white/40 font-black uppercase tracking-wider mb-1 block">Tipo</label>
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

                    {/* Back/Lay Toggle */}
                    <div>
                      <label className="text-[9px] text-white/40 font-black uppercase tracking-wider mb-1 block">Back / Lay</label>
                      <button
                        onClick={() => updateBet(index, 'side', bet.side === 'BACK' ? 'LAY' : 'BACK')}
                        className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all
                          ${bet.side === 'BACK' ? 'bg-[#03d791]/20 text-[#03d791] border border-[#03d791]/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                      >
                        {bet.side === 'BACK' ? '▲ BACK' : '▼ LAY'}
                      </button>
                    </div>

                    {/* Aumento % */}
                    <div>
                      <label className="text-[9px] text-white/40 font-black uppercase tracking-wider mb-1 block">Aumento %</label>
                      <input
                        type="number" value={bet.boostPercent}
                        onChange={e => updateBet(index, 'boostPercent', e.target.value)}
                        disabled={bet.type !== 'Aumento'}
                        className={`w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-center font-black outline-none
                          ${bet.type === 'Aumento' ? 'text-[#FFDD65]' : 'opacity-20'}`}
                        placeholder="0"
                      />
                    </div>

                    {/* Comissão */}
                    <div>
                      <label className="text-[9px] text-white/40 font-black uppercase tracking-wider mb-1 block">Comissão %</label>
                      <input
                        type="number" value={bet.commission}
                        onChange={e => updateBet(index, 'commission', e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-center font-black text-[#00D1FF] outline-none"
                        placeholder="%"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Responsabilidade LAY */}
                    <div className="text-xs text-white/40 font-bold">
                      {bet.side === 'LAY' && <span className="text-red-400">Resp: R${formatCurrency(liability)}</span>}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Fixar */}
                      <button
                        onClick={() => updateBet(index, 'isLocked', !bet.isLocked)}
                        className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all
                          ${bet.isLocked ? 'bg-[#03d791]/20 text-[#03d791] border border-[#03d791]/30' : 'bg-white/5 text-white/30 border border-white/5'}`}
                      >
                        {bet.isLocked ? <><Lock className="w-3.5 h-3.5" /> Fixado</> : <><Unlock className="w-3.5 h-3.5" /> Fixar</>}
                      </button>

                      {/* Remover */}
                      {bets.length > 2 && (
                        <button
                          onClick={() => removeBet(bet.id)}
                          className="flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 active:scale-95 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Bet */}
        <button
          onClick={addBet}
          disabled={bets.length >= 5}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-white/10 text-[#03d791]/60 text-[11px] font-black uppercase tracking-widest hover:border-[#03d791]/30 hover:text-[#03d791] disabled:opacity-20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Adicionar Aposta
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 py-5">
          <div className="flex justify-between items-center mb-1">
            <Wallet className="w-4 h-4 text-white/20" />
          </div>
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1.5 px-0.5">Investimento</p>
          <p className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase leading-none">R${formatCurrency(results.stakeTotal)}</p>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 py-5">
          <div className="flex justify-between items-center mb-1">
            <TrendingUp className="w-4 h-4 text-[#03d791]/30" />
          </div>
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1.5 px-0.5">Retorno Mín.</p>
          <p className={`text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none ${results.lowestOutcome >= 0 ? 'text-[#03d791]' : 'text-red-500'}`}>
            R${formatCurrency(results.lowestOutcome)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 py-5">
          <div className="flex justify-between items-center mb-1">
            <Percent className="w-4 h-4 text-[#FFDD65]/30" />
          </div>
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1.5 px-0.5">ROI</p>
          <p className="text-xl md:text-2xl font-black text-[#FFDD65] italic tracking-tighter uppercase leading-none">{results.roi.toFixed(2)}%</p>
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
        message="Deseja realmente resetar todos os campos da calculadora?"
        confirmLabel="RESETAR"
        cancelLabel="MANTER"
      />
    </div>
  );
}
