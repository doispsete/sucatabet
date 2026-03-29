export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export enum OperationType {
  NORMAL = 'NORMAL',
  FREEBET_GEN = 'FREEBET_GEN',
  EXTRACAO = 'EXTRACAO',
  BOOST_25 = 'BOOST_25',
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
  lucroSemana: number;
  lucroMes: number;
  lucroPeriodo: number;
  freebetsExpirando: Freebet[];
  atividadeRecente: Operation[];
  alerts?: { type: 'URGENT' | 'INFO', message: string }[];
  performance?: {
    weekly: { label: string, value: number }[];
    monthly: { label: string, value: number }[];
    yearly: { label: string, value: number }[];
  };
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
