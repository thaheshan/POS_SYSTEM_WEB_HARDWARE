import { X, Edit2, ChevronDown, Check, Circle, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from '@/api/axiosInstance';

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: any) => Promise<void>;
  item: any;
}

export default function EditInventoryModal({ isOpen, onClose, onSave, item }: EditInventoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [qty, setQty] = useState(0);
  const [minLevel, setMinLevel] = useState(0);
  const [maxLevel, setMaxLevel] = useState(0);
  const [unitCost, setUnitCost] = useState(0);       // Selling price
  const [costPrice, setCostPrice] = useState(0);     // Purchase / cost price
  const [status, setStatus] = useState('In Stock');
  const [autoReorder, setAutoReorder] = useState(false);

  // Fetch Categories & Warehouses on mount / open
  useEffect(() => {
    if (!isOpen || !item) return;

    // Initialize state from item
    setName(item.name || '');
    setSku(item.sku || '');
    setQty(item.qty || 0);
    setMinLevel(item.minStock || item.minLevel || 0);
    setMaxLevel(item.maxLevel || 1);
    setUnitCost(item.sellingPrice || item.price || item.cost || 0);
    setCostPrice(item.purchasePrice || item.costPrice || 0);
    setStatus(item.status || 'In Stock');
    setAutoReorder(item.autoReorder || false);
    setError(null);

    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, whRes] = await Promise.allSettled([
          api.get('/products/categories'),
          api.get('/warehouses'),
        ]);

        let catArr: any[] = [];
        if (catRes.status === 'fulfilled') {
          catArr = Array.isArray(catRes.value.data)
            ? catRes.value.data
            : catRes.value.data?.data || catRes.value.data?.categories || [];
          setCategories(catArr);
        }

        let whArr: any[] = [];
        if (whRes.status === 'fulfilled') {
          whArr = Array.isArray(whRes.value.data)
            ? whRes.value.data
            : whRes.value.data?.data || whRes.value.data?.warehouses || [];
          setWarehouses(whArr);
        }

        // Pre-select Category by Name or ID matching
        if (item.category) {
          const matchingCat = catArr.find(
            (c: any) =>
              c.name?.toLowerCase() === item.category?.toLowerCase() || c.id === item.categoryId
          );
          if (matchingCat) setCategoryId(matchingCat.id);
        }

        // Pre-select Warehouse
        if (item.warehouseId) {
          setWarehouseId(item.warehouseId);
        } else if (item.warehouse) {
          const matchingWh = whArr.find(
            (w: any) =>
              w.name?.toLowerCase() === item.warehouse?.toLowerCase() || w.id === item.warehouseId
          );
          if (matchingWh) setWarehouseId(matchingWh.id);
        }
      } catch (err) {
        console.error('Failed to load edit modal lists:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!sku.trim()) {
      setError('SKU is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    // Warehouse validation removed as requested
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        categoryId,
        warehouseId,
        qty: Number(qty),
        minimumStockLevel: Number(minLevel),
        maximumStockLevel: Number(maxLevel),
        purchasePrice: Number(costPrice),
        sellingPrice: Number(unitCost),
        status,
        autoReorder,
      };

      await onSave(payload);
    } catch (err: any) {
      console.error('Error saving changes:', err);
      setError(err?.response?.data?.message || 'Failed to update product details.');
    } finally {
      setSaving(false);
    }
  };

  const calculatedTotalValue = qty * unitCost;

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
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-[34px] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse & Location - Hidden as requested */}

          {/* Stock Levels */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Stock Levels</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">
                  Current Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <input 
                    type="number" 
                    value={qty} 
                    onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-center text-sm focus:outline-none" 
                  />
                  <div className="flex flex-col border-l border-gray-200">
                    <button 
                      type="button"
                      onClick={() => setQty(prev => prev + 1)}
                      className="px-2 py-0.5 hover:bg-gray-100 border-b border-gray-200 text-xs"
                    >
                      ▲
                    </button>
                    <button 
                      type="button"
                      onClick={() => setQty(prev => Math.max(0, prev - 1))}
                      className="px-2 py-0.5 hover:bg-gray-100 text-xs"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Minimum level</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <input 
                    type="number" 
                    value={minLevel} 
                    onChange={(e) => setMinLevel(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-center text-sm focus:outline-none bg-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Maximum level</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <input 
                    type="number" 
                    value={maxLevel} 
                    onChange={(e) => setMaxLevel(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-center text-sm focus:outline-none bg-white" 
                  />
                </div>
              </div>
            </div>
            
            {/* Stock Level Preview */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-700">Stock Level Preview</span>
                <span className="text-gray-900">{qty} / {maxLevel}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full mb-1 relative">
                <div className="absolute left-[12.5%] top-0 bottom-0 w-px bg-gray-300"></div>
                <div 
                  className={`h-full rounded-full ${qty <= 0 ? 'bg-red-500' : qty <= minLevel ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.min(100, Math.max(5, (qty / maxLevel) * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Min: {minLevel}</span>
                <span>Max: {maxLevel}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price (LKR) <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs text-gray-400">What you pay</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-400">
                  <span className="px-2 py-2 text-xs text-gray-400 bg-gray-50 border-r border-gray-200">Rs.</span>
                  <input 
                    type="number" 
                    value={costPrice} 
                    onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm focus:outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (LKR) <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs text-gray-400">Customer pays</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="px-2 py-2 text-xs text-gray-400 bg-gray-50 border-r border-gray-200">Rs.</span>
                  <input 
                    type="number" 
                    value={unitCost} 
                    onChange={(e) => setUnitCost(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm focus:outline-none" 
                  />
                </div>
              </div>
            </div>
            {/* Profit Margin Preview */}
            {costPrice > 0 && unitCost > 0 && (
              <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                unitCost >= costPrice ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                Margin: Rs. {(unitCost - costPrice).toLocaleString()} &nbsp;|&nbsp;
                {Math.round(((unitCost - costPrice) / costPrice) * 100)}% profit
              </div>
            )}
          </div>

          {/* Status & Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b pb-2">Status & Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-[34px] pointer-events-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto Re-Order</label>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setAutoReorder(true)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${autoReorder ? 'border-blue-500' : 'border-gray-300'}`}>
                      {autoReorder && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                    </div>
                    Enabled
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAutoReorder(false)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!autoReorder ? 'border-blue-500' : 'border-gray-300'}`}>
                      {!autoReorder && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                    </div>
                    Disabled
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-white">
          <button 
            type="button"
            onClick={onClose}
            disabled={saving}
            className="py-2 px-6 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="py-2 px-6 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors capitalize disabled:bg-blue-400"
          >
            {saving ? 'Saving...' : 'save changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
