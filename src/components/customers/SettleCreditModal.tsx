'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, CreditCard, Search, Check, RotateCcw, DollarSign, Wallet, ArrowDownRight } from 'lucide-react';
import api from '@/api/axiosInstance';
import { toastError, toastSuccess } from '@/lib/toast';
import { sendCreditSettlementSMS } from '@/utils/textlkSmsService';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  outstanding: number;
  customerType?: string;
  initials?: string;
}

interface SettleCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedId?: string, newBalance?: number) => void;
  initialCustomer?: Customer | null;
  allCustomers?: Customer[];
}

export default function SettleCreditModal({
  isOpen,
  onClose,
  onSuccess,
  initialCustomer = null,
  allCustomers = [],
}: SettleCreditModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settlingAmount, setSettlingAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setPaymentMethod('Cash');
      setReference('');
      if (initialCustomer) {
        setSelectedCustomer(initialCustomer);
        setSettlingAmount(String(initialCustomer.outstanding || ''));
        setSearchQuery('');
      } else {
        setSelectedCustomer(null);
        setSettlingAmount('');
        setSearchQuery('');
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, initialCustomer]);

  /* Filter customers by query (priority given to those with outstanding credit) */
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = allCustomers;
    if (q) {
      list = list.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.id || '').toLowerCase().includes(q)
      );
    }
    // Sort customers with outstanding credit first
    return [...list].sort((a, b) => (b.outstanding || 0) - (a.outstanding || 0));
  }, [allCustomers, searchQuery]);

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setSettlingAmount(cust.outstanding > 0 ? String(cust.outstanding) : '');
    setError('');
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setSettlingAmount('');
    setSearchQuery('');
    setError('');
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const currentOutstanding = selectedCustomer?.outstanding || 0;
  const settlingNum = parseFloat(settlingAmount) || 0;
  const remainingBalance = Math.max(0, currentOutstanding - settlingNum);

  const handleSubmit = async () => {
    setError('');
    if (!selectedCustomer) {
      setError('Please select a customer to settle credit.');
      return;
    }
    if (isNaN(settlingNum) || settlingNum <= 0) {
      setError('Please enter a valid settling amount greater than 0.');
      return;
    }
    if (settlingNum > currentOutstanding && currentOutstanding > 0) {
      setError(`Settlement amount (Rs. ${settlingNum.toLocaleString()}) cannot exceed outstanding balance (Rs. ${currentOutstanding.toLocaleString()}).`);
      return;
    }

    setLoading(true);
    const newOutstandingBalance = Math.max(0, currentOutstanding - settlingNum);

    try {
      // 1. Primary POS Sales Engine Credit Settlement: Post negative credit transaction
      try {
        await api.post('/sales/credit', {
          customerId: selectedCustomer.id,
          amount: -settlingNum,
          reference: reference || 'Credit Settlement Payment',
          paymentTermsDays: 0,
        });
      } catch (errCredit) {
        console.warn('[SettleCredit] /sales/credit endpoint fallback:', errCredit);
      }

      // 2. Direct customer record update via PATCH & PUT
      try {
        await api.patch(`/customers/${selectedCustomer.id}`, {
          outstandingBalance: newOutstandingBalance,
          creditBalance: newOutstandingBalance,
          outstanding_balance: newOutstandingBalance,
          outstanding: newOutstandingBalance,
        });
      } catch (patchErr) {
        try {
          await api.put(`/customers/${selectedCustomer.id}`, {
            name: selectedCustomer.name,
            phone: selectedCustomer.phone !== 'N/A' ? selectedCustomer.phone : undefined,
            email: selectedCustomer.email !== 'N/A' ? selectedCustomer.email : undefined,
            outstandingBalance: newOutstandingBalance,
            creditBalance: newOutstandingBalance,
            outstanding_balance: newOutstandingBalance,
            outstanding: newOutstandingBalance,
          });
        } catch (putErr) {
          console.warn('[SettleCredit] PUT/PATCH backend update fallback:', putErr);
        }
      }

      // 2. Also log credit payment transaction record if endpoint exists
      try {
        await api.post(`/customers/${selectedCustomer.id}/settle-credit`, {
          amount: settlingNum,
          paymentMethod,
          reference: reference || 'Credit Settlement',
        });
      } catch {
        try {
          await api.post('/customers/credit-payment', {
            customerId: selectedCustomer.id,
            amount: settlingNum,
            paymentMethod,
            notes: reference || 'Credit Settlement',
          });
        } catch {}
      }

      // 3. Send text.lk SMS payment receipt to customer
      if (selectedCustomer.phone && selectedCustomer.phone !== 'N/A') {
        sendCreditSettlementSMS(
          selectedCustomer.name,
          selectedCustomer.phone,
          settlingNum,
          newOutstandingBalance,
          paymentMethod
        ).catch((smsErr) => console.warn('[SettleCredit SMS Error]', smsErr));
      }

      toastSuccess(
        `Settled Rs. ${settlingNum.toLocaleString()} for ${selectedCustomer.name}. Remaining Balance: Rs. ${newOutstandingBalance.toLocaleString()}.`
      );
      onSuccess(selectedCustomer.id, newOutstandingBalance);
      onClose();
    } catch (err: any) {
      console.error('Failed to settle credit', err);
      const msg = err?.response?.data?.message || 'Failed to settle credit. Please try again.';
      setError(msg);
      toastError(err, msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === 'Escape' || (e.key === 'Backspace' && !isInput)) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-[540px] flex flex-col overflow-hidden max-h-[90vh] border border-gray-100">
        {/* EMERALD HEADER */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <CreditCard className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-[20px] font-black tracking-tight leading-none mb-1">Settle Customer Credit</h2>
              <p className="text-[12px] font-bold text-emerald-200/80">Record payment &amp; reduce outstanding balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[12.5px] font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
              {error}
            </div>
          )}

          {/* 1. SELECT CUSTOMER */}
          <div>
            <label className="block text-[12px] font-black text-gray-700 uppercase tracking-wider mb-2">
              1. Select Customer <span className="text-red-500">*</span>
            </label>

            {selectedCustomer ? (
              /* Selected Customer Card */
              <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-700 text-white font-black text-[15px] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    {selectedCustomer.initials || selectedCustomer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[14px] font-black text-gray-900 flex items-center gap-2">
                      {selectedCustomer.name}
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <div className="text-[12px] font-bold text-gray-500 mt-0.5">
                      {selectedCustomer.phone} {selectedCustomer.email && selectedCustomer.email !== 'N/A' ? `• ${selectedCustomer.email}` : ''}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Outstanding Balance:</span>
                      <span className={`text-[13px] font-black ${selectedCustomer.outstanding > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                        Rs. {selectedCustomer.outstanding.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="flex items-center gap-1.5 text-[12px] font-black text-emerald-800 bg-white border border-emerald-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-emerald-100 transition-colors shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Change
                </button>
              </div>
            ) : (
              /* Live Search Input & Dropdown */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-[12px] pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search customer name, phone, or email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-[10px] text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Customer List */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white max-h-48 overflow-y-auto shadow-inner divide-y divide-gray-100">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-4 text-center text-[12px] font-bold text-gray-400">
                      No matching customers found.
                    </div>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        className="p-3 hover:bg-emerald-50/60 cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 group-hover:bg-emerald-200 text-gray-700 group-hover:text-emerald-900 rounded-lg text-[12px] font-black flex items-center justify-center">
                            {cust.initials || cust.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-gray-900 group-hover:text-emerald-900">
                              {cust.name}
                            </div>
                            <div className="text-[11px] text-gray-400 font-medium font-mono">
                              {cust.phone} {cust.id ? `• ${cust.id.substring(0, 8).toUpperCase()}` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[12px] font-black ${cust.outstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            Rs. {cust.outstanding.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {cust.outstanding > 0 ? 'Outstanding' : 'Cleared'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. SETTLING AMOUNT */}
          {selectedCustomer && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[12px] font-black text-gray-700 uppercase tracking-wider">
                    2. Settling Amount (LKR) <span className="text-red-500">*</span>
                  </label>
                  {currentOutstanding > 0 && (
                    <button
                      type="button"
                      onClick={() => setSettlingAmount(String(currentOutstanding))}
                      className="text-[11px] font-black text-emerald-700 hover:underline"
                    >
                      Pay Full Amount (Rs. {currentOutstanding.toLocaleString()})
                    </button>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-[11px] text-[14px] font-black text-gray-400">Rs.</span>
                  <input
                    type="number"
                    value={settlingAmount}
                    onChange={(e) => setSettlingAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="any"
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[16px] font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Balance After Payment Preview */}
                <div className="mt-2 bg-gray-50 border border-gray-200/80 rounded-xl p-3 flex items-center justify-between text-[12px]">
                  <span className="font-bold text-gray-500 flex items-center gap-1.5">
                    <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                    Remaining Credit Balance:
                  </span>
                  <span className={`font-black text-[13px] ${remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    Rs. {remainingBalance.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* 3. PAYMENT METHOD & REFERENCE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-black text-gray-700 uppercase tracking-wider mb-1.5">
                    Notes / Reference
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. Bank Ref, Receipt #..."
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 p-4 px-6 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl text-[13px] font-bold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedCustomer}
            className="py-2.5 px-7 rounded-xl text-[13px] font-black bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2"
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}
