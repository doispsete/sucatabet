"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Banknote, 
  Ticket, 
  Users, 
  Wallet, 
  Crown
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { PlansModal } from "./modals/PlansModal";

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const [isPlansOpen, setIsPlansOpen] = React.useState(false);

  if (!user) return null;

  const items = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Operações", href: "/operacoes", icon: Banknote },
    ...(user.plan === 'PRO' || isAdmin ? [
      { label: "Banco", href: "/banco", icon: Wallet },
    ] : []),
    { label: "Freebets", href: "/freebets", icon: Ticket },
    { label: "Contas", href: "/contas", icon: Users },
    ...(user.plan !== 'PRO' && !isAdmin ? [
      { label: "Planos", href: undefined, icon: Crown, onClick: () => setIsPlansOpen(true) },
    ] : []),
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-2 h-[64px] safe-area-bottom">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href ? pathname === item.href : false;

          const content = (
            <div className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 min-w-[52px]
              ${isActive 
                ? "text-[#00ff88]" 
                : "text-white/40 active:text-white/80"}`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]" : ""}`} />
              <span className="text-[9px] font-bold uppercase tracking-wider leading-none">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
              )}
            </div>
          );

          return item.href ? (
            <Link key={item.href} href={item.href} className="relative flex">
              {content}
            </Link>
          ) : (
            <button key={item.label} onClick={item.onClick} className="relative flex">
              {content}
            </button>
          );
        })}
      </nav>

      <PlansModal isOpen={isPlansOpen} onClose={() => setIsPlansOpen(false)} />
    </>
  );
}
