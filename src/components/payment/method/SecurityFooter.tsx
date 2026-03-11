import React from "react";
import { Shield, RotateCcw, Headset } from "lucide-react";

export default function SecurityFooter() {
  return (
    <div className="mt-12 flex justify-center gap-8 text-xs font-semibold text-gray-600 pb-8">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-blue-600" />
        <span>Secure Payment</span>
      </div>
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4 text-[#059669]" />
        <span>30-Day Money Back</span>
      </div>
      <div className="flex items-center gap-2">
        <Headset className="w-4 h-4 text-[#FF5722]" />
        <span>24/7 Support</span>
      </div>
    </div>
  );
}
