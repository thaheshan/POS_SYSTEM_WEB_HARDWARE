'use client';

import React from 'react';
import { AlertTriangle, PauseCircle, Trash2, X } from 'lucide-react';
import { HeldSale } from './HeldSalesModal';

interface HoldOverwriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSale: HeldSale | null;
  currentCartItemCount: number;
  currentCartTotal: number;
  onHoldCurrentAndLoad: () => void;
  onDiscardCurrentAndLoad: () => void;
}

export default function HoldOverwriteModal({
  isOpen,
  onClose,
  targetSale,
  currentCartItemCount,
  currentCartTotal,
  onHoldCurrentAndLoad,
  onDiscardCurrentAndLoad,
}: HoldOverwriteModalProps) {
  if (!isOpen || !targetSale) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1">
          Active Cart Is Not Empty
        </h3>
        <p className="text-xs text-gray-500 font-medium mb-4">
          You currently have{' '}
          <span className="font-bold text-gray-800">
            {currentCartItemCount} item(s) (Rs.{' '}
            {currentCartTotal.toLocaleString()})
          </span>{' '}
          in your active cart. Loading &quot;{targetSale.reference}&quot; will
          replace them.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={onHoldCurrentAndLoad}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <PauseCircle className="w-4 h-4" />
            Put Current Cart on Hold & Load This One
          </button>

          <button
            onClick={onDiscardCurrentAndLoad}
            className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 active:scale-95 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Discard Current Cart & Load
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
