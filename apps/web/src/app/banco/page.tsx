"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight,
  Receipt,
  PiggyBank,
  CheckCircle2,
  Trash2,
  Edit2,
  Pencil,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useBankSummary, useExpenses, useBankTransactions } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { SkeletonCard, CustomSelect, CustomDateRangePicker } from "@/components/ui/components";
import { ExpenseModal } from "@/components/modals/ExpenseModal";
import { DepositWithdrawModal } from "@/components/modals/DepositWithdrawModal";
import { BankHistoryModal } from "@/components/modals/BankHistoryModal";
import { Expense } from "@/lib/api/types";

type Tab = 'overview' | 'expenses' | 'transactions';

function NextExpenses({ summary, onAction }: { summary: any, onAction: () => void }) {
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('PENDING');

  const filteredExpenses = useMemo(() => {
    let list = summary.nextExpenses || [];
    if (filter === 'PAID') {
      list = list.filter((exp: any) => exp.status === 'PAID');
    } else if (filter === 'PENDING') {
      list = list.filter((exp: any) => exp.status !== 'PAID');
    }
    return list.slice(0, 4);
  }, [summary.nextExpenses, filter]);

  const getUrgencyStyles = (date: string, isPaid: boolean) => {
    if (isPaid) return { text: 'text-primary', pulse: false };
    
    const due = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return { text: 'text-red-500', pulse: true };
    if (diffDays < 3) return { text: 'text-amber-500', pulse: false };
    return { text: 'text-primary', pulse: false };
  };

  return (
    <div className="glass-card rounded-[32px] p-8 border border-white/5 relative overflow-visible group h-fit">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-[12px] font-black italic uppercase tracking-widest text-[#b9cbbc]/60 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Próximos Pagamentos
        </h4>
        <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/5">
          {[
            { id: 'PENDING', label: 'Faltam' },
            { id: 'PAID', label: 'Pagos' },
            { id: 'ALL', label: 'Todos' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-wider transition-all ${
                filter === f.id ? 'bg-primary text-black shadow-[0_0_10px_#03D791]' : 'text-[#b9cbbc]/40 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExpenses.map((exp: any) => {
          const urgency = getUrgencyStyles(exp.nextDueAt, exp.status === 'PAID');
          
          return (
            <div 
              key={exp.id} 
              onClick={() => exp.status !== 'PAID' && onAction()}
              className={`flex justify-between items-center p-4 rounded-2xl border transition-all cursor-pointer
                ${exp.status === 'PAID' 
                  ? 'bg-primary/5 border-primary/20 opacity-60' 
                  : urgency.pulse 
                    ? 'bg-red-500/5 border-red-500/30 animate-blink-red-slow' 
                    : 'bg-white/5 border-white/5 hover:border-primary/20 hover:bg-white/[0.08]'}`}
            >
              <div className="min-w-0 flex-1 mr-4">
                <div className="flex items-center gap-3">
                  <p className={`text-[13px] font-black italic uppercase truncate ${urgency.pulse ? 'text-red-500' : 'text-white'}`}>
                    {exp.name} 
                    {exp.totalOccurrences && (
                      <span className="ml-1 text-[#b9cbbc]/40 text-[11px]">
                        ({exp.totalOccurrences - (exp.remainingOccurrences || 0) + (exp.status === 'PAID' ? 0 : 1)}/{exp.totalOccurrences})
                      </span>
                    )}
                  </p>
                  {exp.status === 'PAID' && (
                    <span className="text-[8px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">PAGO</span>
                  )}
                </div>
                <p className={`text-[10px] font-bold uppercase mt-1 ${urgency.pulse ? 'text-red-500/60' : 'text-[#b9cbbc]/40'}`}>
                  {exp.status === 'PAID' 
                    ? `Pago em ${new Date(exp.lastPaidAt).toLocaleDateString()} | Próximo: ${new Date(exp.nextDueAt).toLocaleDateString()}` 
                    : 'Vence ' + new Date(exp.nextDueAt).toLocaleDateString()}
                </p>
              </div>
              <p className={`text-sm font-black italic tracking-tight whitespace-nowrap ${urgency.text}`}>
                R$ {formatCurrency(exp.amount)}
              </p>
            </div>
          );
        })}
        {filteredExpenses.length === 0 && (
          <div className="py-10 text-center opacity-10 text-[9px] font-black uppercase tracking-widest italic">
            Nenhuma despesa para mostrar
          </div>
        )}
      </div>
    </div>
  );
}

export default function BancoPage() {
  const [activeTab, setActiveTab] = useState<Tab>('transactions');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<any>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyCategory, setHistoryCategory] = useState<'Despesas' | 'Casas' | 'Manual' | ''>('');
  const [txMode, setTxMode] = useState<'deposit' | 'withdraw'>('deposit');
  
  // Filtros de Transações
  const [txFilters, setTxFilters] = useState({
    search: '',
    mode: '' as '' | 'IN' | 'OUT',
    type: '',
    period: '30', // dias
    startDate: '',
    endDate: ''
  });

  const [bankFilters, setBankFilters] = useState({
    period: '6',
    startDate: '',
    endDate: ''
  });

  const bankSummaryParams = useMemo(() => {
    if (bankFilters.period === 'custom') {
      return { startDate: bankFilters.startDate, endDate: bankFilters.endDate };
    }
    if (bankFilters.period === 'all') return {};
    
    // Calculate start date based on months
    const start = new Date();
    start.setMonth(start.getMonth() - parseInt(bankFilters.period) + 1);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    
    return { 
      startDate: start.toISOString(),
      endDate: new Date().toISOString()
    };
  }, [bankFilters.period, bankFilters.startDate, bankFilters.endDate]);

  const { data: bankSummary, isLoading: isBankLoading, refetch: refetchBank } = useBankSummary(bankSummaryParams);
  const { data: expenses, isLoading: isExpensesLoading, pay, remove, refetch: refetchExpenses } = useExpenses();
  
  const filterParams = useMemo(() => {
    const params: any = {};
    if (txFilters.search) params.search = txFilters.search;
    if (txFilters.mode) params.mode = txFilters.mode;
    if (txFilters.type) params.type = txFilters.type;
    
    if (txFilters.period === 'custom') {
      if (txFilters.startDate) params.startDate = txFilters.startDate;
      if (txFilters.endDate) params.endDate = txFilters.endDate;
    } else if (txFilters.period !== 'all') {
      const start = new Date();
      start.setDate(start.getDate() - parseInt(txFilters.period));
      params.startDate = start.toISOString();
    }
    return params;
  }, [txFilters.search, txFilters.mode, txFilters.type, txFilters.period, txFilters.startDate, txFilters.endDate]);

  const { data: transactions, isLoading: isTxLoading, refetch: refetchTransactions } = useBankTransactions(filterParams);
  
  const expenseStats = useMemo(() => {
    if (!expenses) return { total: 0, paid: 0, pending: 0 };
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthExpenses = expenses.filter(exp => {
      const due = new Date(exp.nextDueAt);
      return (due.getMonth() === currentMonth && due.getFullYear() === currentYear) || exp.status === 'PAID';
    });

    const total = thisMonthExpenses.reduce((acc, exp) => acc + exp.amount, 0);
    const paid = thisMonthExpenses.filter(exp => exp.status === 'PAID').reduce((acc, exp) => acc + exp.amount, 0);
    const pending = total - paid;

    return { total, paid, pending };
  }, [expenses]);

  // Only show skeleton on initial load
  if (isBankLoading && !bankSummary) {
    return (
      <div className="space-y-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="glass-card rounded-[40px] p-8 h-[400px] animate-pulse bg-white/5" />
          </div>
          <div className="lg:col-span-4">
            <div className="glass-card rounded-[40px] p-8 h-[400px] animate-pulse bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!bankSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-bold uppercase tracking-tight">Erro ao carregar dados bancários. Tente novamente mais tarde.</p>
        </div>
        <button
          onClick={() => refetchBank()}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-3 md:px-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Gestão Financeira</h1>
          <p className="text-[10px] text-[#b9cbbc]/40 font-black uppercase tracking-[0.2em] italic">Controle de banca, despesas e patrimônio</p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldos Totais (2 Colunas) */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[40px] border border-white/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-[0.2em] mb-2 italic opacity-40">SALDOS TOTAIS</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">
                R$ {formatCurrency(bankSummary.totalPatrimony)}
              </h3>
              <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1 opacity-60 italic">Patrimônio Consolidado</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <PiggyBank className="text-primary w-6 h-6" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5 relative z-10">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-30 italic">Saldo Bancário</p>
              <p className="text-xl font-black text-white italic">R$ {formatCurrency(bankSummary.balance)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-30 italic">Valor em Banca</p>
              <p className="text-xl font-black text-white/60 italic">R$ {formatCurrency(bankSummary.totalInAccounts)}</p>
            </div>
          </div>

          <Wallet className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Despesas (1 Coluna) */}
        <div className="glass-card p-7 rounded-[32px] border border-white/5 flex flex-col justify-between group relative overflow-visible">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[9px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-40 italic">DESPESAS (MÊS)</p>
              <div className="p-2 bg-white/5 rounded-xl"><Receipt className="text-red-500" /></div>
            </div>
            <h3 className="text-4xl font-black text-white italic tracking-tighter">R$ {formatCurrency(expenseStats.total)}</h3>
            
            <div className="flex gap-4 mt-6 pt-4 border-t border-white/5">
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-primary uppercase tracking-widest">PAGO</p>
                <p className="text-sm font-black text-primary italic">R$ {formatCurrency(expenseStats.paid)}</p>
              </div>
              <div className="space-y-0.5" title="Falta pagar">
                <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">FALTA PAGAR</p>
                <p className="text-sm font-black text-red-500 italic">R$ {formatCurrency(expenseStats.pending)}</p>
              </div>
            </div>
          </div>
          <div className={`absolute -bottom-2 -right-2 w-16 h-16 pointer-events-none opacity-5 group-hover:opacity-10 transition-all text-red-500`}>
            <Receipt className="w-full h-full" />
          </div>
        </div>

        {/* Lucro Líquido (1 Coluna) */}
        <StatCard 
          title="LUCRO LÍQUIDO (MÊS)" 
          value={`R$ ${formatCurrency(bankSummary.monthlyNetProfit)}`} 
          icon={<TrendingUp className={bankSummary.monthlyNetProfit >= 0 ? "text-primary" : "text-red-500"} />} 
          color={bankSummary.monthlyNetProfit >= 0 ? "primary" : "danger"}
        />
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Tabs Selection */}
        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 w-fit">
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'transactions' ? 'bg-primary text-black shadow-[0_0_20px_rgba(3,215,145,0.3)]' : 'text-[#b9cbbc]/40 hover:text-white'
            }`}
          >
            Movimentações
          </button>
          <button 
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'expenses' ? 'bg-primary text-black shadow-[0_0_20px_rgba(3,215,145,0.3)]' : 'text-[#b9cbbc]/40 hover:text-white'
            }`}
          >
            Despesas
          </button>
        </div>

        {/* Action Buttons Moved Here */}
        <div className="flex gap-3 w-full lg:w-auto">
          <button 
            onClick={() => { setTxMode('withdraw'); setIsTxModalOpen(true); }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#b9cbbc] transition-all border border-white/5"
          >
            <ArrowDownLeft className="w-4 h-4 text-red-500" /> RETIRADA
          </button>
          <button 
            onClick={() => { setTxMode('deposit'); setIsTxModalOpen(true); }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#b9cbbc] transition-all border border-white/5"
          >
            <ArrowUpRight className="w-4 h-4 text-primary" /> DEPÓSITO
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'expenses' && (
          <ExpensesTab 
            expenses={expenses} 
            onPay={pay} 
            onDelete={remove} 
            onEdit={(exp) => { setExpenseToEdit(exp); setIsExpenseModalOpen(true); }} 
            onNewExpense={() => { setExpenseToEdit(null); setIsExpenseModalOpen(true); }}
            refetchBank={refetchBank}
            refetchExpenses={refetchExpenses}
          />
        )}
        {activeTab === 'transactions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col h-full">
              <TransactionsTab 
                transactions={(transactions || []).slice(0, 15)} 
                filters={txFilters}
                onFilterChange={setTxFilters}
                isLoading={isTxLoading}
                onShowFullHistory={() => setIsHistoryModalOpen(true)}
              />
            </div>
            <div className="space-y-8 flex flex-col h-full">
              <NextExpenses 
                summary={bankSummary} 
                onAction={() => setActiveTab('expenses')} 
              />
              <OverviewTab 
                summary={bankSummary} 
                filters={bankFilters}
                onFilterChange={setBankFilters}
                onCategoryClick={(cat) => {
                  setHistoryCategory(cat as any);
                  setIsHistoryModalOpen(true);
                }}
              />
            </div>
          </div>
        )}
      </div>

      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        expenseToEdit={expenseToEdit}
      />

      <DepositWithdrawModal 
        isOpen={isTxModalOpen} 
        onClose={() => setIsTxModalOpen(false)} 
        mode={txMode}
        onSuccess={() => {
          refetchBank();
          refetchTransactions();
          refetchExpenses();
        }}
      />

      <BankHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryCategory('');
        }}
        initialCategory={historyCategory}
      />
    </div>
  );
}

