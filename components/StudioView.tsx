import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Play, Square, Settings, Save } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export const StudioView: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(128);
  const [currentStep, setCurrentStep] = useState(0);
  
  // 4 tracks x 16 steps
  const [pattern, setPattern] = useState<boolean[][]>([
      [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
      [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
      [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // HiHat
      [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false]  // Bass
  ]);

  const tracks = [
      { name: 'KICK', color: 'bg-red-500' },
      { name: 'SNARE', color: 'bg-yellow-500' },
      { name: 'HIHAT', color: 'bg-teal-500' },
      { name: 'BASS', color: 'bg-purple-500' }
  ];

  const toggleStep = (trackIndex: number, stepIndex: number) => {
      const newPattern = [...pattern];
      newPattern[trackIndex][stepIndex] = !newPattern[trackIndex][stepIndex];
      setPattern(newPattern);
      audioEngine.setSequencerStep(trackIndex, stepIndex, newPattern[trackIndex][stepIndex]);
  };

  const togglePlay = () => {
      const playing = audioEngine.toggleSequencer();
      setIsPlaying(playing);
  };

  useEffect(() => {
      // Sync local pattern to engine
      pattern.forEach((track, tIdx) => {
          track.forEach((active, sIdx) => {
              audioEngine.setSequencerStep(tIdx, sIdx, active);
          });
      });
      
      // Update UI step
      const interval = setInterval(() => {
          if (audioEngine.sequencerPlaying) {
              setCurrentStep(audioEngine.currentStep);
          }
      }, 50); // High poll rate for UI sync

      return () => clearInterval(interval);
  }, []); // Run once on mount

  useEffect(() => {
      audioEngine.setSequencerBpm(bpm);
  }, [bpm]);

  return (
    <div className="flex w-full h-full gap-4 items-center justify-center p-4">
      <GlassCard className="w-full max-w-4xl flex flex-col p-8 bg-black/80 border-t-4 border-teal-500">
         <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-4">
                 <h2 className="text-2xl font-bold text-white tracking-widest">STEP SEQUENCER</h2>
                 <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded">
                     <span className="text-xs text-white/50">BPM</span>
                     <input 
                        type="number" 
                        value={bpm} 
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className="w-16 bg-transparent text-white font-mono font-bold text-lg outline-none text-center"
                     />
                 </div>
             </div>

             <div className="flex gap-4">
                 <button 
                    onClick={togglePlay}
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${isPlaying ? 'bg-red-500 text-white' : 'bg-teal-500 text-white hover:scale-105'}`}
                 >
                     {isPlaying ? <Square fill="currentColor" size={16} /> : <Play fill="currentColor" size={18} className="ml-1" />}
                 </button>
             </div>
         </div>

         <div className="flex flex-col gap-4">
             {tracks.map((track, trackIndex) => (
                 <div key={track.name} className="flex items-center gap-4">
                     <div className="w-20 text-right font-bold text-white/60 text-sm">{track.name}</div>
                     <div className="flex-1 grid grid-cols-16 gap-1 h-12">
                         {pattern[trackIndex].map((active, stepIndex) => (
                             <button
                                key={stepIndex}
                                onClick={() => toggleStep(trackIndex, stepIndex)}
                                className={`
                                    rounded-sm transition-all duration-75 relative
                                    ${active ? track.color : 'bg-white/5 hover:bg-white/10'}
                                    ${currentStep === stepIndex ? 'border border-white scale-110 z-10 brightness-150' : 'border border-transparent'}
                                `}
                             >
                             </button>
                         ))}
                     </div>
                 </div>
             ))}
         </div>

         <div className="mt-8 pt-4 border-t border-white/10 flex justify-between text-white/40 text-xs">
             <div className="flex gap-4">
                 <button className="flex items-center gap-1 hover:text-white"><Settings size={14} /> PATTERN SETTINGS</button>
                 <button className="flex items-center gap-1 hover:text-white"><Save size={14} /> SAVE PRESET</button>
             </div>
             <div>16 STEPS • 4/4 TIME</div>
         </div>
      </GlassCard>
    </div>
  );
};