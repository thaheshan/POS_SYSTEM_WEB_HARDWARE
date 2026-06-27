'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, ArrowLeftRight, Search, AlertCircle, CheckCircle2, Package, Plus } from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axiosInstance';

interface InvoiceItem {
  id: string; // invoiceItemId
  productId: string;
  warehouseId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  returnQuantity: number;
}

interface NewItem {
  productId: string;
  warehouseId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export default function ExchangePage() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [invoiceFound, setInvoiceFound] = useState(false);
  
  const [returnedItems, setReturnedItems] = useState<InvoiceItem[]>([]);
  const [newItems, setNewItems] = useState<NewItem[]>([]);
  
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deltaVal, setDeltaVal] = useState(0);

  const handleSearchInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true); setError('');
    
    try {
      const res = await api.get(`/sales/${encodeURIComponent(invoiceNumber.trim())}`);
      const payload = res.data?.data;
      const invoice = payload?.data ? payload.data : payload;

      if (invoice) {
        setInvoiceFound(true);
        setReturnedItems(invoice.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          warehouseId: item.warehouseId,
          name: item.product?.name || item.productName || 'Unknown',
          sku: item.product?.sku || 'N/A',
          quantity: item.quantity,
          price: item.unitPrice,
          returnQuantity: 0,
        })));
      } else {
        setError('Invoice not found.');
        setInvoiceFound(false);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invoice not found or not eligible for exchange.';
      setError(msg);
      setInvoiceFound(false);
    } finally {
      setIsSearching(false);
    }
  };

  const [allProducts, setAllProducts] = useState<any[]>([]);

  const handleSearchProducts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setProductSearch(term);
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearchingProducts(true);
    try {
      let productsList = allProducts;
      if (productsList.length === 0) {
        const res = await api.get('/products');
        const payload = res.data?.data;
        productsList = payload?.data ? payload.data : (payload || res.data || []);
        setAllProducts(productsList);
      }
      
      const lowerTerm = term.toLowerCase();
      const filtered = productsList.filter(p => 
        p.name?.toLowerCase().includes(lowerTerm) || 
        p.sku?.toLowerCase().includes(lowerTerm) ||
        p.category?.toLowerCase().includes(lowerTerm)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingProducts(false);
    }
  };

  const addNewItem = (product: any) => {
    const warehouseId = product.stock?.[0]?.warehouseId || product.warehouseId || '';
    
    setNewItems(prev => {
      const existing = prev.find(p => p.productId === product.id);
      if (existing) {
        return prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, {
        productId: product.id,
        warehouseId: warehouseId,
        name: product.name,
        sku: product.sku,
        price: product.sellingPrice,
        quantity: 1
      }];
    });
    setProductSearch('');
    setSearchResults([]);
  };

  const updateNewItemQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setNewItems(prev => prev.filter(p => p.productId !== productId));
    } else {
      setNewItems(prev => prev.map(p => p.productId === productId ? { ...p, quantity: qty } : p));
    }
  };

  const updateReturnQuantity = (id: string, qty: number) => {
    setReturnedItems(returnedItems.map(item => {
      if (item.id === id) {
        const validQty = Math.max(0, Math.min(qty, item.quantity));
        return { ...item, returnQuantity: validQty };
      }
      return item;
    }));
  };

  const returnAmt = returnedItems.reduce((acc, item) => acc + (item.price * item.returnQuantity), 0);
  const newAmt = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const delta = newAmt - returnAmt;

  const handleProcess = async () => {
    if (!invoiceFound) return;
    setIsProcessing(true); setError('');
    
    const retPayload = returnedItems.filter(i => i.returnQuantity > 0).map(i => ({
      productId: i.productId,
      invoiceItemId: i.id,
      warehouseId: i.warehouseId,
      quantity: i.returnQuantity,
      price: i.price
    }));

    const newPayload = newItems.map(i => ({
      productId: i.productId,
      warehouseId: i.warehouseId,
      quantity: i.quantity,
      price: i.price
    }));

    try {
      await api.post('/sales/exchange', { 
        invoiceId: invoiceNumber, 
        returnAmount: returnAmt, 
        newAmount: newAmt, 
        delta,
        returnedItems: retPayload,
        newItems: newPayload
      });
      setDeltaVal(delta);
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to process exchange. Check backend.';
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
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10" /></div>
            <h2 className="text-2xl font-bold mb-2">Exchange Processed</h2>
            <p className="text-slate-500 mb-8">{deltaVal > 0 ? `Customer paid additional Rs. ${deltaVal.toLocaleString()}` : `Refunded Rs. ${Math.abs(deltaVal).toLocaleString()} to customer`}</p>
            <button onClick={() => window.print()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mb-3">Print Receipt</button>
            <button onClick={() => { setSuccess(false); setInvoiceFound(false); setInvoiceNumber(''); setReturnedItems([]); setNewItems([]); }} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold">New Exchange</button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-slate-50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/pos/select" className="p-2 bg-white rounded-full border"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-bold flex items-center gap-3"><ArrowLeftRight className="w-7 h-7 text-blue-600" />Item Exchange</h1>
        </div>

        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Invoice Lookup */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="font-bold mb-4">Original Invoice Lookup</h2>
            <form onSubmit={handleSearchInvoice} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="Enter Invoice Number" className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={isSearching} className="px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold">{isSearching ? '...' : 'Lookup'}</button>
            </form>
            {error && <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
          </div>

          {invoiceFound && (
            <>
              {/* Returned Items */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-rose-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-rose-900 flex items-center gap-2"><Package className="w-5 h-5 text-rose-600"/> Returned Items</h3>
                  <span className="font-mono font-bold text-rose-600">Rs. {returnAmt.toLocaleString()}</span>
                </div>
                <div className="p-0">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-4 font-medium">Product</th>
                        <th className="p-4 font-medium">Purchased</th>
                        <th className="p-4 font-medium">Price</th>
                        <th className="p-4 font-medium text-center">Return Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {returnedItems.map(item => (
                        <tr key={item.id}>
                          <td className="p-4">
                            <div className="font-medium text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.sku}</div>
                          </td>
                          <td className="p-4">{item.quantity} units</td>
                          <td className="p-4">Rs. {item.price.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-3">
                              <button onClick={() => updateReturnQuantity(item.id, item.returnQuantity - 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center">-</button>
                              <span className="w-8 text-center font-bold text-lg">{item.returnQuantity}</span>
                              <button onClick={() => updateReturnQuantity(item.id, item.returnQuantity + 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center">+</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* New Items */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-emerald-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-emerald-900 flex items-center gap-2"><Package className="w-5 h-5 text-emerald-600"/> New Items Issued</h3>
                  <span className="font-mono font-bold text-emerald-600">Rs. {newAmt.toLocaleString()}</span>
                </div>
                <div className="p-4 border-b relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={productSearch} 
                      onChange={handleSearchProducts} 
                      placeholder="Search products to add..." 
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full left-0 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div key={product.id} className="p-3 border-b hover:bg-slate-50 flex justify-between items-center cursor-pointer" onClick={() => addNewItem(product)}>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-slate-500">{product.sku} | Rs. {product.sellingPrice}</div>
                          </div>
                          <Plus className="w-5 h-5 text-emerald-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {newItems.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="p-4 font-medium">Product</th>
                        <th className="p-4 font-medium">Price</th>
                        <th className="p-4 font-medium text-center">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {newItems.map(item => (
                        <tr key={item.productId}>
                          <td className="p-4">
                            <div className="font-medium text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.sku}</div>
                          </td>
                          <td className="p-4">Rs. {item.price.toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-3">
                              <button onClick={() => updateNewItemQty(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center">-</button>
                              <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                              <button onClick={() => updateNewItemQty(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center">+</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-400">Search and add products above</div>
                )}
              </div>

              {/* Summary & Submit */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-blue-900 font-bold text-lg">{delta > 0 ? 'Customer Owes:' : 'Refund Due:'}</span>
                  <span className="text-sm text-blue-600">New Items (Rs. {newAmt}) - Returned Items (Rs. {returnAmt})</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-3xl font-black text-blue-700 font-mono">Rs. {Math.abs(delta).toLocaleString()}</span>
                  <button onClick={handleProcess} disabled={isProcessing || (returnAmt === 0 && newAmt === 0)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg disabled:opacity-50">
                    {isProcessing ? 'Processing...' : 'Complete Exchange'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
