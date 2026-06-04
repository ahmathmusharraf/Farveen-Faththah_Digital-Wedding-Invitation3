import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { motion } from 'motion/react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Defer iframe rendering slightly to allow main thread layout to finish without blocking onload
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIframeLoaded(true);
    }, 200); // 200ms ensures Safari finishes initial load cycle and immediately initializes the music frame
    return () => clearTimeout(timer);
  }, []);

  const hasStartedPlayback = useRef(false);

  // Auto-play ambient instrumental/nasheed when invitation is opened/revealed
  useEffect(() => {
    const handleUnveilInvitation = () => {
      if (!hasStartedPlayback.current) {
        startPlayback();
      }
    };
    window.addEventListener('unveil-invitation', handleUnveilInvitation);
    return () => {
      window.removeEventListener('unveil-invitation', handleUnveilInvitation);
    };
  }, []);

  // Handle document level initial interaction to auto-play background music
  useEffect(() => {
    const handleFirstGesture = (e: Event) => {
      // Ignore click on the music player itself to prevent interference with toggleSound
      const target = e.target as HTMLElement;
      if (target && target.closest('#ambient-player-bar')) {
        return;
      }

      if (!hasStartedPlayback.current) {
        startPlayback();
      }
    };
    
    document.addEventListener('click', handleFirstGesture, { once: true });
    document.addEventListener('touchstart', handleFirstGesture, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstGesture);
      document.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  const startPlayback = () => {
    hasStartedPlayback.current = true;
    
    if (!isIframeLoaded) {
      setIsIframeLoaded(true);
      // Wait for React to mount the iframe element, then command play
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            // Send unMute and play video using both formats to be fully bulletproof
            iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
            iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: '' }), '*');
            
            iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
            iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
            
            iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [60] }), '*');
          } catch (e) {
            console.error(e);
          }
        }
      }, 300);
      setIsPlaying(true);
      return;
    }

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Send play command to YouTube iframe player
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: '' }), '*');
        
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
        
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [60] }), '*');
        setIsPlaying(true);
      } catch (err) {
        console.error("Failed to trigger YouTube playback", err);
      }
    }
  };

  const pausePlayback = () => {
    // Keep hasStartedPlayback.current as true so the app knows the user explicitly configured or interacted with the music player, prevents automatic restarting
    hasStartedPlayback.current = true;
    
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Send mute & pause using both formats for extreme cross-browser compliance
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: '' }), '*');
        
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
        
        setIsPlaying(false);
      } catch (err) {
        console.error("Failed to pause YouTube playback", err);
      }
    }
  };

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!isPlaying) {
      startPlayback();
    } else {
      pausePlayback();
    }
  };

  return (
    <div id="ambient-player-bar" className="fixed bottom-5 right-5 z-40">
      {/* Invisible YouTube Player API wrapper with loop and background autoplay pre-buffered */}
      {isIframeLoaded && (
        <iframe
          ref={iframeRef}
          id="youtube-bg-audio-player"
          src="https://www.youtube.com/embed/7H5372PZRdk?enablejsapi=1&autoplay=1&controls=0&loop=1&playlist=7H5372PZRdk&volume=60&mute=0&playsinline=1&start=3"
          title="Background Wedding Melody"
          className="pointer-events-none absolute w-0 h-0 opacity-0"
          style={{ border: 0, width: 0, height: 0 }}
          allow="autoplay; encrypted-media"
        />
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSound}
        className={`px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-2 text-xs font-semibold font-sans cursor-pointer transition-all duration-300 ${
          isPlaying
            ? 'bg-[#1b1511] text-amber-200 border-amber-500/40 shadow-[0_4px_12px_rgba(0,0,0,0.4)] animate-pulse'
            : 'bg-white/95 text-emerald-950 border-amber-200/60 hover:bg-amber-50'
        }`}
        title={isPlaying ? "Stop music" : "Play beautiful background wedding music"}
      >
        <span className="relative flex h-2 w-2">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-amber-300' : 'bg-[#7c1d1a]'}`}></span>
        </span>
        
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="text-amber-100 font-medium">Stop Music</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 text-emerald-800 fill-emerald-800/10" />
            <span className="hidden md:inline">Play Wedding Music</span>
            <span className="md:hidden">Play Music</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
