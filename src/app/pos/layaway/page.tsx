'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, Archive, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axiosInstance';

export default function LayawayPage() {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const total = parseFloat(totalAmount) || 0;
  const deposit = parseFloat(depositAmount) || 0;
  const balance = Math.max(0, total - deposit);

  const handleProcess = async () => {
    if (!customerName || !total || deposit <= 0 || !pickupDate) {
      setError('Please fill in all required fields and ensure deposit is > 0.');
      return;
    }
    if (deposit > total) {
      setError('Deposit cannot exceed total amount.');
      return;
    }

    setIsProcessing(true); setError('');
    
    try {
      await api.post('/sales/layaway', { customerName, phone, totalAmount: total, deposit, balance, pickupDate });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create layaway. Check backend.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="flex flex-col h-full bg-slate-50 p-4 items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-sm border w-full max-w-lg text-center">
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10" /></div>
            <h2 className="text-2xl font-bold mb-2">Layaway Created</h2>
            <p className="text-slate-500 mb-8">Deposit of Rs. {deposit.toLocaleString()} received. Balance Rs. {balance.toLocaleString()} due on {pickupDate}.</p>
            <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mb-3">Print Layaway Receipt</button>
            <button onClick={() => { setSuccess(false); setTotalAmount(''); setDepositAmount(''); setCustomerName(''); }} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">New Layaway</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/pos/select" className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold flex items-center gap-3"><Archive className="w-7 h-7 text-yellow-600" />Layaway / Backorder</h1>
        </div>

        <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl shadow-sm border p-8">
          {error && <div className="mb-6 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Customer Name *</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-yellow-500" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-yellow-500" /></div>
            </div>

            <div><label className="block text-sm font-bold text-slate-700 mb-2">Target Pickup Date *</label><input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-yellow-500" /></div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Total Order Amount (Rs.) *</label><input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full px-4 py-3 font-mono text-lg bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-yellow-500" /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-2">Deposit Amount (Rs.) *</label><input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full px-4 py-3 font-mono text-lg bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" /></div>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 flex justify-between items-center mt-6">
              <span className="text-yellow-900 font-bold">Remaining Balance Due:</span>
              <span className="text-2xl font-black text-yellow-700 font-mono">Rs. {balance.toLocaleString()}</span>
            </div>

            <button onClick={handleProcess} disabled={isProcessing} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-4 rounded-xl text-lg mt-4 disabled:opacity-50">
              {isProcessing ? 'Processing...' : 'Create Layaway Agreement'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
