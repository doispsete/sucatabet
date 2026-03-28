"use client";
import { usePathname } from "next/navigation";

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/";

  return (
    <div 
      className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300
      ${isDashboard ? "ml-[220px]" : "ml-[64px]"}`}
    >
      {children}
    </div>
  );
}
