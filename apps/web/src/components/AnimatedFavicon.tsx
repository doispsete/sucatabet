"use client";
import { useEffect } from 'react';

export function AnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    const drawZap = (glowSize: number) => {
      ctx.clearRect(0, 0, 32, 32);
      
      const zapColor = '#00ff88';
      
      // Glow effect
      ctx.shadowBlur = glowSize;
      ctx.shadowColor = zapColor;
      
      ctx.beginPath();
      ctx.fillStyle = zapColor;
      
      // Draw lightning bolt shape (simplified Lucide Zap)
      // Path based on 32x32 canvas
      ctx.moveTo(18, 2);   // Top point
      ctx.lineTo(8, 18);   // To middle left
      ctx.lineTo(15, 18);  // Inset
      ctx.lineTo(14, 30);  // Bottom point
      ctx.lineTo(24, 14);  // To middle right
      ctx.lineTo(17, 14);  // Inset
      ctx.closePath();
      
      ctx.fill();
      
      // Inner fill for more "zap" look
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      link.href = canvas.toDataURL('image/png');
    };

    const animate = () => {
      frame += 0.05;
      // Pulse between 2 and 12 pixels of glow
      const glow = 7 + Math.sin(frame) * 5;
      drawZap(glow);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return null;
}
