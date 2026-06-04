import React from 'react';

interface WeddingIconProps {
  className?: string;
  isLightBg?: boolean;
}

export default function WeddingIcon({ className = "w-full h-full", isLightBg = false }: WeddingIconProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dynamic backdrop soft glow */}
      <circle cx="50" cy="50" r="45" fill="url(#weddingGlow)" opacity={isLightBg ? "0.08" : "0.15"} />

      {/* Ornate Octagonal Geometrical Rub El Hizb Star Ring representing Nikkah Islamic tradition */}
      <g className="opacity-90">
        <rect 
          x="22" 
          y="22" 
          width="56" 
          height="56" 
          stroke="url(#weddingGoldGrad)" 
          strokeWidth="1.2" 
          fill="none" 
          rx="3" 
          className="animate-[pulse_4s_ease-in-out_infinite]"
        />
        <rect 
          x="22" 
          y="22" 
          width="56" 
          height="56" 
          stroke="url(#weddingGoldGrad)" 
          strokeWidth="1.2" 
          fill="none" 
          rx="3" 
          transform="rotate(45 50 50)" 
          className="animate-[pulse_4s_ease-in-out_infinite]"
          style={{ animationDelay: '1.5s' }}
        />
      </g>

      {/* Fine-line beaded inner circle */}
      <circle cx="50" cy="50" r="35" stroke="url(#weddingGoldGrad)" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.8" />

      {/* Interlocking Golden Wedding Rings with Sparkling Diamonds */}
      <g transform="translate(0, -1)" className="animate-[pulse_3s_easeInOut_infinite]">
        {/* Groom's classic gold ring (Left) */}
        <circle 
          cx="42" 
          cy="52" 
          r="12" 
          stroke="url(#weddingGoldGrad)" 
          strokeWidth="3" 
          fill="none" 
          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }} 
        />
        
        {/* Bride's modern gold ring (Right) */}
        <circle 
          cx="58" 
          cy="52" 
          r="12" 
          stroke="url(#weddingGoldGrad)" 
          strokeWidth="3" 
          fill="none" 
          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))' }} 
        />

        {/* Dynamic overlapping arc overlay for interlocking realism */}
        <path 
          d="M 50,40.5 A 12,12 0 0,1 58,64" 
          stroke="url(#weddingGoldGrad)" 
          strokeWidth="3" 
          fill="none" 
        />

        {/* Exquisite Princess-cut Diamond on Bride's Ring */}
        <g transform="translate(58, 40)">
          {/* Diamond setting bridge */}
          <path d="M -4,-2 L 4,-2 L 5,2 L -5,2 Z" fill="url(#weddingGoldGrad)" stroke="url(#weddingDarkGold)" strokeWidth="0.5" />
          {/* Sparkly facets */}
          <path d="M -4,-2 L 0,-7 L 4,-2 Z" fill="#ffffff" stroke="#f0f0f0" strokeWidth="0.5" />
          <path d="M -5,2 L -4,-2 L 0,-7 Z" fill="#ffffff" opacity="0.8" />
          <path d="M 5,2 L 4,-2 L 0,-7 Z" fill="#f8f8f8" opacity="0.9" />
          
          {/* Real-time sparkles pulsing outward */}
          <g className="animate-[ping_2.5s_infinite]" style={{ transformOrigin: '0px -4px' }}>
            <circle cx="0" cy="-4" r="3" fill="#ffffff" opacity="0.3" />
          </g>
        </g>

        {/* Central Heart Liaison of Union */}
        <path 
          d="M50 54.5 C50 54.5 48 52 48 50.4 C48 49.3 48.7 48.6 49.7 48.6 C50.2 48.6 50.4 49.1 50.4 49.1 C50.4 49.1 50.6 48.6 51.1 48.6 C52.1 48.6 52.8 49.3 52.8 50.4 C52.8 52 50 54.5 50 54.5 Z" 
          fill="#ffffff" 
          style={{ filter: 'drop-shadow(0px 0px 3.5px rgba(251,191,36,0.95))' }} 
        />
      </g>

      {/* Ornate bottom botanical laurel wreath leaves */}
      <g className="opacity-80">
        {/* Left Side Spray */}
        <path d="M26 62 C23 66, 26 73, 31 75 C32 75, 34 72, 32 69 C31 66, 28 64, 26 62 Z" fill="url(#weddingGoldGrad)" />
        <path d="M33 69 C31 73, 35 78, 40 79 C41 78, 42 75, 40 72 C38 69, 36 68, 33 69 Z" fill="url(#weddingGoldGrad)" />
        
        {/* Right Side Spray */}
        <path d="M74 62 C77 66, 74 73, 69 75 C68 75, 66 72, 68 69 C69 66, 72 64, 74 62 Z" fill="url(#weddingGoldGrad)" />
        <path d="M67 69 C69 73, 65 78, 60 79 C59 78, 58 75, 60 72 C62 69, 64 68, 67 69 Z" fill="url(#weddingGoldGrad)" />

        {/* Central Ribbon Knot */}
        <path d="M47 75 L53 75 L51 81 L49 81 Z" fill="url(#weddingGoldGrad)" />
        <circle cx="50" cy="75" r="2.5" fill="url(#weddingGoldGrad)" />
      </g>

      {/* Sparkling Ambient Star Dots */}
      <g className="animate-pulse">
        <path d="M 18,34 L 18,40 M 15,37 L 21,37" stroke="#ffffff" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M 82,34 L 82,40 M 79,37 L 85,37" stroke="#ffffff" strokeWidth="0.5" strokeLinecap="round" />
        <circle cx="28" cy="18" r="0.8" fill="#ffffff" />
        <circle cx="72" cy="18" r="0.8" fill="#ffffff" />
        <circle cx="50" cy="14" r="1.2" fill="#ffffff" />
      </g>

      {/* Exhaustive gradients configuration */}
      <defs>
        <radialGradient id="weddingGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="weddingGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="75%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="weddingDarkGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>
    </svg>
  );
}
