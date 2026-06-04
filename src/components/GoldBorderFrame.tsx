import React from 'react';

interface GoldBorderFrameProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export default function GoldBorderFrame({ children, className = '', active = true }: GoldBorderFrameProps) {
  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl group ${className}`} id="gold-animated-border-frame">
      {/* 4 Laser tracing gold lines (Desktop-only for maximum performance) */}
      {/* Top line */}
      <div className="absolute top-0 left-0 w-full h-[1.5px] overflow-hidden pointer-events-none z-30 hidden md:block">
        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-laser-t" />
      </div>

      {/* Right line */}
      <div className="absolute top-0 right-0 w-[1.5px] h-full overflow-hidden pointer-events-none z-30 hidden md:block">
        <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-amber-400 to-transparent animate-laser-r" style={{ animationDelay: '1s' }} />
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 w-full h-[1.5px] overflow-hidden pointer-events-none z-30 hidden md:block">
        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-laser-b" style={{ animationDelay: '2s' }} />
      </div>

      {/* Left line */}
      <div className="absolute top-0 left-0 w-[1.5px] h-full overflow-hidden pointer-events-none z-30 hidden md:block">
        <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-amber-400 to-transparent animate-laser-l" style={{ animationDelay: '3s' }} />
      </div>

      {/* Subtle border base layer of soft gold */}
      <div className="absolute -inset-px rounded-2xl border border-amber-400/20 pointer-events-none group-hover:border-amber-400/40 transition-all duration-700" />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
