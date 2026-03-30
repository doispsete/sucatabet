"use client";
import React, { useState } from "react";
import {
  Bolt,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Gamepad2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRegister } from "@/lib/hooks";
import { toast } from "@/components/ui/components";

export default function RegisterPage() {
  const { register } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setSuccess(true);
      toast.success("Cadastro realizado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao realizar cadastro");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#03d791]/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
        <div className="w-full max-w-[460px] z-10 text-center animate-in fade-in zoom-in duration-700">
          <div className="glass-card rounded-[50px] p-12 border-white/5 shadow-3xl text-center">
            <div className="w-20 h-20 bg-[#03d791]/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(3,215,145,0.2)]">
              <CheckCircle2 className="w-10 h-10 text-[#03d791]" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-[0.1em] mb-4">Solicitação Enviada</h2>
            <p className="text-[#B9CBBC] opacity-60 text-sm mb-10 leading-relaxed uppercase font-bold tracking-widest text-[10px]">
              Seu cadastro foi recebido com sucesso. <br/> 
              Agora aguarde a aprovação manual de um administrador para acessar a plataforma.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center gap-3 text-[#03d791] font-black uppercase text-[11px] tracking-[0.3em] italic hover:gap-5 transition-all"
            >
              VOLTAR AO LOGIN <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#03d791]/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse delay-700 pointer-events-none"></div>

      <div className="w-full max-w-[460px] z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 text-center">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Bolt className="w-10 h-10 text-[#03d791]" />
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
            NOVO <span className="text-[#03d791]">OPERADOR</span>
          </h1>
        </div>

        <div className="glass-card rounded-[40px] p-10 border-white/5 shadow-3xl text-left">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.4em] pl-4 italic">Nome Completo</label>
              <div className="relative group/input">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B9CBBC] opacity-20" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="EX: JOÃO SILVA"
                  className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl pl-16 pr-6 text-white text-xs font-black focus:border-[#03d791]/30 focus:outline-none uppercase italic"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.4em] pl-4 italic">E-mail</label>
              <div className="relative group/input">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B9CBBC] opacity-20" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="EMAIL@EXEMPLO.COM"
                  className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl pl-16 pr-6 text-white text-xs font-black focus:border-[#03d791]/30 focus:outline-none uppercase italic"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.4em] pl-4 italic">Senha</label>
              <div className="relative group/input">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B9CBBC] opacity-20" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl pl-16 pr-16 text-white text-xs tracking-widest focus:border-[#03d791]/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[#B9CBBC] opacity-20 hover:opacity-100"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.4em] pl-4 italic">Confirmar Senha</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full h-14 bg-black/40 border border-white/5 rounded-2xl px-6 text-white text-xs tracking-widest focus:border-[#03d791]/30 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-14 mt-4 bg-gradient-to-r from-[#03d791] to-[#00D1FF] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic disabled:opacity-50 transition-all hover:shadow-[0_10px_30px_rgba(3,215,145,0.3)] active:scale-[0.98]"
            >
              {loading ? "PROCESSANDO..." : "SOLICITAR ACESSO"}
            </button>

            <div className="text-center mt-4">
              <Link href="/login" className="text-[9px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.3em] italic hover:text-[#03d791] hover:opacity-100 transition-all">
                Já tem conta? <span className="text-[#03d791]">Entrar</span>
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 px-6 py-2 glass-card rounded-full border border-white/5">
            <ShieldCheck className="w-3 h-3 text-[#03d791]" />
            <span className="text-[8px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.4em] italic">SOLICITAÇÃO SUJEITA A TERMOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
