import { X, Trash2 } from 'lucide-react';
import React from 'react';

interface DeleteInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: any;
}

export default function DeleteInventoryModal({ isOpen, onClose, onConfirm, item }: DeleteInventoryModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col items-center text-center">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
          <Trash2 className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Inventory Item</h2>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-bold text-gray-700">"{item.name}"</span> from your inventory? This action cannot be undone.
        </p>

        {/* Item Preview Card */}
        <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 flex gap-4 text-left mb-8 items-center">
          <div className="w-12 h-12 bg-white border border-gray-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-gray-300"></div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</h4>
            <p className="text-xs text-gray-500 mt-1 uppercase">SKU: <span className="text-gray-700 font-medium">{item.sku}</span><span className="mx-2 text-gray-300">|</span>Category: <span className="text-gray-700 font-medium">{item.category}</span></p>
            <p className="text-xs text-gray-500 mt-0.5 uppercase">Quantity: <span className="text-gray-700 font-medium">{item.qty}</span><span className="mx-2 text-gray-300">|</span>Value: <span className="text-emerald-600 font-medium tracking-tight">{item.totalValue}</span></p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
