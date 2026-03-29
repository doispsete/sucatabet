"use client";

import React, { useEffect, useRef } from "react";

export function DynamicBackground() {
  const bg1Ref = useRef<HTMLDivElement>(null);
  const bg2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let requestRef: number;
    let mouseX = 50;
    let mouseY = 50;
    let currentX1 = 50;
    let currentY1 = 50;
    let currentX2 = 50;
    let currentY2 = 50;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;
    };

    const animate = () => {
      // Suavização (lerp)
      currentX1 += (mouseX - currentX1) * 0.05;
      currentY1 += (mouseY - currentY1) * 0.05;
      
      currentX2 += ((100 - mouseX) - currentX2) * 0.05;
      currentY2 += ((100 - mouseY) - currentY2) * 0.05;

      if (bg1Ref.current) {
        bg1Ref.current.style.transform = `translate(${currentX1 - 50}%, ${currentY1 - 50}%)`;
      }
      if (bg2Ref.current) {
        bg2Ref.current.style.transform = `translate(${currentX2 - 50}%, ${currentY2 - 50}%)`;
      }

      requestRef = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    requestRef = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div 
        ref={bg1Ref}
        className="absolute w-[600px] h-[600px] bg-[#00ff88]/20 blur-[150px] rounded-full will-change-transform"
        style={{ left: '0', top: '0', transform: 'translate(0, 0)' }}
      ></div>
      <div 
        ref={bg2Ref}
        className="absolute w-[400px] h-[400px] bg-[#00ff88]/15 blur-[120px] rounded-full will-change-transform"
        style={{ right: '0', bottom: '0', transform: 'translate(0, 0)' }}
      ></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] contrast-120 brightness-125 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-radial from-white/[0.02] to-transparent pointer-events-none"></div>
    </div>
  );
}
