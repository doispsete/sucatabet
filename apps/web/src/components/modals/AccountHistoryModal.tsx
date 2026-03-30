"use client";
import React, { useState, useMemo } from "react";
import {
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  Filter
} from "lucide-react";
import { Modal, Input, CustomSelect, CustomDatePicker } from "@/components/ui/components";
import { useAccountHistory } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";

interface AccountHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
}

export function AccountHistoryModal({ isOpen, onClose, account }: AccountHistoryModalProps) {
  const { data: history, isLoading } = useAccountHistory(account?.id);
  const [filterType, setFilterType] = useState<"ALL" | "DEPOSIT" | "WITHDRAW">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredHistory = useMemo(() => {
    return (history || []).filter((item: any) => {
      const matchesType = filterType === "ALL" || item.action === filterType;
      
      const itemDate = new Date(item.createdAt);
      const matchesStart = !startDate || itemDate >= new Date(startDate);
      const matchesEnd = !endDate || itemDate <= new Date(endDate + 'T23:59:59');

      return matchesType && matchesStart && matchesEnd;
    });
  }, [history, filterType, startDate, endDate]);

  if (!account) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Histórico - ${account.bettingHouse?.name || 'Conta'}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="glass-card rounded-[35px] p-8 border-white/5 bg-white/[0.02] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Filter className="w-4 h-4 text-[#03D791]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Filtros de Busca</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/20 italic">Tipo de Transação</label>
              <CustomSelect
                value={filterType}
                onChange={(val) => setFilterType(val as any)}
                options={[
                  { value: "ALL", label: "TODOS OS TIPOS" },
                  { value: "DEPOSIT", label: "DEPÓSITOS" },
                  { value: "WITHDRAW", label: "SAQUES" },
                ]}
                placeholder="FILTRAR TIPO"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/20 italic">Data Inicial</label>
              <CustomDatePicker
                value={startDate}
                onChange={(val) => setStartDate(val.split('T')[0])}
                allowPastDates={true}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/20 italic">Data Final</label>
              <CustomDatePicker
                value={endDate}
                onChange={(val) => setEndDate(val.split('T')[0])}
                allowPastDates={true}
              />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h5 className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-[0.3em] italic">Transações Encontradas</h5>
            <span className="text-[9px] text-[#b9cbbc]/40 font-bold italic">{filteredHistory.length} registros</span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pt-2 px-2 pr-2 custom-scrollbar lg:no-scrollbar pb-4">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-[#03D791]/20 border-t-[#03D791] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/30 italic">Carregando histórico...</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-20 text-center glass-card rounded-[35px] border-white/5 bg-white/[0.01]">
                <Search className="w-10 h-10 text-[#b9cbbc]/10 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/30 italic">Nenhuma transação encontrada</p>
              </div>
            ) : (
              filteredHistory.map((item: any) => (
                <div
                  key={item.id}
                  className="glass-card rounded-[25px] p-6 border-white/5 bg-white/[0.02] flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                      item.action === 'DEPOSIT' 
                        ? 'bg-[#14d1ff]/5 border-[#14d1ff]/20 text-[#14d1ff] group-hover:bg-[#14d1ff]/10' 
                        : 'bg-[#03D791]/5 border-[#03D791]/20 text-[#03D791] group-hover:bg-[#03D791]/10'
                    }`}>
                      {item.action === 'DEPOSIT' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                    </div>
                    <div>
                      <h6 className="text-sm font-black text-white italic tracking-tighter uppercase">
                        {item.action === 'DEPOSIT' ? 'Depósito Realizado' : 'Saque Realizado'}
                      </h6>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-black text-[#b9cbbc]/30 uppercase tracking-widest flex items-center gap-1.5 italic">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString('pt-BR')} às {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[9px] font-black text-[#b9cbbc]/20 uppercase tracking-widest italic">• Por {item.user?.name || 'Sistema'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black italic tracking-tighter ${
                      item.action === 'DEPOSIT' ? 'text-[#14d1ff]' : 'text-[#03D791]'
                    }`}>
                      {item.action === 'DEPOSIT' ? '+' : '-'} R$ {formatCurrency(item.newValue?.depositAmount || item.newValue?.withdrawAmount || 0)}
                    </p>
                    <p className="text-[9px] font-black text-[#b9cbbc]/20 uppercase tracking-widest mt-1 italic">
                      Saldo Final: R$ {formatCurrency(item.newValue?.balance || 0)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
