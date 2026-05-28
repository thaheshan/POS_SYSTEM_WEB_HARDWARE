'use client';

import { useEffect, useState } from 'react';
import api from '@/api/axiosInstance';

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  monthlyRevenue: number;
  monthlyTransactions: number;
  totalCustomers: number;
}

export interface RecentTransaction {
  id: string;
  invoiceNumber: string;
  customerName: string | null;
  date: string;
  amount: number;
  status: string;
}

export interface TopProduct {
  id: string;
  name: string;
  totalQty: number;
  totalRevenue: number;
}

export interface ChartPoint {
  name: string;
  revenue: number;
  sales: number;
  cost: number;
}

// ─── Dashboard KPI Stats ───────────────────────────────────────────────────────
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/stats')
      .then((res) => {
        // Unpack nested data object if needed
        const d = res.data?.data || res.data;
        setStats({
          todaySales: d.todaySales ?? 0,
          todayTransactions: d.todayTransactions ?? 0,
          monthlyRevenue: d.monthlyRevenue ?? 0,
          monthlyTransactions: d.monthlyTransactions ?? 0,
          totalCustomers: d.totalCustomers ?? 0,
        });
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}

// ─── Recent Transactions ──────────────────────────────────────────────────────
export function useRecentTransactions() {
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = () => {
    api
      .get('/dashboard/recent-transactions', { params: { limit: 8 } })
      .then((res) => {
        // Handle various response shapes: array, { data: [] }, { items: [] }
        const raw = res.data;
        const items: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : [];

        setTransactions(
          items.map((tx: any) => ({
            id: tx.id,
            invoiceNumber: tx.invoiceNumber,
            customerName: tx.customerName ?? tx.customer?.name ?? 'Walk-in Customer',
            date: tx.date ?? tx.createdAt,
            amount: Number(tx.amount ?? tx.totalAmount ?? 0),
            status: tx.status ?? tx.paymentStatus ?? 'PAID',
          }))
        );
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();

    // Auto-refresh every 30 seconds so new sales appear without manual refresh
    const interval = setInterval(fetchTransactions, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { transactions, loading, refresh: fetchTransactions };
}

// ─── Weekly Revenue Chart ─────────────────────────────────────────────────────
export function useWeeklyChart() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/weekly-chart')
      .then((res) => {
        const raw = res.data;
        const items: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : [];

        setChartData(
          items.map((day: any) => ({
            name: day.name,
            revenue: day.revenue ?? 0,
            sales: day.sales ?? 0,
            cost: day.cost ?? 0,
          }))
        );
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, []);

  return { chartData, loading };
}

// ─── Low Stock Count ──────────────────────────────────────────────────────────
export function useLowStockCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    api
      .get('/stock/low-stock')
      .then((res) => {
        const items = res.data?.data || res.data || [];
        setCount(Array.isArray(items) ? items.length : 0);
      })
      .catch(() => setCount(0));
  }, []);

  return count;
}

// ─── Top Products ─────────────────────────────────────────────────────────────
export function useTopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/top-products')
      .then((res) => {
        const raw = res.data;
        const items: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.items)
          ? raw.items
          : [];

        setProducts(
          items.map((p: any) => ({
            id: p.id,
            name: p.name,
            totalQty: p.totalQty ?? 0,
            totalRevenue: p.totalRevenue ?? 0,
          }))
        );
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}

// ─── Pending Payments ─────────────────────────────────────────────────────────
export interface PendingPaymentsData {
  count: number;
  total: number;
}

export function usePendingPayments() {
  const [data, setData] = useState<PendingPaymentsData>({ count: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try the dedicated dashboard endpoint first; fall back to filtering sales list
    api
      .get('/dashboard/pending-payments')
      .then((res) => {
        const d = res.data?.data || res.data;
        setData({
          count: d.count ?? d.pendingCount ?? 0,
          total: d.total ?? d.pendingTotal ?? d.totalAmount ?? 0,
        });
      })
      .catch(() => {
        // Fallback: fetch all sales and filter by PENDING / UNPAID status
        api
          .get('/sales', { params: { status: 'PENDING', limit: 500 } })
          .then((res) => {
            const raw = res.data;
            const items: any[] = Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.data)
              ? raw.data
              : Array.isArray(raw?.items)
              ? raw.items
              : [];

            const pending = items.filter((s: any) => {
              const status = (s.paymentStatus || s.status || '').toUpperCase();
              return status === 'PENDING' || status === 'UNPAID' || status === 'PARTIAL';
            });

            const total = pending.reduce((acc: number, s: any) => {
              return acc + Number(s.totalAmount ?? s.total ?? s.amount ?? 0);
            }, 0);

            setData({ count: pending.length, total });
          })
          .catch(() => setData({ count: 0, total: 0 }));
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
