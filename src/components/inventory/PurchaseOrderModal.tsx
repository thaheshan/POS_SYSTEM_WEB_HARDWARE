'use client';

import { X, FileText, Search, Plus, Trash2, CheckCircle2, Package } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from '@/api/axiosInstance';
import { toast } from 'sonner';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface OrderLine {
  productId: string;
  productName: string;
  sku: string;
  quantity: string;
  unitCost: string;
  warehouseId: string;
}

export default function PurchaseOrderModal({ isOpen, onClose, onSuccess }: PurchaseOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [supplierName, setSupplierName] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<OrderLine[]>([
    { productId: '', productName: '', sku: '', quantity: '', unitCost: '', warehouseId: '' }
  ]);
  const [search, setSearch] = useState<string[]>(['']);

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
      const [prodRes, whRes] = await Promise.all([
        api.get('/inventory/products'),
        api.get('/warehouses').catch(() => ({ data: [] })),
      ]);
      const rawProds = prodRes.data?.data || prodRes.data || [];
      setProducts(rawProds.map((p: any) => ({
        id: p.id,
        name: p.product_name || p.name || 'Unknown',
        sku: p.sku || 'N/A',
      })));

      const rawWh = whRes.data?.data || whRes.data || [];
      setWarehouses(rawWh.map((w: any) => ({ id: w.id, name: w.name })));
    } catch {
      // Silently fail; user can still type
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSupplierName('');
    setExpectedDate('');
    setNotes('');
    setLines([{ productId: '', productName: '', sku: '', quantity: '', unitCost: '', warehouseId: '' }]);
    setSearch(['']);
  };

  const addLine = () => {
    setLines(prev => [...prev, { productId: '', productName: '', sku: '', quantity: '', unitCost: '', warehouseId: '' }]);
    setSearch(prev => [...prev, '']);
  };

  const removeLine = (idx: number) => {
    setLines(prev => prev.filter((_, i) => i !== idx));
    setSearch(prev => prev.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: keyof OrderLine, value: string) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const selectProduct = (idx: number, product: Product) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, productId: product.id, productName: product.name, sku: product.sku } : l));
    setSearch(prev => prev.map((s, i) => i === idx ? product.name : s));
  };

  const totalValue = lines.reduce((sum, l) => {
    const q = Number(l.quantity) || 0;
    const c = Number(l.unitCost) || 0;
    return sum + q * c;
  }, 0);

  const handleSubmit = async () => {
    if (!supplierName) { toast.error('Supplier name is required.'); return; }
    const validLines = lines.filter(l => l.productId && Number(l.quantity) > 0);
    if (validLines.length === 0) { toast.error('Add at least one product with a quantity.'); return; }

    setSubmitting(true);
    try {
      // Record GRN: add stock for each line item
      let receiveCount = 0;
      for (const line of validLines) {
        const wh = line.warehouseId || (warehouses[0]?.id ?? '00000000-0000-0000-0000-000000000000');
        await api.post('/stock/add', {
          product_id: line.productId,
          warehouse_id: wh,
          branch_id: '00000000-0000-0000-0000-000000000000',
          add_quantity: Number(line.quantity),
          reason: `GRN - Supplier: ${supplierName}`,
        });
        receiveCount++;
      }
      toast.success(`Purchase order received. ${receiveCount} line(s) added to stock.`);
      setDone(true);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to process purchase order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create Purchase Order</h2>
              <p className="text-sm text-gray-500">Record incoming stock from a supplier (GRN)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {done ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Purchase Order Received</h3>
              <p className="text-sm text-gray-500">Stock has been added to inventory.</p>
              <button
                onClick={() => { setDone(false); resetForm(); }}
                className="mt-6 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors"
              >
                New Purchase Order
              </button>
            </div>
          ) : (
            <>
              {/* Supplier & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Supplier Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    placeholder="e.g. ABC Distributors"
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-rose-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Expected Delivery</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={e => setExpectedDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-rose-400 transition-all"
                  />
                </div>
              </div>

              {/* Order Lines */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Order Lines <span className="text-red-400">*</span></label>
                  <button onClick={addLine} className="flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors">
                    <Plus className="w-4 h-4" /> Add Line
                  </button>
                </div>

                <div className="space-y-3">
                  {lines.map((line, idx) => {
                    const filteredProducts = products.filter(p =>
                      p.name.toLowerCase().includes((search[idx] || '').toLowerCase()) ||
                      p.sku.toLowerCase().includes((search[idx] || '').toLowerCase())
                    );
                    return (
                      <div key={idx} className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Line {idx + 1}</span>
                          {lines.length > 1 && (
                            <button onClick={() => removeLine(idx)} className="text-red-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Product Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search product..."
                            value={search[idx] || ''}
                            onChange={e => {
                              const val = e.target.value;
                              setSearch(prev => prev.map((s, i) => i === idx ? val : s));
                              if (!val) updateLine(idx, 'productId', '');
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white outline-none focus:border-rose-400 transition-all"
                          />
                          {search[idx] && !line.productId && filteredProducts.length > 0 && (
                            <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                              {filteredProducts.slice(0, 8).map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => selectProduct(idx, p)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-rose-50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                  <Package className="w-4 h-4 text-gray-400 shrink-0" />
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">{p.name}</p>
                                    <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Quantity</label>
                            <input
                              type="number"
                              min={1}
                              value={line.quantity}
                              onChange={e => updateLine(idx, 'quantity', e.target.value)}
                              placeholder="0"
                              className="w-full border border-gray-200 rounded-xl py-2 px-3 text-sm font-bold bg-white outline-none focus:border-rose-400 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Unit Cost (Rs.)</label>
                            <input
                              type="number"
                              min={0}
                              value={line.unitCost}
                              onChange={e => updateLine(idx, 'unitCost', e.target.value)}
                              placeholder="0.00"
                              className="w-full border border-gray-200 rounded-xl py-2 px-3 text-sm font-bold bg-white outline-none focus:border-rose-400 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Warehouse</label>
                            <select
                              value={line.warehouseId}
                              onChange={e => updateLine(idx, 'warehouseId', e.target.value)}
                              className="w-full border border-gray-200 rounded-xl py-2 px-3 text-sm font-medium bg-white outline-none focus:border-rose-400 transition-all"
                            >
                              <option value="">Default</option>
                              {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {line.productId && line.quantity && line.unitCost && (
                          <div className="text-right text-xs font-bold text-gray-500">
                            Line Total: <span className="text-rose-600 font-black">Rs. {(Number(line.quantity) * Number(line.unitCost)).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              {totalValue > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl px-5 py-4 flex items-center justify-between">
                  <span className="text-sm font-black text-gray-700 uppercase tracking-wider">Order Total</span>
                  <span className="text-xl font-black text-rose-600">Rs. {totalValue.toLocaleString()}</span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium outline-none focus:border-rose-400 transition-all resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-gray-50 shrink-0">
            <button onClick={onClose} className="py-2 px-6 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="py-2 px-6 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              {submitting ? 'Processing...' : 'Receive Stock (GRN)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
