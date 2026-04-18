import { X, Edit2, ChevronDown, Check, Circle, Dot } from 'lucide-react';
import React from 'react';

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  item: any;
}

export default function EditInventoryModal({ isOpen, onClose, onSave, item }: EditInventoryModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Inventory Item</h2>
              <p className="text-sm text-gray-500">Update product details and stock information</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Product Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Product Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  defaultValue={item.name}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    defaultValue={item.sku}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1 whitespace-nowrap opacity-0">
                    Category
                  </label>
                  <select defaultValue={item.category} className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                    <option>{item.category}</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-[34px] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="relative w-16 h-16 rounded-lg border border-gray-200 bg-gray-100 overflow-hidden cursor-pointer group">
                   <div className="w-full h-full bg-gray-300"></div> {/* Placeholder image */}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Edit2 className="w-4 h-4 text-white" />
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse & Location */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Warehouse & Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse <span className="text-red-500">*</span>
                </label>
                <select defaultValue={item.warehouse} className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option>{item.warehouse}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-[34px] pointer-events-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last movement</label>
                <input 
                  type="text" 
                  value={item.lastMovement}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Stock Levels */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Stock Levels</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                  Current Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <input type="number" defaultValue={item.qty} className="w-full px-3 py-2 text-center text-sm focus:outline-none" />
                  <div className="flex flex-col border-l border-gray-200">
                    <button className="px-2 py-0.5 hover:bg-gray-100 border-b border-gray-200 text-xs">▲</button>
                    <button className="px-2 py-0.5 hover:bg-gray-100 text-xs">▼</button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Minimum level</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <input type="number" defaultValue={item.minLevel} className="w-full px-3 py-2 text-center text-sm focus:outline-none bg-gray-50" readOnly />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Maximum level</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <input type="number" defaultValue={item.maxLevel} className="w-full px-3 py-2 text-center text-sm focus:outline-none bg-gray-50" readOnly />
                </div>
              </div>
            </div>
            
            {/* Stock Level Preview */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700">Stock Level Preview</span>
                <span className="text-gray-900">{item.qty} / {item.maxLevel}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full mb-1 relative">
                <div className="absolute left-[12.5%] top-0 bottom-0 w-px bg-gray-300"></div>
                <div 
                  className={`h-full rounded-full ${item.status === 'Out of Stock' ? 'bg-red-500' : item.status === 'Low Stock' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.min(100, Math.max(5, (item.qty / item.maxLevel) * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Min: {item.minLevel}</span>
                <span>Max: {item.maxLevel}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit cost (LKR) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <input type="number" defaultValue={item.unitCost.replace(/[^0-9]/g, '')} className="w-full px-3 py-2 text-sm focus:outline-none" />
                  <div className="flex flex-col border-l border-gray-200">
                    <button className="px-2 py-0.5 hover:bg-gray-100 border-b border-gray-200 text-xs text-gray-500">▲</button>
                    <button className="px-2 py-0.5 hover:bg-gray-100 text-xs text-gray-500">▼</button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total value (LKR)</label>
                <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-600 font-medium text-center">
                  {item.totalValue}
                </div>
              </div>
            </div>
          </div>

          {/* Status & Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Status & Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock status</label>
                <select defaultValue={item.status} className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option>In Stock</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-[34px] pointer-events-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto Re-Order</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center"></div>
                    Enabled
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <div className="w-4 h-4 rounded-full border border-blue-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    </div>
                    Disabled
                  </label>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-white">
          <button 
            onClick={onClose}
            className="py-2 px-6 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="py-2 px-6 rounded-lg text-sm font-semibold bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors capitalize"
          >
            save changes
          </button>
        </div>

      </div>
    </div>
  );
}
