"use client";
import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: string;
}

export default function BubbleBackground({ count = 18 }: { count?: number }) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setBubbles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i / count) * 100 + (Math.random() * 8 - 4)}%`,
        delay: `${(Math.random() * 10).toFixed(1)}s`,
        duration: `${(7 + Math.random() * 10).toFixed(1)}s`,
        size: `${Math.round(4 + Math.random() * 12)}px`,
        opacity: `${(0.3 + Math.random() * 0.5).toFixed(2)}`,
      }))
    );
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            left: b.left,
            animationDelay: b.delay,
            animationDuration: b.duration,
            width: b.size,
            height: b.size,
            opacity: b.opacity,
          }}
        />
      ))}
    </div>
  );
}
