import React from "react";
import { Lock } from "lucide-react";

export default function PulsatingLock() {
  return (
    <div className="relative mb-14 sm:mb-16 flex items-center justify-center">
      {/* Inner pulsating ring */}
      <div className="absolute w-24 h-24 bg-white/10 rounded-full animate-ping opacity-75"></div>
      {/* Middle ring */}
      <div className="absolute w-32 h-32 border-2 border-white/20 rounded-full"></div>
      {/* Outer ring */}
      <div className="absolute w-40 h-40 border border-white/10 rounded-full"></div>

      <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10 shadow-xl border border-white/30">
        <Lock className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
