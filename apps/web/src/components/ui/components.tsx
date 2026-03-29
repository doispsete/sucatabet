"use client";

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Loader2, ChevronDown, HelpCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, ChevronUp } from 'lucide-react';

// --- TOAST ---
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, type === 'success' ? 4000 : 8000);
    return () => clearTimeout(timer);
  }, [type, onClose]);

  return (
    <div className={`
      fixed bottom-8 right-8 z-[999999] flex items-center gap-4 p-5 rounded-2xl border-l-[6px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right-4 transition-all
      bg-[#131313] ${type === 'success' ? 'border-[#03D791] text-[#e5e2e1]' : 'border-[#EF4444] text-[#e5e2e1] ring-2 ring-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}
    `}>
      {type === 'success' ? <CheckCircle className="w-6 h-6 text-[#03D791]" /> : <AlertCircle className="w-6 h-6 text-[#EF4444]" />}
      <span className="text-sm font-bold tracking-tight">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-30 hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded-full">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Global Toast Manager (Simplified for this project)
let toastFn: (msg: string, type: 'success' | 'error') => void = () => {};

export function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);

  useEffect(() => {
    toastFn = (msg, type) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, msg, type }]);
    };
  }, []);

  return (
    <>
      {toasts.map(t => (
        <Toast key={t.id} message={t.msg} type={t.type} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}
    </>
  );
}

export const toast = {
  success: (msg: string) => toastFn(msg, 'success'),
  error: (msg: string) => toastFn(msg, 'error'),
};

export * from './skeleton';
export * from './error-state';
export * from './empty-state';

// --- LOADING BUTTON ---
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function LoadingButton({ children, isLoading, className, ...props }: LoadingButtonProps) {
  return (
    <button 
      disabled={isLoading || props.disabled}
      className={`relative flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#03D791]" />}
      <span>{isLoading ? 'AGUARDE...' : children}</span>
    </button>
  );
}

// --- INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input 
      className={`
        w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-white 
        focus:border-[#03D791]/30 outline-none transition-all placeholder:opacity-10
        ${className}
      `}
      onWheel={(e) => props.type === 'number' && e.currentTarget.blur()}
      {...props}
    />
  );
}

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-[440px]',
    md: 'max-w-[620px]',
    lg: 'max-w-[840px]',
    xl: 'max-w-[1240px]',
  };

  const modalContent = (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className={`
        relative w-full ${sizeClasses[size]} bg-[#111111] rounded-[40px] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] 
        animate-in zoom-in-95 slide-in-from-top-4 duration-300 flex flex-col max-h-[92vh] overflow-hidden
      `}>
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <h2 className="text-2xl font-black font-headline italic tracking-tighter uppercase text-white">{title}</h2>
          <button onClick={onClose} className="p-3 -mr-3 text-[#b9cbbc] hover:text-white hover:bg-white/5 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
// --- CUSTOM SELECT ---
interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "SELECIONAR...", className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = () => setIsOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`} onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black uppercase tracking-widest text-white focus:border-[#03D791]/30 transition-all group"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-5 h-5 text-[#b9cbbc] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: coords.top, 
            left: coords.left, 
            width: coords.width,
            zIndex: 9999 
          }}
          className="glass-card rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        >
          <div className="max-h-[240px] overflow-y-auto py-2 custom-scrollbar no-scrollbar">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all
                  ${value === opt.value ? 'bg-[#03D791] text-black shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]' : 'text-[#b9cbbc] hover:bg-white/10 hover:text-white'}
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// --- CONFIRM DIALOG ---
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'info';
}

export function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Confirmar", 
  cancelLabel = "Cancelar",
  type = 'info'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[400px] glass-card rounded-[40px] p-8 border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 text-center">
        <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${type === 'danger' ? 'bg-red-500/10' : 'bg-[#03D791]/10'}`}>
          {type === 'danger' ? <AlertCircle className="w-8 h-8 text-red-500" /> : <HelpCircle className="w-8 h-8 text-[#03D791]" />}
        </div>
        
        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">{title}</h3>
        <p className="text-xs text-[#b9cbbc] font-medium opacity-60 mb-10 px-4">{message}</p>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-white/5 text-[#b9cbbc] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic border border-white/5"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic shadow-2xl
              ${type === 'danger' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-[#03D791] text-black shadow-[#03D791]/20'}
            `}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// --- CUSTOM DATE PICKER ---
interface CustomDatePickerProps {
  value: string; // ISO string or datetime-local string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowPastDates?: boolean;
}

export function CustomDatePicker({ value, onChange, placeholder = "SELECIONAR DATA...", className, allowPastDates = false }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, isBottom: true });
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const selectedDate = value ? new Date(value) : null;

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = 280; // Compact size
      const popoverHeight = 440; // Approx height
      let left = rect.left;
      
      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 20;
      }

      // Check for space below
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldFlip = spaceBelow < popoverHeight && rect.top > popoverHeight;

      setCoords({
        top: shouldFlip ? rect.top - popoverHeight - 8 : rect.bottom + 8,
        left: left,
        width: popoverWidth,
        isBottom: !shouldFlip
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!allowPastDates && newDate < today) {
        toast.error("DATA INVÁLIDA: Não é possível selecionar uma data retroativa");
        return;
    }

    // Keep current time if exists
    if (selectedDate) {
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
    } else {
      newDate.setHours(12);
      newDate.setMinutes(0);
    }
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (type: 'h' | 'm', value: number, isDirect = false) => {
    const baseDate = selectedDate || new Date(viewDate.getFullYear(), viewDate.getMonth(), 1, 12, 0);
    const newDate = new Date(baseDate);
    if (type === 'h') {
        let newH = isDirect ? value : newDate.getHours() + value;
        if (newH > 23) newH = (isDirect ? 23 : 0);
        if (newH < 0) newH = (isDirect ? 0 : 23);
        newDate.setHours(newH);
    } else {
        let newM = isDirect ? value : newDate.getMinutes() + value;
        if (newM > 59) newM = (isDirect ? 59 : 0);
        if (newM < 0) newM = (isDirect ? 0 : 55); 
        newDate.setMinutes(newM);
    }
    onChange(newDate.toISOString());
  };

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Days from prev month
    const prevMonthDays = daysInMonth(year, month - 1);
    
    const days = [];

    // Render padding from prev month
    for (let i = startDay - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        const dObj = new Date(year, month - 1, d);
        const isPast = !allowPastDates && dObj < today;

        days.push(
            <button 
                key={`prev-${d}`} 
                type="button"
                disabled={isPast}
                onClick={() => {
                    setViewDate(dObj);
                    handleDateSelect(d);
                }}
                className={`h-10 w-10 text-[10px] font-black transition-all flex items-center justify-center italic
                    ${isPast ? 'opacity-0 pointer-events-none' : 'text-[#b9cbbc]/10 hover:text-[#b9cbbc]/30'}
                `}
            >
                {d}
            </button>
        );
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
        const dateToCheck = new Date(year, month, d);
        const isPast = !allowPastDates && dateToCheck < today;
        const isSelected = selectedDate?.getDate() === d && 
                         selectedDate?.getMonth() === month && 
                         selectedDate?.getFullYear() === year;
        const isToday = new Date().getDate() === d && 
                        new Date().getMonth() === month && 
                        new Date().getFullYear() === year;

        days.push(
            <button
                key={d}
                type="button"
                disabled={isPast}
                onClick={() => handleDateSelect(d)}
                className={`
                    h-10 w-10 rounded-xl text-[10px] font-black transition-all flex items-center justify-center
                    ${isSelected ? 'bg-[#03D791] text-black shadow-[0_0_15px_rgba(3,215,145,0.4)]' : 
                      isToday ? 'bg-white/10 text-[#03D791]' : 
                      isPast ? 'opacity-20 cursor-not-allowed text-[#b9cbbc]' : 'text-[#b9cbbc] hover:bg-white/5 hover:text-white'}
                `}
            >
                {d}
            </button>
        );
    }

    // Next month padding
    const remaining = 42 - days.length; // 6 rows of 7
    for (let d = 1; d <= remaining; d++) {
        const dObj = new Date(year, month + 1, d);
        const isPast = !allowPastDates && dObj < today;

        days.push(
            <button 
                key={`next-${d}`} 
                type="button"
                disabled={isPast}
                onClick={() => {
                    setViewDate(dObj);
                    handleDateSelect(d);
                }}
                className={`h-10 w-10 text-[10px] font-black transition-all flex items-center justify-center italic
                    ${isPast ? 'opacity-0 pointer-events-none' : 'text-[#b9cbbc]/10 hover:text-[#b9cbbc]/30'}
                `}
            >
                {d}
            </button>
        );
    }

    return days;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black uppercase tracking-widest text-[#00ff88] focus:border-[#00ff88]/30 transition-all group hover:bg-black/70"
      >
        <div className="flex items-center gap-3">
            <CalendarIcon size={16} className="text-[#00ff88] animate-pulse" />
            <span className="truncate italic">
                {selectedDate ? selectedDate.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : placeholder}
            </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#b9cbbc] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div 
          ref={popoverRef}
          style={{ 
            position: 'fixed', 
            top: coords.top, 
            left: coords.left, 
            width: coords.width,
            zIndex: 9999 
          }}
          className={`glass-card rounded-[30px] border border-white/10 shadow-[0_60px_120px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in duration-300 p-6 flex flex-col
            ${coords.isBottom ? 'zoom-in-95 slide-in-from-top-2' : 'zoom-in-95 slide-in-from-bottom-2'}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-full text-[#b9cbbc] transition-all hover:text-[#00ff88]"><ChevronLeft size={16} /></button>
            <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">{months[viewDate.getMonth()]}</p>
                <p className="text-[8px] font-black text-[#b9cbbc]/20 uppercase tracking-widest">{viewDate.getFullYear()}</p>
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-full text-[#b9cbbc] transition-all hover:text-[#00ff88]"><ChevronRight size={16} /></button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map(d => (
                <div key={d} className="text-center text-[8px] font-black text-[#b9cbbc]/20 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5 mb-4">
            {renderCalendar()}
          </div>

          {/* Time Picker */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-[#00ff88] opacity-50" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#b9cbbc]/40 italic">Horário</span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4">
                {/* Hours */}
                <div className="flex flex-col items-center gap-1">
                    <button onClick={() => handleTimeChange('h', 1)} className="p-1 hover:text-[#00ff88] transition-all rounded-lg"><ChevronUp size={16}/></button>
                    <input 
                        type="number"
                        min="0"
                        max="23"
                        value={(selectedDate?.getHours() || 0).toString().padStart(2, '0')}
                        onChange={e => handleTimeChange('h', parseInt(e.target.value) || 0, true)}
                        className="bg-black/40 border border-white/5 rounded-xl w-12 h-10 flex items-center justify-center text-lg font-black italic text-[#00ff88] text-center focus:border-[#00ff88]/30 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button onClick={() => handleTimeChange('h', -1)} className="p-1 hover:text-[#00ff88] transition-all rounded-lg"><ChevronDown size={16}/></button>
                </div>
                
                <div className="text-xl font-black text-white/5 animate-pulse">:</div>
                
                {/* Minutes */}
                <div className="flex flex-col items-center gap-1">
                    <button onClick={() => handleTimeChange('m', 5)} className="p-1 hover:text-[#00ff88] transition-all rounded-lg"><ChevronUp size={16}/></button>
                    <input 
                        type="number"
                        min="0"
                        max="59"
                        value={(selectedDate?.getMinutes() || 0).toString().padStart(2, '0')}
                        onChange={e => handleTimeChange('m', parseInt(e.target.value) || 0, true)}
                        className="bg-black/40 border border-white/5 rounded-xl w-12 h-10 flex items-center justify-center text-lg font-black italic text-[#00ff88] text-center focus:border-[#00ff88]/30 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button onClick={() => handleTimeChange('m', -5)} className="p-1 hover:text-[#00ff88] transition-all rounded-lg"><ChevronDown size={16}/></button>
                </div>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 bg-[#00ff88] text-black text-[9px] font-black uppercase tracking-[0.1em] py-3 rounded-xl shadow-[0_15px_30px_rgba(0,255,136,0.2)] hover:scale-[1.02] active:scale-95 transition-all italic"
          >
            CONFIRMAR
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

// --- CUSTOM DATE RANGE PICKER ---
export function CustomDateRangePicker({ 
  startDate, 
  endDate, 
  onChange, 
  placeholder = "SELECIONAR PERÍODO",
  className = ""
}: { 
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void; 
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Local states to avoid constant parent re-renders while choosing
  const [localStart, setLocalStart] = useState<string | null>(startDate);
  const [localEnd, setLocalEnd] = useState<string | null>(endDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  
  const [inputValue1, setInputValue1] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0, flip: false });

  // Sync internal state when props change (only if not open)
  useEffect(() => {
    if (!isOpen) {
      setLocalStart(startDate);
      setLocalEnd(endDate);
    }
  }, [startDate, endDate, isOpen]);

  useEffect(() => {
    if (localStart) setInputValue1(new Date(localStart).toLocaleDateString('pt-BR'));
    else setInputValue1("");
    if (localEnd) setInputValue2(new Date(localEnd).toLocaleDateString('pt-BR'));
    else setInputValue2("");
  }, [localStart, localEnd]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const portal = document.getElementById('datepicker-portal');
        if (portal && portal.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const flip = spaceBelow < 450 && rect.top > 450;
      setPopupPos({ top: flip ? rect.top : rect.bottom, left: rect.left, width: rect.width, flip });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleManualInput = (val: string, type: 'start' | 'end') => {
    let cleaned = val.replace(/\D/g, '').slice(0, 8);
    if (cleaned.length >= 2) cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    if (cleaned.length >= 5) cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
    
    if (type === 'start') setInputValue1(cleaned);
    else setInputValue2(cleaned);

    if (cleaned.length === 10) {
      const [d, m, y] = cleaned.split('/').map(Number);
      const date = new Date(y, m - 1, d);
      if (!isNaN(date.getTime())) {
        if (type === 'start') setLocalStart(date.toISOString());
        else setLocalEnd(date.toISOString());
      }
    }
  };

  const [dragStartCandidate, setDragStartCandidate] = useState<Date | null>(null);

  const handleDateClick = (e: React.MouseEvent, day: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only handle click selection if we weren't just dragging
    if (isDragging) return;

    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    clickedDate.setHours(0,0,0,0);

    const s = localStart ? new Date(localStart) : null;
    const e_val = localEnd ? new Date(localEnd) : null;

    if (!s || (s && e_val)) {
      setLocalStart(clickedDate.toISOString());
      setLocalEnd(null);
    } else {
      if (clickedDate < s) {
        setLocalStart(clickedDate.toISOString());
        setLocalEnd(s.toISOString());
      } else {
        setLocalEnd(clickedDate.toISOString());
      }
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
        setIsDragging(false);
        setDragStartCandidate(null);
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, []);

  const onMouseDownDate = (e: React.MouseEvent, day: number) => {
    e.preventDefault();
    e.stopPropagation();
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    d.setHours(0,0,0,0);
    setDragStartCandidate(d);
  };

  const onMouseEnterDate = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    d.setHours(0,0,0,0);
    setHoverDate(d);
    
    if (dragStartCandidate) {
      if (!isDragging && d.getTime() !== dragStartCandidate.getTime()) {
          setIsDragging(true);
          setLocalStart(dragStartCandidate.toISOString());
          setLocalEnd(null);
      }
      
      if (isDragging) {
          const s = dragStartCandidate;
          if (d < s) {
              setLocalStart(d.toISOString());
              setLocalEnd(s.toISOString());
          } else {
              setLocalStart(s.toISOString());
              setLocalEnd(d.toISOString());
          }
      }
    }
  };

  const isSelected = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    d.setHours(0,0,0,0);
    const s = localStart ? new Date(localStart) : null;
    const e = localEnd ? new Date(localEnd) : null;
    return (s && d.getTime() === s.getTime()) || (e && d.getTime() === e.getTime());
  };

  const isInRange = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    d.setHours(0,0,0,0);
    const s = localStart ? new Date(localStart) : null;
    const e = localEnd ? new Date(localEnd) : null;
    const h = hoverDate;

    if (s && !e && h) {
      const rangeStart = s < h ? s : h;
      const rangeEnd = s < h ? h : s;
      return d >= rangeStart && d <= rangeEnd;
    }

    if (!s || !e) return false;
    return d > s && d < e;
  };

  const calendar = (
    <div 
      className={`fixed z-[9999] bg-[#0a0a0b]/98 backdrop-blur-3xl border border-white/10 rounded-[32px] p-7 shadow-[0_30px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300 w-[300px]`}
      style={{
        top: popupPos.flip ? (popupPos.top - 15) : (popupPos.top + 15),
        left: Math.max(10, popupPos.left - 40),
        transform: popupPos.flip ? 'translateY(-100%)' : 'none'
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseLeave={() => setHoverDate(null)}
    >
      <div className="flex items-center justify-between mb-6">
        <button onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)); }} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
          <ChevronLeft size={18} />
        </button>
        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white italic">
          {viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)); }} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-3 text-center">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <span key={`day-label-${d}-${i}`} className="text-[9px] font-black text-white/10">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5" onMouseUp={() => setIsDragging(false)}>
        {Array(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay()).fill(0).map((_, i) => <div key={`empty-${viewDate.getMonth()}-${i}`} />)}
        {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => (
          <button
            key={`day-${viewDate.getMonth()}-${day}`}
            onMouseDown={(e) => onMouseDownDate(e, day)}
            onMouseEnter={() => onMouseEnterDate(day)}
            onClick={(e) => handleDateClick(e, day)}
            className={`
              w-9 h-9 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center relative group
              ${isSelected(day) ? 'bg-[#00d1ff] text-black shadow-[0_0_20px_rgba(0,209,255,0.4)] z-10' : 
                isInRange(day) ? 'bg-[#00d1ff]/10 text-[#00d1ff]' :
                'text-white/40 hover:bg-white/5'}
            `}
          >
            {day}
            <div className={`absolute inset-0 border-2 border-[#00d1ff] rounded-xl opacity-0 group-hover:opacity-20 transition-opacity ${isSelected(day) ? 'hidden' : ''}`} />
          </button>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-3">
          <button 
            onClick={(e) => { 
                e.stopPropagation(); 
                onChange(localStart, localEnd);
                setIsOpen(false); 
            }}
            className="w-full py-3 bg-[#00d1ff] text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all shadow-[0_10px_20px_rgba(0,209,255,0.2)]"
          >
            Confirmar Período
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLocalStart(null);
              setLocalEnd(null);
              setInputValue1("");
              setInputValue2("");
            }}
            className="w-full py-3 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 hover:text-white transition-all"
          >
            Limpar
          </button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
        <div 
            onClick={() => setIsOpen(true)}
            className="flex items-center bg-white/[0.03] border border-white/10 rounded-2xl group hover:border-white/20 transition-all cursor-text overflow-hidden"
        >
            <div className="flex items-center justify-center w-10 h-10 border-r border-white/10 bg-white/5 group-hover:bg-white/10 transition-colors">
                <CalendarIcon size={14} className="text-[#00d1ff] animate-pulse" />
            </div>
            <div className="flex items-center gap-1 px-2">
                <input 
                    type="text" 
                    value={inputValue1}
                    placeholder="INÍCIO"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleManualInput(e.target.value, 'start')}
                    className="w-20 bg-transparent border-none focus:ring-0 text-[10px] font-black text-white placeholder:text-white/10 uppercase tracking-tighter"
                />
                <span className="text-white/10 font-bold">-</span>
                <input 
                    type="text" 
                    value={inputValue2}
                    placeholder="FIM"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleManualInput(e.target.value, 'end')}
                    className="w-20 bg-transparent border-none focus:ring-0 text-[10px] font-black text-white placeholder:text-white/10 uppercase tracking-tighter"
                />
            </div>
        </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
            calendar, 
            document.getElementById('datepicker-portal') || document.body
      )}
    </div>
  );
}
