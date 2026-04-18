import { api } from './client';
import * as T from './types';

export const authService = {
  login: (body: unknown) => api.post<T.AuthUser>('/auth/login', body),
  register: (body: unknown) => api.post<{ message: string }>('/auth/register', body),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<T.AuthUser>('/auth/me'),
  refresh: () => api.post<T.AuthUser>('/auth/refresh'),
};

export const dashboardService = {
  getSummary: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(Object.entries(params || {}).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])).toString();
    return api.get<T.DashboardSummary>(`/dashboard/summary${query ? `?${query}` : ''}`);
  },
  getClub: () => api.get<T.DashboardClub>('/dashboard/club'),
};

export const usersService = {
  list: (status?: string) => api.get<T.User[]>(`/users${status ? `?status=${status}` : ''}`),
  create: (body: unknown) => api.post<T.User>('/users', body),
  update: (id: string, body: unknown) => api.patch<T.User>(`/users/${id}`, body),
  updateStatus: (id: string, status: string) => api.patch<T.User>(`/users/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/users/${id}`),
  updateProfile: (body: unknown) => api.patch<T.User>('/users/profile', body),
};

export const cpfProfilesService = {
  list: (targetUserId?: string) => 
    api.get<T.CpfProfile[]>(`/cpf-profiles${targetUserId ? `?targetUserId=${targetUserId}` : ''}`),
  create: (body: unknown) => api.post<T.CpfProfile>('/cpf-profiles', body),
  update: (id: string, body: unknown) => api.patch<T.CpfProfile>(`/cpf-profiles/${id}`, body),
  delete: (id: string) => api.delete(`/cpf-profiles/${id}`),
};

export const housesService = {
  list: () => api.get<T.BettingHouse[]>('/houses'),
  create: (body: unknown) => api.post<T.BettingHouse>('/houses', body),
  update: (id: string, body: unknown) => api.patch<T.BettingHouse>(`/houses/${id}`, body),
  delete: (id: string) => api.delete<void>(`/houses/${id}`),
};

export const accountsService = {
  list: () => api.get<T.Account[]>('/accounts'),
  create: (body: unknown) => api.post<T.Account>('/accounts', body),
  update: (id: string, body: unknown) => api.patch<T.Account>(`/accounts/${id}`, body),
  delete: (id: string) => api.delete<void>(`/accounts/${id}`),
  deposit: (id: string, amount: number) => api.post<T.Account>(`/accounts/${id}/deposit`, { amount }),
  withdraw: (id: string, amount: number) => api.post<T.Account>(`/accounts/${id}/withdraw`, { amount }),
  getHistory: (id: string) => api.get<any[]>(`/accounts/${id}/history`),
};

export const operationsService = {
  list: (params?: Record<string, unknown>) => {
    const query = new URLSearchParams(Object.entries(params || {}).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])).toString();
    return api.get<T.PaginatedResponse<T.Operation>>(`/operations?${query}`);
  },
  create: (body: unknown) => api.post<T.Operation>('/operations', body),
  update: (id: string, body: unknown) => api.patch<T.Operation>(`/operations/${id}`, body),
  close: (id: string, body: unknown) => api.patch<T.Operation>(`/operations/${id}/close`, body),
  void: (id: string) => api.patch<T.Operation>(`/operations/${id}/void`),
  delete: (id: string) => api.delete<void>(`/operations/${id}`),
  linkGame: (id: string, sofascoreEventId: string) => api.patch<T.Operation>(`/operations/${id}/link-game`, { sofascoreEventId }),
};

export const sofascoreService = {
  // A busca agora é feita diretamente no componente GameSearch.tsx via fetch do navegador
};

export const freebetsService = {
  list: () => api.get<T.Freebet[]>('/freebets'),
  create: (body: unknown) => api.post<T.Freebet>('/freebets', body),
  update: (id: string, body: unknown) => api.patch<T.Freebet>(`/freebets/${id}`, body),
  delete: (id: string) => api.delete(`/freebets/${id}`),
};

export const reportsService = {
  get: (params: { from: string, to: string, groupBy: T.ReportGroupBy }) => {
    const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
    return api.get<T.Report[]>(`/reports?${query}`);
  },
};

export const bankService = {
  getBank: () => api.get<T.BankAccount>('/bank'),
  getSummary: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(Object.entries(params || {}).filter(([_, v]) => v != null && v !== '').map(([k, v]) => [k, String(v)])).toString();
    return api.get<T.BankSummary>(`/bank/summary${query ? `?${query}` : ''}`);
  },
  getTransactions: (params?: Record<string, any>) => {
    const query = new URLSearchParams(Object.entries(params || {}).filter(([_, v]) => v != null && v !== '').map(([k, v]) => [k, String(v)])).toString();
    return api.get<T.BankTransaction[]>(`/bank/transactions${query ? `?${query}` : ''}`);
  },
  deposit: (body: { amount: number; description: string }) => api.post<T.BankTransaction>('/bank/deposit', body),
  withdraw: (body: { amount: number; description: string }) => api.post<T.BankTransaction>('/bank/withdraw', body),
  updateGoal: (goal: number) => api.patch<void>('/bank/goal', { goal }),
};

export const expensesService = {
  list: () => api.get<T.Expense[]>('/expenses'),
  create: (body: unknown) => api.post<T.Expense>('/expenses', body),
  update: (id: string, body: unknown) => api.patch<T.Expense>(`/expenses/${id}`, body),
  delete: (id: string) => api.delete<void>(`/expenses/${id}`),
  pay: (id: string) => api.post<T.Expense>(`/expenses/${id}/pay`),
};

export const stripeService = {
  createCheckoutSession: (productId: string) => api.post<{url: string}>('/stripe/checkout', { productId }),
  createPortalSession: () => api.post<{url: string}>('/stripe/portal'),
};
