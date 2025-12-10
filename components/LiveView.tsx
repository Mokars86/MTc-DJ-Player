import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Mic, MicOff, Video, Eye, MessageCircle, Send } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export const LiveView: React.FC = () => {
  const [micActive, setMicActive] = useState(false);
  const [viewers, setViewers] = useState(1240);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
      { user: 'TechnoFan99', msg: 'This drop is insane! 🔥' },
      { user: 'DJ_Newbie', msg: 'What controller are you using?' },
      { user: 'AliceW', msg: 'Love the transition!' },
  ]);

  const toggleMic = async () => {
      if (micActive) {
          audioEngine.disableMicrophone();
          setMicActive(false);
      } else {
          await audioEngine.enableMicrophone();
          setMicActive(true);
      }
  };

  useEffect(() => {
     // Mock viewer count update
     const interval = setInterval(() => {
         setViewers(v => v + Math.floor(Math.random() * 5) - 2);
     }, 3000);
     return () => clearInterval(interval);
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatMessage.trim()) return;
      setChatHistory([...chatHistory, { user: 'HOST (You)', msg: chatMessage }]);
      setChatMessage('');
  };

  return (
    <div className="flex w-full h-full gap-4">
      {/* Main Broadcast Preview */}
      <GlassCard className="flex-1 flex flex-col relative overflow-hidden bg-black">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571266028243-371695039989?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40"></div>
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-32 h-32 rounded-full border-4 border-teal-500 flex items-center justify-center animate-pulse">
                 <div className="text-teal-500 font-bold tracking-widest text-center">
                     LIVE<br/>FEED
                 </div>
             </div>
         </div>
         
         <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded flex items-center gap-2 animate-pulse">
             <div className="w-2 h-2 bg-white rounded-full"></div> LIVE
         </div>

         <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded flex items-center gap-2 backdrop-blur-md">
             <Eye size={14} /> {viewers.toLocaleString()}
         </div>

         <div className="mt-auto relative z-10 p-6 bg-gradient-to-t from-black to-transparent">
             <h1 className="text-3xl font-bold text-white mb-2">Friday Night Mix Session</h1>
             <p className="text-white/60 text-sm">Streaming to Twitch, YouTube • 1080p 60fps</p>
             
             <div className="flex gap-4 mt-6">
                 <button 
                    onClick={toggleMic}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${micActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                 >
                     {micActive ? <><Mic size={18} /> MIC ON</> : <><MicOff size={18} /> MIC OFF</>}
                 </button>
                 <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-bold transition-all">
                     <Video size={18} /> CAMERA SETTINGS
                 </button>
             </div>
         </div>
      </GlassCard>

      {/* Live Chat */}
      <GlassCard className="w-80 flex flex-col bg-white/80 dark:bg-glass-dark">
         <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-2 font-bold text-slate-800 dark:text-white">
             <MessageCircle size={18} /> STREAM CHAT
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
             {chatHistory.map((chat, i) => (
                 <div key={i} className="text-sm">
                     <span className={`font-bold mr-2 ${chat.user === 'HOST (You)' ? 'text-teal-500' : 'text-purple-500'}`}>{chat.user}:</span>
                     <span className="text-slate-700 dark:text-white/80">{chat.msg}</span>
                 </div>
             ))}
         </div>

         <form onSubmit={handleSendChat} className="p-3 border-t border-black/5 dark:border-white/10 flex gap-2">
             <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 bg-black/5 dark:bg-white/5 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-white"
             />
             <button type="submit" className="p-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors">
                 <Send size={16} />
             </button>
         </form>
      </GlassCard>
    </div>
  );
};