"use client";

import * as services from '../api/services';
import { useFetch } from './use-fetch';
import { useMutation } from './use-mutation';

import { useAuth } from '../context/auth-context';
export { useAuth };

// 1. Dashboard Hooks
export function useDashboardSummary(params?: { startDate?: string; endDate?: string }) {
  const { data, isLoading, error, refetch } = useFetch(
    () => services.dashboardService.getSummary(params),
    [params?.startDate, params?.endDate],
    { polling: 5000 }
  );
  return { data, isLoading, error, refetch };
}

export function useDashboardClub() {
  const { data, isLoading, error, refetch } = useFetch(
    services.dashboardService.getClub,
    [],
    { polling: 30000 }
  );
  return { data, isLoading, error, refetch };
}

// 2. Operations Hook
export function useOperations(params?: { status?: string; page?: number; limit?: number; [key: string]: unknown }) {
  const { data, isLoading, error, refetch } = useFetch(
    () => services.operationsService.list(params),
    [params?.status, params?.page, params?.limit, params?.search],
    { polling: 10000 }
  );

  const { mutate: create, isMutating: isCreating, mutationError: createError, clearError: clearCreateError } = useMutation(
    services.operationsService.create,
    () => refetch()
  );

  const { mutate: close, isMutating: isClosing, mutationError: closeError, clearError: clearCloseError } = useMutation(
    ({ id, result }: { id: string, result: unknown }) => services.operationsService.close(id, result),
    () => refetch()
  );

  const { mutate: voidOp, isMutating: isVoiding, mutationError: voidError, clearError: clearVoidError } = useMutation(
    (id: string) => services.operationsService.void(id),
    () => refetch()
  );

  const { mutate: update, isMutating: isUpdating, mutationError: updateError, clearError: clearUpdateError } = useMutation(
    ({ id, body }: { id: string, body: unknown }) => services.operationsService.update(id, body),
    () => refetch()
  );

  const { mutate: remove, isMutating: isRemoving, mutationError: removeError, clearError: clearRemoveError } = useMutation(
    (id: string) => services.operationsService.delete(id),
    () => refetch()
  );

  const isMutating = isCreating || isUpdating || isClosing || isVoiding || isRemoving;
  const mutationError = createError || updateError || closeError || voidError || removeError;
  const clearError = () => { 
    clearCreateError(); 
    clearUpdateError(); 
    clearCloseError(); 
    clearVoidError(); 
    clearRemoveError(); 
  };

  return { 
    data, isLoading, error, refetch, 
    isMutating, mutationError, clearError, 
    create, 
    update: (id: string, body: unknown) => update({ id, body }),
    close: (id: string, result: unknown) => close({ id, result }), 
    void: voidOp, 
    remove 
  };
}

// 3. Accounts Hook
export function useAccounts() {
  const { data, isLoading, error, refetch } = useFetch(
    services.accountsService.list,
    []
  );

  const { mutate: create, isMutating: isCreating, mutationError: createError } = useMutation(
    services.accountsService.create,
    () => refetch()
  );

  const { mutate: update, isMutating: isUpdating, mutationError: updateError } = useMutation(
    ({ id, p }: { id: string, p: unknown }) => services.accountsService.update(id, p),
    () => refetch()
  );

  const { mutate: remove, isMutating: isRemoving, mutationError: removeError } = useMutation(
    (id: string) => services.accountsService.delete(id),
    () => refetch()
  );

  const { mutate: deposit, isMutating: isDepositing, mutationError: depositError } = useMutation(
    ({ id, a }: { id: string, a: number }) => services.accountsService.deposit(id, a),
    () => refetch()
  );

  const { mutate: withdraw, isMutating: isWithdrawing, mutationError: withdrawError } = useMutation(
    ({ id, a }: { id: string, a: number }) => services.accountsService.withdraw(id, a),
    () => refetch()
  );

  const isMutating = isCreating || isUpdating || isRemoving || isDepositing || isWithdrawing;
  const mutationError = createError || updateError || removeError || depositError || withdrawError;

  return { 
    data: data || [], isLoading, error, refetch, isMutating, mutationError,
    create,
    update: (id: string, p: unknown) => update({ id, p }),
    remove,
    deposit: (id: string, a: number) => deposit({ id, a }),
    withdraw: (id: string, a: number) => withdraw({ id, a }),
  };
}

