import { X, ArrowUpDown, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from '@/api/axiosInstance';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdjustStockModal({ isOpen, onClose, onSuccess }: AdjustStockModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '00000000-0000-0000-0000-000000000000', // Mock fallback
    adjustmentType: 'add',
    quantity: '',
    reason: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/stock');
      const items = res.data?.data || res.data || [];
      setProducts(items);
    } catch (error) {
      console.error('Failed to fetch products for stock adjustment', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.productId || !formData.quantity) {
      alert("Please select a product and enter a quantity.");
      return;
    }

    const item = products.find(p => p.productId === formData.productId || p.product?.id === formData.productId);
    // Since the API expects productId, branchId, and warehouseId we try to pull them from the selected product's stock record
    const warehouseId = item?.warehouseId || formData.warehouseId;
    const branchId = item?.branchId || "00000000-0000-0000-0000-000000000000";

    setLoading(true);
    try {
      const endpoint = formData.adjustmentType === 'add' ? '/stock/add' : '/stock/deduct';
      const qtyKey = formData.adjustmentType === 'add' ? 'add_quantity' : 'deduct_quantity';
      await api.post(endpoint, {
        product_id: formData.productId,
        warehouse_id: warehouseId,
        branch_id: branchId,
        [qtyKey]: Number(formData.quantity),
        reason: formData.reason || 'Manual adjustment',
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to adjust stock', error);
      alert('Failed to adjust stock. Check if you have enough stock when deducting.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
              <p className="text-sm text-gray-500">Add or deduct inventory manually</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Product <span className="text-red-500">*</span>
            </label>
            <select 
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="w-full appearance-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="">Select a product...</option>
              {products.map(p => {
                const prod = p.product || p;
                return (
                  <option key={prod.id || p.productId} value={prod.id || p.productId}>
                    {prod.product_name || prod.name} ({p.available_quantity || p.availableQuantity} in stock)
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-[34px] pointer-events-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjustment Type
              </label>
              <div className="relative">
                <select 
                  name="adjustmentType"
                  value={formData.adjustmentType}
                  onChange={handleChange}
                  className="w-full appearance-none px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="add">Add Stock</option>
                  <option value="deduct">Deduct Stock</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-[10px] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="0"
                min="1"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason / Notes
            </label>
            <input 
              type="text" 
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g. Received new shipment, Damaged goods, etc."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            className="py-2 px-6 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="py-2 px-6 rounded-lg text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center gap-2"
          >
            {loading ? "Processing..." : "Confirm Adjustment"}
          </button>
        </div>

      </div>
    </div>
  );
}
