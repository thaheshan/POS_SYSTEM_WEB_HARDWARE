'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Package, CheckCircle2, AlertCircle, Percent, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axiosInstance';

export default function BulkSalesPage() {
  const [totalAmount, setTotalAmount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [wholesaleId, setWholesaleId] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const subtotal = parseFloat(totalAmount) || 0;
  const val = parseFloat(discountValue) || 0;
  const discountAmount = discountType === 'percentage' ? subtotal * (val / 100) : val;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleProcess = async () => {
    if (!subtotal || !wholesaleId) {
      setError('Please enter a valid amount and Wholesale/B2B ID.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await api.post('/sales/bulk', {
        wholesaleId,
        subtotal,
        discountType,
        discountValue: val,
        discountAmount,
        finalTotal
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to process bulk sale.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="flex flex-col h-full bg-slate-50 p-4 items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 w-full max-w-lg text-center">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10" /></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Bulk Sale Processed!</h2>
            <p className="text-slate-500 mb-8">Wholesale transaction for Rs. {finalTotal.toLocaleString()} complete.</p>
            <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mb-3">Print Gate Pass</button>
            <button onClick={() => { setSuccess(false); setTotalAmount(''); setDiscountValue(''); }} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">New Bulk Sale</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/pos/select" className="p-2 hover:bg-white rounded-full shadow-sm bg-white/50 border"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><Package className="w-7 h-7 text-orange-600" />Bulk / Wholesale Sales</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && <div className="mb-6 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Wholesale Buyer ID / Reference *</label>
              <input type="text" value={wholesaleId} onChange={e => setWholesaleId(e.target.value)} placeholder="e.g., WS-9938" className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subtotal Amount (Rs.) *</label>
                <input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full px-4 py-3 font-mono text-lg bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Bulk Discount</label>
                <div className="flex">
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="px-3 bg-slate-100 border border-r-0 rounded-l-xl outline-none">
                    <option value="percentage">%</option><option value="flat">Rs.</option>
                  </select>
                  <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full px-4 py-3 font-mono text-lg bg-slate-50 border rounded-r-xl outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 mt-8">
              <div className="flex justify-between items-center text-orange-800 mb-2"><span>Subtotal</span><span className="font-mono">Rs. {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between items-center text-orange-600 mb-4 pb-4 border-b border-orange-200"><span>Discount</span><span className="font-mono">- Rs. {discountAmount.toLocaleString()}</span></div>
              <div className="flex justify-between items-center text-orange-900 text-2xl font-black"><span>Final Total</span><span className="font-mono">Rs. {finalTotal.toLocaleString()}</span></div>
            </div>

            <button onClick={handleProcess} disabled={isProcessing || !subtotal} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-4 rounded-xl text-lg mt-4 disabled:opacity-50 transition-all">
              {isProcessing ? 'Processing...' : 'Complete Wholesale Transaction'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
