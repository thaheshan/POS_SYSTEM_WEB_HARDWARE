import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

interface InventoryFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onWarehouseChange: (warehouse: string | null) => void;
  onClearAll: () => void;
  activeFilters: {
    selectedCategory: string | null;
    selectedWarehouse: string | null;
    selectedStatus: string | null;
  };
}

export default function InventoryFilters({
  isOpen,
  onClose,
  onStatusChange,
  onCategoryChange,
  onWarehouseChange,
  onClearAll,
  activeFilters
}: InventoryFiltersProps) {
  const [tempCategory, setTempCategory] = useState<string | null>(activeFilters.selectedCategory);
  const [tempWarehouse, setTempWarehouse] = useState<string | null>(activeFilters.selectedWarehouse);
  const [tempStatus, setTempStatus] = useState<string | null>(activeFilters.selectedStatus);

  if (!isOpen) return null;

  const handleApplyFilters = () => {
    onCategoryChange(tempCategory);
    onWarehouseChange(tempWarehouse);
    onStatusChange(tempStatus);
    onClose();
  };

  const handleReset = () => {
    setTempCategory(null);
    setTempWarehouse(null);
    setTempStatus(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center font-sans" onClick={onClose}>
      <div className="bg-white rounded-[20px] shadow-2xl border border-gray-100 w-[380px] p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
            <h3 className="text-[16px] font-black text-gray-900 tracking-tight">Filter Inventory</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Status Section */}
        <div className="mb-6">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Stock Status</label>
          <div className="flex flex-wrap gap-2">
            {['In Stock', 'Low Stock', 'Out of Stock'].map(s => (
              <button 
                key={s} 
                onClick={() => setTempStatus(tempStatus === s ? null : s)}
                className={`px-3 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                  tempStatus === s ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Category Section */}
        <div className="mb-6">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {['Cement', 'Steel & Metal', 'Paint & Varnish', 'Electrical', 'Wood & Timber'].map(c => (
              <button 
                key={c} 
                onClick={() => setTempCategory(tempCategory === c ? null : c)}
                className={`px-3 py-2 rounded-xl text-[12px] font-bold border text-left transition-all truncate ${
                  tempCategory === c ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Warehouse Section */}
        <div className="mb-8">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Warehouse</label>
          <div className="grid grid-cols-2 gap-2">
            {['Main Store', 'Central Warehouse', 'Branch 1', 'Branch 2'].map(w => (
              <button 
                key={w} 
                onClick={() => setTempWarehouse(tempWarehouse === w ? null : w)}
                className={`px-3 py-2 rounded-xl text-[12px] font-bold border text-left transition-all truncate ${
                  tempWarehouse === w ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <button 
            onClick={handleReset} 
            className="flex-1 py-3 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            Reset
          </button>
          <button 
            onClick={handleApplyFilters} 
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-black shadow-sm shadow-emerald-600/20 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
