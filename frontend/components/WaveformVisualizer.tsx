"use client";

import { useEffect, useState, useMemo, useCallback } from "react";

const WaveformVisualizer = () => {
  const [bars, setBars] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const barCount = useMemo(() => 60, []);

  const updateBars = useCallback(() => {
    setBars((prev) => {
      if (prev.length === 0) {
        return Array.from({ length: barCount }, () => Math.random() * 100);
      }
      const intensity = isHovered ? 40 : 30;
      return prev.map((prevHeight, index) => {
        // Create wave patterns
        const wave = Math.sin((index / barCount) * Math.PI * 4 + Date.now() / 200) * 20;
        const change = (Math.random() - 0.5) * intensity;
        const newHeight = Math.max(15, Math.min(100, prevHeight + change + wave * 0.3));
        return newHeight;
      });
    });
  }, [barCount, isHovered]);

  useEffect(() => {
    updateBars();

    const interval = setInterval(updateBars, isHovered ? 100 : 150);

    return () => clearInterval(interval);
  }, [updateBars, isHovered]);

  return (
    <div 
      className="relative flex items-center justify-center gap-0.5 h-32 px-4"
      role="img" 
      aria-label="Animated waveform visualization"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect behind bars */}
      <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none">
        {bars.map((height, i) => (
          <div
            key={`glow-${i}`}
            className="w-1 bg-primary rounded-full blur-sm transition-all duration-150 ease-out"
            style={{
              height: `${height}%`,
              opacity: (height / 100) * 0.3,
            }}
          />
        ))}
      </div>

      {/* Main bars */}
      {bars.map((height, i) => {
        const delay = (i / barCount) * 0.5;
        const isCenter = Math.abs(i - barCount / 2) < 5;
        const colorIntensity = isCenter ? 1 : 0.7;
        
        return (
          <div
            key={i}
            className="w-1.5 bg-gradient-to-t from-primary to-accent rounded-full transition-all duration-150 ease-out relative group"
            style={{
              height: `${height}%`,
              opacity: 0.5 + (height / 100) * 0.5 * colorIntensity,
              animationDelay: `${delay}s`,
              boxShadow: isHovered 
                ? `0 0 ${height * 0.2}px hsl(180 85% 55% / ${0.5 * colorIntensity})`
                : 'none',
            }}
          >
            {/* Sparkle effect on hover */}
            {isHovered && isCenter && (
              <div 
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${delay * 2}s`,
                }}
              />
            )}
          </div>
        );
      })}

      {/* Center highlight line */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />
    </div>
  );
};

export default WaveformVisualizer;
