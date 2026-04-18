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
      
      // Official SucataBet Zap shape (Balanced Wide - V12)
      ctx.beginPath();
      ctx.moveTo(48, 8);   
      ctx.lineTo(10, 34);  
      ctx.lineTo(28, 34);  
      ctx.lineTo(18, 56);  
      ctx.lineTo(54, 30);  
      ctx.lineTo(36, 30);  
      ctx.closePath();

      // Bloom Effect (Outer Glow)
      ctx.shadowBlur = glowSize * 2.5;
      ctx.shadowColor = zapColor;
      ctx.strokeStyle = zapColor;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Secondary sharpen stroke (Inner Intensity)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.stroke();
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
