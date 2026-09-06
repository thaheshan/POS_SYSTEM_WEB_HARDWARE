'use client';

import { useEffect, useState } from 'react';
import api from '@/api/axiosInstance';

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  monthlyRevenue: number;
  monthlyTransactions: number;
  totalCustomers: number;
  // Staff fields
  staffSales?: number;
  staffTransactions?: number;
  staffServiceRevenue?: number;
  staffServiceEntries?: number;
  staffActiveOrders?: number;
}

export interface RecentTransaction {
  id: string;
  invoiceNumber: string;
  customerName: string | null;
  date: string;
  type: string;
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
  profit: number;
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
          staffSales: d.staffSales ?? 0,
          staffTransactions: d.staffTransactions ?? 0,
          staffServiceRevenue: d.staffServiceRevenue ?? 0,
          staffServiceEntries: d.staffServiceEntries ?? 0,
          staffActiveOrders: d.staffActiveOrders ?? 0,
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
            type: tx.type ?? tx.saleType ?? tx.transactionType ?? tx.paymentMethod ?? 'Standard',
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

import { subDays, subMonths, format, isSameDay, isSameMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

function generateChartBuckets(days: number, backendItems: any[], salesList: any[]): ChartPoint[] {
  const now = new Date();
  
  if (days <= 7) {
    // 7 Daily Buckets
    const buckets: ChartPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      const dayName = format(d, 'MMM d');
      
      let salesCount = 0;
      let costTotal = 0;
      let revenueTotal = 0;

      const backendMatch = backendItems.find(b => {
        if (!b.name) return false;
        return b.name.toLowerCase() === dayName.toLowerCase() ||
               b.name.toLowerCase() === format(d, 'EEE').toLowerCase() ||
               b.name.toLowerCase() === format(d, 'yyyy-MM-dd').toLowerCase();
      });

      if (backendMatch) {
        salesCount = backendMatch.sales ?? 0;
        const rawCost = backendMatch.cost ?? 0;
        const rawBackendRev = backendMatch.revenue ?? 0;
        const totalInvoice = rawBackendRev + rawCost;
        revenueTotal = Math.round(totalInvoice / 1.18);
        costTotal = rawCost;
      }

      salesList.forEach(tx => {
        const txDate = tx.createdAt || tx.date ? new Date(tx.createdAt || tx.date) : null;
        if (txDate && isSameDay(txDate, d)) {
          const amt = Number(tx.amount ?? tx.totalAmount ?? 0);
          salesCount += 1;
          revenueTotal += Math.round(amt / 1.18);
          costTotal += Math.round(amt * 0.4);
        }
      });

      const profitTotal = revenueTotal - costTotal;

      buckets.push({
        name: dayName,
        sales: salesCount,
        cost: costTotal,
        revenue: revenueTotal,
        profit: profitTotal,
      });
    }
    return buckets;
  }

  if (days <= 30) {
    // 30 Days: 10 Interval Buckets
    const buckets: ChartPoint[] = [];
    const step = 3;
    for (let i = 27; i >= 0; i -= step) {
      const d = subDays(now, i);
      const dayName = format(d, 'MMM d');
      
      const intervalStart = startOfDay(subDays(d, step - 1));
      const intervalEnd = endOfDay(d);

      let salesCount = 0;
      let revenueTotal = 0;

      salesList.forEach(tx => {
        const txDate = tx.createdAt || tx.date ? new Date(tx.createdAt || tx.date) : null;
        if (txDate && isWithinInterval(txDate, { start: intervalStart, end: intervalEnd })) {
          const amt = Number(tx.amount ?? tx.totalAmount ?? 0);
          salesCount += 1;
          revenueTotal += Math.round(amt / 1.18);
        }
      });

      if (salesCount === 0) {
        const backendMatch = backendItems.find(b => b.name && b.name.toLowerCase() === dayName.toLowerCase());
        if (backendMatch) {
          salesCount = backendMatch.sales ?? 0;
          revenueTotal = Math.round(((backendMatch.revenue ?? 0) + (backendMatch.cost ?? 0)) / 1.18);
        }
      }

      const costTotal = Math.round(revenueTotal * 0.45);
      const profitTotal = revenueTotal - costTotal;

      buckets.push({
        name: dayName,
        sales: salesCount,
        cost: costTotal,
        revenue: revenueTotal,
        profit: profitTotal,
      });
    }
    return buckets;
  }

  if (days <= 90) {
    // 90 Days: 9 Interval Buckets
    const buckets: ChartPoint[] = [];
    const step = 10;
    for (let i = 80; i >= 0; i -= step) {
      const d = subDays(now, i);
      const dayName = format(d, 'MMM d');
      
      const intervalStart = startOfDay(subDays(d, step - 1));
      const intervalEnd = endOfDay(d);

      let salesCount = 0;
      let revenueTotal = 0;

      salesList.forEach(tx => {
        const txDate = tx.createdAt || tx.date ? new Date(tx.createdAt || tx.date) : null;
        if (txDate && isWithinInterval(txDate, { start: intervalStart, end: intervalEnd })) {
          const amt = Number(tx.amount ?? tx.totalAmount ?? 0);
          salesCount += 1;
          revenueTotal += Math.round(amt / 1.18);
        }
      });

      const costTotal = Math.round(revenueTotal * 0.45);
      const profitTotal = revenueTotal - costTotal;

      buckets.push({
        name: dayName,
        sales: salesCount,
        cost: costTotal,
        revenue: revenueTotal,
        profit: profitTotal,
      });
    }
    return buckets;
  }

  // 365 Days: 12 Monthly Buckets
  const buckets: ChartPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const m = subMonths(now, i);
    const monthName = format(m, 'MMM');

    let salesCount = 0;
    let revenueTotal = 0;

    salesList.forEach(tx => {
      const txDate = tx.createdAt || tx.date ? new Date(tx.createdAt || tx.date) : null;
      if (txDate && isSameMonth(txDate, m)) {
        const amt = Number(tx.amount ?? tx.totalAmount ?? 0);
        salesCount += 1;
        revenueTotal += Math.round(amt / 1.18);
      }
    });

    const costTotal = Math.round(revenueTotal * 0.45);
    const profitTotal = revenueTotal - costTotal;

    buckets.push({
      name: monthName,
      sales: salesCount,
      cost: costTotal,
      revenue: revenueTotal,
      profit: profitTotal,
    });
  }
  return buckets;
}

// ─── Weekly Revenue Chart ─────────────────────────────────────────────────────
export function useWeeklyChart(days = 7) {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    Promise.allSettled([
      api.get('/dashboard/weekly-chart', { params: { days } }),
      api.get('/dashboard/recent-transactions', { params: { limit: 500 } }),
    ])
      .then(([chartRes, salesRes]) => {
        let rawItems: any[] = [];
        if (chartRes.status === 'fulfilled') {
          const raw = chartRes.value.data;
          rawItems = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.items)
            ? raw.items
            : [];
        }

        let salesList: any[] = [];
        if (salesRes.status === 'fulfilled') {
          const rawSales = salesRes.value.data;
          salesList = Array.isArray(rawSales)
            ? rawSales
            : Array.isArray(rawSales?.data)
            ? rawSales.data
            : Array.isArray(rawSales?.items)
            ? rawSales.items
            : [];
        }

        const points = generateChartBuckets(days, rawItems, salesList);
        setChartData(points);
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false));
  }, [days]);

  return { chartData, loading };
}

// ─── Low Stock Count ──────────────────────────────────────────────────────────
export function useLowStockCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    api
      .get('/stock?low_stock=true&out_of_stock=true')
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
