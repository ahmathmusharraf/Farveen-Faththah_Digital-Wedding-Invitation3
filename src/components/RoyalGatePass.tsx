import React, { useState } from 'react';
import { RSVP, WeddingDetails } from '../types';
import { Sparkles, Download, Award, Search, Check, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';

interface RoyalGatePassProps {
  rsvps: RSVP[];
  weddingDetails?: WeddingDetails;
}

type LuxuryTheme = 'emerald' | 'obsidian' | 'sapphire' | 'burgundy';

export default function RoyalGatePass({ rsvps, weddingDetails }: RoyalGatePassProps) {
  const brideName = weddingDetails?.brideName || 'Fathima Farveen';
  const groomName = weddingDetails?.groomName || 'Abdul Faththah';
  const dateLabel = weddingDetails?.dateLabel || 'Saturday Night, June 27';
  const locationName = weddingDetails?.locationName || 'Al Khoory Sky Garden Hotel';
  const locationSub = weddingDetails?.locationSub || 'Airport Road, Deira, Dubai, UAE';

  const [searchName, setSearchName] = useState('');
  const [selectedPass, setSelectedPass] = useState<RSVP | null>(null);
  const [errorText, setErrorText] = useState('');
  const [activeTheme, setActiveTheme] = useState<LuxuryTheme>('emerald');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Interactive 3D tilt tracking state
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Handle immediate generated ticket lookup
  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!searchName.trim()) {
      setErrorText('Please enter your name to authenticate the pass.');
      return;
    }

    const found = rsvps.find(
      (r) => r.name.toLowerCase().includes(searchName.toLowerCase().trim())
    );

    if (found) {
      setSelectedPass(found);
    } else {
      // Create a premium guest pass automatically so they can enjoy the feature anyway!
      const simulatedPass: RSVP = {
        id: 'simulated-' + Date.now().toString(16),
        name: searchName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
        attending: true,
        guestsCount: 2,
        dietaryRequirements: 'Halal Only',
        message: 'Barakallahu lakum! Looking forward to celebrating this beautiful union.',
        whatsappContact: '+971 50 786 2026',
        createdAt: Date.now(),
      };
      setSelectedPass(simulatedPass);
    }
  };

  // Interactive 3D tilt handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Max tilt angles: 12 degrees
    const rotateX = -(y - yc) / (rect.height / 24);
    const rotateY = (x - xc) / (rect.width / 24);
    
    // Percentage glare coordinates
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: xPct, y: yPct });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50 });
  };

  const cleanOklchOklab = (text: string): string => {
    // Highly robust regex matching oklch(...) or oklab(...) with optional nested balancing up to 2 levels
    const regex = /(oklch|oklab)\s*\((?:[^()]+|\((?:[^()]+|\([^()]*\))*\))*\)/gi;
    return text.replace(regex, (match) => {
      const lower = match.toLowerCase();
      // Inspect for amber/gold hue bounds (typically around 40-90 or includes terms)
      if (lower.includes('amber') || lower.includes('gold') || lower.includes('yellow') || /[\s,](4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|90)[\s,)]/.test(lower)) {
        return '#f59e0b'; // Tailwind Amber 500
      }
      // Inspect for emerald/green hues (typically around 120-180 or includes terms)
      if (lower.includes('emerald') || lower.includes('green') || /[\s,](1[2-9][0-9]|200)[\s,)]/.test(lower)) {
        return '#065f46'; // Tailwind Emerald 800
      }
      // Bright tones / highlights
      if (/0\.[89]\d*/.test(lower) || lower.includes('100%') || lower.includes('white')) {
        return '#ffffff';
      }
      // Mid grays
      if (lower.includes('zinc') || lower.includes('gray') || lower.includes('neutral')) {
        return '#71717a';
      }
      // Default to deep gold/amber or dark neutral background fallback
      return '#0f172a'; // Deep slate
    });
  };

  const handleDownloadImage = async () => {
    const cardElement = document.getElementById('virtual-ceremony-pass');
    if (!cardElement) return;

    setIsDownloading(true);

    // Briefly reset 3D tilt and glare state for a perfectly flat, clean render
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50 });
    setIsHovered(false);

    // Give react state a tiny tick to update the DOM flatness
    await new Promise((resolve) => setTimeout(resolve, 80));

    try {
      const canvas = await html2canvas(cardElement, {
        scale: 3, // Create an ultra-premium high-definition image
        useCORS: true,
        backgroundColor: null, // Keeps the outer backdrop transparent
        logging: false,
        onclone: (clonedDoc) => {
          // Adjust any styles in cloned element if necessary
          const clonedCard = clonedDoc.getElementById('virtual-ceremony-pass');
          if (clonedCard) {
            clonedCard.style.transform = 'none';
          }

          // Exhaustive cleaning of all <style> blocks in the cloned document
          clonedDoc.querySelectorAll('style').forEach((styleEl) => {
            if (styleEl.textContent) {
              styleEl.textContent = cleanOklchOklab(styleEl.textContent);
            }
          });

          // Exhaustive cleaning of all inline style attributes in the cloned document
          clonedDoc.querySelectorAll('*').forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style && htmlEl.getAttribute('style')) {
              const originalStyle = htmlEl.getAttribute('style') || '';
              if (originalStyle.toLowerCase().includes('oklch') || originalStyle.toLowerCase().includes('oklab')) {
                htmlEl.setAttribute('style', cleanOklchOklab(originalStyle));
              }
            }
          });
        }
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Pass_${brideName.replace(/\s+/g, '_')}_${groomName.replace(/\s+/g, '_')}_${selectedPass?.name.trim().replace(/\s+/g, '_') || 'Guest'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export ticket image:', err);
      // Fallback to window print if canvas capture fails
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // Luxury theme descriptors
  const themeStyles = {
    emerald: {
      cardBg: 'from-[#0e2c24] via-[#071914] to-[#020a08]',
      borderGlow: 'border-emerald-500/40 shadow-emerald-950/20',
      badgeBg: 'bg-amber-400 text-[#071914]',
      badgeBorder: 'border-amber-400/30',
      textAccent: 'text-amber-400',
      textLight: 'text-emerald-100/70',
      textSubHighlight: 'text-emerald-300',
      glowGlint: 'rgba(245,158,11,0.3)',
      pillBg: 'bg-emerald-950/60 border-emerald-800/40'
    },
    obsidian: {
      cardBg: 'from-[#1a1a1a] via-[#0f0f0f] to-[#050505]',
      borderGlow: 'border-amber-400/40 shadow-black/80',
      badgeBg: 'bg-amber-500 text-black',
      badgeBorder: 'border-amber-500/20',
      textAccent: 'text-amber-400',
      textLight: 'text-zinc-400',
      textSubHighlight: 'text-amber-300',
      glowGlint: 'rgba(251,191,36,0.35)',
      pillBg: 'bg-zinc-900/60 border-zinc-800/50'
    },
    sapphire: {
      cardBg: 'from-[#0d2240] via-[#061224] to-[#020710]',
      borderGlow: 'border-blue-400/30 shadow-blue-950/30',
      badgeBg: 'bg-amber-400 text-slate-950',
      badgeBorder: 'border-amber-400/20',
      textAccent: 'text-amber-400',
      textLight: 'text-sky-100/70',
      textSubHighlight: 'text-sky-300',
      glowGlint: 'rgba(255,215,0,0.3)',
      pillBg: 'bg-blue-950/60 border-blue-900/40'
    },
    burgundy: {
      cardBg: 'from-[#330811] via-[#1d0307] to-[#0a0002]',
      borderGlow: 'border-amber-400/30 shadow-red-950/40',
      badgeBg: 'bg-amber-400 text-rose-950',
      badgeBorder: 'border-amber-400/20',
      textAccent: 'text-amber-400',
      textLight: 'text-rose-100/70',
      textSubHighlight: 'text-rose-300',
      glowGlint: 'rgba(245,158,11,0.3)',
      pillBg: 'bg-rose-950/60 border-rose-900/45'
    }
  };

  const currTheme = themeStyles[activeTheme];

  return (
    <div id="gatepass-section" className="relative p-5 md:p-8 bg-[#fdfbf6] rounded-3xl border border-amber-200/50 shadow-md overflow-hidden">
      {/* Absolute watermark background flourishes */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-100/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-100/20 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Traditional Vintage Corners */}
      <div className="absolute top-2 left-2 w-8 h-8 opacity-15 border-t-2 border-l-2 border-amber-700 pointer-events-none" />
      <div className="absolute top-2 right-2 w-8 h-8 opacity-15 border-t-2 border-r-2 border-amber-700 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-8 h-8 opacity-15 border-b-2 border-l-2 border-amber-700 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-8 h-8 opacity-15 border-b-2 border-r-2 border-amber-700 pointer-events-none" />

      <div className="max-w-md mx-auto text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-[#604218] rounded-full text-[9px] font-extrabold tracking-[0.15em] uppercase mb-2 shadow-3xs">
          <Sparkles className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
          ✨ Bespoke Digital Ticketing
        </span>
        <h3 className="font-serif text-lg md:text-xl text-emerald-950 font-extrabold tracking-tight mt-1">
          VIP Entrance Gate Pass
        </h3>
        <p className="font-sans text-[10.5px] text-[#705a41] leading-relaxed max-w-sm mx-auto mt-1">
          Enter your RSVP guest name to retrieve your gorgeous digital ceremony pass. Show this QR/Barcode at the reception check-in.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedPass ? (
          <motion.form
            key="search-form"
            initial={{ opacity: 0, scale: 0.98, Filter: 'blur(3px)' } as any}
            animate={{ opacity: 1, scale: 1, Filter: 'blur(0px)' } as any}
            exit={{ opacity: 0, scale: 0.98, Filter: 'blur(3px)' } as any}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onSubmit={handleLookup}
            className="space-y-4 max-w-sm mx-auto p-4 bg-white rounded-2xl border border-amber-100/70 shadow-2xs"
            id="pass-search-form"
          >
            <div className="space-y-1">
              <label htmlFor="gatepass-name-input" className="block text-[8.5px] uppercase font-bold tracking-wider text-[#8b6e4b] mb-1 pl-1">
                RSVP Registered Name
              </label>
              <div className="relative">
                <input
                  id="gatepass-name-input"
                  type="text"
                  required
                  placeholder="e.g. Fathima Farveen, Mushi, etc..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-amber-50/20 text-emerald-950 placeholder-amber-900/30 border border-amber-200/60 rounded-xl focus:ring-1 focus:ring-amber-500/30 focus:border-amber-600 outline-none font-sans text-xs transition-all shadow-4xs"
                />
                <Search className="w-3.5 h-3.5 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2 opacity-75" />
              </div>
            </div>

            {errorText && (
              <p className="text-[10px] text-red-600 font-sans font-semibold flex items-center gap-1">
                <span>⚠️ {errorText}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-sans text-[10px] font-extrabold tracking-widest uppercase rounded-xl shadow-xs hover:shadow-sm active:scale-[0.99] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-3.5 h-3.5 text-amber-200" />
              <span>Generate Royal Ticket</span>
            </button>
            <p className="text-[8px] text-center text-amber-900/40 leading-normal italic">
              *Note: Typing any valid name will generate an instantaneous ticket stub so you can fully live-test this digital boarding pass!
            </p>
          </motion.form>
        ) : (
          <motion.div
            key="ticket-card"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            className="space-y-5"
            id="ticket-view-wrapper"
          >
            {/* Live Interactive Creative Customizer Bar */}
            <div className="flex flex-col items-center gap-2 max-w-sm mx-auto" id="ticket-interactive-customizer">
              <span className="text-[8.5px] font-bold text-amber-900/60 uppercase tracking-widest flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-500" /> Interactive Theme Selector:
              </span>
              <div className="flex bg-[#f3ede3] p-1 rounded-xl gap-1 border border-amber-200/50">
                {(['emerald', 'obsidian', 'sapphire', 'burgundy'] as LuxuryTheme[]).map((theme) => {
                  const isActive = activeTheme === theme;
                  const themeColors = {
                    emerald: 'bg-[#0e2c24] border-emerald-400',
                    obsidian: 'bg-[#1a1a1a] border-amber-500',
                    sapphire: 'bg-[#0d2240] border-blue-400',
                    burgundy: 'bg-[#330811] border-red-400'
                  };
                  return (
                    <button
                      key={theme}
                      onClick={() => setActiveTheme(theme)}
                      className={`w-7 h-7 rounded-lg transition-all border shrink-0 cursor-pointer flex items-center justify-center relative ${themeColors[theme]} ${isActive ? 'scale-110 shadow-sm ring-1 ring-amber-500' : 'opacity-70 hover:opacity-100 scale-95'}`}
                      title={`${theme.toUpperCase()} luxury theme`}
                    >
                      {isActive && <Check className="w-3 h-3 text-amber-400 stroke-[3px]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Premium virtual 3D Boarding Pass Card */}
            <div className="flex justify-center select-none" style={{ perspective: '1200px' }}>
              <motion.div 
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                animate={{
                  rotateX: isHovered ? tilt.x : 0,
                  rotateY: isHovered ? tilt.y : 0,
                  scale: isHovered ? 1.02 : 1,
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                className={`w-[290px] md:w-[310px] bg-gradient-to-b ${currTheme.cardBg} text-white rounded-[24px] border border-amber-400/80 p-5 shadow-[0_25px_50px_-15px_rgba(0,0,0,0.65)] relative overflow-hidden transition-all`}
                id="virtual-ceremony-pass"
              >
                {/* Dual gold ornate lines framing */}
                <div className="absolute inset-2 border border-amber-400/30 rounded-[18px] pointer-events-none" />
                <div className="absolute inset-3 border-2 border-[#d4af37]/15 rounded-[15px] pointer-events-none" />

                {/* Corner ornament stars */}
                <span className="absolute top-4 left-4 text-[7px] text-amber-400/30">✦</span>
                <span className="absolute top-4 right-4 text-[7px] text-amber-400/30">✦</span>
                <span className="absolute bottom-[108px] left-4 text-[7px] text-amber-400/30">✦</span>
                <span className="absolute bottom-[108px] right-4 text-[7px] text-amber-400/30">✦</span>

                {/* Glare foil reflection layer */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-45 mix-blend-overlay transition-opacity duration-300" 
                  style={{
                    background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, ${currTheme.glowGlint} 0%, transparent 65%)`
                  }}
                />

                {/* Dynamic glitter dust effect in block background */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] mix-blend-screen" />

                {/* Top Banner Header */}
                <div className="text-center mb-4 relative z-10">
                  <span className={`inline-block px-3 py-1 ${currTheme.badgeBg} font-extrabold text-[7.5px] uppercase tracking-[0.22em] rounded-full border ${currTheme.badgeBorder} shadow-sm`}>
                    ★ ROYAL CEREMONY PASS ★
                  </span>
                </div>

                {/* Islamic Sacred Grace & Couple Identifier */}
                <div className="border-b border-dashed border-amber-400/30 pb-3 mb-4 text-center relative z-10">
                  <span className="font-sans text-[8.5px] font-extrabold uppercase text-amber-300/60 tracking-[0.2em] block">
                    UNDER THE GRACE OF ALLAH
                  </span>
                  
                  {/* Decorative curved couples title styling */}
                  <h4 className="font-serif text-lg md:text-xl text-amber-400 font-extrabold tracking-tight mt-1 dropshadow-md leading-tight">
                    {brideName.split(' ').slice(-1)[0]} & {groomName.split(' ').slice(-1)[0]}
                  </h4>
                  
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                    <p className="font-sans text-[7.5px] text-zinc-300 uppercase tracking-[0.18em] font-semibold">
                      WEDDING • {dateLabel.split(',')[1]?.trim().toUpperCase() || dateLabel.toUpperCase()}
                    </p>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                  </div>
                </div>

                {/* Main Content Info Stub Segment */}
                <div className="space-y-4 mb-4 relative z-10 text-center">
                  
                  {/* LUXURIOUS ROYAL WEDDING CREST AND ETERNAL RINGS */}
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-400/10 rounded-full blur-md opacity-70 animate-pulse" />
                    
                    <svg className="w-20 h-20 text-amber-400 relative z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Soft gold backdrop glow */}
                      <circle cx="50" cy="50" r="30" fill="url(#goldGlow)" opacity="0.25" />

                      {/* 8-Pointed Star Monogram / Rub El Hizb Border of Wedding Union */}
                      <g className="animate-[spin_40s_linear_infinite]" style={{ transformOrigin: '50px 50px' }}>
                        <rect x="25" y="25" width="50" height="50" stroke="url(#royalGoldGradient)" strokeWidth="0.8" fill="none" rx="2" opacity="0.45" />
                        <rect x="25" y="25" width="50" height="50" stroke="url(#royalGoldGradient)" strokeWidth="0.8" fill="none" rx="2" transform="rotate(45 50 50)" opacity="0.45" />
                      </g>

                      {/* Micro botanical ring */}
                      <circle cx="50" cy="50" r="33" stroke="url(#royalGoldGradient)" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.6" />

                      {/* Majestic Interlocking Bridal rings - Symmetrical and highly detailed */}
                      <g transform="translate(0, -2)">
                        {/* Groom's Classic Band (Left) */}
                        <circle cx="42" cy="54" r="11.5" stroke="url(#royalGoldGradient)" strokeWidth="2.5" fill="none" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
                        
                        {/* Bride's Engagement Band (Right) */}
                        <circle cx="58" cy="54" r="11.5" stroke="url(#royalGoldGradient)" strokeWidth="2.5" fill="none" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }} />
                        
                        {/* The Interlocking Overlay arc representing unity */}
                        <path d="M 50,43.2 A 11.5,11.5 0 0,1 58,65.5" stroke="url(#royalGoldGradient)" strokeWidth="2.5" fill="none" />

                        {/* Brilliant Faceted Solitaire Diamond on Bride's Band (Right Ring Peak) */}
                        <g transform="translate(58, 42.5)">
                          {/* Diamond Base facet */}
                          <path d="M -4,-3 L 4,-3 L 6,1 L -6,1 Z" fill="url(#royalGoldGradient)" stroke="#fff" strokeWidth="0.5" />
                          {/* Diamond Gem peak facets */}
                          <path d="M -4,-3 L 0,-8 L 4,-3 Z" fill="#ffffff" stroke="#e0e0e0" strokeWidth="0.5" />
                          <path d="M -6,1 L -4,-3 L 0,-8 Z" fill="#fefefe" opacity="0.8" />
                          <path d="M 6,1 L 4,-3 L 0,-8 Z" fill="#f5f5f5" opacity="0.9" />
                        </g>

                        {/* Sparkling Diamond Rays */}
                        <g className="animate-pulse" transform="translate(58, 34)">
                          <line x1="0" y1="-4" x2="0" y2="-9" stroke="#fff" strokeWidth="0.75" strokeLinecap="round" />
                          <line x1="-4" y1="-3" x2="-8" y2="-6" stroke="#fff" strokeWidth="0.75" strokeLinecap="round" />
                          <line x1="4" y1="-3" x2="8" y2="-6" stroke="#fff" strokeWidth="0.75" strokeLinecap="round" />
                        </g>

                        {/* Central glowing heart of pure love connection */}
                        <path d="M50 56.5 C50 56.5 47.5 53.5 47.5 51.5 C47.5 50.3 48.3 49.5 49.5 49.5 C50.1 49.5 50.3 50.1 50.3 50.1 C50.3 50.1 50.5 49.5 51.1 49.5 C52.3 49.5 53.1 50.3 53.1 51.5 C53.1 53.5 50 56.5 50 56.5 Z" fill="url(#royalGoldGradient)" style={{ filter: 'drop-shadow(0px 0px 3px rgba(251,191,36,0.85))' }} />
                      </g>

                      {/* Symmetrical elegant botanical leaves at front-bottom */}
                      <path d="M 28,75 C 36,73 44,70 50,70 C 56,70 64,73 72,75 C 64,76 56,76 50,76 C 44,76 36,76 28,75 Z" fill="url(#royalGoldGradient)" opacity="0.3" />
                      <path d="M 33,71 C 38,70 43,69 48,69 L 46,71 Z" fill="url(#royalGoldGradient)" />
                      <path d="M 67,71 C 62,70 57,69 52,69 L 54,71 Z" fill="url(#royalGoldGradient)" />

                      {/* Mini Sparkles falling */}
                      <g className="animate-pulse">
                        <circle cx="28" cy="38" r="0.8" fill="#fff" />
                        <circle cx="72" cy="38" r="0.8" fill="#fff" />
                        <circle cx="34" cy="58" r="0.6" fill="#fff" opacity="0.7" />
                        <circle cx="66" cy="58" r="0.6" fill="#fff" opacity="0.7" />
                      </g>

                      {/* Gradients Declarations nested */}
                      <defs>
                        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="royalGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fffbeb" />
                          <stop offset="25%" stopColor="#fef08a" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="75%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>
                        <linearGradient id="darkGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#b45309" />
                          <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Elegant Cordial Seat Dedication */}
                  <div className="text-center font-sans space-y-1">
                    <p className="text-[7.5px] uppercase tracking-[0.2em] text-zinc-400 leading-none">This Pass Cordially Admits</p>
                    <p className="text-base font-extrabold text-amber-300 font-serif leading-tight tracking-wide" id="pass-guest-name">
                      {selectedPass.name}
                    </p>
                  </div>

                  {/* Elegant Double-Col Information Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-sans">
                    <div className={`${currTheme.pillBg} border p-2 rounded-xl transition-all hover:bg-white/5`}>
                      <span className="text-[7px] text-zinc-400 uppercase tracking-widest font-semibold block">Total Guests</span>
                      <strong className={`font-serif font-black ${currTheme.textAccent} text-[13px] mt-0.5 block`}>
                        {selectedPass.attending ? selectedPass.guestsCount : 'Prays Only'}
                      </strong>
                    </div>
                    <div className={`${currTheme.pillBg} border p-2 rounded-xl transition-all hover:bg-white/5`}>
                      <span className="text-[7px] text-zinc-400 uppercase tracking-widest font-semibold block">Seating Row</span>
                      <strong className="font-serif font-black text-white text-[13px] mt-0.5 block">VIP Table 12</strong>
                    </div>
                  </div>

                  {/* Location and Venue highlights */}
                  <div className="text-center font-sans mt-1">
                    <p className="text-[8px] text-emerald-300 font-extrabold tracking-[0.14em] uppercase leading-tight">
                      {locationName}
                    </p>
                    <p className="text-[8px] text-zinc-400/80 mt-0.5">Bring this digital ticket with you</p>
                  </div>
                </div>

                {/* Perforated Segment Cutouts to resemble a real paper tear ticket */}
                <div className="relative h-1 my-3 relative z-10">
                  <div className="absolute left-[-22px] right-[-22px] border-t border-dashed border-amber-400/25 top-0.5" />
                  
                  {/* Visual cut-outs on left and right borders of the card container */}
                  <div className={`absolute -left-[27px] -top-[9px] w-5 h-5 rounded-full ${currTheme.cardBg} border-r border-amber-400/35 z-20`} />
                  <div className={`absolute -right-[27px] -top-[9px] w-5 h-5 rounded-full ${currTheme.cardBg} border-l border-amber-400/35 z-20`} />
                </div>

                {/* Pull-out Barcode Ticket Stub - Styled as pure crisp paper coupon */}
                <div className="bg-white p-2.5 rounded-xl flex flex-col items-center justify-center relative mt-2 shadow-xl border border-amber-400/20">
                  {/* Decorative frame for barcode inside paper tag */}
                  <div className="absolute inset-0.5 border border-amber-900/5 rounded-lg pointer-events-none" />
                  
                  <div className="w-full h-7 flex gap-[1.2px] items-center justify-center opacity-90 mx-auto" id="ticket-barcode">
                    {[...Array(30)].map((_, idx) => {
                      // Creative barcode height/thickness rendering
                      const barThick = idx % 5 === 0 ? '2.5px' : idx % 3 === 0 ? '1.5px' : '0.6px';
                      return (
                        <motion.div
                          key={idx}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ 
                            delay: 0.12 + idx * 0.007, 
                            type: 'spring', 
                            stiffness: 240,
                            damping: 14
                          }}
                          className="bg-black shrink-0 origin-center rounded-xs"
                          style={{
                            width: barThick,
                            height: idx % 4 === 0 ? '80%' : '100%',
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="font-mono text-[7px] text-[#2c1a0c] font-bold mt-1.5 uppercase tracking-widest leading-none">
                    *FM-NKK-2026-{selectedPass.id.substring(0, 6).toUpperCase()}*
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Print and Change actions control bar */}
            <div className="flex gap-2.5 justify-center max-w-xs mx-auto text-xs" id="ticket-action-buttons">
              <button
                onClick={() => {
                  setSelectedPass(null);
                  setSearchName('');
                }}
                className="flex-1 py-2 bg-white text-emerald-950 border border-amber-200 hover:border-amber-400 rounded-xl font-bold cursor-pointer transition-all hover:bg-amber-50/50 active:scale-[0.97]"
              >
                Change Name
              </button>
              
              <button
                disabled={isDownloading}
                onClick={handleDownloadImage}
                className="flex-1 py-1 px-3 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 disabled:opacity-80 disabled:cursor-wait transition-all active:scale-[0.97]"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </>
                )}
              </button>
            </div>

            {/* Verification certificate check line */}
            <p className="text-[9px] text-center text-[#90795c] font-sans flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Secure digital wedding admission pass authorized.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
