"use client";

import { ArrowRight, X } from "lucide-react";

interface CreatePurchaseOrderActionProps {
  selectedCount: number;
  onCreatePurchaseOrders: () => void;
  onClose: () => void;
}

export default function CreatePurchaseOrderAction({
  selectedCount,
  onCreatePurchaseOrders,
  onClose,
}: CreatePurchaseOrderActionProps) {
  return (
    <div className="stock-fade-up stock-delay-4 border-t border-slate-200 bg-white px-4 py-4 sm:px-8 sm:py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold text-slate-600">
          {selectedCount > 0 ? (
            <span>{selectedCount} products selected</span>
          ) : (
            <span>Select products to build a purchase order</span>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center md:justify-end">
          <button
            type="button"
            onClick={onCreatePurchaseOrders}
            disabled={selectedCount === 0}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#1e40af] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:w-auto"
          >
            <ArrowRight className="h-4 w-4" />
            Create Purchase Orders
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 sm:w-auto"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
