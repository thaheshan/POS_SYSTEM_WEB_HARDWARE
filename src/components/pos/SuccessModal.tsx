'use client';

import { CheckCircle2, PartyPopper } from 'lucide-react';
import { useEffect } from 'react';

type SuccessModalProps = {
  isOpen: boolean;
  total: number;
};

export default function SuccessModal({ isOpen, total }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[32px] w-full max-w-[400px] p-10 shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
        
        {/* Animated Icon Container */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 relative">
          <CheckCircle2 className="w-14 h-14 text-[#059669] animate-in slide-in-from-bottom-2 duration-500" />
          <div className="absolute -top-2 -right-2">
            <PartyPopper className="w-8 h-8 text-amber-500 animate-bounce" />
          </div>
        </div>

        <h2 className="text-[24px] font-black text-gray-900 tracking-tight mb-2">
          Payment Successful!
        </h2>
        <p className="text-[14px] font-medium text-gray-500 mb-8 px-6">
          The transaction has been processed and your receipt is being printed.
        </p>

        {/* Transaction Summary Block */}
        <div className="w-full bg-[#f1fdf9] border border-emerald-100 rounded-2xl p-5 mb-8">
           <div className="flex justify-between items-center mb-1">
             <span className="text-[12px] font-bold text-emerald-800 uppercase tracking-widest">Total Paid</span>
             <span className="text-[18px] font-black text-[#059669]">Rs. {total.toLocaleString()}</span>
           </div>
           <div className="flex justify-between items-center opacity-60">
             <span className="text-[11px] font-bold text-emerald-800">Transaction ID</span>
             <span className="text-[11px] font-bold text-emerald-800">TXN-00123490</span>
           </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#059669] animate-pulse">
           <span className="w-2 h-2 rounded-full bg-[#059669]" />
           Auto-redirecting in 2s...
        </div>

      </div>
    </div>
  );
}
