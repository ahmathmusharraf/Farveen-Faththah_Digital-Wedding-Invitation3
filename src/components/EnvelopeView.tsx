import { useState, useMemo, MouseEvent } from 'react';
import { Sparkles, MailOpen, Info } from 'lucide-react';
import { motion } from 'motion/react';
import WeddingIcon from './WeddingIcon';

interface EnvelopeViewProps {
  brideName: string;
  groomName: string;
  onOpen: () => void;
}

interface EnvelopeParticle {
  id: number;
  size: number;
  delay: number;
  duration: number;
  left: number;
  top: number;
}

export default function EnvelopeView({ brideName, groomName, onOpen }: EnvelopeViewProps) {
  const [envelopeTilt, setEnvelopeTilt] = useState({ x: 0, y: 0 });
  const [envelopeGlare, setEnvelopeGlare] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Pre-generate static particles so we don't recalculate them on every single frame/render
  const particles = useMemo<EnvelopeParticle[]>(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.5 + 1.5,
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 6,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Smooth, restricted 3D tilt
    const rotateX = -(y - yc) / (rect.height / 25);
    const rotateY = (x - xc) / (rect.width / 25);
    
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    setEnvelopeTilt({ x: rotateX, y: rotateY });
    setEnvelopeGlare({ x: xPct, y: yPct });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setEnvelopeTilt({ x: 0, y: 0 });
    setEnvelopeGlare({ x: 50, y: 50 });
  };

  return (
    <motion.div
      key="envelope-view"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -60, scale: 0.98 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 md:top-12 top-0 z-45 bg-[#0b0807] flex items-center justify-center p-4 overflow-y-auto select-none"
      id="envelope-wrapper"
      style={{
        background: 'radial-gradient(circle at 50% 30%, #151c19 0%, #0d0a08 60%, #050403 100%)',
        willChange: 'opacity, transform'
      }}
    >
      {/* Enchanted background floating gold particles with cached properties */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-gradient-to-tr from-amber-300 to-amber-500 rounded-full opacity-35 animate-[bounce_8s_infinite] pointer-events-none"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              willChange: 'transform'
            }}
          />
        ))}
      </div>

      {/* Ambient static color rings representing high fidelity glow */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* 3D Parallax Envelope Frame wrapper */}
      <div style={{ perspective: '1000px' }} className="w-full max-w-lg">
        <motion.div 
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          animate={{
            rotateX: isHovered ? envelopeTilt.x : 0,
            rotateY: isHovered ? envelopeTilt.y : 0,
            scale: isHovered ? 1.015 : 1,
            boxShadow: isHovered 
              ? "0 30px 70px -15px rgba(0,0,0,0.95), 0 0 40px rgba(245, 158, 11, 0.12)"
              : "0 20px 50px -15px rgba(0,0,0,0.9)"
          }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          className="w-full p-8 md:p-12 bg-gradient-to-tr from-[#120e0a] via-[#1e1510] to-[#2e2219] rounded-[32px] border-2 border-amber-400/40 text-center relative overflow-hidden" 
          id="envelope"
          style={{ willChange: 'transform' }}
        >
          {/* Subtle decoration lines - static for optimal Safari rendering */}
          <div className="absolute inset-3 border border-amber-400/15 rounded-[26px] pointer-events-none" />
          <div className="absolute inset-4 border border-[#d4af37]/5 rounded-[22px] pointer-events-none" />

          {/* Handcrafted gold corners */}
          <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-xl pointer-events-none" />
          <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-amber-400/25 rounded-tl-xl pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-amber-400/25 rounded-br-xl pointer-events-none" />

          {/* Reflective metallic glare overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay transition-opacity duration-300" 
            style={{
              background: `radial-gradient(circle at ${envelopeGlare.x}% ${envelopeGlare.y}%, rgba(251,191,36,0.5) 0%, transparent 60%)`,
            }}
          />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-full text-[10px] font-extrabold text-amber-300 uppercase tracking-[0.25em] mb-6 border border-amber-500/25 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Royal Wedding Invitation
          </span>

          {/* Ornate wedding crest of invitation */}
          <div className="relative w-32 h-32 mx-auto mb-5 flex items-center justify-center">
            {/* Dashed background circle */}
            <div className="absolute inset-0 rounded-full border border-dashed border-amber-400/20 animate-spin-slow pointer-events-none" />
            
            {/* Glowing botanical style ring */}
            <svg className="absolute w-[124px] h-[124px] text-amber-400/35 pointer-events-none" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.75" />
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                return <circle key={i} cx={50 + 44 * Math.cos(angle)} cy={50 + 44 * Math.sin(angle)} r="1.5" fill="currentColor" />;
              })}
            </svg>

            <div className="w-24 h-24 rounded-full border border-amber-400/60 bg-[#16100d] hover:scale-105 transition-transform duration-500 shrink-0 shadow-2xl relative z-10 flex items-center justify-center p-1">
              <WeddingIcon className="w-full h-full" />
            </div>
          </div>

          <div className="space-y-3 mb-6 relative z-10">
            <p className="font-sans text-[11px] text-amber-300/70 uppercase tracking-[0.32em] font-extrabold">BLESSED BY ALLAH'S GRACE</p>
            
            <div className="space-y-1 py-1">
              <h2 className="font-serif text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {brideName}
              </h2>
              <p className="font-serif text-sm text-zinc-400 italic font-normal">&</p>
              <h2 className="font-serif text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {groomName}
              </h2>
            </div>
            
            <div className="w-28 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto my-3 rounded-full" />
            <p className="font-sans text-[11px] text-amber-100/60 font-medium tracking-wide max-w-sm mx-auto leading-relaxed italic">
              "Two hearts unite under His beautiful guidance, beginning a blessed journey of love, faith & serenity..."
            </p>
          </div>

          {/* INTERACTIVE TRADITIONAL WAX SEAL TRIGGER */}
          <div className="relative py-4 flex flex-col items-center justify-center z-20" id="wax-seal-container">
            <button
              onClick={onOpen}
              id="unveil-invitation-btn"
              className="relative focus:outline-none cursor-pointer flex flex-col items-center group transition-all"
            >
              {/* Outer glow aura - optimized static scaling style */}
              <div className="absolute -inset-2 bg-amber-500/10 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
              
              {/* Embossed Wax Seal Base */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6e1916] via-[#942420] to-[#b32f2b] border-2 border-[#ffbe5a]/30 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.7),inset_0_4px_8px_rgba(255,255,255,0.3)] relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 rounded-t-full" />
                
                <span className="font-serif text-amber-200 text-lg font-extrabold tracking-tighter select-none">
                  F&A
                </span>

                <div className="absolute inset-1 rounded-full border border-dashed border-amber-300/25 pointer-events-none" />
              </div>

              <div className="mt-3 flex items-center gap-1.5 px-4 py-1.5 bg-[#14100d] border border-amber-500/15 rounded-lg group-hover:border-amber-400/30 transition-colors">
                <MailOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-sans text-[10px] text-amber-200 uppercase tracking-widest font-extrabold">
                  Open Invitation
                </span>
              </div>
            </button>
          </div>

          <div className="mt-4 font-sans text-[9.5px] text-amber-200/30 flex items-center justify-center gap-1.5 leading-normal">
            <Info className="w-3.5 h-3.5 text-amber-400/30 shrink-0" />
            <span>Click the Royal Seal to unfold the digital ceremony card.</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