export function useAccountHistory(accountId?: string) {
  const { data, isLoading, error, refetch } = useFetch(
    () => accountId ? services.accountsService.getHistory(accountId) : Promise.resolve([]),
    [accountId]
  );
  return { data: data || [], isLoading, error, refetch };
}

// 4. Other Hooks
export function useHouses() {
  const { data, isLoading, error, refetch } = useFetch(
    services.housesService.list,
    []
  );

  const { mutate: create, isMutating: isCreating } = useMutation(
    services.housesService.create,
    () => refetch()
  );

  const { mutate: update, isMutating: isUpdating } = useMutation(
    ({ id, p }: { id: string, p: unknown }) => services.housesService.update(id, p),
    () => refetch()
  );

  const { mutate: remove, isMutating: isRemoving } = useMutation(
    (id: string) => services.housesService.delete(id),
    () => refetch()
  );

  const isMutating = isCreating || isUpdating || isRemoving;

  return { 
    data: data || [], isLoading, error, refetch, isMutating,
    create,
    update: (id: string, p: unknown) => update({ id, p }),
    remove,
  };
}

export function useCpfProfiles() {
  const { data, isLoading, error, refetch } = useFetch(
    () => services.cpfProfilesService.list(),
    []
  );

  const { mutate: create, isMutating: isCreating } = useMutation(
    services.cpfProfilesService.create,
    () => refetch()
  );

  const { mutate: remove, isMutating: isRemoving } = useMutation(
    (id: string) => services.cpfProfilesService.delete(id),
    () => refetch()
  );

  return { data: data || [], isLoading, error, refetch, isMutating: isCreating || isRemoving, create, remove };
}

export function useFreebets() {
  const { data, isLoading, error, refetch } = useFetch(
    services.freebetsService.list,
    []
  );

  const { mutate: create, isMutating: isCreating } = useMutation(
    services.freebetsService.create,
    () => refetch()
  );

  const { mutate: update, isMutating: isUpdating } = useMutation(
    ({ id, p }: { id: string, p: any }) => services.freebetsService.update(id, p),
    () => refetch()
  );

  const { mutate: remove, isMutating: isRemoving } = useMutation(
    (id: string) => services.freebetsService.delete(id),
    () => refetch()
  );

  const isMutating = isCreating || isUpdating || isRemoving;

  return { 
    data: data || [], isLoading, error, refetch, isMutating, 
    create, 
    update: (id: string, p: any) => update({ id, p }),
    remove 
  };
}

export function useRegister() {
  const { mutate: register, isMutating, mutationError, clearError } = useMutation(
    services.authService.register
  );
  return { register, isMutating, mutationError, clearError };
}

export function useUsers(status?: string) {
  const { data, isLoading, error, refetch } = useFetch(
    () => services.usersService.list(status),
    [status]
  );

  const { mutate: create, isMutating: isCreating } = useMutation(
    services.usersService.create,
    () => refetch()
  );

  const { mutate: update, isMutating: isUpdating } = useMutation(
    ({ id, p }: { id: string, p: unknown }) => services.usersService.update(id, p),
    () => refetch()
  );

  const { mutate: updateStatus, isMutating: isUpdatingStatus } = useMutation(
    ({ id, status }: { id: string, status: string }) => services.usersService.updateStatus(id, status),
    () => refetch()
  );

  const { mutate: remove, isMutating: isRemoving } = useMutation(
    (id: string) => services.usersService.delete(id),
    () => refetch()
  );

  const isMutating = isCreating || isUpdating || isUpdatingStatus || isRemoving;

  return { 
    data: data || [], 
    isLoading, error, refetch, 
    isMutating, create, 
    update: (id: string, p: unknown) => update({ id, p }), 
    updateStatus: (id: string, s: string) => updateStatus({ id, status: s }),
    remove 
  };
}

