'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  ArrowLeft,
  PauseCircle,
  Search,
  ShoppingCart,
  Play,
  Trash2,
  Clock,
  User,
  PackageOpen,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axiosInstance';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface HeldSaleDisplay {
  id: string;
  backendId?: string;
  reference: string;
  itemCount: number;
  total: number;
  timeHeld: string;
  customerName?: string;
  items?: any[];
}

export default function HoldSalesPage() {
  const [heldSales, setHeldSales] = useState<HeldSaleDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // 1. Load from localStorage first
    let localList: HeldSaleDisplay[] = [];
    try {
      const saved = localStorage.getItem('pos_held_sales');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          localList = parsed.map((s: any) => ({
            id: s.id,
            backendId: s.backendId,
            reference: s.reference || 'Held Sale',
            itemCount: s.itemCount || s.items?.length || 0,
            total: Number(s.total || s.totalAmount || 0),
            timeHeld: s.timeFormatted || new Date(s.createdAt).toLocaleTimeString(),
            customerName: s.customer?.name,
            items: s.items || [],
          }));
        }
      }
    } catch {}

    setHeldSales(localList);

    // 2. Fetch from backend API to merge any server held carts
    api
      .get('/sales/hold/list')
      .then((res) => {
        const data = res.data?.data || [];
        if (Array.isArray(data)) {
          const existingIds = new Set(localList.map((l) => l.backendId || l.id));
          const serverEntries = data
            .filter((h: any) => !existingIds.has(h.id))
            .map((h: any) => ({
              id: h.id,
              backendId: h.id,
              reference: h.reference || 'Server Hold Cart',
              itemCount: h.itemCount || h.items?.length || 0,
              total: Number(h.totalAmount || h.total || 0),
              timeHeld: new Date(h.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              items: h.items || [],
            }));
          setHeldSales([...localList, ...serverEntries]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resumeSale = (id: string) => {
    router.push('/pos?resume=' + id);
  };

  const deleteSale = (sale: HeldSaleDisplay) => {
    if (!confirm(`Discard held sale "${sale.reference}"?`)) return;

    // Update state
    setHeldSales((prev) => prev.filter((s) => s.id !== sale.id));

    // Update localStorage
    try {
      const saved = localStorage.getItem('pos_held_sales');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter((s: any) => s.id !== sale.id);
        localStorage.setItem('pos_held_sales', JSON.stringify(filtered));
      }
    } catch {}

    // Delete from backend if backendId exists
    if (sale.backendId) {
      api.delete(`/sales/${sale.backendId}`).catch(() => {});
    }

    toast.info(`Deleted held sale: "${sale.reference}"`);
  };

  const filtered = heldSales.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.reference.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q))
    );
  });

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/pos"
              className="p-2.5 hover:bg-white rounded-xl shadow-sm bg-white/80 border border-slate-200 transition-colors"
              title="Back to POS"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <PauseCircle className="w-7 h-7 text-amber-500" />
                Held Sales Queue
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                View and resume suspended customer orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search held sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
              />
            </div>
            <Link
              href="/pos"
              className="px-4 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-all whitespace-nowrap"
            >
              Go to POS
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <p className="text-slate-500 col-span-full py-12 text-center text-sm font-semibold">
              Loading held sales...
            </p>
          ) : filtered.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-100">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-slate-800">
                {searchQuery ? 'No Matching Held Sales' : 'No Sales on Hold'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No held cart matches "${searchQuery}".`
                  : 'You do not have any suspended carts right now. Use the "Hold" button on the POS screen to suspend sales.'}
              </p>
              <div className="mt-5">
                <Link
                  href="/pos"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Open POS Register
                </Link>
              </div>
            </div>
          ) : (
            filtered.map((sale) => (
              <div
                key={sale.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:border-amber-400/80 hover:shadow-md transition-all gap-4"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-black text-base text-slate-900 line-clamp-1">
                      {sale.reference}
                    </h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {sale.timeHeld}
                    </span>
                  </div>

                  {sale.customerName && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 mb-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{sale.customerName}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-500">
                      {sale.itemCount}{' '}
                      {sale.itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      Rs. {sale.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => deleteSale(sale)}
                    className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                    title="Discard held sale"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => resumeSale(sale.id)}
                    className="flex-1 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Resume Checkout
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
