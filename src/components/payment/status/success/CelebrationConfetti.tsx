"use client";

import React, { useEffect, useRef } from "react";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
const TOTAL = 60;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function CelebrationConfetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pieces: HTMLSpanElement[] = [];

    for (let i = 0; i < TOTAL; i++) {
      const el = document.createElement("span");
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = randomBetween(6, 12);
      const left = randomBetween(0, 100);
      const delay = randomBetween(0, 1.2);
      const duration = randomBetween(1.8, 3.2);

      el.style.cssText = `
        position: absolute;
        top: -20px;
        left: ${left}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        opacity: 0;
        animation: confettiFall ${duration}s ease-in ${delay}s forwards;
        transform: rotate(${randomBetween(0, 360)}deg);
      `;

      container.appendChild(el);
      pieces.push(el);
    }

    return () => {
      pieces.forEach((p) => p.remove());
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(220px) rotate(720deg) scale(0.5); }
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute inset-x-0 top-0 h-48 pointer-events-none overflow-hidden"
        aria-hidden="true"
      />
    </>
  );
}
