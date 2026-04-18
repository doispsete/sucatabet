"use client";
import { useEffect } from 'react';

export function AnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    
    const updateFavicon = (dataUrl: string) => {
      // Remove ALL existing icons to avoid browser confusion
      const existingIcons = document.querySelectorAll("link[rel~='icon']");
      existingIcons.forEach(el => el.parentNode?.removeChild(el));

      const link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = dataUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    };

    const drawZap = (glowSize: number) => {
      ctx.clearRect(0, 0, 64, 64);
      
      const zapColor = '#00ff88';
      
      // Glow effect - Optimized for official shape
      ctx.shadowBlur = glowSize * 1.5;
      ctx.shadowColor = zapColor;
      
      ctx.beginPath();
      ctx.fillStyle = zapColor;
      
      // Official SucataBet Zap shape (thicker, boxy)
      ctx.moveTo(40, 4);   
      ctx.lineTo(14, 34);  
      ctx.lineTo(30, 34);  
      ctx.lineTo(26, 60);  
      ctx.lineTo(52, 30);  
      ctx.lineTo(36, 30);  
      ctx.closePath();
      
      ctx.fill();
      
      // Inner fill for secondary highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      updateFavicon(canvas.toDataURL('image/png'));
    };

    let animationId: number;
    const animate = () => {
      frame += 0.08;
      const glow = 5 + Math.sin(frame) * 4;
      drawZap(glow);
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return null;
}
