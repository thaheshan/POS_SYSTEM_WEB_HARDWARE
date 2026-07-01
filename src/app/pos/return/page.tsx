'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, RotateCcw, Search, AlertCircle, CheckCircle2, ChevronRight, Package, Receipt, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axiosInstance';

interface InvoiceItem {
  id: string;           // invoiceItemId
  productId: string;
  warehouseId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  returnQuantity: number;
}

export default function ProcessReturnPage() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [invoiceFound, setInvoiceFound] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      setError('Please enter an invoice number');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      // Use the standard /sales/:id endpoint
      const res = await api.get(`/sales/${encodeURIComponent(invoiceNumber.trim())}`);
      
      // Handle potential double-wrapping from NestJS interceptors
      const payload = res.data?.data;
      const invoice = payload?.data ? payload.data : payload;

      if (invoice) {
        setInvoiceFound(true);
        setItems(invoice.items.map((item: any) => ({
          id: item.id,           // real invoiceItemId
          productId: item.productId,
          warehouseId: item.warehouseId,
          name: item.product?.name || item.productName || 'Unknown',
          sku: item.product?.sku || 'N/A',
          quantity: item.quantity,
          price: item.unitPrice,
          returnQuantity: 0,
        })));
      } else {
        setError('Invoice not found or not eligible for return.');
        setInvoiceFound(false);
        setItems([]);
      }
    } catch (err: any) {
      console.error('Failed to lookup invoice', err);
      const backendMessage = err?.response?.data?.message;
      const status = err?.response?.status;
      const errorStr = err?.message || String(err);
      
      const msg = backendMessage 
        ? `Backend Error (${status}): ${backendMessage}`
        : `Network Error: ${errorStr}`;
        
      setError(`Failed to lookup invoice. ${msg}`);
      setInvoiceFound(false);
      setItems([]);
    } finally {
      setIsSearching(false);
    }
  };

  const updateReturnQuantity = (id: string, qty: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const validQty = Math.max(0, Math.min(qty, item.quantity));
        return { ...item, returnQuantity: validQty };
      }
      return item;
    }));
  };

  const totalRefund = items.reduce((acc, item) => acc + (item.price * item.returnQuantity), 0);
  const hasItemsToReturn = totalRefund > 0;

  const handleProcessReturn = async () => {
    setIsProcessing(true);
    
    const returnItems = items
      .filter(item => item.returnQuantity > 0)
      .map(item => ({
        productId: item.productId,
        invoiceItemId: item.id,
        warehouseId: item.warehouseId,
        quantity: item.returnQuantity,
        price: item.price,
        condition: 'GOOD',
      }));

    try {
      await api.post('/sales/return', {
        invoiceId: invoiceNumber,
        reason: returnReason,
        refundMethod: 'CASH',
        refundAmount: totalRefund,
        items: returnItems,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Failed to process return', err);
      const msg = err?.response?.data?.message || 'Failed to process return. Check backend logs.';
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/pos/select"
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-white/50 border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <RotateCcw className="w-7 h-7 text-rose-600" />
              Process Return
            </h1>
            <p className="text-slate-500 text-sm mt-1">Look up an invoice to process refunds and restock inventory</p>
          </div>
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 w-full text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Return Processed Successfully</h2>
              <p className="text-slate-500 mb-8">The refund of Rs. {totalRefund.toLocaleString()} has been recorded and the inventory has been restocked.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => window.print()}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
                >
                  <Receipt className="w-5 h-5" />
                  Print Return Receipt
                </button>
                <button 
                  onClick={() => {
                    setSuccess(false);
                    setInvoiceFound(false);
                    setInvoiceNumber('');
                    setItems([]);
                    setReturnReason('');
                  }}
                  className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Process Another Return
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            {/* Left Column: Invoice Lookup & Items */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Search Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Find Invoice</h2>
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="Enter Invoice Number (e.g., INV-123...)" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-900 font-medium"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSearching}
                    className="px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-70 whitespace-nowrap"
                  >
                    {isSearching ? 'Searching...' : 'Lookup'}
                  </button>
                </form>
                {error && (
                  <div className="mt-4 flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col min-h-[400px]">
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Invoice Items</h2>
                
                {!invoiceFound ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <Receipt className="w-16 h-16 mb-4 text-slate-200" />
                    <p className="text-lg font-medium text-slate-600">No invoice loaded</p>
                    <p className="text-sm">Search for an invoice above to view returnable items.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="py-3 text-sm font-bold text-slate-500 uppercase">Product</th>
                          <th className="py-3 text-sm font-bold text-slate-500 uppercase">Purchased</th>
                          <th className="py-3 text-sm font-bold text-slate-500 uppercase">Price</th>
                          <th className="py-3 text-sm font-bold text-slate-500 uppercase text-center">Return Qty</th>
                          <th className="py-3 text-sm font-bold text-slate-500 uppercase text-right">Refund Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="py-4">
                              <p className="font-bold text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</p>
                            </td>
                            <td className="py-4 font-medium text-slate-700">{item.quantity} units</td>
                            <td className="py-4 font-medium text-slate-700">Rs. {item.price.toLocaleString()}</td>
                            <td className="py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => updateReturnQuantity(item.id, item.returnQuantity - 1)}
                                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                                  disabled={item.returnQuantity <= 0}
                                >-</button>
                                <input
                                  type="number"
                                  min={0}
                                  max={item.quantity}
                                  step="any"
                                  value={item.returnQuantity}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) {
                                      updateReturnQuantity(item.id, Math.min(item.quantity, Math.max(0, val)));
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-16 h-9 text-center font-bold text-slate-900 border-2 border-slate-200 rounded-lg outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button 
                                  onClick={() => updateReturnQuantity(item.id, item.returnQuantity + 1)}
                                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                                  disabled={item.returnQuantity >= item.quantity}
                                >+</button>
                              </div>
                            </td>
                            <td className="py-4 text-right font-bold text-rose-600">
                              Rs. {(item.price * item.returnQuantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Refund Summary */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col">
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Refund Summary</h2>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Return *</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none disabled:opacity-50"
                      disabled={!invoiceFound}
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                    >
                      <option value="">Select reason...</option>
                      <option value="defective">Defective/Damaged</option>
                      <option value="wrong_item">Wrong Item</option>
                      <option value="customer_changed_mind">Customer Changed Mind</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 mt-4">
                    <div className="flex items-center gap-2 text-rose-800 mb-2 font-bold">
                      <IndianRupee className="w-5 h-5" />
                      Refund Calculation
                    </div>
                    <div className="flex justify-between items-center text-sm mb-1 text-rose-700">
                      <span>Items Selected:</span>
                      <span className="font-bold">{items.reduce((acc, item) => acc + item.returnQuantity, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-black mt-2 pt-2 border-t border-rose-200 text-rose-900">
                      <span>Total</span>
                      <span>Rs. {totalRefund.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <button 
                    onClick={handleProcessReturn}
                    disabled={!invoiceFound || !hasItemsToReturn || !returnReason || isProcessing}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Return & Refund'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
