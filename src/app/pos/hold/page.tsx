'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowLeft, PauseCircle, Search, ShoppingCart, Play } from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axiosInstance';
import { useRouter } from 'next/navigation';

interface HeldSale {
  id: string;
  reference: string;
  itemCount: number;
  total: number;
  timeHeld: string;
}

export default function HoldSalesPage() {
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get('/sales/hold/list')
      .then(res => {
        const data = res.data?.data || [];
        setHeldSales(Array.isArray(data) ? data.map((h: any) => ({
          id: h.id,
          reference: h.reference || 'Unnamed Cart',
          itemCount: h.itemCount || h.items?.length || 0,
          total: Number(h.totalAmount || h.total || 0),
          timeHeld: new Date(h.createdAt).toLocaleTimeString()
        })) : []);
      })
      .catch(() => {
        // Fallback if no held sales endpoint yet
        setHeldSales([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const resumeSale = async (id: string) => {
    // In a real app, this sets the central POS state context and redirects
    router.push('/pos?resume=' + id);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/pos/select" className="p-2 hover:bg-white rounded-full shadow-sm bg-white/50 border"><ArrowLeft className="w-5 h-5 text-slate-600" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><PauseCircle className="w-7 h-7 text-violet-600" />Held Sales Queue</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-slate-500 col-span-full">Loading held carts...</p>
          ) : heldSales.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-2xl border text-center">
              <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800">No Held Sales</h2>
              <p className="text-slate-500">You don't have any suspended carts right now.</p>
            </div>
          ) : (
            heldSales.map(sale => (
              <div key={sale.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-violet-300 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{sale.reference}</h3>
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">{sale.timeHeld}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 mb-6 flex-1">
                  <span>{sale.itemCount} items</span>
                  <span className="font-bold text-slate-900">Rs. {sale.total.toLocaleString()}</span>
                </div>
                <button onClick={() => resumeSale(sale.id)} className="w-full py-3 bg-violet-50 hover:bg-violet-600 hover:text-white text-violet-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Play className="w-4 h-4" /> Resume Checkout
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
