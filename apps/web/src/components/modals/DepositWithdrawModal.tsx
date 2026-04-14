"use client";
import React, { useState, useEffect } from "react";
import { Modal, LoadingButton, toast, Input } from "@/components/ui/components";
import { bankService } from "@/lib/api/services";

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'deposit' | 'withdraw';
  onSuccess?: () => void;
}

export function DepositWithdrawModal({ isOpen, onClose, mode, onSuccess }: DepositWithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setDescription("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { 
        amount: parseFloat(amount), 
        description: description.toUpperCase()
      };

      if (mode === 'deposit') {
        await bankService.deposit(payload);
        toast.success("Depósito realizado com sucesso");
      } else {
        await bankService.withdraw(payload);
        toast.success("Retirada realizada com sucesso");
      }
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refetch-data'));
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Erro ao processar transação";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === 'deposit' ? "Realizar Depósito" : "Realizar Retirada"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 italic">Valor (R$)</label>
            <Input 
              type="number"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className={mode === 'deposit' ? "text-primary font-black" : "text-red-500 font-black"}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc]/60 italic">Descrição / Notas</label>
            <Input 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={mode === 'deposit' ? "EX: ADIÇÃO DE BANCA" : "EX: SAQUE PARA USO PESSOAL"}
              className="uppercase font-black"
            />
          </div>
        </div>

        <LoadingButton 
          type="submit" 
          isLoading={isLoading}
          className={`w-full font-black uppercase tracking-[0.4em] py-4 rounded-2xl text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg italic ${
            mode === 'deposit' ? 'bg-primary text-black' : 'bg-red-500 text-white shadow-red-500/10'
          }`}
        >
          {mode === 'deposit' ? 'CONFIRMAR DEPÓSITO' : 'CONFIRMAR RETIRADA'}
        </LoadingButton>
      </form>
    </Modal>
  );
}
