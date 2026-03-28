import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Settings,
  Menu,
  Calculator,
  AlertTriangle
} from "lucide-react";
import { useDashboardSummary, useFreebets } from "@/lib/hooks";

interface TopbarProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
  isHalf?: boolean;
  isCollapsed?: boolean;
}

export function Topbar({ onMenuClick, isMobile, isHalf, isCollapsed }: TopbarProps) {
  const pathname = usePathname();
  const isCalc = pathname === "/calculadora";
  const isAlerts = pathname === "/alertas";

  const { data: summary } = useDashboardSummary();
  const { data: allFreebets } = useFreebets();
  
  const summaryAlerts = summary?.freebetsExpirando || [];
  
  // Combine with client-side filtered freebets (< 48h) to catch missed alerts
  const combinedAlerts = (() => {
    const now = Date.now();
    const clientFiltered = (Array.isArray(allFreebets) ? allFreebets : [])
      .filter((fb: any) => {
        if (!fb.expiresAt) return false;
        const diff = (new Date(fb.expiresAt).getTime() - now) / 3600000;
        return diff > 0 && diff <= 48; // Only future freebets within 48h
      });

    const map = new Map();
    [...summaryAlerts, ...clientFiltered].forEach(fb => map.set(fb.id, fb));
    return Array.from(map.values());
  })();

  const minDiffHours = combinedAlerts.length > 0 
    ? Math.min(...combinedAlerts
        .map((fb: any) => fb.expiresAt ? new Date(fb.expiresAt).getTime() : null)
        .filter((t): t is number => t !== null && !isNaN(t))
        .map(t => Math.ceil((t - Date.now()) / 3600000))
      )
    : Infinity;

  const alertBlinkClass = minDiffHours <= 2 
    ? "animate-blink-red !text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
    : minDiffHours <= 24 
      ? "animate-blink-red-slow !text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" 
      : minDiffHours <= 48 
        ? "animate-blink-orange !text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]" 
        : "";

  const { push } = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [time, setTime] = useState<Date | null>(null);

  // Clock Update - UTC-3 (America/Sao_Paulo)
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time ? time.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '') : "";

  // Debounce search update to URL
  useEffect(() => {
    if (pathname !== "/operacoes") return;
    
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      push(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, pathname, push, searchParams]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 h-[56px] bg-black/20 backdrop-blur-2xl border-b border-white/5 z-50 flex items-center justify-between transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) will-change-[backdrop-filter,background-color]
        ${isMobile ? "px-4" : (isCollapsed ? "pl-[64px] pr-8" : "pl-[220px] pr-8")}`}
    >
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        {isMobile && (
          <button 
            onClick={onMenuClick}
            className="p-2 text-[#00ff88] hover:bg-white/5 rounded-lg active:scale-95 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}

        {/* HUD Navigation */}
        {!isMobile && (
          <nav className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <Link 
              href="/calculadora" 
              className={`px-4 md:px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 flex items-center gap-2
                ${isCalc 
                  ? "bg-[#00ff88] text-black font-black shadow-[0_0_15px_rgba(0,255,136,0.3)]" 
                  : "text-gray-400 hover:text-white"}`}
            >
              <Calculator className="w-4 h-4" />
              {!isHalf && <span>Calculadora</span>}
            </Link>
            <Link 
              href="/alertas" 
              className={`px-4 md:px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 flex items-center gap-2
                ${isAlerts 
                  ? `bg-[#00ff88] text-black font-black shadow-[0_0_15px_rgba(0,255,136,0.3)] ${alertBlinkClass}` 
                  : alertBlinkClass || "text-gray-400 hover:text-white"}`}
            >
              <AlertTriangle className={`w-4 h-4 ${alertBlinkClass ? "animate-pulse" : ""}`} />
              {!isHalf && <span>Alertas</span>}
            </Link>
          </nav>
        )}

        {/* Search Bar - Visible ONLY on /operacoes */}
        {!isMobile && pathname === "/operacoes" && (
          <div className="relative group animate-in slide-in-from-left duration-500">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00ff88] transition-colors w-4 h-4" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`bg-white/5 border border-white/10 rounded-full pl-12 py-2 text-sm focus:outline-none focus:border-[#00ff88]/50 focus:ring-0 transition-all placeholder:text-gray-600 text-white input-interact
                ${isHalf ? "w-12 pr-0 cursor-pointer overflow-hidden" : "w-64 lg:w-80 pr-6"}`} 
              placeholder={isHalf ? "" : "pesquisar casa, operador ou descrição..."} 
              type="text"
            />
          </div>
        )}

        {isMobile && (
           <h1 className="text-sm font-black text-[#00ff88] tracking-widest italic uppercase">Sucata Bet</h1>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {isMobile && (
          <button className="p-2 text-gray-400 hover:text-[#00ff88] btn-interact">
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Repositioned Clock - UTC-3 */}
        {!isMobile && (
          <div className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl transition-all hover:border-[#00ff88]/20 group">
            <span className="text-[11px] font-black text-[#B9CBBC] opacity-60 tracking-[0.2em] italic uppercase tabular-nums group-hover:opacity-100 transition-opacity">
              {formattedTime}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
