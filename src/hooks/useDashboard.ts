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
  sku?: string;
  category?: string;
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
function getRealizedCash(inv: any): { realized: number; isSettlement: boolean } {
  const invNum: string = inv.invoiceNumber || inv.id || '';

  // 1. Credit Settlements (CRD- prefix): Cash Inflow
  const isCreditSettlement =
    invNum.startsWith('CRD-') ||
    (inv.saleType || '').toUpperCase() === 'CREDIT_SETTLEMENT' ||
    (inv.type || '').toUpperCase() === 'CREDIT_SETTLEMENT' ||
    (inv.transactionType || '').toUpperCase() === 'CREDIT_SETTLEMENT';

  if (isCreditSettlement) {
    return { realized: Math.abs(Number(inv.totalAmount || inv.amount || 0)), isSettlement: true };
  }

  // 2. Returns (RET- prefix): Cash Refund Outflow
  const isReturn =
    invNum.startsWith('RET-') ||
    (inv.saleType || '').toUpperCase() === 'RETURN' ||
    (inv.type || '').toUpperCase() === 'RETURN' ||
    (inv.transactionType || '').toUpperCase() === 'RETURN';

  if (isReturn) {
    const refundAmt = Math.abs(Number(inv.totalAmount || inv.amount || 0));
    return { realized: -refundAmt, isSettlement: false };
  }

  // 3. Exchanges (EXC- prefix): Net Cash Difference
  const isExchange =
    invNum.startsWith('EXC-') ||
    (inv.saleType || '').toUpperCase() === 'EXCHANGE' ||
    (inv.type || '').toUpperCase() === 'EXCHANGE';

  if (isExchange) {
    const delta = Number(inv.netAmount ?? inv.delta ?? inv.totalAmount ?? inv.amount ?? 0);
    return { realized: delta, isSettlement: false };
  }

  const total = Number(inv.totalAmount || inv.amount || 0);
  if (total <= 0) return { realized: 0, isSettlement: false };

  const st = (inv.status || inv.paymentStatus || inv.payment_status || '').toString().toUpperCase();

  // Explicit UNPAID / PENDING status
  if (st === 'UNPAID' || st === 'PENDING') {
    const explicitPaid = Number(inv.paidAmount ?? inv.paid_amount ?? inv.amountPaid ?? inv.paid ?? 0);
    return { realized: Math.max(0, explicitPaid), isSettlement: false };
  }

  // Explicit PARTIAL status
  if (st === 'PARTIAL') {
    const explicitPaid = Number(inv.paidAmount ?? inv.paid_amount ?? inv.amountPaid ?? inv.paid ?? 0);
    if (explicitPaid > 0) return { realized: explicitPaid, isSettlement: false };
    const due = Number(inv.dueAmount ?? inv.due_amount ?? inv.balance ?? inv.creditAmount ?? 0);
    return { realized: Math.max(0, total - due), isSettlement: false };
  }

  // Explicit CREDIT saleType / paymentMethod / isCredit flag
  const isCreditType =
    (inv.saleType || '').toString().toUpperCase() === 'CREDIT' ||
    (inv.paymentMethod || '').toString().toUpperCase() === 'CREDIT' ||
    inv.isCredit === true;

  if (isCreditType) {
    const explicitPaid = Number(inv.paidAmount ?? inv.paid_amount ?? inv.amountPaid ?? inv.paid ?? 0);
    if (explicitPaid > 0) return { realized: explicitPaid, isSettlement: false };
    const due = Number(inv.dueAmount ?? inv.due_amount ?? inv.balance ?? inv.creditAmount ?? 0);
    if (due > 0) return { realized: Math.max(0, total - due), isSettlement: false };
    return { realized: 0, isSettlement: false };
  }

  return { realized: total, isSettlement: false };
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/dashboard/stats'),
      api.get('/sales', { params: { limit: 1000 } }),
    ])
      .then(([statsRes, salesRes]) => {
        let d: any = {};
        if (statsRes.status === 'fulfilled') {
          d = statsRes.value.data?.data || statsRes.value.data || {};
        }

        let salesItems: any[] = [];
        let fetchedSales = false;
        if (salesRes.status === 'fulfilled') {
          fetchedSales = true;
          const resData = salesRes.value.data;
          if (Array.isArray(resData?.data?.data?.items)) {
            salesItems = resData.data.data.items;
          } else if (Array.isArray(resData?.data?.data)) {
            salesItems = resData.data.data;
          } else if (Array.isArray(resData?.data?.items)) {
            salesItems = resData.data.items;
          } else if (Array.isArray(resData?.data)) {
            salesItems = resData.data;
          } else if (Array.isArray(resData?.items)) {
            salesItems = resData.items;
          } else if (Array.isArray(resData)) {
            salesItems = resData;
          }
        }

        // Compute cash-basis todaySales and monthlyRevenue
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let cashToday = 0;
        let cashMonthly = 0;
        let todayTxnCnt = 0;
        let monthTxnCnt = 0;

        salesItems.forEach((inv: any) => {
          const invDate = inv.createdAt || inv.date ? new Date(inv.createdAt || inv.date) : null;
          if (!invDate) return;

          const { realized, isSettlement } = getRealizedCash(inv);

          const isToday = invDate.toISOString().split('T')[0] === todayStr;
          const isThisMonth = invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;

          if (isToday) {
            cashToday += realized;
            if (!isSettlement) todayTxnCnt += 1;
          }
          if (isThisMonth) {
            cashMonthly += realized;
            if (!isSettlement) monthTxnCnt += 1;
          }
        });

        setStats({
          todaySales: fetchedSales ? cashToday : (d.todaySales ?? 0),
          todayTransactions: fetchedSales ? todayTxnCnt : (d.todayTransactions ?? 0),
          monthlyRevenue: fetchedSales ? cashMonthly : (d.monthlyRevenue ?? 0),
          monthlyTransactions: fetchedSales ? monthTxnCnt : (d.monthlyTransactions ?? 0),
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
          items.map((tx: any) => {
            const invNum = tx.invoiceNumber || tx.id || '';
            const isCreditSettlement =
              invNum.startsWith('CRD-') ||
              (tx.type || tx.saleType || '').toUpperCase() === 'CREDIT_SETTLEMENT' ||
              (tx.transactionType || '').toUpperCase() === 'CREDIT_SETTLEMENT';

            const rawAmt = Number(tx.amount ?? tx.totalAmount ?? 0);

            return {
              id: tx.id,
              invoiceNumber: invNum,
              customerName: tx.customerName ?? tx.customer?.name ?? 'Walk-in Customer',
              date: tx.date ?? tx.createdAt,
              type: isCreditSettlement
                ? 'Credit Settlement'
                : (tx.type ?? tx.saleType ?? tx.transactionType ?? tx.paymentMethod ?? 'Standard'),
              amount: isCreditSettlement ? Math.abs(rawAmt) : Math.max(0, rawAmt),
              status: isCreditSettlement ? 'PAID' : (tx.status ?? tx.paymentStatus ?? 'PAID'),
            };
          })
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

function extractTxRealizedRevenue(tx: any): { realized: number; isSettlement: boolean } {
  return getRealizedCash(tx);
}

function generateChartBuckets(days: number, backendItems: any[], salesList: any[], hasSalesData = false): ChartPoint[] {
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

      if (!hasSalesData) {
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
          revenueTotal = Math.round(totalInvoice);
          costTotal = rawCost;
        }
      }

      salesList.forEach(tx => {
        const txDate = tx.createdAt || tx.date ? new Date(tx.createdAt || tx.date) : null;
        if (txDate && isSameDay(txDate, d)) {
          const { realized } = extractTxRealizedRevenue(tx);
          if (realized > 0) {
            salesCount += 1;
            revenueTotal += Math.round(realized);

            let invCogs = 0;
            if (Array.isArray(tx.items) && tx.items.length > 0) {
              for (const item of tx.items) {
                const qty = Number(item.quantity || 0);
                const unitCost = Number(
                  item.costPrice ?? item.product?.purchasePrice ?? item.purchasePrice ?? 0
                );
                invCogs += qty * unitCost;
              }
            } else {
              invCogs = Math.round(realized * (2 / 3));
            }
            costTotal += Math.round(invCogs);
          }
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
          const { realized } = extractTxRealizedRevenue(tx);
          if (realized > 0) {
            salesCount += 1;
            revenueTotal += Math.round(realized);
          }
        }
      });

      if (!hasSalesData && salesCount === 0) {
        const backendMatch = backendItems.find(b => b.name && b.name.toLowerCase() === dayName.toLowerCase());
        if (backendMatch) {
          salesCount = backendMatch.sales ?? 0;
          revenueTotal = Math.round((backendMatch.revenue ?? 0) + (backendMatch.cost ?? 0));
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
          const { realized } = extractTxRealizedRevenue(tx);
          if (realized > 0) {
            salesCount += 1;
            revenueTotal += Math.round(realized);
          }
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
        const { realized } = extractTxRealizedRevenue(tx);
        if (realized > 0) {
          salesCount += 1;
          revenueTotal += Math.round(realized);
        }
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
      api.get('/sales', { params: { limit: 1000 } }),
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
        let hasSalesData = false;
        if (salesRes.status === 'fulfilled') {
          hasSalesData = true;
          const resData = salesRes.value.data;
          if (Array.isArray(resData?.data?.data?.items)) {
            salesList = resData.data.data.items;
          } else if (Array.isArray(resData?.data?.data)) {
            salesList = resData.data.data;
          } else if (Array.isArray(resData?.data?.items)) {
            salesList = resData.data.items;
          } else if (Array.isArray(resData?.data)) {
            salesList = resData.data;
          } else if (Array.isArray(resData?.items)) {
            salesList = resData.items;
          } else if (Array.isArray(resData)) {
            salesList = resData;
          }
        }

        const points = generateChartBuckets(days, rawItems, salesList, hasSalesData);
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
          items.map((p: any, idx: number) => ({
            id: p.id || p.product_id || `tp-${idx}`,
            name: p.name || p.product_name || 'Unknown',
            sku: p.sku || p.product?.sku || 'N/A',
            category: p.category || p.category_name || p.product?.category?.name || 'General',
            totalQty: Number(p.totalQty ?? p.quantity ?? p.qty ?? p.unitsSold ?? 0),
            totalRevenue: Number(p.totalRevenue ?? p.revenue ?? p.amount ?? 0),
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
