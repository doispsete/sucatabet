"use client";
import React, { useRef, useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { AccountCard } from "./AccountCard";
import * as T from "@/lib/api/types";

interface AccountCarouselProps {
  accounts: T.Account[];
  onAddAccount: () => void;
  onUnlink: () => void;
  profileName?: string;
}

export function AccountCarousel({ accounts, onAddAccount, onUnlink, profileName }: AccountCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Refs for inertia and tracking
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setProgress(scrollLeft / maxScroll);
      }
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll();
      // Small timeout to ensure correctly calculated clientWidth/scrollWidth
      const timer = setTimeout(handleScroll, 100);
      return () => {
        el.removeEventListener("scroll", handleScroll);
        clearTimeout(timer);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }
  }, [accounts]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const [moved, setMoved] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    
    // Stop any ongoing inertia
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsDragging(true);
    setMoved(false);
    
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    
    lastXRef.current = e.pageX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;

    // Disable smooth scroll / snap for immediate tracking
    scrollRef.current.style.scrollBehavior = "auto";
    scrollRef.current.style.scrollSnapType = "none";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    
    // Exact 1:1 tracking
    const walk = (x - startXRef.current); 
    if (Math.abs(walk) > 5) setMoved(true);
    
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    handleScroll(); // Update progress bar during move

    // Calculate velocity for inertia
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTimeRef.current;
    if (timeDelta > 0) {
      const xDelta = e.pageX - lastXRef.current;
      velocityRef.current = xDelta / timeDelta;
      lastXRef.current = e.pageX;
      lastTimeRef.current = currentTime;
    }
  };

  const applyInertia = () => {
    if (!scrollRef.current || Math.abs(velocityRef.current) < 0.1) {
      if (scrollRef.current) {
        scrollRef.current.style.scrollBehavior = "smooth";
        scrollRef.current.style.scrollSnapType = "x mandatory";
      }
      animationFrameRef.current = null;
      return;
    }

    scrollRef.current.scrollLeft -= velocityRef.current * 16;
    velocityRef.current *= 0.95;
    handleScroll(); // Update progress bar during inertia

    animationFrameRef.current = requestAnimationFrame(applyInertia);
  };

  const onMouseUp = () => {
    if (!isDragging || !scrollRef.current) return;
    setIsDragging(false);
    
    // Start inertia if moved fast enough
    if (Math.abs(velocityRef.current) > 0.2) {
      animationFrameRef.current = requestAnimationFrame(applyInertia);
    } else {
      // Re-enable snap immediately
      scrollRef.current.style.scrollBehavior = "smooth";
      scrollRef.current.style.scrollSnapType = "x mandatory";
    }
  };

  const onMouseLeave = () => {
    if (isDragging) onMouseUp();
  };

  return (
    <div className="relative group/carousel select-none">
      {/* Navigation Buttons */}
      <button 
        onClick={() => scroll("left")}
        className={`absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white transition-all hover:bg-[#03d791] hover:text-black hover:scale-110 hidden md:flex ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={() => scroll("right")}
        className={`absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white transition-all hover:bg-[#03d791] hover:text-black hover:scale-110 hidden md:flex ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <ChevronRight size={24} />
      </button>

      {/* Carousel Container */}
      <div 
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        className={`flex gap-6 overflow-x-auto pb-8 pt-2 px-2 no-scrollbar snap-x snap-mandatory scroll-smooth ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Link House Card (First Item) */}
        <div className="snap-start shrink-0 w-[320px] md:w-[350px]">
          <button
            onClick={() => {
              if (!moved) onAddAccount();
            }}
            className="w-full h-full min-h-[260px] glass-card rounded-[35px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center p-10 transition-all duration-500 hover:border-[#03d791]/30 hover:bg-[#03d791]/5 active:scale-95 group/add"
          >
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover/add:bg-[#03d791]/10 group-hover/add:scale-110 transition-all duration-500 border border-white/5 group-hover/add:border-[#03d791]/20">
              <Plus size={32} className="text-[#b9cbbc]/20 group-hover/add:text-[#03d791] group-hover/add:rotate-90 transition-all duration-500" />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#b9cbbc]/40 group-hover/add:text-[#03d791] italic text-center leading-relaxed">
              Vincular<br /><span className="text-white group-hover/add:text-[#03d791]">Nova Casa</span>
            </p>
          </button>
        </div>

        {/* Account Cards */}
        {accounts.map((acc) => (
          <div key={acc.id} className="snap-start shrink-0 w-[320px] md:w-[350px]">
            <AccountCard 
              account={acc} 
              profileName={profileName}
              onUnlink={onUnlink}
            />
          </div>
        ))}
      </div>
      
      {/* Scroll Progress Bar (Subtle) */}
      <div className="w-full h-[1px] bg-white/5 rounded-full overflow-hidden mt-[-15px] max-w-[200px] mx-auto opacity-20 group-hover/carousel:opacity-100 transition-opacity">
        <div 
          className="h-full bg-[#03d791] transition-all duration-150 ease-out shadow-[0_0_8px_#03d791]" 
          style={{ 
            width: `${100 / (accounts.length + 1)}%`,
            transform: `translateX(${progress * (accounts.length) * 100}%)`
          }} 
        />
      </div>
    </div>
  );
}
