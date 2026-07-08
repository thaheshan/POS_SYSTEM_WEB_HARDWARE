'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, FileText, Check, Search, Trash2, Plus, AlertCircle, FileCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axiosInstance';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function CreateQuotationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [validUntil, setValidUntil] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Simulate product search
  useEffect(() => {
    if (searchTerm.length > 1) {
      api.get('/products', { params: { search: searchTerm, limit: 5 } })
        .then(res => {
          const data = res.data?.data || res.data || [];
          const arr = Array.isArray(data) ? data : (data.items || []);
          setSearchResults(arr.slice(0, 5).map((p: any) => ({
            id: p.id || p.product_id,
            name: p.name || p.product_name || 'Unknown',
            sku: p.sku || 'N/A',
            price: Number(p.selling_price || p.sellingPrice || p.price || 0)
          })));
        })
        .catch(() => setSearchResults([]));
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchTerm('');
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const totalEstimate = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleGenerateQuotation = async () => {
    if (!customerName || !validUntil || cart.length === 0) {
      setError('Please fill in customer name, valid date, and add at least one item.');
      return;
    }
    setIsProcessing(true);
    setError('');

    try {
      await api.post('/sales/quotation', {
        customerName,
        phone,
        validUntil,
        totalAmount: totalEstimate,
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price }))
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save quotation. Check backend connection.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <>
        {/* Printable Quotation Document (Hidden on screen, visible on print) */}
        <div className="hidden print:block fixed inset-0 bg-white z-[99999] p-10 text-black">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">QUOTATION</h1>
              <p className="text-slate-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-slate-500">Valid Until: <span className="font-bold text-slate-900">{validUntil}</span></p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-900">Quoted To:</h2>
              <p className="text-lg text-slate-700">{customerName}</p>
              <p className="text-slate-600">{phone}</p>
            </div>
          </div>

          <table className="w-full text-left mb-8">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 font-bold text-slate-900">Product / Details</th>
                <th className="py-3 font-bold text-slate-900">SKU</th>
                <th className="py-3 text-right font-bold text-slate-900">Unit Price</th>
                <th className="py-3 text-center font-bold text-slate-900">Qty</th>
                <th className="py-3 text-right font-bold text-slate-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="py-4 font-medium">{item.name}</td>
                  <td className="py-4 text-slate-500">{item.sku}</td>
                  <td className="py-4 text-right">Rs. {item.price.toLocaleString()}</td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-4 border-t-2 border-slate-900">
            <div className="w-64">
              <div className="flex justify-between text-2xl font-black text-slate-900">
                <span>Total:</span>
                <span>Rs. {totalEstimate.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 text-sm text-center text-slate-500">
            <p>Thank you for your business.</p>
            <p>This is a computer generated quotation and does not require a physical signature.</p>
          </div>
        </div>

        {/* Screen UI (Hidden on print) */}
        <div className="print:hidden h-full">
          <MainLayout>
            <div className="flex flex-col h-full bg-slate-50 p-4 items-center justify-center">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 w-full max-w-lg text-center">
                <div className="w-20 h-20 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileCheck className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Quotation Generated!</h2>
                <p className="text-slate-500 mb-8">Quote for {customerName} valid until {validUntil} has been saved.</p>
                <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mb-3">Print / PDF</button>
                <button onClick={() => { setSuccess(false); setCart([]); setCustomerName(''); setPhone(''); setValidUntil(''); }} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">New Quotation</button>
              </div>
            </div>
          </MainLayout>
        </div>
      </>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/pos/select" className="p-2 hover:bg-white rounded-full transition-colors shadow-sm bg-white/50 border border-slate-200"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><FileText className="w-7 h-7 text-cyan-600" />Create Quotation</h1>
            <p className="text-slate-500 text-sm mt-1">Generate price quotes for potential customers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 h-full min-h-[600px]">
          {/* Left Column: Product Search */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col relative">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search live products to add..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden">
                    {searchResults.map(p => (
                      <button key={p.id} onClick={() => addToCart(p)} className="w-full text-left px-4 py-3 hover:bg-slate-50 flex justify-between items-center border-b border-slate-100">
                        <div><p className="font-bold">{p.name}</p><p className="text-xs text-slate-500">{p.sku}</p></div>
                        <p className="font-bold text-cyan-600">Rs. {p.price}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="text-lg font-medium text-slate-600">No items added yet</p>
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="border-b border-slate-200"><th className="py-2 text-sm text-slate-500">Product</th><th className="py-2 text-sm text-slate-500 text-center">Qty</th><th className="py-2 text-sm text-slate-500 text-right">Price</th></tr></thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.id} className="border-b border-slate-50">
                          <td className="py-3"><p className="font-bold">{item.name}</p></td>
                          <td className="py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-slate-100 rounded">-</button>
                              <span className="font-bold w-6 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-slate-100 rounded">+</button>
                            </div>
                          </td>
                          <td className="py-3 text-right font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Quotation Details</h2>
              {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
              
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Customer Name *</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Phone Number</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
                <div><label className="block text-sm font-medium mb-1">Valid Until *</label><input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              </div>

              <div className="mt-auto pt-8">
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-lg font-bold"><span>Total Estimate</span><span className="text-cyan-600">Rs. {totalEstimate.toLocaleString()}</span></div>
                </div>
                <button onClick={handleGenerateQuotation} disabled={isProcessing || cart.length === 0} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 px-4 rounded-xl disabled:opacity-50">
                  {isProcessing ? 'Saving...' : 'Generate Quotation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
