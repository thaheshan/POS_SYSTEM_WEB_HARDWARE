'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import api from '@/api/axiosInstance';

export default function AddCustomerModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (customer?: any) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', customerType: 'Individual' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!form.name.trim()) {
      setError('Customer Name is required.');
      return;
    }

    if (!form.phone.trim()) {
      setError('Mobile Number is required.');
      return;
    }

    const cleanPhone = form.phone.replace(/[^0-9]/g, '');
    const validPhoneRegex = /^[0-9+\-\s()]+$/;
    if (!validPhoneRegex.test(form.phone) || cleanPhone.length < 9) {
      setError('Please enter a valid Mobile Number (at least 9 digits).');
      return;
    }

    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setError('Please enter a valid Email Address.');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/customers', { 
        name: form.name.trim(), 
        phone: form.phone.trim(), 
        email: form.email.trim() || undefined, 
        address: form.address.trim() || undefined, 
        customerType: form.customerType 
      });
      // Try to pass the newly created customer back to the caller
      const createdCustomer = response.data?.data || response.data;
      onSuccess(createdCustomer);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[520px] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-[20px] font-black text-gray-900">Add New Customer</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">Fill in the customer details below</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] font-bold px-4 py-3 rounded-xl">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Full Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Kamal Perera"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Phone <span className="text-red-500">*</span></label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="077 123 4567"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="kamal@email.com" type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Address</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="123 Galle Road, Colombo"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Customer Type</label>
              <select value={form.customerType} onChange={e => setForm(f => ({ ...f, customerType: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors">
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 py-3 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white py-3 rounded-[12px] text-[13px] font-black transition-colors shadow-sm disabled:opacity-60">
            {loading ? 'Saving...' : <><Check className="w-4 h-4" /> Save Customer</>}
          </button>
        </div>
      </div>
    </div>
  );
}
