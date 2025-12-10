import React, { useState, useRef } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Track } from '../types';
import { Search, List, Grid, Upload } from 'lucide-react';

interface LibraryPanelProps {
  tracks: Track[];
  onLoadTrack: (track: Track, deck: 'A' | 'B') => void;
  onImportTracks: (files: FileList) => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ tracks, onLoadTrack, onImportTracks }) => {
  const [mood, setMood] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter tracks based on search and mood
  const filteredTracks = tracks.filter(t => 
    (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.artist.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (Math.abs(t.moodIntensity - mood) < 40) // Simple mood proximity filter
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportTracks(e.target.files);
    }
  };

  return (
    <GlassCard className="p-4 flex flex-col gap-4">
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="audio/*" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Header Controls */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 flex items-center bg-black/5 dark:bg-white/5 rounded-full px-3 py-2 border border-black/5 dark:border-white/10">
          <Search size={14} className="text-slate-500 dark:text-white/40 mr-2" />
          <input 
            type="text" 
            placeholder="Search Library..." 
            className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white w-full placeholder-slate-400 dark:placeholder-white/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Import Button */}
        <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full text-xs font-bold transition-colors shadow-lg"
        >
            <Upload size={14} /> IMPORT
        </button>
        
        {/* Mood Dial Mini Interface */}
        <div className="flex items-center gap-3 hidden md:flex">
           <span className="text-[10px] uppercase text-slate-500 dark:text-white/50">Mood Filter</span>
           <div className="relative group">
                <input 
                    type="range" 
                    min="0" max="100" 
                    value={mood} 
                    onChange={(e) => setMood(Number(e.target.value))}
                    className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer" 
                />
                <div 
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 dark:bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                >
                    {mood < 30 ? 'Chill' : mood < 70 ? 'Energy' : 'Peak'}
                </div>
           </div>
        </div>

        <div className="flex gap-1 hidden sm:flex">
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded text-slate-600 dark:text-white"><List size={16} /></button>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded text-slate-600 dark:text-white"><Grid size={16} /></button>
        </div>
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="text-[10px] text-slate-500 dark:text-white/40 border-b border-black/5 dark:border-white/5">
                    <th className="py-2 pl-2">TITLE</th>
                    <th className="py-2 hidden sm:table-cell">ARTIST</th>
                    <th className="py-2">BPM</th>
                    <th className="py-2 hidden sm:table-cell">KEY</th>
                    <th className="py-2 hidden md:table-cell">MOOD</th>
                    <th className="py-2">LOAD</th>
                </tr>
            </thead>
            <tbody>
                {filteredTracks.map(track => (
                    <tr key={track.id} className="text-sm hover:bg-teal-50 dark:hover:bg-white/5 transition-colors group border-b border-black/5 dark:border-white/5 last:border-0">
                        <td className="py-3 pl-2 flex items-center gap-3">
                            <img src={track.coverUrl} className="w-8 h-8 rounded shadow-sm object-cover" alt="cover" />
                            <span className="font-medium text-slate-900 dark:text-white/90 truncate max-w-[120px] sm:max-w-none">{track.title}</span>
                        </td>
                        <td className="text-slate-600 dark:text-white/60 hidden sm:table-cell">{track.artist}</td>
                        <td className="text-teal-600 dark:text-neon-cyan/80 font-mono font-bold">{track.bpm}</td>
                        <td className="text-slate-500 dark:text-white/60 hidden sm:table-cell">{track.key}</td>
                        <td className="text-slate-400 dark:text-white/40 hidden md:table-cell">
                            <div className="w-16 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500" style={{width: `${track.moodIntensity}%`}}></div>
                            </div>
                        </td>
                        <td>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onLoadTrack(track, 'A')}
                                    className="px-2 py-1 bg-teal-100 dark:bg-white/10 hover:bg-teal-200 dark:hover:bg-neon-cyan/20 text-[10px] rounded text-teal-700 dark:text-neon-cyan border border-teal-200 dark:border-neon-cyan/30"
                                >
                                    A
                                </button>
                                <button 
                                    onClick={() => onLoadTrack(track, 'B')}
                                    className="px-2 py-1 bg-fuchsia-100 dark:bg-white/10 hover:bg-fuchsia-200 dark:hover:bg-neon-magenta/20 text-[10px] rounded text-fuchsia-700 dark:text-neon-magenta border border-fuchsia-200 dark:border-neon-magenta/30"
                                >
                                    B
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {filteredTracks.length === 0 && (
                    <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 dark:text-white/30 italic">No tracks found. Import some music!</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </GlassCard>
  );
};