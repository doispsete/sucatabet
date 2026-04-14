"use client";
import React, { useState } from "react";
import { Modal, LoadingButton, toast, Input } from "@/components/ui/components";
import { useCpfProfiles } from "@/lib/hooks";
import { formatCpf6 } from "@/lib/utils";

interface AddCpfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCpfModal({ isOpen, onClose, onSuccess }: AddCpfModalProps) {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const { create: createCpf, isMutating } = useCpfProfiles();

  const handleCpfChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCpf(digits);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpf.length < 6) {
      toast.error("O prefixo do documento deve ter pelo menos 6 dígitos");
      return;
    }
    try {
      await createCpf({ name, cpf });
      toast.success("Perfil de operador inicializado");
      
      // Dispatch global refetch event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refetch-data'));
      }
      
      if (onSuccess) onSuccess();
      onClose();
      setName("");
      setCpf("");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Falha na inicialização do perfil");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Perfil de Operador">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Nome do Titular</label>
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="NOME COMPLETO"
            required
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Prefixo Documento (6 Dig.)</label>
          <Input
            type="text"
            value={formatCpf6(cpf)}
            onChange={e => handleCpfChange(e.target.value)}
            className="text-[#03D791] font-black tracking-widest text-center"
            placeholder="000.000"
            required
          />
        </div>
        <LoadingButton
          type="submit"
          isLoading={isMutating}
          className="w-full bg-[#03D791] text-black font-black uppercase tracking-[0.3em] italic py-5 rounded-[20px] text-[10px] shadow-[0_10px_30px_rgba(3,215,145,0.2)] hover:scale-[1.02] active:scale-95 transition-all mt-4"
        >
          INICIALIZAR PERFIL
        </LoadingButton>
      </form>
    </Modal>
  );
}
