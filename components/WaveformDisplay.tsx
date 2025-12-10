import React, { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  color: string;
  isPlaying: boolean;
  deckId: 'A' | 'B';
  progress: number; // 0 to 1
  onSeek: (progress: number) => void;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ color, isPlaying, deckId, progress, onSeek }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  // Handle click to seek
  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, x / rect.width));
    onSeek(newProgress);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const centerY = height / 2;
      
      if (isPlaying) {
        phaseRef.current += 0.2;
      }

      // Draw Waveforms
      drawWave(ctx, width, centerY, color, 0.3, phaseRef.current - 2, 0.5);
      drawWave(ctx, width, centerY, color, 0.8, phaseRef.current, 1);
      drawWave(ctx, width, centerY, '#ffffff', 0.4, phaseRef.current + 0.5, 0.3);

      // Draw Playhead
      const playheadX = width * progress;

      // Playhead Line
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.strokeStyle = '#ffffff'; 
      ctx.lineWidth = 2;
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.stroke();
      
      // Playhead Knob
      ctx.beginPath();
      ctx.arc(playheadX, height - 10, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // Mask already played area (optional visual style)
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(0, 0, playheadX, height);
      ctx.globalCompositeOperation = 'source-over';

      animationRef.current = requestAnimationFrame(draw);
    };

    const drawWave = (
      ctx: CanvasRenderingContext2D, 
      width: number, 
      centerY: number, 
      strokeColor: string, 
      alpha: number, 
      phase: number, 
      amplitudeScale: number
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2;
      
      const height = centerY * 2; // Derived height for amplitude

      for (let x = 0; x < width; x += 3) {
        const dynamicPhase = phase + (x * 0.05); 
        const noise = Math.sin(dynamicPhase) * Math.cos(dynamicPhase * 0.5) * Math.sin(dynamicPhase * 0.1);
        const amplitude = (height / 3) * noise * amplitudeScale;
        
        ctx.moveTo(x, centerY - Math.abs(amplitude));
        ctx.lineTo(x, centerY + Math.abs(amplitude));
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [color, isPlaying, progress]);

  const borderColor = deckId === 'A' ? 'border-teal-500/30' : 'border-fuchsia-500/30';

  return (
    <div 
      className={`relative w-full h-32 bg-black/80 dark:bg-black/40 rounded-lg overflow-hidden border-t border-b ${borderColor} cursor-crosshair group`}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Beat Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.1)_100%)] bg-[length:40px_100%] opacity-30"></div>
      
      {/* Seek Tooltip Hint */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        <span className="bg-black/80 text-white text-[10px] px-2 py-1 rounded">CLICK TO SEEK</span>
      </div>
    </div>
  );
};
