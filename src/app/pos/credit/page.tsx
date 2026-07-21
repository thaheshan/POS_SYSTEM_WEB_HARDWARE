'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, CreditCard, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axiosInstance';

interface Customer {
  id: string;
  name: string;
  phone: string;
  creditLimit: number;
  currentCredit: number;
}

export default function CreditSalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [terms, setTerms] = useState('30');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchTerm.length > 2) {
      api.get('/customers', { params: { search: searchTerm } })
        .then(res => {
          const data = res.data?.data || res.data || [];
          const arr = Array.isArray(data) ? data : (data.items || []);
          setCustomers(arr.slice(0, 5).map((c: any) => ({
            id: c.id || c.customer_id,
            name: c.name || c.customer_name || c.first_name,
            phone: c.phone || 'N/A',
            creditLimit: Number(c.credit_limit || c.creditLimit || 50000),
            currentCredit: Number(c.outstanding_balance || c.outstandingBalance || 0)
          })));
        }).catch(() => setCustomers([]));
    } else {
      setCustomers([]);
    }
  }, [searchTerm]);

  const handleProcess = async () => {
    if (!selectedCustomer || !amount) {
      setError('Please select a customer and enter an amount.');
      return;
    }
    const saleAmount = parseFloat(amount);
    const available = selectedCustomer.creditLimit - selectedCustomer.currentCredit;
    if (saleAmount > available) {
      setError(`This sale exceeds ${selectedCustomer.name}'s available credit of Rs. ${available.toLocaleString()}!`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await api.post('/sales/credit', {
        customerId: selectedCustomer.id,
        amount: saleAmount,
        reference,
        paymentTermsDays: parseInt(terms)
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to process credit sale.';
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
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10" /></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Credit Sale Approved</h2>
            <p className="text-slate-500 mb-8">Rs. {amount} has been added to {selectedCustomer?.name}'s credit balance.</p>
            <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mb-3">Print Invoice</button>
            <button onClick={() => { setSuccess(false); setSelectedCustomer(null); setAmount(''); }} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">New Credit Sale</button>
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
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><CreditCard className="w-7 h-7 text-teal-600" />Customer Credit Sales</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
          {/* Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative">
            <h2 className="font-bold mb-4">Find Customer</h2>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or phone..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
              {customers.length > 0 && !selectedCustomer && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 z-50">
                  {customers.map(c => (
                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setSearchTerm(''); setCustomers([]); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-0 flex justify-between">
                      <span className="font-bold">{c.name}</span><span className="text-slate-500 text-sm">Limit: Rs.{c.creditLimit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {selectedCustomer && (
              <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2"><span className="font-bold text-teal-900 text-lg">{selectedCustomer.name}</span><button onClick={() => setSelectedCustomer(null)} className="text-teal-600 text-sm font-bold">Change</button></div>
                <div className="flex justify-between text-sm text-teal-700 mt-2"><span>Credit Limit:</span><span className="font-bold">Rs. {selectedCustomer.creditLimit.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-teal-700 mt-1"><span>Current Balance:</span><span className="font-bold">Rs. {selectedCustomer.currentCredit.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mt-3 pt-3 border-t border-teal-200 text-teal-900"><span>Available Credit:</span><span className="font-black text-lg">Rs. {(selectedCustomer.creditLimit - selectedCustomer.currentCredit).toLocaleString()}</span></div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <h2 className="font-bold mb-4">Sale Details</h2>
            {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
            
            <div className="space-y-4 flex-1">
              <div><label className="block text-sm font-medium mb-1">Invoice Amount (Rs.) *</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} disabled={!selectedCustomer} className="w-full px-4 py-3 text-xl font-bold bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50" /></div>
              <div><label className="block text-sm font-medium mb-1">Reference / PO Number</label><input type="text" value={reference} onChange={e => setReference(e.target.value)} disabled={!selectedCustomer} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50" /></div>
              <div><label className="block text-sm font-medium mb-1">Payment Terms</label><select value={terms} onChange={e => setTerms(e.target.value)} disabled={!selectedCustomer} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"><option value="15">Net 15</option><option value="30">Net 30</option><option value="60">Net 60</option></select></div>
            </div>

            <button onClick={handleProcess} disabled={!selectedCustomer || !amount || isProcessing} className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl disabled:opacity-50">
              {isProcessing ? 'Processing...' : 'Approve Credit Sale'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