const typeMap: Record<string, { label: string, color: string }> = {
  'DEPOSIT': { label: 'Depósito Manual', color: 'primary' },
  'WITHDRAW': { label: 'Saque Manual', color: 'danger' },
  'ACCOUNT_DEPOSIT': { label: 'Depósito em Casa', color: 'danger' },
  'ACCOUNT_WITHDRAW': { label: 'Saque de Casa', color: 'primary' },
  'EXPENSE_PAYMENT': { label: 'Pagto Despesa', color: 'danger' },
};

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: 'primary' | 'danger' }) {
  return (
    <div className="glass-card p-7 rounded-[32px] border border-white/5 flex flex-col justify-between group relative overflow-visible">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[9px] font-black text-[#b9cbbc] uppercase tracking-widest opacity-40 italic">{title}</p>
          <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
        </div>
        <h3 className="text-4xl font-black text-white italic tracking-tighter">{value}</h3>
      </div>
      <div className={`absolute -bottom-2 -right-2 w-16 h-16 pointer-events-none opacity-5 group-hover:opacity-10 transition-all ${color === 'primary' ? 'text-primary' : 'text-red-500'}`}>
        {icon}
      </div>
    </div>
  );
}


function OverviewTab({ summary, filters, onFilterChange, onCategoryClick }: { 
  summary: any, 
  filters: any, 
  onFilterChange: (f: any) => void,
  onCategoryClick: (cat: string) => void
}) {
  const [viewMode, setViewMode] = useState<'INCOME' | 'EXPENSE' | 'GERAL'>('GERAL');
  const [hoveredMonth, setHoveredMonth] = useState<any>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  const compass = summary.compassData || { monthly: [], categories: [] };
  const filteredMonthly = compass.monthly;

  const totalIncome = filteredMonthly.reduce((acc: number, curr: any) => acc + curr.income, 0);
  const totalExpense = filteredMonthly.reduce((acc: number, curr: any) => acc + curr.expense, 0);

  const selectedMonth = selectedMonthKey ? filteredMonthly.find((m: any) => m.key === selectedMonthKey) : null;
  const displayIncome = selectedMonth ? selectedMonth.income : totalIncome;
  const displayExpense = selectedMonth ? selectedMonth.expense : totalExpense;
  const displayCategories = selectedMonth ? selectedMonth.categories : compass.categories;

  const maxVal = useMemo(() => {
    const vals = filteredMonthly.map((m: any) => Math.max(m.income, m.expense));
    return Math.max(...vals, 1) * 1.15; // 15% buffer as ceiling
  }, [filteredMonthly]);

  const markers = useMemo(() => {
    return [maxVal, maxVal * 0.8, maxVal * 0.6, maxVal * 0.4, maxVal * 0.2, 0].map(v => {
      if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
      return Math.round(v).toLocaleString('pt-BR');
    });
  }, [maxVal]);

  return (
    <div className="space-y-6">
      <section className="bg-[#0b0b0b] rounded-[40px] border border-white/5 shadow-2xl relative transition-transform duration-500 hover:scale-[1.02] transform-gpu hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] z-10 group/section">
        {/* Controls Layout: Periods Left, Modes Right */}
        <div className="px-6 py-4 flex items-center justify-between gap-6 flex-wrap border-b border-white/5 bg-white/[0.01] relative z-20 rounded-t-[40px]">
          {/* Left: Period Selectors */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1 p-1 bg-white/[0.1] border border-white/5 rounded-full shadow-inner">
              {[
                { id: '1', label: '1 Mês' },
                { id: '3', label: '3 Meses' },
                { id: 'all', label: 'Histórico' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => onFilterChange({ ...filters, period: p.id })}
                  className={`px-6 py-2 rounded-full text-[8.5px] font-black uppercase tracking-widest transition-all ${
                    filters.period === p.id 
                      ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,0.25)] text-black scale-105' 
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            
            <CustomDateRangePicker 
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={(start, end) => onFilterChange({ ...filters, period: 'custom', startDate: start, endDate: end })}
              className="w-auto h-auto"
              placeholder="CALENDÁRIO"
              customTrigger={(open) => (
                <button
                  onClick={open}
                  className={`px-4 py-2.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                    filters.period === 'custom' 
                      ? 'bg-primary border-primary text-black shadow-[0_0_30px_rgba(3,215,145,0.3)]' 
                      : 'bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Calendar size={12} className="opacity-80" /> Calendário
                </button>
              )}
            />
          </div>

          {/* Right: Mode Switcher */}
          <div className="bg-white/[0.1] p-1 rounded-[16px] border border-white/5 flex gap-1">
            {[
              { id: 'INCOME', label: 'Entradas' },
              { id: 'EXPENSE', label: 'Saídas' },
              { id: 'GERAL', label: 'Geral' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id as any)}
                className={`px-6 py-2 rounded-[14px] text-[9.5px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                  viewMode === m.id 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="px-6 pt-16 pb-6 relative">
          <div className="flex gap-2 h-72 relative">
            {/* Eixo Y - Marcadores */}
            <div className="flex flex-col justify-between h-full py-0 text-[10px] font-black text-white italic uppercase text-right w-12 border-r border-white/5 pr-4 pb-12">
              {markers.map((m, idx) => (
                <span key={idx} className="leading-none">{m}</span>
              ))}
            </div>

            <div className="flex-1 h-full flex justify-between items-end gap-1 relative px-2 border-b border-white/10 pb-12">
              {/* Linhas de grade horizontais */}
              <div className="absolute left-0 right-0 h-full flex flex-col justify-between pointer-events-none opacity-[0.05] bottom-12">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-full border-t border-white" />)}
              </div>

              {filteredMonthly.map((m: any, i: number) => {
                const maxHeightPct = maxVal ? (Math.max(m.income, m.expense) / maxVal) * 85 : 0;
                
                return (
                  <div 
                    key={m.key} 
                    className={`flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer transition-all ${selectedMonthKey === m.key ? 'bg-white/[0.03]' : ''}`}
                    onMouseEnter={() => setHoveredMonth(m)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    onClick={() => setSelectedMonthKey(selectedMonthKey === m.key ? null : m.key)}
                  >
                    {/* Dynamic Tooltip Container - Matches highest bar */}
                    <div 
                      className="absolute bottom-12 w-full flex justify-center z-[100] pointer-events-none"
                      style={{ height: `${maxHeightPct}%` }}
                    >
                      {hoveredMonth?.key === m.key && (
                        <div className="absolute bottom-[calc(100%+8px)] mb-0 bg-[#0d0d0d] border border-primary/40 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] min-w-[190px] rounded-[24px] pointer-events-auto z-[200]">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-primary italic uppercase tracking-[0.2em] mb-0.5">
                              {m.label}
                            </span>
                            
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-6">
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">ENTRADAS</span>
                                <span className="text-[14px] font-black text-[#03D791] italic tracking-tighter">R$ {formatCurrency(m.income)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-6">
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">SAÍDAS</span>
                                <span className="text-[14px] font-black text-[#ef4444] italic tracking-tighter">-R$ {formatCurrency(m.expense)}</span>
                              </div>
                              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-6">
                                <span className="text-[10px] font-black text-white italic uppercase tracking-widest">SALDO</span>
                                <span className={`text-[14px] font-black italic tracking-tighter ${m.income >= m.expense ? 'text-primary' : 'text-red-500'}`}>
                                  R$ {formatCurrency(m.income - m.expense)}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Tail */}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0d0d0d] border-r border-b border-primary/40 rotate-45" />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-[1px] items-end w-full max-w-[28px] h-full pt-10 group-hover:scale-y-110 group-hover:scale-x-105 transition-transform will-change-transform origin-bottom">
                      {(viewMode === 'INCOME' || viewMode === 'GERAL') && (
                        <div 
                          className={`flex-1 rounded-t-full transition-all duration-300 relative ${
                            viewMode === 'GERAL' ? 'w-1/2' : 'w-full'
                          } ${hoveredMonth?.key === m.key || selectedMonthKey === m.key ? 'bg-primary shadow-[0_0_20px_rgba(3,215,145,0.6)]' : 'bg-primary/50'}`}
                          style={{ height: `${maxVal ? (m.income / maxVal) * 85 : 0}%` }}
                        />
                      )}
                      {(viewMode === 'EXPENSE' || viewMode === 'GERAL') && (
                        <div 
                          className={`flex-1 rounded-t-full transition-all duration-300 relative ${
                            viewMode === 'GERAL' ? 'w-1/2' : 'w-full'
                          } ${hoveredMonth?.key === m.key || selectedMonthKey === m.key ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-red-500/50'}`}
                          style={{ height: `${maxVal ? (m.expense / maxVal) * 85 : 0}%` }}
                        />
                      )}
                    </div>

                    <span className={`absolute -bottom-10 text-[11px] font-black transition-all uppercase tracking-widest leading-none ${hoveredMonth?.key === m.key || selectedMonthKey === m.key ? 'text-white scale-110' : 'text-white/50'}`}>
                      {i === 0 || filteredMonthly[i-1].label !== m.label ? m.label : ''}
                    </span>
                    
                    {(hoveredMonth?.key === m.key || selectedMonthKey === m.key) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white absolute -bottom-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="p-10 border-t border-white/5 space-y-8 bg-white/[0.01]">
          {(viewMode === 'INCOME' || viewMode === 'GERAL') && (
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-full bg-[#03D791]/10 flex items-center justify-center border border-[#03D791]/20 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="text-[#03D791]" size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-3xl font-black text-white italic tracking-tighter">R$ {formatCurrency(displayIncome)}</h4>
                <p className="text-[11px] font-black text-[#b9cbbc]/60 uppercase tracking-widest leading-relaxed">
                  {selectedMonth ? `Entrada total em ${selectedMonth.label}` : (filters.period === 'all' ? 'Entrada total em todo o histórico' : filters.period === 'custom' ? 'Entrada total no período selecionado' : `Entrada total nos últimos ${filters.period === '1' ? '30 dias' : `${filters.period} meses`}`)}
                </p>
                <div className="w-8 h-1 bg-[#03D791] rounded-full shadow-[0_0_10px_#03D791]" />
              </div>
            </div>
          )}

          {(viewMode === 'EXPENSE' || viewMode === 'GERAL') && (
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="text-red-500" size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-3xl font-black text-white italic tracking-tighter">-R$ {formatCurrency(displayExpense)}</h4>
                <p className="text-[11px] font-black text-[#b9cbbc]/60 uppercase tracking-widest leading-relaxed">
                  {selectedMonth ? `Saída total em ${selectedMonth.label}` : (filters.period === 'all' ? 'Saída total em todo o histórico' : filters.period === 'custom' ? 'Saída total no período selecionado' : `Saída total nos últimos ${filters.period === '1' ? '30 dias' : `${filters.period} meses`}`)}
                </p>
                <div className="w-8 h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="glass-card rounded-[40px] p-6 border border-white/5 shadow-2xl transition-transform duration-500 hover:scale-[1.02] transform-gpu hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
<div className="flex justify-between items-center mb-10">
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Categorias {selectedMonth ? `em ${selectedMonth.label}` : `de ${viewMode === 'INCOME' ? 'entrada' : 'saída'}`}</h3>
          {selectedMonthKey && (
            <button 
              onClick={() => setSelectedMonthKey(null)}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
              Ver Tudo
            </button>
          )}
        </div>
        <div className="space-y-8">
          {displayCategories
            .filter((c: any) => viewMode === 'GERAL' || c.type === (viewMode === 'INCOME' ? 'INCOME' : 'EXPENSE'))
            .map((cat: any, i: number) => {
              const percentage = (cat.amount / (cat.type === 'INCOME' ? displayIncome : displayExpense)) * 100 || 0;
              return (
                <div 
                  key={i} 
                  onClick={() => onCategoryClick(cat.name)}
                  className="flex items-center gap-6 group cursor-pointer hover:translate-x-2 transition-transform"
                >
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/20 transition-all">
                    <Receipt className="text-[#b9cbbc]/40 group-hover:text-primary transition-colors" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="text-sm font-black text-white uppercase italic">{cat.name}</h5>
                      <span className="text-sm font-black text-white italic">R$ {formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-black text-[#b9cbbc]/40 uppercase tracking-widest">
                      <span>{percentage.toFixed(2)}%</span>
                      <ChevronRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              );
            })}
            
            {compass.categories.length === 0 && (
              <div className="text-center py-10 opacity-20 text-[10px] font-black uppercase tracking-widest italic">
                Nenhum dado categorizado neste período
              </div>
            )}
        </div>
      </section>
    </div>
  );
}

function ExpensesTab({ expenses, onPay, onDelete, onEdit, onNewExpense, refetchBank, refetchExpenses }: { 
  expenses: any[], 
  onPay: (id: string) => void, 
  onDelete: (id: string) => void,
  onEdit: (exp: any) => void,
  onNewExpense: () => void,
  refetchBank: () => void,
  refetchExpenses: () => void
}) {
  return (
    <section className="glass-card rounded-[40px] border border-white/5 overflow-hidden">
      <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <h3 className="text-lg font-black italic uppercase tracking-tight">Controle de Despesas</h3>
        <button 
          onClick={onNewExpense}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)]"
        >
          <Plus className="w-4 h-4" /> NOVA DESPESA
        </button>
      </div>
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] uppercase tracking-[0.2em] text-[#b9cbbc]/40 border-b border-white/5">
              <th className="px-8 py-6 font-black">Despesa / Tipo</th>
              <th className="px-8 py-6 font-black">Valor</th>
              <th className="px-8 py-6 font-black">Vencimento</th>
              <th className="px-8 py-6 font-black text-center">Status</th>
              <th className="px-8 py-6 font-black text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {expenses.map((exp) => {
              const due = new Date(exp.nextDueAt);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isCritical = exp.status !== 'PAID' && diffDays < 1;
              const isWarning = exp.status !== 'PAID' && diffDays < 3;

              return (
                <tr key={exp.id} className={`transition-colors group ${isCritical ? 'animate-blink-red-slow bg-red-500/5' : 'hover:bg-white/[0.02]'}`}>
                  <td className="px-8 py-6">
                    <p className={`text-[12px] font-black italic uppercase tracking-tight leading-none mb-1 transition-colors
                      ${isCritical ? 'text-red-500' : 'text-white group-hover:text-primary'}`}>
                      {exp.name}
                      {exp.totalOccurrences && (
                        <span className={`ml-2 text-[10px] ${isCritical ? 'text-red-500/40' : 'text-[#b9cbbc]/30'}`}>
                          ({exp.totalOccurrences - (exp.remainingOccurrences || 0) + (exp.status === 'PAID' ? 0 : 1)}/{exp.totalOccurrences})
                        </span>
                      )}
                    </p>
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isCritical ? 'text-red-500/30' : 'text-[#b9cbbc]/30'}`}>
                      {exp.type} • {exp.recurring ? (exp.totalOccurrences ? 'Parcelado' : 'Recorrente') : 'Única'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className={`text-[14px] font-black italic tracking-tight ${isCritical ? 'text-red-500' : 'text-white'}`}>
                      R$ {formatCurrency(exp.amount)}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className={`text-[11px] font-black italic tracking-tight
                      ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-[#e5e2e1]'}`}>
                      {new Date(exp.nextDueAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-[0.15em] border transition-all ${
                      exp.status === 'PAID' 
                        ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(11,235,114,0.1)]' 
                        : isCritical
                          ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                          : isWarning
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/50'
                            : 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                    }`}>
                      {exp.status === 'PAID' ? 'PAGO' : isCritical ? 'URGENTE' : 'PENDENTE'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      {exp.status !== 'PAID' && (
                        <button 
                          onClick={async () => {
                            await onPay(exp.id);
                            refetchBank();
                            refetchExpenses();
                          }}
                          className={`p-3 rounded-2xl transition-all group/btn
                            ${isCritical ? 'bg-white text-red-500 hover:bg-white/90' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                          title="Pagar despesa"
                        >
                          <CheckCircle2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                      )}
                      <button 
                        onClick={() => onEdit(exp)}
                        className={`p-3 rounded-2xl transition-all
                          ${isCritical ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-[#b9cbbc] hover:bg-white/10'}`}
                        title="Editar despesa"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(exp.id)}
                        className={`p-3 rounded-2xl transition-all
                          ${isCritical ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-500/5 text-red-500 hover:bg-red-500/10'}`}
                        title="Excluir despesa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-[#b9cbbc]/20 font-black uppercase italic tracking-widest">
                  Nenhuma despesa cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TransactionsTab({ transactions, filters, onFilterChange, isLoading, onShowFullHistory }: { 
  transactions: any[], 
  filters: any,
  onFilterChange: (f: any) => void,
  isLoading: boolean,
  onShowFullHistory: () => void
}) {
  return (
    <section className="glass-card rounded-[40px] border border-white/5 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black italic uppercase tracking-tight">Histórico de Movimentações</h3>
            <p className="text-[9px] font-bold text-[#b9cbbc]/20 uppercase tracking-[0.2em] italic">Últimos 15 registros</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b9cbbc]/40" />
              <input 
                type="text"
                placeholder="Pesquisar..."
                value={filters.search}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-bold text-white focus:outline-none focus:border-primary/50 transition-all uppercase italic"
              />
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              {[
                { label: 'Todas', value: '' },
                { label: 'Entradas', value: 'IN', icon: <ArrowUp className="w-3 h-3" /> },
                { label: 'Saídas', value: 'OUT', icon: <ArrowDown className="w-3 h-3" /> }
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => onFilterChange({ ...filters, mode: m.value })}
                  className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                    filters.mode === m.value ? 'bg-primary text-black' : 'text-[#b9cbbc]/40 hover:text-white'
                  }`}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] uppercase tracking-[0.2em] text-[#b9cbbc]/40 border-b border-white/5">
              <th className="px-6 py-6 font-black text-left">Movimento</th>
              <th className="px-6 py-6 font-black text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => {
              const info = typeMap[tx.type as keyof typeof typeMap] || { label: tx.type, color: 'primary' };
              const isIncome = ['DEPOSIT', 'ACCOUNT_WITHDRAW'].includes(tx.type);
              
              return (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] font-bold text-white italic uppercase group-hover:text-primary transition-colors">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-[8px] font-bold text-[#b9cbbc]/40 uppercase tracking-widest">
                        <span>{new Date(tx.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
                        <span>•</span>
                        <span>{new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <p className={`text-[12px] font-black italic tracking-tighter ${isIncome ? 'text-primary' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && !isLoading && (
              <tr>
                <td colSpan={2} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-10">
                    <History size={40} />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">Sem dados</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <button 
          className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all group"
          onClick={onShowFullHistory}
        >
          <History size={14} className="group-hover:rotate-[-45deg] transition-transform" />
          Ver Histórico Completo
        </button>
      </div>
    </section>
  );
}
