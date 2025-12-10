import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', interactive = false }) => {
  return (
    <div 
      className={`
        bg-white/60 dark:bg-glass-100 backdrop-blur-md 
        border border-black/5 dark:border-white/10 
        rounded-xl shadow-lg relative overflow-hidden
        text-slate-900 dark:text-white
        ${interactive ? 'hover:bg-white/80 dark:hover:bg-glass-200 transition-all duration-300' : ''}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
      {children}
    </div>
  );
};