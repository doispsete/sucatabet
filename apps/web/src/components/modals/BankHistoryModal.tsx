"use client";

import React, { useState, useMemo } from "react";
import { 
  History, 
  Search, 
  Filter, 
  ArrowUp, 
  ArrowDown, 
  X,
  Calendar as CalendarIcon
} from "lucide-react";
import { Modal, Input, CustomSelect, CustomDateRangePicker } from "@/components/ui/components";
import { useBankTransactions } from "@/lib/hooks";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

const typeMap: Record<string, { label: string, color: string }> = {
  'DEPOSIT': { label: 'Depósito Manual', color: 'primary' },
  'WITHDRAW': { label: 'Saque Manual', color: 'danger' },
  'ACCOUNT_DEPOSIT': { label: 'Depósito em Casa', color: 'danger' },
  'ACCOUNT_WITHDRAW': { label: 'Saque de Casa', color: 'primary' },
  'EXPENSE_PAYMENT': { label: 'Pagto Despesa', color: 'danger' },
};

interface BankHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: 'Despesas' | 'Casas' | 'Manual' | '';
}

export function BankHistoryModal({ isOpen, onClose, initialCategory = '' }: BankHistoryModalProps) {
  const [filters, setFilters] = useState({
    search: '',
    mode: '' as '' | 'IN' | 'OUT',
    category: initialCategory,
    startDate: null as string | null,
    endDate: null as string | null,
    period: 'all'
  });

  // Reset category if initialCategory changes (when modal re-opens)
  React.useEffect(() => {
    if (isOpen) {
      setFilters(prev => ({ ...prev, category: initialCategory }));
    }
  }, [isOpen, initialCategory]);

  const { data: transactions, isLoading } = useBankTransactions({
    search: filters.search,
    mode: filters.mode,
    category: filters.category || undefined,
    startDate: filters.startDate,
    endDate: filters.endDate
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <History className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Histórico Completo</h2>
            <p className="text-[10px] text-[#b9cbbc]/40 font-black uppercase tracking-[0.2em] italic mt-1">Gestão de Fluxo de Caixa</p>
          </div>
        </div>
      }
      size="xl"
    >
      <div className="space-y-8">
        {/* Advanced Filters */}
        <div className="glass-card rounded-[35px] p-8 border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Filtros Avançados</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/20 italic ml-2">Pesquisar por Descrição</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b9cbbc]/40" />
                <Input 
                  placeholder="EX: DEPÓSITO, SAQUE, PAGAMENTO..." 
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-12 bg-white/5 border-white/5 uppercase italic font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/20 italic ml-2">Tipo de Fluxo</label>
              <CustomSelect 
                value={filters.mode}
                onChange={(val) => setFilters(prev => ({ ...prev, mode: val as any }))}
                options={[
                  { label: 'TODOS OS FLUXOS', value: '' },
                  { label: 'ENTRADAS (+)', value: 'IN' },
                  { label: 'SAÍDAS (-)', value: 'OUT' }
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/20 italic ml-2">Categoria</label>
              <CustomSelect 
                value={filters.category}
                onChange={(val) => setFilters(prev => ({ ...prev, category: val as any }))}
                options={[
                  { label: 'TODAS CATEGORIAS', value: '' },
                  { label: 'DESPESAS', value: 'Despesas' },
                  { label: 'CASAS', value: 'Casas' },
                  { label: 'MANUAL', value: 'Manual' }
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/20 italic ml-2">Período Selecionado</label>
              <CustomDateRangePicker 
                startDate={filters.startDate}
                endDate={filters.endDate}
                onChange={(start, end) => setFilters(prev => ({ ...prev, startDate: start, endDate: end }))}
              />
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h5 className="text-[12px] font-black text-white uppercase tracking-[0.3em] italic">Movimentações</h5>
              <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                 <span className="text-[10px] text-primary font-black italic">{transactions.length} registros</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[40px] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] uppercase tracking-[0.2em] text-[#b9cbbc]/40 border-b border-white/5 bg-white/[0.01]">
                    <th className="px-8 py-6 font-black">Data / Hora (UTC-3)</th>
                    <th className="px-8 py-6 font-black">Descrição Completa</th>
                    <th className="px-8 py-6 font-black">Categoria</th>
                    <th className="px-8 py-6 font-black text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/30 italic">Carregando dados...</p>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-10">
                          <History size={48} />
                          <p className="text-[12px] font-black uppercase tracking-widest italic">Nenhum registro encontrado para este filtro</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx: any) => {
                      const isIncome = ['DEPOSIT', 'ACCOUNT_WITHDRAW'].includes(tx.type);
                      const info = typeMap[tx.type as keyof typeof typeMap] || { label: tx.type, color: 'primary' };

                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black text-white italic">
                                {formatDate(tx.createdAt)}
                              </span>
                              <span className="text-[9px] font-bold text-[#b9cbbc]/40 uppercase tracking-widest">
                                {formatTime(tx.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-[12px] font-black text-white italic uppercase group-hover:text-primary transition-colors">
                              {tx.description}
                            </p>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border border-white/5 bg-white/5 ${
                              isIncome ? 'text-primary' : 'text-red-500'
                            }`}>
                              {info.label}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <p className={`text-lg font-black italic tracking-tighter ${isIncome ? 'text-primary' : 'text-red-500'}`}>
                              {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
