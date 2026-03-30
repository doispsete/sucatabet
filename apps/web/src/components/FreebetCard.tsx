import React from "react";
import { 
  Clock, 
  MoreVertical,
  Shield,
  Zap,
  Gamepad2,
  Trash2,
  Calendar,
  Play
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as T from "@/lib/api/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface FreebetCardProps {
  freebet: T.Freebet;
  onUse: (id: string) => void;
  onExpire: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (freebet: T.Freebet) => void;
}

export function FreebetCard({ freebet, onUse, onExpire, onDelete, onEdit }: FreebetCardProps) {
  const router = useRouter();
  const houseName = freebet.account?.bettingHouse?.name || "Casa";
  const logoUrl = freebet.account?.bettingHouse?.logoUrl;
  const profileName = freebet.account?.cpfProfile?.name || "Operador";
  const profileCpf = freebet.account?.cpfProfile?.cpf.substring(0, 6) || "000000";
  
  const getStatusInfo = (status?: T.FreebetStatus, isActuallyExpired?: boolean) => {
    if (isActuallyExpired) {
      return { label: "EXPIRADA", color: "border-[#353534] bg-[#353534]/40 text-[#b9cbbc]/40 grayscale" };
    }
    switch (status) {
      case T.FreebetStatus.PENDENTE:
        return { label: "ATIVA", color: "border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]" };
      case T.FreebetStatus.USADA:
        return { label: "USADA", color: "border-[#14d1ff] bg-[#14d1ff]/10 text-[#14d1ff]" };
      case T.FreebetStatus.EXPIRADA:
        return { label: "EXPIRADA", color: "border-[#353534] bg-[#353534]/40 text-[#b9cbbc]/40 grayscale" };
      case T.FreebetStatus.EXPIRANDO:
        return { label: "EXPIRANDO", color: "border-red-500 bg-red-500/10 text-red-500" };
      default:
        return { label: "ATIVA", color: "border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]" };
    }
  };

  const diffMs = new Date(freebet.expiresAt).getTime() - new Date().getTime();
  const isActuallyExpired = diffMs <= 0 || freebet.status === T.FreebetStatus.EXPIRADA;
  const statusInfo = getStatusInfo(freebet.status, isActuallyExpired);
  const diffHours = diffMs / (1000 * 60 * 60);
  
  const isActive = (freebet.status === T.FreebetStatus.PENDENTE || freebet.status === T.FreebetStatus.EXPIRANDO) && !isActuallyExpired;
  const isUrgent = isActive && diffHours <= 24;
  const isWarning = isActive && diffHours > 24 && diffHours <= 48;

  const getHouseBranding = (name: string) => {
    const lowName = name.toLowerCase();
    if (lowName.includes('bet365')) return { bg: "bg-[#005a41]", text: "text-white", glow: "hover:shadow-[0_20px_40px_-12px_rgba(3,215,145,0.15)]" };
    if (lowName.includes('betano')) return { bg: "bg-[#ff6700]", text: "text-white", glow: "hover:shadow-[0_20px_40px_-12px_rgba(255,103,0,0.15)]" };
    if (lowName.includes('stake')) return { bg: "bg-[#2a2a2a]", text: "text-[#14d1ff]", glow: "hover:shadow-[0_20px_40px_-12px_rgba(20,209,255,0.15)]" };
    return { bg: "bg-[#1a1a1a]", text: "text-white", glow: "hover:shadow-[0_20px_40px_-12px_rgba(255,255,255,0.05)]" };
  };

  const branding = getHouseBranding(houseName);
  const borderClass = isActuallyExpired ? 'border-[#353534]' : isUrgent ? 'border-red-500' : isWarning ? 'border-orange-500' : 'border-white/5';

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "EXPIRADA";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `EXPIRA EM ${hours}H ${mins}M`;
    return `EXPIRA EM ${mins} MINUTOS`;
  };

  return (
    <div className={`glass-card rounded-2xl p-6 group transition-all duration-500 card-interact relative overflow-hidden border-l-4 ${borderClass} ${branding.glow} ${isActuallyExpired ? 'grayscale opacity-60' : ''}`}>
      
      {/* Card Header (Account Style) */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-[12px] uppercase tracking-tighter shadow-xl ${branding.bg} ${branding.text}`}>
            {logoUrl ? (
              <img src={logoUrl} alt={houseName} className="w-8 h-8 object-contain" />
            ) : (
              houseName.substring(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-[#e5e2e1] font-bold text-sm font-headline tracking-tight uppercase">
              {profileName.split(' ')[0]} <span className="text-[#03d791] text-[10px]">({profileCpf})</span>
            </p>
            <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5 ${isUrgent ? 'text-red-500 animate-pulse' : isWarning ? 'text-orange-500' : 'text-[#03d791]'}`}>
              <div className={`w-1.5 h-1.5 rounded-full fill-current ${isUrgent ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-[#03d791]'}`} />
              {isUrgent ? formatCountdown(diffMs) : isWarning ? 'ALERTA < 48H' : statusInfo.label}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(freebet); }}
            className="text-[#b9cbbc] hover:text-[#03d791] hover:bg-[#03d791]/10 transition-all p-2 rounded-lg"
            title="Editar Expiração"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(freebet.id); }}
            className="text-[#b9cbbc] hover:text-red-500 hover:bg-red-500/10 transition-all p-2 rounded-lg"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Value Section */}
      <div className="mb-8">
        <p className="text-[#b9cbbc] text-[9px] uppercase font-black tracking-[0.2em] opacity-40 mb-1">Bônus Disponível ({houseName})</p>
        <h6 className={`text-3xl font-headline font-black italic tracking-tighter uppercase ${isUrgent ? 'text-red-400' : 'text-[#e5e2e1]'}`}>
          R$ {formatCurrency(freebet.value)}
        </h6>
        <p className="text-[10px] text-[#b9cbbc]/40 font-bold mt-1 italic uppercase tracking-tighter">
          Válido até {formatDate(freebet.expiresAt)} às {formatTime(freebet.expiresAt)}
        </p>
      </div>

      {/* Action Buttons (Integrated) */}
      {(freebet.status === T.FreebetStatus.PENDENTE || freebet.status === T.FreebetStatus.EXPIRANDO) && !isActuallyExpired ? (
        <div className="grid grid-cols-1 gap-2">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              localStorage.setItem('active_freebet', JSON.stringify(freebet));
              router.push('/calculadora');
            }}
            className="bg-[#03d791] text-black text-[9px] font-black py-3 rounded-lg border border-[#03d791]/20 uppercase tracking-widest btn-interact italic flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(3,215,145,0.2)] w-full"
          >
            <Play size={12} fill="black" />
            Usar Freebet
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <span className="text-[10px] font-black text-[#b9cbbc]/20 uppercase tracking-[0.3em] italic">
            {isActuallyExpired ? "FREEBET EXPIRADA" : freebet.status === T.FreebetStatus.USADA ? "FREEBET UTILIZADA" : "REGISTRO ARQUIVADO"}
          </span>
        </div>
      )}

    </div>
  );
}
