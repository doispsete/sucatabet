"use client";
import { useEffect } from "react";
import { toast } from "@/components/ui/components";

export function GlobalErrorManager() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Promise rejection:", event.reason);
      const message = event.reason?.message || String(event.reason) || "Erro inesperado de rede ou servidor";
      toast.error(`ERRO: ${message}`);
    };

    const handleError = (event: ErrorEvent) => {
      // Ignorar erros vindos de extensões ou bugs internos do browser
      if (event.message?.includes("ResizeObserver") || event.message?.includes("Script error")) return;
      
      console.error("Global error:", event.error);
      toast.error(`ERRO DE EXECUÇÃO: ${event.message}`);
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
