import React from "react";
import { Shield } from "lucide-react";

export default function SecurityBadge() {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8">
      <Shield className="w-4 h-4 text-white/80" />
      <span className="text-xs font-semibold text-white/90">
        256-bit SSL Encrypted
      </span>
    </div>
  );
}
