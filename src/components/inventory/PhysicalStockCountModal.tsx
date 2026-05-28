'use client';

import { X, CheckSquare, Search, AlertTriangle, CheckCircle2, RefreshCcw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from '@/api/axiosInstance';
import { toast } from 'sonner';

interface PhysicalStockCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StockItem {
  stockId: string;
  productId: string;
  warehouseId: string;
  branchId: string;
  name: string;
  sku: string;
  systemQty: number;
  countedQty: string;
}

export default function PhysicalStockCountModal({ isOpen, onClose, onSuccess }: PhysicalStockCountModalProps) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStock();
      setSubmitted(false);
      setSearch('');
    }
  }, [isOpen]);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stock');
      const raw = res.data?.data || res.data || [];
      setItems(raw.map((item: any) => ({
        stockId: item.id,
        productId: item.product_id || item.productId,
        warehouseId: item.warehouse_id || item.warehouseId || '',
        branchId: item.branch_id || item.branchId || '',
        name: item.product?.product_name || item.product?.name || 'Unknown',
        sku: item.product?.sku || 'N/A',
        systemQty: Number(item.available_quantity ?? item.availableQuantity ?? 0),
        countedQty: '',
      })));
    } catch {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const handleCountChange = (stockId: string, value: string) => {
    setItems(prev => prev.map(i => i.stockId === stockId ? { ...i, countedQty: value } : i));
  };

  const itemsWithChanges = items.filter(i => i.countedQty !== '' && Number(i.countedQty) !== i.systemQty);
  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    if (itemsWithChanges.length === 0) {
      toast.info('No differences to reconcile.');
      return;
    }
    setSubmitting(true);
    let successCount = 0;
    try {
      for (const item of itemsWithChanges) {
        const counted = Number(item.countedQty);
        const diff = counted - item.systemQty;
        const endpoint = diff > 0 ? '/stock/add' : '/stock/deduct';
        const qtyKey = diff > 0 ? 'add_quantity' : 'deduct_quantity';
        await api.post(endpoint, {
          product_id: item.productId,
          warehouse_id: item.warehouseId,
          branch_id: item.branchId,
          [qtyKey]: Math.abs(diff),
          reason: 'Physical Stock Count Reconciliation',
        });
        successCount++;
      }
      toast.success(`Stock count complete. ${successCount} item(s) reconciled.`);
      setSubmitted(true);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reconciliation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Physical Stock Count</h2>
              <p className="text-sm text-gray-500">Enter counted quantities to reconcile with system records</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        {/* Summary bar */}
        {itemsWithChanges.length > 0 && (
          <div className="mx-6 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-amber-800 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            {itemsWithChanges.length} item(s) differ from system record — will be adjusted on submit.
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : submitted ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Reconciliation Complete</h3>
              <p className="text-sm text-gray-500">Stock counts have been updated successfully.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-black text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="text-center py-2 text-xs font-black text-gray-400 uppercase tracking-wider">System Qty</th>
                  <th className="text-center py-2 text-xs font-black text-gray-400 uppercase tracking-wider">Counted Qty</th>
                  <th className="text-center py-2 text-xs font-black text-gray-400 uppercase tracking-wider">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => {
                  const counted = item.countedQty !== '' ? Number(item.countedQty) : null;
                  const diff = counted !== null ? counted - item.systemQty : null;
                  return (
                    <tr key={item.stockId} className={`hover:bg-gray-50 transition-colors ${diff !== null && diff !== 0 ? 'bg-amber-50/40' : ''}`}>
                      <td className="py-3 pr-4">
                        <p className="font-bold text-gray-900 leading-tight line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                      </td>
                      <td className="py-3 text-center font-bold text-gray-700">{item.systemQty}</td>
                      <td className="py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          value={item.countedQty}
                          onChange={e => handleCountChange(item.stockId, e.target.value)}
                          placeholder="—"
                          className="w-20 text-center border-2 border-gray-200 rounded-lg py-1.5 text-sm font-bold outline-none focus:border-blue-400 transition-all"
                        />
                      </td>
                      <td className="py-3 text-center">
                        {diff !== null ? (
                          <span className={`font-black text-sm px-2 py-0.5 rounded-md ${diff > 0 ? 'bg-green-50 text-green-600' : diff < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="border-t border-gray-100 p-4 flex items-center justify-between gap-3 bg-gray-50 shrink-0">
            <button onClick={fetchStock} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors">
              <RefreshCcw className="w-4 h-4" /> Refresh
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="py-2 px-6 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || itemsWithChanges.length === 0}
                className="py-2 px-6 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
              >
                <CheckSquare className="w-4 h-4" />
                {submitting ? 'Reconciling...' : `Reconcile (${itemsWithChanges.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
