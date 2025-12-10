import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { EffectType } from '../types';
import { Sparkles, Activity, Hexagon } from 'lucide-react';

// Define ZapIcon locally or import from lucide if available
function ZapIcon(props: any) {
  return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
}

export const EffectsRack: React.FC = () => {
  const effects = [
    { name: EffectType.REVERB, icon: Sparkles, color: 'text-purple-500 dark:text-purple-400' },
    { name: EffectType.DELAY, icon: Activity, color: 'text-blue-500 dark:text-blue-400' },
    { name: EffectType.FLANGER, icon: Hexagon, color: 'text-pink-500 dark:text-pink-400' },
    { name: EffectType.BITCRUSH, icon: ZapIcon, color: 'text-yellow-500 dark:text-yellow-400' },
  ];

  const handleDragStart = (e: React.DragEvent, effect: string) => {
    e.dataTransfer.setData('effectType', effect);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <GlassCard className="h-full w-20 flex flex-col items-center py-4 gap-4 bg-white/60 dark:bg-black/40 border-l border-black/5 dark:border-white/10">
      <div className="text-[10px] font-bold text-slate-400 dark:text-white/50 rotate-[-90deg] mb-4 mt-4 whitespace-nowrap">FX RACK</div>
      
      {effects.map((fx) => (
        <div 
            key={fx.name}
            className="w-12 h-12 rounded-full bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing transition-all hover:scale-110 group relative shadow-sm z-50"
            draggable
            onDragStart={(e) => handleDragStart(e, fx.name)}
        >
            <fx.icon className={`w-5 h-5 ${fx.color} group-hover:text-slate-900 dark:group-hover:text-white transition-colors`} />
            <div className="absolute opacity-0 group-hover:opacity-100 right-14 bg-slate-800 dark:bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm pointer-events-none shadow-lg z-50 border border-white/10">
                {fx.name}
            </div>
        </div>
      ))}
      
      <div className="mt-auto text-[9px] text-center text-slate-400 dark:text-white/30 px-1">
        DRAG TO DECK
      </div>
    </GlassCard>
  );
};
