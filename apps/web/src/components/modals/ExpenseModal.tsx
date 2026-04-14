"use client";
import React, { useState, useEffect } from "react";
import { Modal, LoadingButton, toast, CustomSelect, Input } from "@/components/ui/components";
import { Expense, ExpenseType } from "@/lib/api/types";
import { useExpenses } from "@/lib/hooks";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export function ExpenseModal({ isOpen, onClose, expenseToEdit }: ExpenseModalProps) {
  const { create, update, isMutating } = useExpenses();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<ExpenseType>(ExpenseType.OPERACIONAL);
  const [dueDay, setDueDay] = useState("1");
  const [recurring, setRecurring] = useState(true);
  const [totalMonths, setTotalMonths] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setName(expenseToEdit.name);
        setAmount(expenseToEdit.amount.toString());
        setType(expenseToEdit.type);
        setDueDay(expenseToEdit.dueDay.toString());
        setRecurring(expenseToEdit.recurring);
        setTotalMonths(expenseToEdit.totalOccurrences?.toString() || "");
      } else {
        setName("");
        setAmount("");
        setType(ExpenseType.OPERACIONAL);
        setDueDay("1");
        setRecurring(true);
        setTotalMonths("");
      }
    }
  }, [isOpen, expenseToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDay) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const payload = {
        name,
        amount: parseFloat(amount),
        type,
        dueDay: parseInt(dueDay),
        recurring,
        totalMonths: totalMonths ? parseInt(totalMonths) : undefined
      };

      if (expenseToEdit) {
        await update(expenseToEdit.id, payload);
        toast.success("Despesa atualizada com sucesso");
      } else {
        await create(payload);
        toast.success("Despesa cadastrada com sucesso");
      }
      // Dispatch global refetch event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refetch-data'));
      }
      
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar despesa");
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={expenseToEdit ? "Editar Despesa" : "Nova Despesa"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 italic">Nome da Despesa</label>
            <Input 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="EX: ALUGUEL, LUZ, INTERNET"
              className="uppercase font-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 italic">Valor (R$)</label>
              <Input 
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-primary font-black"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 italic">Tipo</label>
              <CustomSelect 
                value={type}
                onChange={val => setType(val as ExpenseType)}
                options={[
                  { value: ExpenseType.OPERACIONAL, label: "OPERACIONAL" },
                  { value: ExpenseType.PESSOAL, label: "PESSOAL" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 italic">Dia do Vencimento</label>
              <Input 
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={e => setDueDay(e.target.value)}
                placeholder="1"
                className="font-black"
              />
            </div>
            <div className="flex flex-col justify-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={recurring}
                    onChange={e => setRecurring(e.target.checked)}
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${recurring ? 'bg-primary shadow-[0_0_10px_rgba(3,215,145,0.3)]' : 'bg-white/10'}`} />
                  <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${recurring ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#b9cbbc]/60 group-hover:text-white transition-colors italic">Recorrente?</span>
              </label>
            </div>
          </div>

          {recurring && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 italic">
                Quantidade de Meses (Vazio = Vitalício)
              </label>
              <Input 
                type="number"
                min="1"
                value={totalMonths}
                onChange={e => setTotalMonths(e.target.value)}
                placeholder="EX: 12"
                className="font-black"
              />
            </div>
          )}
        </div>

        <LoadingButton 
          type="submit" 
          isLoading={isMutating}
          className="w-full bg-primary text-black font-black uppercase tracking-[0.3em] py-4 rounded-2xl text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg italic"
        >
          {expenseToEdit ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR DESPESA'}
        </LoadingButton>
      </form>
    </Modal>
  );
}
