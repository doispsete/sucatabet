"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Heart, Smartphone, Zap, Sparkles } from 'lucide-react';
import { supportService } from '@/lib/api/services';
import { toast } from '@/components/ui/components';
import { useAuth } from '@/lib/context/auth-context';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    whatsapp: '',
    reason: '',
    improvement: ''
  });

  const isPro = user?.plan === 'PRO' || isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp || !formData.reason) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const result = await supportService.sendTicket(formData);
      if (result.success) {
        toast.success('Ticket enviado com sucesso! Entraremos em contato em breve.');
        setFormData({ name: user?.name || '', whatsapp: '', reason: '', improvement: '' });
        onClose();
      } else {
        toast.error(result.message || 'Erro ao enviar ticket.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden">
          {/* Backdrop Liquid Glass */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-2xl transition-all duration-500"
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30, rotateX: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30, rotateX: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.5 }}
            className="relative w-full max-w-[480px] overflow-hidden rounded-[32px] bg-[#0A0A0A]/70 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5),0_0_40px_rgba(3,215,145,0.05)] backdrop-blur-3xl"
            style={{ perspective: '1000px' }}
          >
            {/* Liquid Background Glows */}
            <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-[#03d791]/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#03d791]/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#03d791]/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between p-8 pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#03d791]/10 border border-[#03d791]/20 text-[#03d791] shadow-[0_0_20px_rgba(3,215,145,0.2)]">
                  <MessageSquare size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Central de Suporte</h3>
                  <p className="text-[11px] font-bold text-[#b9cbbc] opacity-60 uppercase tracking-widest">Atendimento Sucatabet</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="group absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:border-white/20 transition-all active:scale-90"
              >
                <X size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="relative p-8 pt-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc] ml-1 opacity-60">Seu Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl bg-white/5 border border-white/5 p-4 text-[13px] font-bold text-white placeholder-white/20 focus:border-[#03d791]/40 focus:bg-white/[0.08] transition-all outline-none shadow-inner"
                    placeholder="Nome Completo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc] ml-1 opacity-60">WhatsApp *</label>
                  <div className="relative group">
                    <Smartphone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#03d791] transition-colors" />
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full rounded-2xl bg-white/5 border border-white/5 p-4 pl-10 text-[13px] font-bold text-white placeholder-white/20 focus:border-[#03d791]/40 focus:bg-white/[0.08] transition-all outline-none shadow-inner"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc] ml-1 opacity-60">Motivo do Contato *</label>
                <textarea
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full rounded-2xl bg-white/5 border border-white/5 p-4 text-[13px] font-bold text-white placeholder-white/20 focus:border-[#03d791]/40 focus:bg-white/[0.08] transition-all outline-none resize-none shadow-inner"
                  placeholder="Explique como podemos te ajudar hoje..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 ml-1">
                  <Sparkles size={12} className="text-amber-400" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#b9cbbc] opacity-60">Sugestão de Melhoria</label>
                </div>
                <textarea
                  value={formData.improvement}
                  onChange={e => setFormData({ ...formData, improvement: e.target.value })}
                  rows={2}
                  className="w-full rounded-2xl bg-white/5 border border-white/5 p-4 text-[13px] font-bold text-white placeholder-white/20 focus:border-[#03d791]/40 focus:bg-white/[0.08] transition-all outline-none resize-none shadow-inner opacity-80 focus:opacity-100"
                  placeholder="Ideia de nova funcionalidade?"
                />
              </div>

              <div className="pt-2 flex flex-col items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full group overflow-hidden rounded-2xl bg-[#03d791] p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale shadow-[0_20px_40px_-8px_rgba(3,215,145,0.4)]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 skew-y-12 origin-bottom" />
                  
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      <span className="text-black font-black uppercase text-xs tracking-widest">Enviando...</span>
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center gap-3">
                      <Send size={18} className="text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-black font-black uppercase text-sm tracking-[0.1em] italic">Enviar Ticket</span>
                    </div>
                  )}
                </button>

                {/* Priority Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${isPro ? 'bg-[#03d791]/10 border-[#03d791]/20 text-[#03d791]' : 'bg-white/5 border-white/10 text-[#b9cbbc]/60'}`}>
                  {isPro ? (
                    <>
                      <Zap size={10} className="fill-current animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">Suporte Prioritário Ativado</span>
                    </>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Atendimento em até 24h</span>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