export function useUpdateUserStatus() {
  const { mutate: updateStatus, isMutating, mutationError } = useMutation(
    ({ id, status }: { id: string, status: string }) => services.usersService.updateStatus(id, status)
  );
  return { updateStatus, isMutating, mutationError };
}
export function useBankSummary(params?: { startDate?: string; endDate?: string }) {
  const { data, isLoading, error, refetch } = useFetch(
    () => services.bankService.getSummary(params),
    [params?.startDate, params?.endDate],
    { polling: 10000 }
  );
  return { data, isLoading, error, refetch };
}

export function useExpenses() {
  const { data, isLoading, error, refetch } = useFetch(
    services.expensesService.list,
    []
  );

  const { mutate: create, isMutating: isCreating } = useMutation(
    services.expensesService.create, 
    () => refetch()
  );
  
  const { mutate: update, isMutating: isUpdating } = useMutation(
    ({ id, body }: { id: string, body: unknown }) => services.expensesService.update(id, body), 
    () => refetch()
  );
  
  const { mutate: remove, isMutating: isRemoving } = useMutation(
    (id: string) => services.expensesService.delete(id), 
    () => refetch()
  );
  
  const { mutate: pay, isMutating: isPaying } = useMutation(
    (id: string) => services.expensesService.pay(id), 
    () => refetch()
  );

  const isMutating = isCreating || isUpdating || isRemoving || isPaying;

  return { 
    data: data || [], isLoading, error, refetch, isMutating,
    create, 
    update: (id: string, body: unknown) => update({ id, body }), 
    remove, 
    pay 
  };
}

export function useBankTransactions(params?: Record<string, any>) {
  const { data, isLoading, error, refetch } = useFetch(
    () => services.bankService.getTransactions(params),
    [JSON.stringify(params)]
  );
  return { data: data || [], isLoading, error, refetch };
}

export function useProfile() {
  const { user, refetch: refetchAuth } = useAuth();
  
  const { mutate: updateProfile, isMutating, mutationError } = useMutation(
    services.usersService.updateProfile,
    () => refetchAuth()
  );

  return { user, updateProfile, isMutating, mutationError };
}
export function useUpdateBankGoal() {
  const { refetch } = useDashboardSummary();
  const { mutate, isMutating, mutationError } = useMutation(
    services.bankService.updateGoal,
    () => refetch()
  );

  return { updateGoal: mutate, isMutating, mutationError };
}

// 5. Sofascore Shared Polling Hook (V15)
import { useEffect, useRef } from 'react';

