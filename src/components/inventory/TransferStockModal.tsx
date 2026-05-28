'use client';

import { X, ArrowLeftRight, Search, CheckCircle2, Package } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from '@/api/axiosInstance';
import { toast } from 'sonner';

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StockItem {
  stockId: string;
  productId: string;
  warehouseId: string;
  warehouseName: string;
  branchId: string;
  name: string;
  sku: string;
  availableQty: number;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function TransferStockModal({ isOpen, onClose, onSuccess }: TransferStockModalProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [search, setSearch] = useState('');

  const [selectedProductId, setSelectedProductId] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setDone(false);
      resetForm();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stockRes, whRes] = await Promise.all([
        api.get('/stock'),
        api.get('/warehouses').catch(() => ({ data: [] })),
      ]);
      const rawStock = stockRes.data?.data || stockRes.data || [];
      setStockItems(rawStock.map((item: any) => ({
        stockId: item.id,
        productId: item.product_id || item.productId,
        warehouseId: item.warehouse_id || item.warehouseId || '',
        warehouseName: item.warehouse?.name || 'Main Warehouse',
        branchId: item.branch_id || item.branchId || '',
        name: item.product?.product_name || item.product?.name || 'Unknown',
        sku: item.product?.sku || 'N/A',
        availableQty: Number(item.available_quantity ?? item.availableQuantity ?? 0),
      })));

      const rawWh = whRes.data?.data || whRes.data || [];
      setWarehouses(rawWh.map((w: any) => ({ id: w.id, name: w.name })));
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProductId('');
    setFromWarehouseId('');
    setToWarehouseId('');
    setQuantity('');
    setNotes('');
    setSearch('');
  };

  const selectedStockItem = stockItems.find(
    i => i.productId === selectedProductId && i.warehouseId === fromWarehouseId
  );

  const maxQty = selectedStockItem?.availableQty ?? 0;

  const handleSubmit = async () => {
    if (!selectedProductId || !fromWarehouseId || !toWarehouseId || !quantity) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      toast.error('Source and destination warehouse must be different.');
      return;
    }
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Enter a valid quantity.');
      return;
    }
    if (qty > maxQty) {
      toast.error(`Only ${maxQty} units available in the source warehouse.`);
      return;
    }

    setSubmitting(true);
    try {
      const destItem = stockItems.find(i => i.productId === selectedProductId && i.warehouseId === toWarehouseId);
      const branchId = selectedStockItem?.branchId || destItem?.branchId || '00000000-0000-0000-0000-000000000000';

      // Deduct from source
      await api.post('/stock/deduct', {
        product_id: selectedProductId,
        warehouse_id: fromWarehouseId,
        branch_id: branchId,
        deduct_quantity: qty,
        reason: notes || `Transfer to ${warehouses.find(w => w.id === toWarehouseId)?.name}`,
      });

      // Add to destination
      await api.post('/stock/add', {
        product_id: selectedProductId,
        warehouse_id: toWarehouseId,
        branch_id: branchId,
        add_quantity: qty,
        reason: notes || `Transfer from ${warehouses.find(w => w.id === fromWarehouseId)?.name}`,
      });

      toast.success(`${qty} unit(s) transferred successfully.`);
      setDone(true);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Transfer failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Unique products from stock
  const uniqueProducts = Array.from(new Map(stockItems.map(i => [i.productId, i])).values())
    .filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

  // Warehouses available for the selected product
  const fromWarehouses = stockItems.filter(i => i.productId === selectedProductId && i.availableQty > 0);
  const toWarehouses = warehouses.length > 0 ? warehouses : Array.from(new Map(stockItems.map(i => [i.warehouseId, { id: i.warehouseId, name: i.warehouseName }])).values());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transfer Stock</h2>
              <p className="text-sm text-gray-500">Move inventory between warehouses</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
            </div>
          ) : done ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Transfer Complete</h3>
              <p className="text-sm text-gray-500">Stock has been successfully moved.</p>
              <button
                onClick={() => { setDone(false); resetForm(); }}
                className="mt-6 px-5 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-bold hover:bg-cyan-700 transition-colors"
              >
                New Transfer
              </button>
            </div>
          ) : (
            <>
              {/* Product Search */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Product <span className="text-red-400">*</span></label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                  {uniqueProducts.map(item => (
                    <button
                      key={item.productId}
                      onClick={() => { setSelectedProductId(item.productId); setFromWarehouseId(''); setSearch(''); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-cyan-50 transition-colors border-b border-gray-50 last:border-0 ${selectedProductId === item.productId ? 'bg-cyan-50 text-cyan-700' : ''}`}
                    >
                      <Package className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                      </div>
                    </button>
                  ))}
                  {uniqueProducts.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">No products found</div>
                  )}
                </div>
              </div>

              {/* From Warehouse */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">From Warehouse <span className="text-red-400">*</span></label>
                <select
                  value={fromWarehouseId}
                  onChange={e => setFromWarehouseId(e.target.value)}
                  disabled={!selectedProductId}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-cyan-400 transition-all disabled:opacity-50"
                >
                  <option value="">Select source warehouse</option>
                  {fromWarehouses.map(i => (
                    <option key={i.warehouseId} value={i.warehouseId}>
                      {i.warehouseName} (Available: {i.availableQty})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Warehouse */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">To Warehouse <span className="text-red-400">*</span></label>
                <select
                  value={toWarehouseId}
                  onChange={e => setToWarehouseId(e.target.value)}
                  disabled={!fromWarehouseId}
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-cyan-400 transition-all disabled:opacity-50"
                >
                  <option value="">Select destination warehouse</option>
                  {toWarehouses.filter(w => w.id !== fromWarehouseId).map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                  Quantity <span className="text-red-400">*</span>
                  {maxQty > 0 && <span className="ml-2 text-cyan-600 normal-case font-bold">(max: {maxQty})</span>}
                </label>
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  disabled={!fromWarehouseId}
                  placeholder="Enter quantity to transfer"
                  className="w-full border-2 border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold outline-none focus:border-cyan-400 transition-all disabled:opacity-50"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Reason for transfer..."
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-cyan-400 transition-all resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!done && !loading && (
          <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-gray-50 shrink-0">
            <button onClick={onClose} className="py-2 px-6 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedProductId || !fromWarehouseId || !toWarehouseId || !quantity}
              className="py-2 px-6 rounded-xl text-sm font-bold bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4" />
              {submitting ? 'Transferring...' : 'Transfer Stock'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
