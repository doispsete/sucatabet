"use client";

import { usePathname } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { DynamicBackground } from "./DynamicBackground";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isHalf, setIsHalf] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 760);
      setIsHalf(width >= 760 && width < 1280);
      if (width >= 760) setIsDrawerOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isDashboard = pathname === "/";
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/cadastro";

  if (isLogin || isRegister) {
    return <>{children}</>;
  }

  // Sidebar logic: Always 64px in Half-Screen or on non-dashboard pages.
  // Expanded only on Dashboard at Full resolution (>= 1280px).
  const sidebarWidth = isMobile ? 0 : (isHalf || !isDashboard ? 64 : 220);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-[#00ff88]/30 selection:text-[#00ff88]">
      {/* Progress Bar */}
      <div 
        className={`fixed top-0 left-0 h-[2px] bg-[#00ff88] z-[9999] transition-all duration-700 ease-out pointer-events-none ${isNavigating ? 'w-[70%]' : 'w-0 opacity-0'}`}
        style={{ boxShadow: '0 0 10px rgba(0,255,136,0.5)' }}
      />
      <DynamicBackground />
      {/* Mobile Menu Trigger (since Topbar is gone) */}
      {isMobile && (
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="fixed top-4 left-4 z-40 p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl text-[#00ff88] shadow-xl"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      )}

      <Sidebar 
        isMobile={isMobile} 
        isHalf={isHalf} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        isCollapsed={isHalf || !isDashboard}
      />

      {/* Mobile Overlay */}
      {isMobile && isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 animate-in fade-in cursor-pointer"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      <div 
        className="flex-1 flex flex-col min-h-screen transition-[margin,width] duration-300 cubic-bezier(0.16, 1, 0.3, 1) relative z-10"
        style={{ 
          marginLeft: isMobile ? "0px" : `${sidebarWidth}px`,
          width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`
        }}
      >
        <Suspense fallback={<div className="fixed top-0 left-0 right-0 h-20 bg-[#050505]/50 backdrop-blur-xl z-30" />}>
          <Topbar isMobile={isMobile} isHalf={isHalf} isCollapsed={isHalf || !isDashboard} />
        </Suspense>
        <main className="flex-1 overflow-y-auto pt-[100px] pb-10 px-3 md:px-8 lg:px-10 custom-scrollbar relative">
          {children}
        </main>
      </div>
    </div>
  );
}