export function useSofascorePolling(operations: any[]) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTabVisible = useRef(true);

  // Filtra operações ativas (pendentes e com ID)
  const activeOps = operations.filter(op => 
    op.status === 'PENDING' && 
    op.sofascoreEventId && 
    op.sofascoreStatus !== 'finished'
  );

  const poll = async () => {
    if (!isTabVisible.current || activeOps.length === 0) return;

    // Deduplica por eventId
    const uniqueEventIds = Array.from(new Set(activeOps.map(op => op.sofascoreEventId)));
    console.log(`[SofascorePolling] Verificando ${uniqueEventIds.length} eventos ativos...`, uniqueEventIds);

    for (const eventId of uniqueEventIds) {
      try {
        // PASSO 1: Verificar Cache no Backend
        const cacheRes = await services.sofascoreService.getCache(eventId);
        
        if (cacheRes.cached) {
          console.log(`[SofascorePolling] Cache HIT para ${eventId}. Pulando fetch externo.`);
          continue; 
        }

        console.log(`[SofascorePolling] Cache MISS para ${eventId}. Buscando no Sofascore...`);

        // PASSO 2: Cache Miss -> Request ao Sofascore (via Browser do Usuário)
        const response = await fetch(`https://api.sofascore.com/api/v1/event/${eventId}`, {
          headers: { 'Accept': 'application/json' },
          referrerPolicy: 'no-referrer'
        });

        if (!response.ok) {
          console.warn(`[SofascorePolling] Falha ao buscar evento ${eventId}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        if (!data?.event) continue;

        const event = data.event;
        console.log(`[SofascorePolling] Dados recebidos para ${eventId}: ${event.homeTeam?.name} ${event.homeScore?.current}x${event.awayScore?.current} ${event.awayTeam?.name}`);

        // Mapeamento conforme especificação V15/V21/V22/V23/V24 (Sugerido pelo Usuário)
        const getSimplifiedPeriod = (status: any, time: any, league: string) => {
          if (!status) return { periodLabel: null, minute: null };

          const leagueLower = league?.toLowerCase() || '';
          const isBasketball = leagueLower.includes('nba') || leagueLower.includes('nbb') || leagueLower.includes('basket');
          const p = status.period;
          const description = status.description || '';

          // Minuto: futebol usa time.played, basquete usa time.played ou status.description
          let minute: string | null = null;
          if (time?.played !== undefined && time?.played !== null) {
            minute = String(time.played);
          } else if (time?.initial !== undefined && time?.initial !== null) {
            minute = String(Math.floor(time.initial / 60));
          } else if (/\d+/.test(description)) {
            minute = description.match(/\d+/)?.[0] || null;
          }

          let periodLabel: string | null = null;
          if (p === 5 || description.toLowerCase().includes('pen')) periodLabel = "PEN";
          else if (isBasketball && p >= 1 && p <= 4) periodLabel = `Q${p}`;
          else if (isBasketball && p > 4) periodLabel = `OT`;
          else if (p === 1) periodLabel = "1T";
          else if (p === 2) periodLabel = "2T";
          else if (p === 3) periodLabel = "ET";
          else if (p === 4) periodLabel = "AP";
          else if (description) periodLabel = description;

          return { periodLabel, minute };
        };

        const { periodLabel, minute } = getSimplifiedPeriod(event.status, event.time, event.tournament?.name || '');

        const mappedData = {
          eventId: String(event.id),
          status: event.status?.type || 'notstarted',
          homeTeam: event.homeTeam?.name,
          awayTeam: event.awayTeam?.name,
          homeScore: event.homeScore?.current ?? null,
          awayScore: event.awayScore?.current ?? null,
          period: periodLabel,
          minute: minute,
          homeLogo: `https://api.sofascore.com/api/v1/team/${event.homeTeam?.id}/image`,
          awayLogo: `https://api.sofascore.com/api/v1/team/${event.awayTeam?.id}/image`,
          startTime: new Date(event.startTimestamp * 1000).toISOString()
        };

        // PASSO 3: Alimentar Cache (Backend salva o cache e atualiza o banco)
        const saveRes = await services.sofascoreService.setCache(eventId, mappedData);
        console.log(`[SofascorePolling] Cache sincronizado para ${eventId}. Ops afetadas: ${saveRes.updatedOperations}`);

        // Delay entre requisições para evitar rate limit do Sofascore
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.error(`[SofascorePolling] Erro crítico para evento ${eventId}:`, error);
      }
    }

    // Notifica sistema local para re-buscar dados das operações atualizadas
    window.dispatchEvent(new CustomEvent('refetch-data'));
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisible.current = document.visibilityState === 'visible';
      if (isTabVisible.current) poll(); // Poll imediato ao voltar
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Determina intervalo adaptativo
    const hasLive = activeOps.some(op => op.sofascoreStatus === 'inprogress');
    const intervalTime = hasLive ? 3000 : 60000;

    if (activeOps.length > 0) {
      intervalRef.current = setInterval(poll, intervalTime);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [JSON.stringify(activeOps.map(op => ({ id: op.id, status: op.sofascoreStatus })))]);
}

