"use client";

import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";

export default function CelebrationConfetti() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  if (!size.width || !size.height) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Confetti
        width={size.width}
        height={size.height}
        numberOfPieces={300}
        gravity={0.16}
        recycle={false}
        colors={["#2563EB", "#16A34A", "#F97316", "#EAB308"]}
      />
    </div>
  );
}
