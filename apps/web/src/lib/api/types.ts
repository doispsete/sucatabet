export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum OperationType {
  NORMAL = 'NORMAL',
  FREEBET_GEN = 'FREEBET_GEN',
  EXTRACAO = 'EXTRACAO',
  BOOST_25 = 'BOOST_25',
  BOOST_30 = 'BOOST_30',
  BOOST_50 = 'BOOST_50',
  SUPERODDS = 'SUPERODDS',
  TENTATIVA_DUPLO = 'TENTATIVA_DUPLO',
}

export enum OperationCategory {
  GERACAO = 'GERACAO',
  CONVERSAO = 'CONVERSAO',
  BOOST = 'BOOST',
  RISCO = 'RISCO',
}

export enum OperationStatus {
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  CASHOUT = 'CASHOUT',
  VOID = 'VOID',
}

export enum OperationResult {
  DUPLO = 'DUPLO',
  NORMAL = 'NORMAL',
  PROTECAO = 'PROTECAO',
}

export enum FreebetStatus {
  PENDENTE = 'PENDENTE',
  USADA = 'USADA',
  EXPIRADA = 'EXPIRADA',
  EXPIRANDO = 'EXPIRANDO',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  LIMITED = 'LIMITED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  approvedAt?: string;
  createdAt: string;
}

export type AuthUser = User;

export interface CpfProfile {
  id: string;
  cpf: string;
  name: string;
  userId: string;
  accounts?: Account[];
}

export interface BettingHouse {
  id: string;
  name: string;
  domain?: string;
  logoUrl?: string;
}

export interface Account {
  id: string;
  balance: number;
  inOperation: number;
  cpfProfileId: string;
  bettingHouseId: string;
  status: AccountStatus;
  cpfProfile?: CpfProfile;
  bettingHouse?: BettingHouse;
}

export interface Bet {
  id: string;
  odds: number;
  stake: number;
  expectedProfit: number;
  cost?: number;
  side: 'BACK' | 'LAY';
  type: 'Normal' | 'Freebet' | 'Aumento';
  commission?: number;
  isBenefit?: boolean;
  accountId: string;
  operationId: string;
  account?: Account;
  isWinner?: boolean;
}

export interface Operation {
  id: string;
  type: OperationType;
  category: OperationCategory;
  expectedProfit: number;
  realProfit?: number;
  profitDifference?: number;
  status: OperationStatus;
  result?: OperationResult;
  userId: string;
  description?: string;
  generatedFbValue?: number;
  createdAt: string;
  bets?: Bet[];
}

export interface Freebet {
  id: string;
  value: number;
  expiresAt: string;
  usedAt?: string;
  accountId: string;
  account?: Account;
  status?: FreebetStatus; // Calculated
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  executedBy: string;
  oldValue?: unknown;
  newValue?: unknown;
  createdAt: string;
}

export interface WeeklyClub {
  id: string;
  weekStart: string;
  totalStake: number;
  accountId: string;
  account?: Account;
}

export interface DashboardSummary {
  bancaTotal: number;
  disponivel: number;
  emOperacao: number;
  saldoBanco: number;
  lucroSemana: number;
  lucroMes: number;
  lucroPeriodo: number;
  monthlyGoal: number;
  freebetsExpirando: Freebet[];
  atividadeRecente: Operation[];
  alerts?: { type: 'URGENT' | 'INFO', message: string }[];
  performance?: {
    weekly: { label: string, value: number }[];
    monthly: { label: string, value: number }[];
    yearly: { label: string, value: number }[];
  };
  distribuicaoPorResultado?: Record<string, number>;
}

export interface DashboardClub {
  items: ClubAccount[];
  stats: {
    completed: number;
    total: number;
  };
}

export interface ClubAccount {
  accountId: string;
  accountName: string;
  profileName: string;
  meta: number;
  atual: number;
  percentual: number;
  isGroup?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Report {
  period: string;
  totalInvestment: number;
  totalProfit: number;
  count: number;
}

export type ReportGroupBy = 'day' | 'week' | 'month' | 'category' | 'type';

export enum BankTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  ACCOUNT_DEPOSIT = 'ACCOUNT_DEPOSIT',
  ACCOUNT_WITHDRAW = 'ACCOUNT_WITHDRAW',
  EXPENSE_PAYMENT = 'EXPENSE_PAYMENT',
  INCOME = 'INCOME',
}

export enum ExpenseType {
  OPERACIONAL = 'OPERACIONAL',
  PESSOAL = 'PESSOAL',
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface BankAccount {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  type: BankTransactionType;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  bankAccountId: string;
  name: string;
  type: ExpenseType;
  amount: number;
  dueDay: number;
  recurring: boolean;
  totalOccurrences?: number | null;
  remainingOccurrences?: number | null;
  lastPaidAt?: string;
  nextDueAt: string;
  status: ExpenseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BankSummary {
  balance: number;
  totalInAccounts: number;
  totalPatrimony: number;
  monthlyGrossProfit: number;
  monthlyExpenses: number;
  monthlyNetProfit: number;
  nextExpenses: Expense[];
  recentTransactions: BankTransaction[];
  compassData: {
    monthly: any[];
    categories: any[];
  }
}
