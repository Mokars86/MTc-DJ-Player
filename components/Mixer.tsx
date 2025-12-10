
import React from 'react';
import { GlassCard } from './ui/GlassCard';
import { Knob } from './ui/Knob';
import { MixerState, DeckState } from '../types';

interface MixerProps {
  mixerState: MixerState;
  deckAState: DeckState;
  deckBState: DeckState;
  setCrossfader: (val: number) => void;
  setVolumeA: (val: number) => void;
  setVolumeB: (val: number) => void;
  setEqA: (band: 'low'|'mid'|'high', val: number) => void;
  setEqB: (band: 'low'|'mid'|'high', val: number) => void;
  setFilterA: (val: number) => void;
  setFilterB: (val: number) => void;
  setGainA: (val: number) => void;
  setGainB: (val: number) => void;
  setMasterVolume: (val: number) => void;
}

export const Mixer: React.FC<MixerProps> = ({ 
  mixerState, 
  deckAState, 
  deckBState, 
  setCrossfader,
  setVolumeA,
  setVolumeB,
  setEqA,
  setEqB,
  setFilterA,
  setFilterB,
  setGainA,
  setGainB,
  setMasterVolume
}) => {
  return (
    <GlassCard className="w-full max-w-[320px] h-full flex flex-col p-4 bg-white/40 dark:bg-glass-dark z-10 border-x border-black/5 dark:border-white/10">
      
      {/* Top Gain & Master Section */}
      <div className="flex justify-between items-start mb-2 px-2">
         {/* Deck A Gain */}
         <div className="flex flex-col items-center">
            <Knob label="TRIM" value={deckAState.gain} onChange={setGainA} />
         </div>

         {/* Master Volume (Center) */}
         <div className="flex flex-col items-center mt-[-4px]">
             <div className="bg-black/10 dark:bg-white/5 p-2 rounded-xl border border-black/5 dark:border-white/10">
                <Knob 
                    label="MASTER" 
                    value={mixerState.masterVolume} 
                    onChange={setMasterVolume} 
                    color="#eab308" // Yellow/Gold for Master
                />
             </div>
         </div>

         {/* Deck B Gain */}
         <div className="flex flex-col items-center">
            <Knob label="TRIM" value={deckBState.gain} color="#d946ef" onChange={setGainB} />
         </div>
      </div>

      <div className="h-px bg-black/5 dark:bg-white/10 w-full mb-4"></div>

      {/* EQ Section */}
      <div className="flex justify-between gap-4 md:gap-6 mb-4 flex-1">
        {/* Channel A EQ */}
        <div className="flex flex-col gap-2 items-center">
            <Knob label="HIGH" value={deckAState.eq.high} onChange={(v) => setEqA('high', v)} />
            <Knob label="MID" value={deckAState.eq.mid} onChange={(v) => setEqA('mid', v)} />
            <Knob label="LOW" value={deckAState.eq.low} onChange={(v) => setEqA('low', v)} />
        </div>

        {/* Master Meters */}
        <div className="flex gap-2 h-full items-center justify-center px-1 pb-4">
            <div className="w-2 h-full max-h-[160px] bg-black/10 dark:bg-black/50 rounded-full overflow-hidden flex flex-col justify-end">
                <div 
                    className="w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 opacity-80 transition-all duration-75" 
                    style={{ height: `${(deckAState.volume * (1 - (mixerState.crossfader + 1)/2)) * (mixerState.masterVolume/100)}%` }} 
                />
            </div>
            <div className="w-2 h-full max-h-[160px] bg-black/10 dark:bg-black/50 rounded-full overflow-hidden flex flex-col justify-end">
                 <div 
                    className="w-full bg-gradient-to-t from-green-500 via-yellow-400 to-red-500 opacity-80 transition-all duration-75" 
                    style={{ height: `${(deckBState.volume * ((mixerState.crossfader + 1)/2)) * (mixerState.masterVolume/100)}%` }} 
                />
            </div>
        </div>

        {/* Channel B EQ */}
        <div className="flex flex-col gap-2 items-center">
            <Knob label="HIGH" value={deckBState.eq.high} color="#d946ef" onChange={(v) => setEqB('high', v)} />
            <Knob label="MID" value={deckBState.eq.mid} color="#d946ef" onChange={(v) => setEqB('mid', v)} />
            <Knob label="LOW" value={deckBState.eq.low} color="#d946ef" onChange={(v) => setEqB('low', v)} />
        </div>
      </div>

      {/* Filter Knobs */}
      <div className="flex justify-between px-2 mb-4">
          <Knob 
            label="FILTER" 
            value={(deckAState.filter + 100) / 2} 
            min={-100} max={100}
            color="#94a3b8" 
            onChange={(v) => setFilterA((v * 2) - 100)} 
          />
          <Knob 
            label="FILTER" 
            value={(deckBState.filter + 100) / 2} 
            min={-100} max={100}
            color="#94a3b8" 
            onChange={(v) => setFilterB((v * 2) - 100)} 
          />
      </div>

      {/* Faders */}
      <div className="flex justify-between items-end h-28 px-2 gap-4">
        {/* Vol A */}
        <div className="relative h-full w-8 bg-black/10 dark:bg-black/30 rounded-lg flex justify-center group">
            <input 
                type="range" 
                min="0" max="100" 
                value={deckAState.volume}
                onChange={(e) => setVolumeA(Number(e.target.value))}
                className="absolute -rotate-90 w-28 h-8 top-10 -left-10 opacity-0 cursor-pointer z-20"
            />
            <div 
                className="absolute bottom-0 w-full bg-teal-500/30 rounded-b-lg pointer-events-none transition-all duration-75" 
                style={{ height: `${deckAState.volume}%` }}
            />
            <div 
                className="absolute w-12 h-6 bg-white dark:bg-glass-300 border border-slate-300 dark:border-white/40 rounded shadow-md backdrop-blur cursor-pointer z-10 transition-all active:bg-slate-100 dark:active:bg-white/20"
                style={{ bottom: `calc(${deckAState.volume}% - 12px)` }}
            >
                <div className="w-full h-[1px] bg-slate-400 dark:bg-white/50 mt-[50%]"></div>
            </div>
        </div>

        {/* Vol B */}
        <div className="relative h-full w-8 bg-black/10 dark:bg-black/30 rounded-lg flex justify-center group">
            <input 
                type="range" 
                min="0" max="100" 
                value={deckBState.volume}
                onChange={(e) => setVolumeB(Number(e.target.value))}
                className="absolute -rotate-90 w-28 h-8 top-10 -left-10 opacity-0 cursor-pointer z-20"
            />
            <div 
                className="absolute bottom-0 w-full bg-fuchsia-500/30 rounded-b-lg pointer-events-none transition-all duration-75" 
                style={{ height: `${deckBState.volume}%` }}
            />
            <div 
                className="absolute w-12 h-6 bg-white dark:bg-glass-300 border border-slate-300 dark:border-white/40 rounded shadow-md backdrop-blur cursor-pointer z-10 transition-all active:bg-slate-100 dark:active:bg-white/20"
                style={{ bottom: `calc(${deckBState.volume}% - 12px)` }}
            >
                 <div className="w-full h-[1px] bg-slate-400 dark:bg-white/50 mt-[50%]"></div>
            </div>
        </div>
      </div>

      {/* Crossfader */}
      <div className="mt-4 relative w-full h-8 bg-black/10 dark:bg-black/40 rounded-full flex items-center px-4 border border-black/5 dark:border-white/5 shadow-inner">
        <input 
            type="range" 
            min="-1" max="1" step="0.01"
            value={mixerState.crossfader}
            onChange={(e) => setCrossfader(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 z-20 cursor-ew-resize"
        />
        <div className="absolute left-4 right-4 h-[2px] bg-slate-400/30 dark:bg-white/20"></div>
        <div 
            className="absolute h-6 w-4 bg-white border border-slate-300 dark:border-gray-400 rounded shadow-md z-10 pointer-events-none transition-all duration-75"
            style={{ 
                left: `calc(50% + ${mixerState.crossfader * 40}%)`, 
                transform: 'translateX(-50%)' 
            }}
        ></div>
        <span className="absolute left-2 text-[8px] text-teal-600 dark:text-neon-cyan font-bold">A</span>
        <span className="absolute right-2 text-[8px] text-fuchsia-600 dark:text-neon-magenta font-bold">B</span>
      </div>

    </GlassCard>
  );
};
