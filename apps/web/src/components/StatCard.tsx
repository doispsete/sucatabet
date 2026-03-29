"use client";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  color?: string;
}

export function StatCard({ label, value, trend, trendUp, icon: Icon, color = "primary" }: StatCardProps) {
  return (
    <div className="glass-card rounded-[24px] p-6 flex flex-col gap-4 group transition-all duration-500">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${trendUp ? 'text-primary bg-primary/10 border-primary/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
            {trend}
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#B9CBBC] opacity-60">
          {label}
        </span>
        <span className="text-2xl font-black text-white tracking-tight">
          {value}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-700"></div>
    </div>
  );
}
