"use client";
import React, { useState, useEffect } from "react";
import { Modal, LoadingButton, toast, CustomSelect } from "@/components/ui/components";
import { useAccounts, useHouses, useCpfProfiles } from "@/lib/hooks";
import { formatCpf6 } from "@/lib/utils";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialProfileId?: string;
  profiles?: any[]; // Optional, will use useCpfProfiles hook if not provided
}

export function AddAccountModal({ isOpen, onClose, onSuccess, initialProfileId, profiles: propsProfiles }: AddAccountModalProps) {
  const [cpfProfileId, setCpfProfileId] = useState<string | null>(null);
  const [bettingHouseId, setBettingHouseId] = useState<string | null>(null);
  
  const { data: hookProfiles } = useCpfProfiles();
  const { data: houses, isLoading: isHousesLoading } = useHouses();
  const { create: createAccount, isMutating } = useAccounts();

  const profiles = propsProfiles || hookProfiles || [];

  useEffect(() => {
    if (initialProfileId) setCpfProfileId(initialProfileId);
    if (!isOpen) {
      if (!initialProfileId) setCpfProfileId(null);
      setBettingHouseId(null);
    }
  }, [initialProfileId, isOpen]);

  const selectedProfile = (Array.isArray(profiles) ? profiles : []).find(p => p.id === cpfProfileId);
  const linkedHouseIds = selectedProfile?.accounts?.map((acc: any) => acc.bettingHouseId) || [];

  const houseOptions = (Array.isArray(houses) ? [...houses] : [])
    .filter(h => !linkedHouseIds.includes(h.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
    .map(h => ({
      value: h.id,
      label: h.name.toUpperCase()
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfProfileId || !bettingHouseId) {
      toast.error("Vínculo incompleto: Ativo e Casa necessários");
      return;
    }

    try {
      await createAccount({
        cpfProfileId,
        bettingHouseId,
        balance: 0
      });
      toast.success("Ativo vinculado com sucesso");
      
      // Dispatch global refetch event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('refetch-data'));
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Falha na vinculação");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialProfileId && selectedProfile ? `Vincular Casa para ${selectedProfile.name.split(' ')[0]}` : "Vinculação de Ativo"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {!initialProfileId && (
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Detentor Primário</label>
            <CustomSelect
              value={cpfProfileId ?? ""}
              onChange={val => {
                setCpfProfileId(val);
                setBettingHouseId(null); // Reset house when profile changes
              }}
              options={(Array.isArray(profiles) ? profiles : []).map((p: any) => ({
                value: p.id,
                label: `${p.name.toUpperCase()} — ${formatCpf6(p.cpf)}`
              }))}
              placeholder="ESCOLHER OPERADOR"
            />
          </div>
        )}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b9cbbc]/40 italic">Casa de Destino</label>
          <CustomSelect
            value={bettingHouseId ?? ""}
            onChange={val => setBettingHouseId(val)}
            options={houseOptions}
            placeholder={isHousesLoading ? "ACESSANDO HUB..." : (houseOptions.length === 0 && cpfProfileId ? "TODAS AS CASAS JÁ VINCULADAS" : "SELECIONAR DESTINO")}
          />
        </div>
        <LoadingButton
          type="submit"
          isLoading={isMutating}
          disabled={!cpfProfileId || !bettingHouseId || isMutating}
          className="w-full bg-gradient-to-r from-[#03D791] to-[#00D1FF] text-black font-black uppercase tracking-[0.3em] italic py-5 rounded-[25px] text-[10px] hover:shadow-[0_15px_40px_rgba(3,215,145,0.3)] hover:scale-[1.02] active:scale-95 transition-all mt-6 disabled:opacity-20"
        >
          {isMutating ? "VINCULANDO..." : "VINCULAR CONTA NO HUB"}
        </LoadingButton>
      </form>
    </Modal>
  );
}
