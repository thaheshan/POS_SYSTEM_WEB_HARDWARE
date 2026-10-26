'use client';

import React, { useEffect, useRef } from 'react';
import { PauseCircle, X, AlertCircle } from 'lucide-react';

interface HoldConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reference: string) => void;
  defaultReference: string;
  itemCount: number;
  total: number;
}

export default function HoldConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  defaultReference,
  itemCount,
  total,
}: HoldConfirmModalProps) {
  const [reference, setReference] = React.useState(defaultReference);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReference(defaultReference);
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [isOpen, defaultReference]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onConfirm(reference.trim() || defaultReference);
  };

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
              <PauseCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">
                Hold Current Sale
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Suspend basket to resume checkout later
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Summary Banner */}
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
              Cart Summary
            </span>
            <span className="text-xs font-bold text-gray-700">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Total
            </span>
            <span className="text-base font-black text-[#059669]">
              Rs. {Number(total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-600 mb-1.5">
              Hold Reference / Customer Note
            </label>
            <input
              ref={inputRef}
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. Nishanthan (waiting for cash)..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1 font-medium">
              Give this held sale a recognizable name to easily find it later.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5"
            >
              <PauseCircle className="w-4 h-4" />
              Confirm Hold
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
