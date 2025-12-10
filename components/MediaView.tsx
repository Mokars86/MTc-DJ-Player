import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Track } from '../types';
import { Search, Folder, Music, Clock, Heart, MoreHorizontal, Plus, Disc } from 'lucide-react';

interface MediaViewProps {
  tracks: Track[];
  onLoadTrack: (track: Track, deck: 'A' | 'B') => void;
  onImport: (files: FileList) => void;
}

export const MediaView: React.FC<MediaViewProps> = ({ tracks, onLoadTrack, onImport }) => {
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists'>('tracks');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          onImport(e.target.files);
      }
  };

  return (
    <div className="flex w-full h-full gap-4">
      {/* Sidebar */}
      <GlassCard className="w-64 flex flex-col p-4 bg-white/70 dark:bg-black/60">
        <h2 className="text-xl font-bold mb-6 text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <Disc /> LIBRARY
        </h2>
        
        <div className="flex flex-col gap-2">
            <button 
                onClick={() => setActiveTab('tracks')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'tracks' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' : 'text-slate-600 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
                <Music size={16} /> All Tracks
            </button>
            <button 
                onClick={() => setActiveTab('playlists')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'playlists' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' : 'text-slate-600 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
                <Folder size={16} /> Playlists
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                <Heart size={16} /> Favorites
            </button>
        </div>

        <div className="mt-auto">
            <label className="flex items-center justify-center w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg cursor-pointer transition-colors shadow-lg font-bold text-sm gap-2">
                <Plus size={16} /> ADD MUSIC
                <input type="file" multiple accept="audio/*" className="hidden" onChange={handleFileChange} />
            </label>
        </div>
      </GlassCard>

      {/* Main Content */}
      <GlassCard className="flex-1 flex flex-col bg-white/50 dark:bg-black/40">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center">
            <div className="relative w-96">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search collection..."
                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
            </div>
            <div className="text-slate-500 dark:text-white/40 text-xs font-mono">
                {tracks.length} TRACKS
            </div>
        </div>

        <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
                <thead className="bg-black/5 dark:bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                    <tr className="text-xs text-slate-500 dark:text-white/40">
                        <th className="py-3 pl-4">TITLE</th>
                        <th className="py-3">ARTIST</th>
                        <th className="py-3">ALBUM</th>
                        <th className="py-3">BPM</th>
                        <th className="py-3">KEY</th>
                        <th className="py-3">LENGTH</th>
                        <th className="py-3 pr-4 text-right">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {tracks.map(track => (
                        <tr key={track.id} className="group hover:bg-teal-50/50 dark:hover:bg-white/5 transition-colors">
                            <td className="py-3 pl-4">
                                <div className="flex items-center gap-3">
                                    <img src={track.coverUrl} className="w-10 h-10 rounded shadow object-cover" alt="" />
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-white">{track.title}</div>
                                        <div className="text-xs text-teal-600 dark:text-teal-400">{track.genre}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="text-sm text-slate-600 dark:text-white/70">{track.artist}</td>
                            <td className="text-sm text-slate-500 dark:text-white/50">Unknown Album</td>
                            <td className="text-sm font-mono text-slate-700 dark:text-white/80">{track.bpm}</td>
                            <td className="text-sm font-mono text-slate-700 dark:text-white/80">{track.key}</td>
                            <td className="text-sm font-mono text-slate-500 dark:text-white/50 flex items-center gap-1">
                                <Clock size={12} /> {Math.floor(track.duration / 60)}:{Math.floor(track.duration % 60).toString().padStart(2,'0')}
                            </td>
                            <td className="py-3 pr-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onLoadTrack(track, 'A')} className="px-3 py-1 bg-teal-500 text-white text-xs rounded hover:bg-teal-600">LOAD A</button>
                                    <button onClick={() => onLoadTrack(track, 'B')} className="px-3 py-1 bg-fuchsia-500 text-white text-xs rounded hover:bg-fuchsia-600">LOAD B</button>
                                    <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"><MoreHorizontal size={16} className="text-slate-500 dark:text-white/60" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </GlassCard>
    </div>
  );
};