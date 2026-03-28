import { AlertCircle } from 'lucide-react';

export function ErrorFallback({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 glass-card rounded-3xl m-8">
      <AlertCircle className="w-12 h-12 text-[#EF4444]" />
      <h3 className="text-xl font-bold text-white uppercase italic">Ops! Algo deu errado.</h3>
      <p className="text-muted text-sm max-w-xs">Não conseguimos carregar os dados. Verifique sua conexão ou tente novamente.</p>
      <button 
        onClick={reset}
        className="px-6 py-2 bg-[#03D791] text-black font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 transition-all"
      >
        Tentar Novamente
      </button>
    </div>
  );
}
