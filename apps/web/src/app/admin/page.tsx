"use client";
import React, { useState, useMemo } from "react";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  AlertCircle
} from "lucide-react";
import { useUsers, useAuth } from "@/lib/hooks";
import { SkeletonRow, EmptyState, Modal, LoadingButton, toast, Input, CustomSelect, ConfirmDialog } from "@/components/ui/components";
import { UserRole, User } from "@/lib/api/types";

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, refetch, create: createUser, update: updateUser, remove, isMutating } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form States - Add
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState(UserRole.OPERATOR);

  // Form States - Edit
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState(UserRole.OPERATOR);
  const [editPassword, setEditPassword] = useState("");

  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Senha deve ter no mínimo 8 caracteres");
      return;
    }
    try {
      await createUser({ name: newName, email: newEmail, password: newPassword, role: newRole });
      toast.success("Usuário criado com sucesso");
      setIsAddModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole(UserRole.OPERATOR);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro ao criar usuário");
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const data: any = { name: editName, email: editEmail, role: editRole };
      if (editPassword) {
        if (editPassword.length < 8) {
          toast.error("A nova senha deve ter no mínimo 8 caracteres");
          return;
        }
        data.password = editPassword;
      }
      await updateUser(selectedUser.id, data);
      toast.success("Usuário atualizado com sucesso");
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setEditPassword("");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro ao atualizar usuário");
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await remove(id);
      toast.success("Usuário excluído com sucesso");
      setConfirmDeleteUser(null);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Erro ao excluir usuário");
    }
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const stats = useMemo(() => {
    if (!users) return [];
    return [
      { label: "Total Usuários", value: users.length.toString(), subtext: "Cadastrados", color: "text-[#00ff88]" },
      { label: "Administradores", value: users.filter(u => u.role === UserRole.ADMIN).length.toString(), subtext: "Full Access", color: "text-[#4cd6ff]" },
      { label: "Operadores", value: users.filter(u => u.role === UserRole.OPERATOR).length.toString(), subtext: "Limited Access", color: "text-[#ffdd65]" },
      { label: "Status Sistema", value: "99%", status: "pulse", color: "text-[#F4FFF3]" },
    ];
  }, [users]);

  if (!isAdmin && currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          message="Acesso Restrito. Você não tem permissão para visualizar esta página."
        />
      </div>
    );
  }

  return (
    <div className="px-3 md:px-6">

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px] bg-[#00ff88] rounded-full shadow-[0_0_15px_rgba(0,255,136,0.5)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#00ff88] italic">Controle de Acesso</h2>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.8] italic uppercase">
            Gestão de<br /><span className="text-[#00ff88]">Usuários</span>
          </h1>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="group flex items-center gap-4 bg-[#00ff88] text-black px-12 py-6 rounded-[25px] text-[11px] font-black uppercase tracking-[0.4em] italic hover:scale-[1.05] hover:shadow-[0_20px_40px_rgba(0,255,136,0.2)] active:scale-95 transition-all"
        >
          <UserPlus size={20} />
          Novo Operador
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-[30px] animate-pulse" />
          ))
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="glass-card p-8 rounded-[40px] flex flex-col justify-between group transition-all duration-500 hover:border-[#00ff88]/20 border-white/5 relative overflow-hidden">
              <span className="text-[10px] font-black text-[#b9cbbc] uppercase tracking-[0.4em] opacity-30 italic">{stat.label}</span>
              <div className="flex items-baseline gap-3 mt-4">
                <span className={`text-4xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</span>
                {stat.subtext && <span className="text-[#b9cbbc] text-[9px] font-black uppercase tracking-widest opacity-20 italic">{stat.subtext}</span>}
                {stat.status === "pulse" && <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.5)] animate-pulsar ml-2"></div>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Administrative Registry Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-[#3B4A3F]/20 mb-20">
        <div className="px-8 py-5 bg-[#1a1a1a]/50 border-b border-[#3B4A3F]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-headline font-black text-[#E5E2E1] italic tracking-tight uppercase text-sm">Registro Administrativo</h3>
          <div className="flex gap-2">
            <button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-[#b9cbbc] opacity-40 hover:opacity-100 btn-interact">
              <Filter size={16} />
            </button>
            <button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-[#b9cbbc] opacity-40 hover:opacity-100 btn-interact">
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[#b9cbbc] text-[9px] font-black uppercase tracking-[0.2em] bg-[#1a1a1a] opacity-40">
                <th className="px-8 py-4 font-black">Perfil</th>
                <th className="px-8 py-4 font-black">Email / Login</th>
                <th className="px-8 py-4 font-black">Cargo / Permissões</th>
                <th className="px-8 py-4 font-black">Último Login</th>
                <th className="px-8 py-4 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3B4A3F]/10">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : (Array.isArray(users) ? users : []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20">
                    <EmptyState message="Nenhum administrador encontrado." />
                  </td>
                </tr>
              ) : (
                (Array.isArray(users) ? users : []).map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group row-interact">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-[#2a2a2a] overflow-hidden border border-white/5 shadow-inner flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#b9cbbc]" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-[#e5e2e1] italic tracking-tight uppercase leading-none mb-1">{user.name}</p>
                          <p className="text-[10px] text-[#b9cbbc] opacity-40 font-medium">ID: {(user.id ?? '').slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[11px] text-[#b9cbbc] font-medium opacity-60 lowercase">{user.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all
                        ${user.role === UserRole.ADMIN ? 'bg-[#00ff88]/5 text-[#00ff88] border-[#00ff88]/20' : 'bg-[#ffd966]/5 text-[#ffd966] border-[#ffd966]/20'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.4)]`}></div>
                        <span className={`text-[10px] font-black uppercase italic tracking-tighter text-white opacity-40`}>Recent</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2.5 text-[#b9cbbc] hover:text-[#4cd6ff] transition-colors bg-white/5 rounded-xl hover:bg-[#4cd6ff]/10 btn-interact"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteUser(user.id)}
                          className="p-2.5 text-[#b9cbbc] hover:text-red-500 transition-colors bg-white/5 rounded-xl hover:bg-red-500/10 btn-interact"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-[#1a1a1a]/40 border-t border-[#3B4A3F]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[9px] text-[#b9cbbc] opacity-30 uppercase tracking-[.25em] font-black text-center sm:text-left">
            Total: {users?.length || 0} usuários
          </p>
          <div className="flex gap-2">
            <button className="p-1.5 text-[#b9cbbc] hover:text-[#00ff88] transition-colors disabled:opacity-20 btn-interact" disabled>
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
              <button className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-all btn-interact bg-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20`}>
                1
              </button>
            </div>
            <button className="p-1.5 text-[#b9cbbc] hover:text-[#00ff88] transition-colors btn-interact" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <footer className="mt-16 flex flex-col lg:flex-row justify-between items-center gap-6 text-[9px] text-[#b9cbbc] opacity-20 uppercase tracking-[0.3em] font-black pb-10">
        <p>© 2024 SUCATA BET INTERNAL SYSTEM</p>
        <div className="flex flex-wrap justify-center gap-8">
          <span className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-[#00ff88]"></div>
            Server Status: Operational
          </span>
          <span>Lat: 24ms</span>
          <span className="text-[#00ff88]">V 2.4.0-ADM</span>
        </div>
      </footer>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Novo Usuário"
      >
        <form onSubmit={handleAddUser} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 pl-4 italic">Nome Completo</label>
            <Input
              type="text"
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="EX: JOÃO SILVA"
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 pl-4 italic">Email / Login</label>
            <Input
              type="email"
              required
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="EX: JOAO@SUCATABET.COM"
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 pl-4 italic">Senha Temporária</label>
            <Input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="MIN. 8 CARACTERES"
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 pl-4 italic">Cargo / Permissões</label>
            <CustomSelect
              value={newRole}
              onChange={val => setNewRole(val as UserRole)}
              options={[
                { value: UserRole.OPERATOR, label: "OPERADOR (LIMITADO)" },
                { value: UserRole.ADMIN, label: "ADMIN (TOTAL)" }
              ]}
              placeholder="SELECIONAR CARGO"
            />
          </div>
          <div className="pt-6">
            <LoadingButton
              type="submit"
              isLoading={isMutating}
              className="w-full bg-[#00ff88] text-black font-black uppercase tracking-[0.4em] italic py-6 rounded-[25px] text-[10px] hover:shadow-[0_15px_40px_rgba(0,255,136,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              CRIAR ACESSO
            </LoadingButton>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Editar Usuário"
      >
        <form onSubmit={handleEditUser} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 pl-4 italic">Nome Completo</label>
            <Input
              type="text"
              required
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="EX: JOÃO SILVA"
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 pl-4 italic">Email / Login</label>
            <Input
              type="email"
              required
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
            />
          </div>
           <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 pl-4 italic">Cargo / Permissões</label>
            <CustomSelect
              value={editRole}
              onChange={val => setEditRole(val as UserRole)}
              options={[
                { value: UserRole.OPERATOR, label: "OPERADOR (LIMITADO)" },
                { value: UserRole.ADMIN, label: "ADMIN (TOTAL)" }
              ]}
              placeholder="SELECIONAR CARGO"
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 pl-4 italic">Nova Senha (Opcional)</label>
            <Input
              type="password"
              value={editPassword}
              onChange={e => setEditPassword(e.target.value)}
              placeholder="DEIXE EM BRANCO PARA MANTER A ATUAL"
            />
          </div>
          <div className="pt-6">
            <LoadingButton
              type="submit"
              isLoading={isMutating}
              className="w-full bg-[#4cd6ff] text-black font-black uppercase tracking-[0.4em] italic py-6 rounded-[25px] text-[10px] hover:shadow-[0_15px_40px_rgba(76,214,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              SALVAR ALTERAÇÕES
            </LoadingButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeleteUser}
        onClose={() => setConfirmDeleteUser(null)}
        onConfirm={() => confirmDeleteUser && handleDeleteUser(confirmDeleteUser)}
        title="Excluir Usuário"
        message="Tem certeza que deseja remover permanentemente este acesso do sistema?"
        type="danger"
        confirmLabel="EXCLUIR AGORA"
        cancelLabel="MANTER ACESSO"
      />
    </div>
  );
}

