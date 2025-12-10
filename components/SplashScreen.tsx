import React, { useEffect, useState } from 'react';
import { Disc } from 'lucide-react';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for 2.5 seconds, then fade out
    const timer = setTimeout(() => {
      setFading(true);
      // Wait for fade transition (500ms) before unmounting
      setTimeout(onComplete, 500); 
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative mb-8 scale-150">
        <Disc size={80} className="text-teal-500 animate-spin-slow" />
        <div className="absolute inset-0 bg-teal-500/30 blur-2xl rounded-full animate-pulse-fast"></div>
      </div>
      
      <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-600 mb-4 drop-shadow-[0_0_15px_rgba(20,184,166,0.5)]">
        MTc DJ PLAYER
      </h1>
      
      <div className="w-64 h-1 bg-gray-900 rounded-full overflow-hidden mt-8 border border-white/5">
        <div className="h-full bg-teal-500 w-full origin-left animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>
      
      <p className="mt-4 text-teal-500/60 text-xs font-mono tracking-widest">INITIALIZING SYSTEM...</p>
      
      <style>{`
        @keyframes loading {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(1); }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
    </div>
  );
};