"use client";

import { useEffect, useState } from "react";

const WaveformVisualizer = () => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial random heights
    const initialBars = Array.from({ length: 50 }, () => Math.random() * 100);
    setBars(initialBars);

    // Animate bars
    const interval = setInterval(() => {
      setBars((prev) => prev.map(() => Math.random() * 100));
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-1 h-32 px-4">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full transition-all duration-150 ease-out"
          style={{
            height: `${height}%`,
            opacity: 0.4 + (height / 100) * 0.6,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
