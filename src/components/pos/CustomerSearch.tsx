'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, User, Plus, CheckCircle2 } from 'lucide-react';
import api from '@/api/axiosInstance';

export type CustomerMin = {
  id: string;
  name: string;
  phone: string;
  customerType: string;
};

type Props = {
  selectedCustomer: CustomerMin | null;
  onSelectCustomer: (customer: CustomerMin | null) => void;
  onAddNew: () => void;
};

export default function CustomerSearch({ selectedCustomer, onSelectCustomer, onAddNew }: Props) {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<CustomerMin[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      let data = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res.data?.data)) data = res.data.data;
      else if (Array.isArray(res.data?.data?.data)) data = res.data.data.data;

      setCustomers(data.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || 'N/A',
        customerType: c.customerType || 'Individual'
      })));
    } catch (err) {
      console.error('Failed to fetch customers for search:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.phone.includes(query) ||
    c.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#059669]" />
        <input
          type="text"
          placeholder="Search customer name or phone..."
          value={query}
          onFocus={() => {
            setIsOpen(true);
            fetchCustomers();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-[13px] font-medium outline-none focus:border-[#059669] transition-all bg-gray-50"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-[12px] font-bold text-gray-400">Loading...</div>
          ) : (
            <>
              {filtered.length > 0 ? (
                <div className="p-1">
                  {filtered.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCustomer(c);
                        setQuery('');
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg flex items-center justify-between hover:bg-emerald-50 transition-colors ${selectedCustomer?.id === c.id ? 'bg-emerald-50' : ''}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-black text-gray-900">{c.name}</p>
                          <span className="text-[10px] font-medium text-gray-400 font-mono">ID: {c.id.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-500">{c.phone}</p>
                      </div>
                      {selectedCustomer?.id === c.id && <CheckCircle2 className="w-4 h-4 text-[#059669]" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-[12px] font-bold text-gray-400">No customers found.</div>
              )}
            </>
          )}
        </div>
      )}

      {/* Selected state overlay if we have a customer selected and query is empty */}
      {selectedCustomer && !isOpen && query === '' && (
        <div className="absolute inset-y-0 left-0 right-0 bg-white border border-[#059669] rounded-xl flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-emerald-100 text-[#059669] flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[12px] font-black text-gray-900 leading-none mb-0.5">{selectedCustomer.name}</p>
              <p className="text-[10px] font-bold text-gray-500 leading-none">{selectedCustomer.phone} • ID: {selectedCustomer.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={() => onSelectCustomer(null)}
            className="text-[10px] font-black text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 uppercase"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button 
          onClick={() => { onSelectCustomer(null); setQuery(''); }} 
          className={`flex-1 py-3 rounded-xl text-[12px] font-black uppercase border transition-all ${!selectedCustomer ? 'bg-emerald-50 border-[#059669] text-[#059669]' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
        >
          Walk-In
        </button>
        <button 
          onClick={() => { onAddNew(); setIsOpen(false); }} 
          className="flex-1 py-3 rounded-xl text-[12px] font-black uppercase border border-gray-200 bg-white text-gray-600 hover:bg-amber-50 hover:text-[#d97706] hover:border-[#d97706] transition-all flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>
    </div>
  );
}
