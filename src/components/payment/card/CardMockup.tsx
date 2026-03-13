import React from "react";

interface CardMockupProps {
  cardNumber: string;
  cardName: string;
  expiry: string;
}

export default function CardMockup({
  cardNumber,
  cardName,
  expiry,
}: CardMockupProps) {
  return (
    <div className="w-full max-w-sm mb-10 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-[#3B82F6]">
      {/* Chip */}
      <div className="w-12 h-9 bg-yellow-400 rounded-md mb-8 flex -space-x-1 opacity-90 overflow-hidden">
        <div className="w-1/3 h-full border-r border-yellow-500"></div>
        <div className="w-1/3 h-full border-r border-yellow-500"></div>
        <div className="w-1/3 h-full"></div>
      </div>

      <div className="font-mono text-xl tracking-widest mb-6 opacity-90">
        {cardNumber || "•••• •••• •••• ••••"}
      </div>

      <div className="flex justify-between items-end">
        <div>
          <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
            Card Holder
          </div>
          <div className="font-bold text-sm tracking-wide bg-transparent uppercase">
            {cardName || "YOUR NAME"}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">
            Valid Thru
          </div>
          <div className="font-bold text-sm tracking-wide">
            {expiry || "MM/YY"}
          </div>
        </div>

        {/* Visa Logo Mock */}
        <div className="bg-white/20 px-3 py-1 rounded bg-opacity-20 backdrop-blur-sm">
          <span className="font-extrabold italic text-lg tracking-tighter">
            VISA
          </span>
        </div>
      </div>
    </div>
  );
}
