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
  const finishedEvents = useRef(new Set<string>());
  const previousStatuses = useRef<Record<string, string>>({});

  // Filtra operações ativas (pendentes e com ID)
  const activeOps = (operations || []).filter(op => 
    op && 
    op.status === 'PENDING' && 
    op.sofascoreEventId
  );

  const poll = async () => {
    if (!isTabVisible.current || activeOps.length === 0) return;

    // Deduplica por eventId
    const uniqueEventIds = Array.from(new Set(activeOps.map(op => op.sofascoreEventId)));
    
    for (const eventId of uniqueEventIds) {
      try {
        const response = await fetch(`https://api.sofascore.com/api/v1/event/${eventId}`, {
          headers: { 'Accept': 'application/json' },
          referrerPolicy: 'no-referrer'
        });

        if (!response.ok) continue;
        const data = await response.json();
        const event = data?.event;
        if (!event) continue;

        const getSimplifiedPeriod = (event: any): { periodLabel: string | null; minute: string | null } => {
          const status = event?.status;
          const time = event?.time;
          const currentPeriodStartTimestamp = event?.currentPeriodStartTimestamp;
          const sport = event?.tournament?.category?.sport?.slug || '';
          const league = event?.tournament?.name?.toLowerCase() || '';

          if (!status) return { periodLabel: null, minute: null };

          const isBasketball = sport === 'basketball' ||
            ['nba','nbb','basket','euroleague','nbl','b.league','japan'].some(k => league.includes(k));

          const p = status.period;
          const desc = (status.description || '').toLowerCase();
          const statusType = status.type;

          // Jogo encerrado
          if (statusType === 'finished' || desc.includes('ended') || desc.includes('after')) {
            return { periodLabel: null, minute: null };
          }

          // Intervalo
          if (desc.includes('halftime') || desc.includes('half time') || desc.includes('break')) {
            return { periodLabel: 'Intervalo', minute: null };
          }

          let periodLabel: string | null = null;
          let minute: string | null = null;
          if (isBasketball) {
            // Período de Basquete: Q1, Q2, Q3, Q4, OT etc.
            if (p === 1) periodLabel = 'Q1';
            else if (p === 2) periodLabel = 'Q2';
            else if (p === 3) periodLabel = 'Q3';
            else if (p === 4) periodLabel = 'Q4';
            else if (p === 5) periodLabel = 'OT';
            else if (p > 5) periodLabel = `OT${p - 4}`;
            else if (desc.includes('1st quarter')) periodLabel = 'Q1';
            else if (desc.includes('2nd quarter')) periodLabel = 'Q2';
            else if (desc.includes('3rd quarter')) periodLabel = 'Q3';
            else if (desc.includes('4th quarter')) periodLabel = 'Q4';
            else if (desc.includes('overtime')) periodLabel = 'OT';
            else periodLabel = 'LIVE';

            // Tempo no período
            if (time?.played !== undefined && time?.played !== null) {
              const totalSeconds = time.played;
              const mins = Math.floor(totalSeconds / 60);
              const secs = totalSeconds % 60;
              minute = `${mins}:${String(secs).padStart(2, '0')}`;
            } else if (currentPeriodStartTimestamp) {
              const elapsed = Math.floor(Date.now() / 1000) - currentPeriodStartTimestamp;
              const totalSeconds = (time?.initial || 0) + elapsed;
              const mins = Math.floor(totalSeconds / 60);
              const secs = Math.max(0, Math.min(59, totalSeconds % 60));
              minute = `${mins}:${String(secs).padStart(2, '0')}`;
            }
          } else {
            // Futebol
            if (p === 1 || desc.includes('1st half')) periodLabel = '1º';
            else if (p === 2 || desc.includes('2nd half')) periodLabel = '2º';
            else if (p === 3) periodLabel = 'Prorr.';
            else if (p === 4 || desc.includes('pen')) periodLabel = 'Pen.';

            // Minuto: calcular com currentPeriodStartTimestamp
            if (currentPeriodStartTimestamp && time?.initial !== undefined) {
              const elapsed = Math.floor(Date.now() / 1000) - currentPeriodStartTimestamp;
              const totalMinutes = Math.floor((time.initial + elapsed) / 60);
              if (p === 1 && totalMinutes > 45) minute = '45+';
              else if (p === 2 && totalMinutes > 90) minute = '90+';
              else minute = String(totalMinutes);
            }
          }

          // Se ainda estiver sem minuto mas em progresso, tenta pegar da API se disponível
          if (!minute && !periodLabel && statusType === 'inprogress') {
            periodLabel = 'LIVE';
          }

          return { periodLabel, minute };
        };

        const { periodLabel, minute } = getSimplifiedPeriod(event);

        const mappedData = {
          status: event.status?.type,
          homeScore: event.homeScore?.current ?? null,
          awayScore: event.awayScore?.current ?? null,
          period: periodLabel,
          minute: minute,
          homeLogo: `https://api.sofascore.com/api/v1/team/${event.homeTeam?.id}/image`,
          awayLogo: `https://api.sofascore.com/api/v1/team/${event.awayTeam?.id}/image`,
          startTime: new Date(event.startTimestamp * 1000).toISOString()
        };

        // Atualiza todas as operações que usam esse eventId
        const opsToUpdate = activeOps.filter(op => op.sofascoreEventId === eventId);
        
        const prevStatus = previousStatuses.current[eventId];
        previousStatuses.current[eventId] = mappedData.status;

        for (const op of opsToUpdate) {
          await services.operationsService.updateScore(op.id, mappedData);

          // Se o jogo começou agora (notstarted -> inprogress)
          if (mappedData.status === 'inprogress' && (prevStatus === 'notstarted' || !prevStatus)) {
            window.dispatchEvent(new CustomEvent('game-started', {
              detail: {
                operationId: op.id,
                homeName: event.homeTeam?.name,
                awayName: event.awayTeam?.name,
                homeLogo: mappedData.homeLogo,
                awayLogo: mappedData.awayLogo,
                league: event.tournament?.name
              }
            }));
          }

          // Se o jogo acabou E a operação ainda é pendente, notifica o popup
          if (mappedData.status === 'finished' && op.status === 'PENDING') {
            window.dispatchEvent(new CustomEvent('game-finished', {
              detail: {
                operationId: op.id,
                operationType: op.type,
                homeName: event.homeTeam?.name,
                awayName: event.awayTeam?.name,
                homeScore: mappedData.homeScore,
                awayScore: mappedData.awayScore,
                homeLogo: mappedData.homeLogo,
                awayLogo: mappedData.awayLogo,
                league: event.tournament?.name
              }
            }));
          }
        }

        if (mappedData.status === 'finished') {
          finishedEvents.current.add(eventId);
          window.dispatchEvent(new CustomEvent('refetch-data'));
        }

        // Delay de 500ms entre requests ao Sofascore para evitar bloqueio
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`[SofascorePolling] Erro ao processar evento ${eventId}:`, error);
      }
    }

    window.dispatchEvent(new CustomEvent('refetch-data'));
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisible.current = document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Intervalo adaptativo
    const hasLive = activeOps.some(op => op.sofascoreStatus === 'inprogress');
    const intervalTime = hasLive ? 5000 : 60000;

    if (activeOps.length > 0) {
      intervalRef.current = setInterval(poll, intervalTime);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [JSON.stringify(activeOps.map(op => ({ id: op.id, status: op.sofascoreStatus })))]);
}

