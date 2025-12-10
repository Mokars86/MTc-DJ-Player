import React from 'react';
import { Wifi, Cpu, Disc } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <div className="h-8 bg-white/80 dark:bg-black/80 border-t border-black/5 dark:border-white/5 flex items-center justify-between px-4 text-[10px] text-slate-500 dark:text-white/40 font-mono transition-colors">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400 animate-pulse"></div>
            ONLINE
        </span>
        <span className="flex items-center gap-1">
            <Cpu size={10} /> CPU: 12%
        </span>
        <span className="flex items-center gap-1">
            MEM: 480MB
        </span>
      </div>

      <div className="flex items-center gap-4">
         <span>MASTER OUT: STEREO 1/2</span>
         <span className="flex items-center gap-1 text-purple-600 dark:text-neon-purple">
             <Disc size={10} /> MIDI: PIONEER DDJ-400 (Connected)
         </span>
      </div>
    </div>
  );
};