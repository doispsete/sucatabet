"use client";
import React from "react";
import {
  Calendar,
  Hash,
  Target,
  Zap,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  User,
  ExternalLink,
  Receipt,
  Activity
} from "lucide-react";
import { Modal } from "@/components/ui/components";
import { Operation, OperationStatus, OperationResult } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";

interface OperationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: Operation | null;
  primaryColor?: string; // e.g. '#00d1ff' for blue theme
}

export function OperationDetailsModal({ isOpen, onClose, operation, primaryColor = '#03D791' }: OperationDetailsModalProps) {
  if (!operation) return null;

  const getResultLabel = (result?: OperationResult) => {
    switch (result) {
      case OperationResult.NORMAL: return "Vencedor Único";
      case OperationResult.DUPLO: return "Duplo (2 Greens)";
      case OperationResult.PROTECAO: return "Proteção";
      default: return "N/A";
    }
  };

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case 'NORMAL': return 'Normal';
      case 'FREEBET_GEN': return 'Gerar Freebet';
      case 'EXTRACAO': return 'Extração';
      case 'BOOST_25': return 'Aumento 25';
      case 'BOOST_50': return 'Aumento 50';
      case 'SUPERODDS': return 'Super Odds';
      case 'TENTATIVA_DUPLO': return 'Tentativa Duplo';
      default: return type.replace('_', ' ');
    }
  };

  const getStatusInfo = (status: OperationStatus) => {
    switch (status) {
      case OperationStatus.FINISHED:
        return { label: "Finalizada", color: primaryColor, bg: `${primaryColor}10`, border: `${primaryColor}20` };
      case OperationStatus.CASHOUT:
        return { label: "Cashout", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
      case OperationStatus.VOID:
        return { label: "Anulada", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
      default:
        return { label: "Pendente", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" };
    }
  };

  const statusInfo = getStatusInfo(operation.status);
  const totalStaked = (operation.bets || []).reduce((acc, b) => acc + Number(b.stake), 0);

  const getBetCost = (bet: any) => {
    const s = Number(bet.stake);
    const o = Number(bet.odds);
    if (bet.type === 'Freebet') return 0;
    if (bet.side === 'LAY') return s * (o - 1);
    return s;
  };

  const getBetReturn = (bet: any) => {
    const s = Number(bet.stake);
    const o = Number(bet.odds);
    // Para BACK Freebet, o retorno é s * (o - 1)
    if (bet.side === 'BACK' && bet.type === 'Freebet') return s * (o - 1);
    // Para os demais (BACK Normal/Boost e LAY), o retorno bruto se vencer é stake * odds
    return s * o;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Operação"
      size="lg"
    >
      <div className="space-y-8 py-2">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 glass-card rounded-[30px] border-white/5 shadow-xl">
            <p className="text-[10px] font-black text-[#b9cbbc]/30 uppercase tracking-[0.4em] mb-3 italic">STATUS DA OPERAÇÃO</p>
            <div className="flex items-center gap-3">
              <span
                style={{ color: statusInfo.color }}
                className="text-sm font-black uppercase italic tracking-tighter"
              >
                {statusInfo.label}
              </span>
              <div
                style={{ backgroundColor: statusInfo.color, boxShadow: `0 0 10px ${statusInfo.color}` }}
                className="w-2 h-2 rounded-full animate-pulse"
              ></div>
            </div>
          </div>

          <div className="p-6 glass-card rounded-[30px] border-white/5 shadow-xl">
            <p className="text-[10px] font-black text-[#b9cbbc]/30 uppercase tracking-[0.4em] mb-3 italic">LÓGICA APLICADA</p>
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4" style={{ color: primaryColor }} />
              <span className="text-sm font-black text-white italic uppercase tracking-tighter">{getResultLabel(operation.result)}</span>
            </div>
          </div>

          <div
            style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}
            className="p-6 glass-card rounded-[30px] border shadow-xl"
          >
            <p
              style={{ color: `${primaryColor}60` }}
              className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 italic"
            >
              LUCRO LÍQUIDO
            </p>
            <h4
              style={{ color: Number(operation.realProfit) >= 0 ? primaryColor : undefined }}
              className={`text-3xl font-black italic tracking-tighter ${Number(operation.realProfit) < 0 ? 'text-red-500' : ''}`}
            >
              R$ {formatCurrency(operation.realProfit ?? 0)}
            </h4>
          </div>
        </div>

        {operation.description && (
          <div className="px-6 py-4 glass-card rounded-[25px] border-white/5 bg-white/[0.02]">
            <p className="text-[9px] font-black text-[#b9cbbc]/30 uppercase tracking-[0.4em] mb-2 italic text-center">NOTAS / DESCRIÇÃO</p>
            <p className="text-xs font-medium text-white/70 italic text-center">{operation.description}</p>
          </div>
        )}

        {/* Bets Detailed List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h5 className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-[0.3em]">Entradas Realizadas</h5>
            <span className="text-[9px] text-[#b9cbbc]/40 font-bold italic">Total Investido: R$ {formatCurrency(totalStaked)}</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(operation.bets || []).map((bet: any) => (
              <div
                key={bet.id}
                className={`p-8 rounded-[35px] glass-card border-white/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 ${bet.isWinner
                  ? 'border-[#03D791]/30 bg-[#03D791]/5 shadow-2xl'
                  : 'bg-white/5'
                  }`}
              >
                <div className="flex items-center gap-6">
                  <div
                    style={{
                      backgroundColor: bet.isWinner ? `${primaryColor}33` : undefined,
                      borderColor: bet.isWinner ? `${primaryColor}4D` : undefined,
                      boxShadow: bet.isWinner ? `0 0 20px ${primaryColor}33` : undefined
                    }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all relative ${!bet.isWinner ? 'bg-white/5 border-white/5' : ''
                      }`}>
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${bet.account?.bettingHouse?.domain || 'bet365.com'}&sz=64`}
                      alt=""
                      className="w-8 h-8 object-contain rounded-md"
                    />
                    <div
                      style={{
                        borderColor: bet.isWinner ? primaryColor : undefined,
                        color: bet.isWinner ? primaryColor : undefined
                      }}
                      className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black italic border-2 transition-all ${bet.isWinner ? 'bg-black' : 'bg-[#111] text-[#b9cbbc]/40 border-white/10'
                        }`}>
                      {bet.side === 'LAY' ? 'L' : 'B'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black text-white italic tracking-tighter uppercase">{bet.account?.bettingHouse?.name}</span>
                      {bet.isWinner && (
                        <div
                          style={{ backgroundColor: primaryColor }}
                          className="text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest italic shadow-[0_0_10px_rgba(3,215,145,0.5)]"
                        >
                          Green
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[9px] font-black text-[#b9cbbc] opacity-30 uppercase tracking-[0.3em]">
                        ODD: {bet.odds}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12 border-t md:border-t-0 border-white/5 pt-6 md:pt-0">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-[#b9cbbc]/20 uppercase tracking-[0.4em] mb-1 italic">INVESTIMENTO</p>
                    <p className="text-base font-black text-white italic tracking-tighter">
                      R$ {formatCurrency(getBetCost(bet))}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-black text-[#b9cbbc]/20 uppercase tracking-[0.4em] mb-1 italic">RETORNO BRUTO</p>
                    <p className={`text-2xl font-black italic tracking-tighter ${bet.isWinner ? 'text-[#03D791]' : 'text-white/10'}`}>
                      R$ {formatCurrency(getBetReturn(bet))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Footer */}
        <div className="pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 px-4 opacity-20 group">
          <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest italic">
            <Calendar size={14} style={{ color: primaryColor }} />
            <span>{new Date(operation.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest italic">
            <Receipt size={14} style={{ color: primaryColor }} />
            <span>{getOperationTypeLabel(operation.type)}</span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest italic">
            <Hash size={14} style={{ color: primaryColor }} />
            <span>{operation.id.substring(0, 12).toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-end gap-2 text-[9px] font-black text-white uppercase tracking-widest italic">
            <Activity size={14} style={{ color: primaryColor }} />
            <span>{operation.category}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
