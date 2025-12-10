import React, { useState } from 'react';
import { DeckState, DeckId, Track, EffectType } from '../types';
import { GlassCard } from './ui/GlassCard';
import { Play, Pause, SkipBack, Repeat, Zap, Link, Trash2 } from 'lucide-react';
import { WaveformDisplay } from './WaveformDisplay';

interface DeckProps {
  id: DeckId;
  state: DeckState;
  onTogglePlay: () => void;
  onLoadTrack: (track: Track) => void;
  onSeek: (time: number) => void;
  onSetCue: (index: number) => void;
  onJumpCue: (index: number) => void;
  onDeleteCue: (index: number) => void;
  onSync: () => void;
  onDropEffect: (effect: EffectType) => void;
  onRemoveEffect: (effect: EffectType) => void;
}

export const Deck: React.FC<DeckProps> = ({ 
    id, state, onTogglePlay, onSeek, onSetCue, onJumpCue, onDeleteCue, onSync, onDropEffect, onRemoveEffect 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const accentColor = id === DeckId.A ? '#14b8a6' : '#d946ef'; 
  const accentClass = id === DeckId.A ? 'text-teal-600 dark:text-neon-cyan' : 'text-fuchsia-600 dark:text-neon-magenta';
  const bgAccent = id === DeckId.A 
    ? 'shadow-[0_0_30px_-10px_rgba(20,184,166,0.15)] dark:shadow-[0_0_30px_-10px_rgba(20,184,166,0.2)] border-t-4 border-t-teal-500/50' 
    : 'shadow-[0_0_30px_-10px_rgba(217,70,239,0.15)] dark:shadow-[0_0_30px_-10px_rgba(217,70,239,0.2)] border-t-4 border-t-fuchsia-500/50';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const effect = e.dataTransfer.getData('effectType') as EffectType;
    if (effect) {
        onDropEffect(effect);
    }
  };

  const progress = state.track && state.track.duration > 0 
    ? state.currentTime / state.track.duration 
    : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <GlassCard 
        className={`flex flex-col p-4 h-full relative ${bgAccent} transition-all duration-500 ${isDragOver ? 'ring-4 ring-white/50 scale-[1.01]' : ''}`}
    >
      {/* Drag Overlay */}
      {isDragOver && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl border-2 border-dashed border-white">
              <span className="text-white font-bold text-xl animate-pulse">DROP EFFECT HERE</span>
          </div>
      )}

      {/* Deck Header */}
      <div 
        className="flex justify-between items-start mb-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md ${id === DeckId.A ? 'bg-teal-500' : 'bg-fuchsia-500'}`}>
            {id}
          </div>
          {state.track ? (
            <div className="overflow-hidden">
              <h3 className="text-slate-900 dark:text-white font-bold truncate max-w-[150px] text-sm md:text-base">{state.track.title}</h3>
              <p className={`text-xs ${accentClass} font-medium`}>{state.track.artist}</p>
              <p className="text-[10px] text-slate-500 dark:text-white/50 mt-0.5">
                  {formatTime(state.currentTime)} <span className="text-slate-300 dark:text-white/20">/</span> {formatTime(state.track.duration)}
              </p>
            </div>
          ) : (
            <span className="text-slate-400 dark:text-white/40 italic text-sm">Empty Deck - Drag Track</span>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className="text-2xl font-mono font-bold tracking-tighter text-slate-800 dark:text-white">
            {state.track ? state.track.bpm.toFixed(1) : '000.0'} 
            <span className="text-xs text-slate-500 dark:text-white/50 ml-1">BPM</span>
          </span>
          <div className="flex gap-2">
            <span className="text-xs text-slate-600 dark:text-white/60 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded border border-black/5 dark:border-white/5">
                {state.track ? state.track.key : '--'}
            </span>
            <button 
                onClick={onSync}
                className="text-xs font-bold bg-slate-200 dark:bg-white/20 hover:bg-teal-500 hover:text-white dark:hover:bg-teal-500 text-slate-700 dark:text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                title="Sync BPM"
            >
                <Link size={10} /> SYNC
            </button>
          </div>
        </div>
      </div>

      {/* Artwork & Active Effects */}
      <div className="flex gap-4 mb-4">
        {/* VINYL DISC RECORD STYLE */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center group">
             {/* Main Vinyl Disc */}
             <div className={`
                absolute inset-0 rounded-full bg-black shadow-xl border border-slate-800
                vinyl-grooves 
                ${state.isPlaying ? 'animate-spin-slow' : ''}
             `}></div>
             
             {/* Center Label (Album Art) */}
             <div className={`
                absolute w-14 h-14 rounded-full overflow-hidden border-2 border-slate-800
                ${state.isPlaying ? 'animate-spin-slow' : ''}
             `}>
                 <img 
                    src={state.track?.coverUrl || 'https://picsum.photos/200/200'} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                 />
             </div>
             
             {/* Spindle Hole */}
             <div className="absolute w-2 h-2 bg-white dark:bg-slate-200 rounded-full z-10"></div>
             
             {/* Reflection/Sheen overlay */}
             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2 min-w-0">
             {/* Active Effects List */}
             <div className="flex-1 bg-black/5 dark:bg-black/20 rounded p-1 flex flex-wrap content-start gap-1 overflow-y-auto max-h-[60px]">
                {state.activeEffects.length === 0 && <span className="text-[9px] text-slate-400 dark:text-white/30 italic w-full text-center mt-2">No Effects Active</span>}
                {state.activeEffects.map(fx => (
                    <div key={fx} className="flex items-center gap-1 bg-teal-500/20 text-teal-700 dark:text-teal-200 text-[9px] px-1.5 py-0.5 rounded border border-teal-500/30">
                        {fx}
                        <button onClick={() => onRemoveEffect(fx)} className="hover:text-red-500"><Trash2 size={8} /></button>
                    </div>
                ))}
             </div>

             <div className="flex gap-1">
                 <button className={`flex-1 flex items-center justify-center gap-2 text-[10px] py-1 rounded shadow-md hover:shadow-lg transition-all text-white ${id === DeckId.A ? 'bg-teal-600 hover:bg-teal-500' : 'bg-fuchsia-600 hover:bg-fuchsia-500'}`}>
                    <Zap size={10} /> AI Suggest
                 </button>
                 <button className="flex-1 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white text-[10px] rounded transition-colors">
                     KEY LOCK
                 </button>
             </div>
        </div>
      </div>

      {/* Waveform */}
      <WaveformDisplay 
        deckId={id} 
        color={accentColor} 
        isPlaying={state.isPlaying} 
        progress={progress}
        onSeek={(p) => {
            if (state.track) onSeek(p * state.track.duration);
        }}
      />

      {/* Transport Controls */}
      <div className="mt-4 flex justify-between items-center px-2">
        <button 
            onClick={() => onSeek(0)}
            className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
            <SkipBack size={20} />
        </button>
        
        <button 
            onClick={onTogglePlay}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-xl ${
                state.isPlaying 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black' 
                : 'border-2 border-slate-300 dark:border-white text-slate-900 dark:text-white hover:border-slate-900'
            }`}
        >
            {state.isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" className="ml-1" size={24} />}
        </button>

        <button className={`p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${state.loopActive ? 'text-teal-500' : 'text-slate-500 dark:text-white/70'}`}>
            <Repeat size={20} />
        </button>
      </div>

      {/* Hot Cues */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {state.cuePoints.map((cue, index) => {
            const hasCue = cue !== null;
            return (
                <button 
                    key={index} 
                    onClick={() => hasCue ? onJumpCue(index) : onSetCue(index)}
                    onContextMenu={(e) => { e.preventDefault(); if(hasCue) onDeleteCue(index); }}
                    className={`
                        h-8 rounded flex items-center justify-center text-[10px] font-bold transition-all border
                        ${hasCue 
                            ? 'bg-teal-500/20 border-teal-500/50 text-teal-700 dark:text-teal-300 hover:bg-teal-500/40' 
                            : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-400 dark:text-white/30 hover:bg-black/10 dark:hover:bg-white/10'
                        }
                    `}
                >
                    {hasCue ? 'CUE' : index + 1}
                </button>
            );
        })}
      </div>
    </GlassCard>
  );
};