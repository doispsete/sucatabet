"use client";

import { useOperations, useSofascorePolling, useAuth } from "@/lib/hooks";
import { useEffect } from "react";

/**
 * Componente invisível responsável por manter o polling do Sofascore ativo
 * em todo o sistema, independente da página atual.
 */
export function GlobalPollingHandler() {
  const { user } = useAuth();

  // Só busca operações se houver um usuário logado
  const { data: ops } = useOperations({ status: 'PENDING', enabled: !!user });

  // Inicia o polling compartilhado se houver operações
  useSofascorePolling(user ? (ops?.data || []) : []);

  return null;
}
