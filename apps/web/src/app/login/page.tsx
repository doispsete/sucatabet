"use client";
import React, { useState } from "react";
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Gamepad2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "@/components/ui/components";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      toast.error((err as Error).message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Liquid Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#03d791]/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse delay-700 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none"></div>

      <div className="w-full max-w-[460px] z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 will-change-transform text-center">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="flex items-center justify-center group transition-all duration-700 hover:scale-110 hover:rotate-3 active:scale-95">
            <Zap className="w-20 h-20 text-[#03d791] fill-[#03d791]/20 drop-shadow-[0_0_20px_rgba(3,215,145,0.4)] group-hover:animate-neon-pulse transition-transform" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              SUCATA <span className="text-[#03d791]">BET</span>
            </h1>
            <span className="text-[10px] text-[#03d791] font-black uppercase tracking-[0.6em] mt-3 opacity-60 italic">Controle de Operações</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-[50px] p-12 border-white/5 shadow-3xl relative overflow-hidden group text-left">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#03d791]/30 to-transparent opacity-50"></div>

          <div className="flex flex-col gap-3 mb-10 text-center">
            <h2 className="text-xl font-black text-white uppercase italic tracking-[0.2em]">Login do Operador</h2>
            <p className="text-[10px] text-[#B9CBBC] opacity-30 font-bold uppercase tracking-[0.3em] italic">Acesso Restrito • Sessão Criptografada</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email Field */}
            <div className="flex flex-col gap-3">
              <label className="text-[9px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.4em] pl-4 italic">Identidade / E-mail</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-[#B9CBBC] opacity-20 group-focus-within/input:text-[#03d791] transition-all" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="OPERADOR@SUCATABET.COM"
                  className="w-full h-16 bg-black/40 border border-white/5 rounded-3xl pl-16 pr-6 text-white text-sm font-black focus:outline-none focus:border-[#03d791]/30 focus:ring-1 focus:ring-[#03d791]/10 transition-all placeholder:text-[#B9CBBC]/10 placeholder:font-black placeholder:uppercase placeholder:text-[9px] placeholder:tracking-widest uppercase italic"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-4">
                <label className="text-[9px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.4em] italic">Chave de Acesso</label>
                <Link href="#" className="text-[9px] font-black text-[#03d791] hover:underline uppercase tracking-widest italic opacity-40 hover:opacity-100 transition-opacity">Recuperar</Link>
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[#B9CBBC] opacity-20 group-focus-within/input:text-[#03d791] transition-all" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-16 bg-black/40 border border-white/5 rounded-3xl pl-16 pr-16 text-white text-sm tracking-widest focus:outline-none focus:border-[#03d791]/30 focus:ring-1 focus:ring-[#03d791]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-6 flex items-center text-[#B9CBBC] opacity-20 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative flex items-center justify-center h-16 mt-6 bg-gradient-to-r from-[#03d791] to-[#00D1FF] text-black border-none rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] italic overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_15px_40px_rgba(3,215,145,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
               <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-30 group-hover/btn:opacity-100 group-hover/btn:translate-x-2 transition-all duration-500">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-r-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
               </div>
               <span className="pl-[0.3em] -translate-x-[1px] whitespace-nowrap">{loading ? 'AUTORIZANDO...' : 'INICIAR SESSÃO'}</span>
            </button>

            <div className="text-center mt-6">
              <Link href="/cadastro" className="text-[10px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.3em] italic hover:text-[#03d791] hover:opacity-100 transition-all">
                Não tem conta? <span className="text-[#03d791]">Cadastrar</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-12 flex flex-col items-center gap-8">
          <div className="flex items-center gap-4 px-8 py-3 glass-card rounded-full border border-white/5 shadow-2xl">
            <ShieldCheck className="w-4 h-4 text-[#03d791]" />
            <span className="text-[10px] font-black text-[#B9CBBC] opacity-40 uppercase tracking-[0.4em] italic">CRIPTOGRAFIA RSA-4096 ATIVa</span>
          </div>

          <div className="flex items-center gap-10 opacity-10 grayscale hover:grayscale-0 hover:opacity-30 transition-all cursor-default group">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-6 h-6 text-white group-hover:text-[#03d791] transition-colors" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.5em] italic">Sucata Bet</span>
            </div>
            <div className="w-px h-6 bg-white/20"></div>
            <span className="text-[9px] font-black text-white uppercase tracking-[0.5em] italic">© 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
