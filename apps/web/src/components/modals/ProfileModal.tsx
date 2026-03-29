"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { User, Mail, Lock, Check, X, Shield } from "lucide-react";
import { useProfile, useAuth } from "@/lib/hooks";
import { LoadingButton, toast, Input, ConfirmDialog } from "@/components/ui/components";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile, isMutating } = useProfile();
  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);
  const [initialName, setInitialName] = useState("");
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Sincroniza o nome inicial quando o modal abre ou user carrega
  React.useEffect(() => {
    if (isOpen && user?.name) {
      setName(user.name);
      setInitialName(user.name);
    }
  }, [isOpen, user?.name]);

  const hasUnsavedChanges = name !== initialName || oldPassword !== "" || newPassword !== "" || confirmPassword !== "";

  const wrappedOnClose = () => {
    if (hasUnsavedChanges) {
      setIsConfirmingDiscard(true);
    } else {
      onClose();
    }
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      // Ignora cliques enquanto o dialog de confirmação está aberto
      if (isConfirmingDiscard) return;
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        wrappedOnClose();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [isOpen, hasUnsavedChanges, isConfirmingDiscard]);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {};
    if (name !== user?.name) data.name = name;
    
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
      if (newPassword.length < 8) {
        toast.error("A nova senha deve ter no mínimo 8 caracteres");
        return;
      }
      data.oldPassword = oldPassword;
      data.newPassword = newPassword;
    }

    if (Object.keys(data).length === 0) {
      onClose();
      return;
    }

    try {
      await updateProfile(data);
      toast.success("Perfil atualizado com sucesso!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setInitialName(name);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar perfil");
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center sm:justify-start p-4 bg-black/5 animate-in fade-in duration-300"
    >
      <div 
        ref={modalRef}
        className="fixed bottom-20 left-4 z-[9999] w-full max-w-[300px] animate-in fade-in slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="bg-[#0a0a0a] rounded-[24px] border border-white/10 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <button 
          onClick={wrappedOnClose}
          className="absolute top-4 right-4 p-1.5 text-[#b9cbbc]/40 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[1px] bg-[#00ff88] rounded-full" />
              <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-[#00ff88] italic">Perfil do Sistema</h4>
            </div>
            <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-tight">
              Olá, {user?.role} {user?.name?.split(' ')[0]}!
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-3">
              {/* Name field */}
              <div className="space-y-1">
                <span className="text-[7px] font-black text-[#b9cbbc]/40 uppercase tracking-widest ml-1">Nome de Exibição</span>
                <Input
                  placeholder="EX: JOÃO SILVA"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="bg-white/5 text-[10px] py-4 h-9 border-white/5 focus:border-[#00ff88]/50 transition-all font-bold"
                />
              </div>

              {/* Email (Read only check style) */}
              <div className="space-y-1 opacity-60">
                <span className="text-[7px] font-black text-[#b9cbbc]/40 uppercase tracking-widest ml-1">E-mail SucataBet</span>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] text-white/50 font-medium h-9">
                  <Mail size={12} />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>

              <div className="w-full h-px bg-white/5 my-1" />

              {/* Password change fields (Optional) */}
              <div className="space-y-1">
                <span className="text-[7px] font-black text-[#b9cbbc]/40 uppercase tracking-widest ml-1">Alterar Senha (Opcional)</span>
                <div className="grid gap-2">
                  <Input
                    type="password"
                    placeholder="SENHA ATUAL"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-white/5 text-[10px] py-4 h-9 border-white/5"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="password"
                      placeholder="NOVA SENHA"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/5 text-[10px] py-4 h-9 border-white/5"
                    />
                    <Input
                      type="password"
                      placeholder="CONFIRMAR"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 text-[10px] py-4 h-9 border-white/5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <LoadingButton
              type="submit"
              isLoading={isMutating}
              className="w-full bg-[#00ff88] text-black font-black uppercase tracking-widest italic py-4 h-10 rounded-xl text-[9px] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all mt-2"
            >
              SALVAR ALTERAÇÕES
            </LoadingButton>
          </form>
        </div>
      </div>
    </div>

    <ConfirmDialog
        isOpen={isConfirmingDiscard}
        onClose={() => setIsConfirmingDiscard(false)}
        onConfirm={() => {
          setIsConfirmingDiscard(false);
          onClose();
        }}
        title="Descartar Alterações?"
        message="Existem alterações não salvas no seu perfil. Deseja realmente sair sem salvar?"
        type="danger"
        confirmLabel="DESCARTAR"
        cancelLabel="VOLTAR"
      />
    </div>,
    document.body
  );
}
