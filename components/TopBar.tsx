import React, { useState } from 'react';
import { AppMode } from '../types';
import { Mic, Search, Bell, Settings, User, Bot, Sun, Moon } from 'lucide-react';
import { getAIAssistantMessage } from '../services/geminiService';

interface TopBarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentMode, setMode, isDarkMode, toggleTheme }) => {
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");

  const handleAIQuery = async () => {
      if(!aiInput) return;
      const res = await getAIAssistantMessage(aiInput);
      alert(`AI Assistant: ${res}`);
      setAiInput("");
      setAiPromptOpen(false);
  };

  return (
    <div className="h-14 bg-white/70 dark:bg-glass-dark backdrop-blur-md border-b border-black/5 dark:border-white/10 flex items-center justify-between px-6 z-50 transition-colors duration-500">
      
      {/* Branding */}
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-400 dark:from-teal-400 dark:to-teal-200 holo-text">
          MTc DJ PLAYER
        </div>
        <div className="px-2 py-0.5 rounded bg-teal-500/10 text-[10px] text-teal-600 dark:text-teal-400 border border-teal-500/20">v3.0</div>
      </div>

      {/* Modes */}
      <div className="flex bg-black/5 dark:bg-black/30 rounded-lg p-1">
        {Object.values(AppMode).map(mode => (
            <button 
                key={mode}
                onClick={() => setMode(mode)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    currentMode === mode 
                    ? 'bg-teal-600 text-white shadow-lg' 
                    : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white/70'
                }`}
            >
                {mode}
            </button>
        ))}
      </div>

      {/* Center AI Search/Assistant */}
      <div className="relative w-96 group hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Bot size={16} className="text-teal-600 dark:text-teal-400 animate-pulse" />
        </div>
        <input 
            type="text" 
            className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-teal-500/50 transition-colors placeholder-slate-400 dark:placeholder-white/20"
            placeholder="Ask AI Assistant..."
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
        />
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-4 text-slate-500 dark:text-white/60">
        <button 
            onClick={toggleTheme}
            className="hover:text-teal-500 transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            title="Toggle Day/Night Mode"
        >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="hover:text-teal-500 transition-colors relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
        </button>
        <button className="hover:text-teal-500 transition-colors"><Settings size={18} /></button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white font-bold text-xs border border-white/20 shadow-md">
            DJ
        </div>
      </div>

    </div>
  );
};