import React from 'react';

interface KnobProps {
  value: number; // 0 to 100
  label: string;
  color?: string;
  onChange?: (val: number) => void;
  min?: number;
  max?: number;
}

// Default color updated to teal
export const Knob: React.FC<KnobProps> = ({ value, label, color = '#14b8a6', onChange, min = 0, max = 100 }) => {
  // Map value (min-max) to percentage (0-100)
  const percentage = ((value - min) / (max - min)) * 100;
  
  // SVG Arc calc
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center group cursor-pointer">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Background Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            strokeWidth="4"
            fill="transparent"
            className="stroke-black/10 dark:stroke-white/10 transition-colors"
          />
          {/* Active Ring */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-100 ease-out drop-shadow-sm"
          />
        </svg>
        {/* Inner Label */}
        <div className="absolute text-[9px] font-mono text-slate-700 dark:text-white/80 select-none font-bold">
            {Math.round(value)}
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-white/60 mt-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
        {label}
      </span>
      
      {/* Hidden Range Input for Interaction */}
      {onChange && (
        <input 
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ns-resize"
            title={label}
        />
      )}
    </div>
  );
};