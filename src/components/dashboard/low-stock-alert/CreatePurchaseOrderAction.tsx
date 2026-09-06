"use client";

import { ShoppingCart, X } from "lucide-react";

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
    <div className="border-t border-slate-200 bg-white px-4 py-2.5 sm:px-6 shrink-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-semibold text-slate-600">
          {selectedCount > 0 ? (
            <span className="font-bold text-blue-700">{selectedCount} items selected</span>
          ) : (
            <span>Select products to build a purchase order</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onCreatePurchaseOrders}
            disabled={selectedCount === 0}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#1e40af] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Create Purchase Orders
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}