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
      
      // Glow effect - More intense for 64x64
      ctx.shadowBlur = glowSize * 2;
      ctx.shadowColor = zapColor;
      
      ctx.beginPath();
      ctx.fillStyle = zapColor;
      
      // Draw lightning bolt shape (scaled to 64x64)
      ctx.moveTo(36, 4);    // Top
      ctx.lineTo(16, 36);   // Middle left
      ctx.lineTo(30, 36);   // Inset
      ctx.lineTo(28, 60);   // Bottom
      ctx.lineTo(48, 28);   // Middle right
      ctx.lineTo(34, 28);   // Inset
      ctx.closePath();
      
      ctx.fill();
      
      // Inner fill for "bolt" look
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.4;
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
