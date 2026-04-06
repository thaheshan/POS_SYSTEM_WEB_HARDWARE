import React from "react";
import { Shield, RotateCcw, Headset } from "lucide-react";

export default function SecurityFooter() {
  return (
    <div className="mt-10 md:mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs sm:text-sm font-semibold text-slate-600 pb-4 md:pb-8 px-2">
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
