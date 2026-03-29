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
    [params?.status, params?.page, params?.limit, params?.search]
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

export function useUsers() {
  const { data, isLoading, error, refetch } = useFetch(
    services.usersService.list,
    []
  );

  const { mutate: create, isMutating: isCreating } = useMutation(
    services.usersService.create,
    () => refetch()
  );

  const { mutate: update, isMutating: isUpdating } = useMutation(
    ({ id, p }: { id: string, p: unknown }) => services.usersService.update(id, p),
    () => refetch()
  );

  const { mutate: remove, isMutating: isRemoving } = useMutation(
    (id: string) => services.usersService.delete(id),
    () => refetch()
  );

  const isMutating = isCreating || isUpdating || isRemoving;

  return { data, isLoading, error, refetch, isMutating, create, update: (id: string, p: unknown) => update({ id, p }), remove };
}

export function useProfile() {
  const { user, refetch: refetchAuth } = useAuth();
  
  const { mutate: updateProfile, isMutating, mutationError } = useMutation(
    services.usersService.updateProfile,
    () => refetchAuth()
  );

  return { user, updateProfile, isMutating, mutationError };
}
