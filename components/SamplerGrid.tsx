import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { MOCK_SAMPLES } from '../constants';
import { audioEngine } from '../services/audioEngine';

export const SamplerGrid: React.FC = () => {
  const [activePad, setActivePad] = useState<string | null>(null);

  const triggerSample = (id: string, type: 'drum' | 'fx' | 'vocal' | 'synth') => {
    setActivePad(id);
    
    // Simulate different sounds based on type using simple oscillator engine
    let freq = 150;
    let wave: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine';

    switch(type) {
        case 'drum': freq = 100; wave = 'square'; break;
        case 'fx': freq = 800; wave = 'sawtooth'; break;
        case 'vocal': freq = 400; wave = 'triangle'; break;
        case 'synth': freq = 300; wave = 'sawtooth'; break;
    }
    // Random pitch variation
    freq += Math.random() * 50;

    audioEngine.triggerSample(freq, wave);

    setTimeout(() => setActivePad(null), 150);
  };

  return (
    <GlassCard className="p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-white/70 uppercase tracking-widest">Sampler</h3>
        <div className="flex gap-2">
           <button className="text-[10px] bg-black/10 dark:bg-white/10 px-2 py-1 rounded hover:bg-black/20 dark:hover:bg-white/20 text-slate-700 dark:text-white">BANK A</button>
           <button className="text-[10px] text-slate-400 dark:text-white/40 px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10">BANK B</button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 h-full">
        {MOCK_SAMPLES.map((sample) => (
          <button
            key={sample.id}
            onMouseDown={() => triggerSample(sample.id, sample.type)}
            className={`
              relative rounded-lg border border-black/5 dark:border-white/5 overflow-hidden transition-all duration-75
              ${activePad === sample.id ? 'scale-95 brightness-150 ring-2 ring-white/50' : 'hover:bg-black/5 dark:hover:bg-white/5'}
              flex items-center justify-center
            `}
          >
            <div className={`absolute inset-0 opacity-10 dark:opacity-20 ${sample.color}`}></div>
            {activePad === sample.id && (
                 <div className={`absolute inset-0 opacity-40 dark:opacity-50 ${sample.color} animate-pulse-fast`}></div>
            )}
            <span className="relative z-10 text-[9px] font-bold text-slate-800 dark:text-white/80 drop-shadow-sm dark:drop-shadow-md truncate w-full px-1 text-center pointer-events-none">
                {sample.name}
            </span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
};
