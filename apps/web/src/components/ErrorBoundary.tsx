"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-6 bg-black">
          <div className="absolute inset-0 bg-[#00ff88]/5 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)] opacity-50" />
          
          <div className="relative w-full max-w-[540px] glass-card rounded-[40px] p-12 border-white/10 shadow-[0_32px_128px_rgba(0,0,0,1)] text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-full bg-red-500/20 mx-auto mb-8 flex items-center justify-center border border-red-500/30">
              <AlertCircle size={48} className="text-red-500 animate-pulse" />
            </div>

            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4 leading-none">
              O SISTEMA <span className="text-red-500">FALHOU</span>
            </h1>
            
            <p className="text-[#b9cbbc] text-sm font-medium opacity-60 mb-10 px-6 leading-relaxed">
              Ocorreu um erro crítico na interface. Antes de qualquer tela ou operação, garantimos que esta falha seja reportada.
            </p>

            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 mb-10 text-left overflow-x-auto max-h-[120px] custom-scrollbar">
              <pre className="text-[10px] font-mono text-red-400 opacity-80 whitespace-pre-wrap">
                {this.state.error?.name}: {this.state.error?.message}
              </pre>
            </div>

            <button 
              onClick={this.handleReset}
              className="group relative w-full py-5 rounded-2xl bg-[#00ff88] text-black font-black uppercase italic tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(0,255,136,0.2)]"
            >
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center gap-3">
                <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                REINICIAR INTERFACE
              </div>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
