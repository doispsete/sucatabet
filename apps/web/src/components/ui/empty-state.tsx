import { Shovel } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'Nenhum dado detectado no ecossistema' }: EmptyStateProps) {
  return (
    <div className="glass-card py-24 rounded-[45px] border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl">
        <Shovel className="w-10 h-10 text-[#b9cbbc] opacity-20" />
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#b9cbbc] italic">{message}</p>
        <div className="w-12 h-1 bg-white/5 rounded-full mx-auto" />
      </div>
    </div>
  );
}
