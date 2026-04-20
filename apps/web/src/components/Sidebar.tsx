import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Banknote, 
  Ticket, 
  Users, 
  ShieldCheck, 
  Plus, 
  Settings,
  LogOut,
  Wallet,
  Calculator,
  Bell,
  Gamepad2,
  Zap,
  Bolt,
  Crown,
  LifeBuoy
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { useModal } from "@/lib/context/modal-context";
import { ProfileModal } from "./modals/ProfileModal";
import { PlansModal } from "./modals/PlansModal";
import { CasinoModal } from "./modals/CasinoModal";
import { SupportModal } from "./modals/SupportModal";

interface SidebarProps {
  isMobile?: boolean;
  isHalf?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
}

export function Sidebar({ isMobile, isHalf, isOpen, onClose, isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const { openNewOperation } = useModal();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isPlansOpen, setIsPlansOpen] = React.useState(false);
  const [isCasinoOpen, setIsCasinoOpen] = React.useState(false);
  const [isSupportOpen, setIsSupportOpen] = React.useState(false);
  const activeCollapsed = isCollapsed || isHalf;

  if (!user && !isAuthLoading) return null;
  
  const handleManageSubscription = async () => {
    import('@/components/ui/components').then(({ toast }) => {
      toast.success('Redirecionando para o Portal de Assinatura Stripe...');
    });
    try {
      const { stripeService } = await import('@/lib/api/services');
      const response = await stripeService.createPortalSession();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (err) {
      console.error(err);
      import('@/components/ui/components').then(({ toast }) => {
        toast.error('Erro ao acessar o portal.');
      });
    }
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Operações", href: "/operacoes", icon: Banknote },
    ...(user?.plan === 'PRO' || user?.plan === 'BASIC' || isAdmin ? [
      { label: "Banco", href: "/banco", icon: Wallet },
    ] : []),
    { label: "Freebets", href: "/freebets", icon: Ticket },
    ...(user?.plan === 'PRO' || user?.plan === 'BASIC' || isAdmin ? [
      { label: "Cassino", onClick: () => setIsCasinoOpen(true), icon: Gamepad2 }
    ] : []),
    { label: "Contas", href: "/contas", icon: Users },
    ...(isAdmin ? [{ label: "Admin", href: "/admin", icon: ShieldCheck }] : []),
    { label: "Suporte", onClick: () => setIsSupportOpen(true), icon: LifeBuoy },
    ...(user && (user.plan === 'PRO' || user.plan === 'BASIC') && !isAdmin ? [
      { label: "Gerenciar Assinatura", onClick: handleManageSubscription, icon: Crown }
    ] : [
      { label: "Planos", onClick: () => setIsPlansOpen(true), icon: Crown }
    ]),
  ];

  const sidebarClasses = isMobile
    ? `fixed left-0 top-0 h-full z-50 bg-black/20 backdrop-blur-2xl border-r border-white/10 flex flex-col items-center py-8 gap-y-6 transition-[transform] duration-300 cubic-bezier(0.16, 1, 0.3, 1) w-[240px] ${isOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl shadow-black/50'}`
    : `fixed left-0 top-[56px] h-[calc(100vh-56px)] z-40 bg-black/20 backdrop-blur-2xl border-r border-white/5 flex flex-col items-center py-8 gap-y-6 transition-[width] duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${activeCollapsed ? "w-[64px]" : "w-[220px]"}`;

  const isWide = !activeCollapsed || (isMobile && isOpen);

  return (
    <>
      <aside className={`${sidebarClasses} will-change-[width,transform]`}>
        <div className="w-full flex items-center transition-all duration-300 mb-6 px-2">
          <div className="flex items-center justify-center min-w-[48px] h-12 shrink-0 group">
            <Zap className="w-7 h-7 text-[#03d791] fill-[#03d791]/10 drop-shadow-[0_0_10px_rgba(3,215,145,0.4)] group-hover:scale-110 transition-transform cursor-pointer" />
          </div>
          <div className={`flex flex-col transition-all duration-300 ml-1
            ${isWide ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'}`}>
            <span className="text-sm font-black tracking-tight text-white uppercase italic whitespace-nowrap">Sucata Bet</span>
            <span className="text-[9px] text-[#b9cbbc] font-bold uppercase tracking-tighter -mt-1 whitespace-nowrap">Sistema de Surebet</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-y-2 w-full px-2">
          {menuItems.map((item) => {
            const isActive = item.href ? pathname === item.href : false;
            const IconComponent = item.icon;
            
            const Content = (
              <div
                className={`flex items-center h-12 transition-all duration-300 group relative overflow-hidden rounded-xl w-full cursor-pointer
                  ${isActive 
                    ? "bg-[#00ff88]/10 text-[#00ff88]" 
                    : "text-[#B9CBBC] opacity-60 hover:opacity-100 hover:bg-white/10 hover:text-[#00ff88]"}`}
                title={!isWide ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#00ff88] rounded-r-full shadow-[0_0_10px_rgba(0,255,136,0.5)] z-20" />
                )}
                
                <div className="flex items-center justify-center min-w-[48px] h-12 shrink-0 relative z-10">
                  <IconComponent className={`w-5 h-5 transition-transform duration-300 ${isActive ? "text-[#00ff88]" : "group-hover:scale-110 active:scale-90"}`} />
                </div>

                <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap
                  ${isWide ? 'opacity-100 translate-x-0 ml-1' : 'opacity-0 -translate-x-12 pointer-events-none'}`}>
                  {item.label}
                </span>
              </div>
            );

            return item.href ? (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => isMobile && onClose?.()}
                className="w-full"
              >
                {Content}
              </Link>
            ) : (
              <div 
                key={item.label} 
                onClick={() => {
                  item.onClick?.();
                  isMobile && onClose?.()}
                }
                className="w-full"
              >
                {Content}
              </div>
            );
          })}

          {/* Action Button - Simplified & Consistent */}
          <div className="mt-2">
            <button 
              onClick={() => openNewOperation()}
              className={`flex items-center h-12 bg-[#00ff88] text-black font-black uppercase tracking-widest text-[10px] btn-interact transition-all duration-300 overflow-hidden group shadow-[0_0_15px_rgba(0,255,136,0.2)] rounded-xl w-full
              ${isWide ? "" : "w-12 ml-[0px]"}`}
              title={!isWide ? "Nova Operação" : undefined}
            >
              <div className="flex items-center justify-center min-w-[48px] h-12 shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <span className={`transition-all duration-300 whitespace-nowrap ${isWide ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'}`}>
                Nova Operação
              </span>
            </button>
          </div>
        </nav>

        {/* Profile Section - Stabilized */}
        <div className="mt-auto w-full flex flex-col gap-2 px-2 mb-6">
          <div 
            onClick={() => setIsProfileOpen(true)}
            className={`group flex items-center h-14 rounded-2xl transition-all duration-300 relative overflow-hidden cursor-pointer
              ${isWide ? 'bg-white/5 border border-white/5 hover:border-[#00ff88]/30' : 'hover:bg-white/5 border border-transparent'}`}
          >
            {/* Avatar Slot - Fixed */}
            <div className="flex items-center justify-center min-w-[48px] h-14 shrink-0 relative z-10">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#00ff88]/20 shadow-[0_0_10px_rgba(0,255,136,0.1)] bg-white/5">
                {isAuthLoading ? (
                  <div className="w-full h-full animate-pulse bg-white/10" />
                ) : (
                  <img 
                    src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Lucky'}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* User Info - Slid in */}
            <div className={`flex flex-col min-w-0 transition-all duration-300 ml-1
              ${isWide ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'}`}>
              {isAuthLoading ? (
                <>
                  <div className="h-3 w-20 animate-pulse bg-white/10 rounded mb-1" />
                  <div className="h-2 w-12 animate-pulse bg-[#00ff88]/20 rounded" />
                </>
              ) : (
                <>
                  <span className="text-[11px] font-black text-white truncate uppercase tracking-tight italic whitespace-nowrap">{user?.name || 'Usuário'}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-[#00ff88] truncate uppercase tracking-[0.2em] font-black whitespace-nowrap">{user?.role || 'User'}</span>
                    <span className="text-[8px] text-white/40 font-black">•</span>
                    <span className="text-[8px] text-white/60 truncate uppercase tracking-[0.1em] font-black whitespace-nowrap">{user?.plan || 'FREE'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Logout Button - Stabilized */}
          <button 
            onClick={() => logout()}
            className={`flex items-center h-12 w-full rounded-xl text-[#EF4444] group transition-all duration-300 relative overflow-hidden
              ${isWide ? 'bg-[#EF4444]/5 hover:bg-[#EF4444]/10' : 'justify-center hover:bg-[#EF4444]/10'}`}
            title="Sair do Sistema"
          >
            <div className="flex items-center justify-center min-w-[48px] h-12 shrink-0 relative z-10">
              <LogOut className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap
              ${isWide ? 'opacity-100 translate-x-0 ml-1' : 'opacity-0 -translate-x-12 pointer-events-none absolute'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      <PlansModal 
        isOpen={isPlansOpen} 
        onClose={() => setIsPlansOpen(false)} 
      />

      <CasinoModal 
        isOpen={isCasinoOpen} 
        onClose={() => setIsCasinoOpen(false)} 
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </>
  );
}
