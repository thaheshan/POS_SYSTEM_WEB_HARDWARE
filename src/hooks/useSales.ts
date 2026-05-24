import { useEffect, useState, useCallback } from 'react';
import api from '@/api/axiosInstance';
import { DateRange } from 'react-day-picker';

export function useSalesData(dateRange: DateRange | undefined) {
  const [data, setData] = useState<any>({
    catA: { core: 0, vat: 0, avg: 0, items: 0, txns: 0, recentTxns: [] },
    catB: { core: 0, overflow: 0, baseNonTax: 0, avg: 0, items: 0, txns: 0, recentTxns: [], topProducts: [] },
    catC: { core: 0, labour: 0, install: 0, misc: 0, entries: 0, recentEntries: [], breakdown: [] },
  });
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);

      // Build date params from the selected date range
      const params: Record<string, any> = { limit: 1000 };
      if (dateRange?.from) {
        params.startDate = dateRange.from.toISOString().split('T')[0]; // YYYY-MM-DD
      }
      if (dateRange?.to) {
        params.endDate = dateRange.to.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      const res = await api.get('/sales', { params });

      // Handle various response nesting levels (GlobalInterceptor + SalesService both wrap in 'data')
      let items: any[] = [];
      if (Array.isArray(res.data?.data?.data?.items)) {
        items = res.data.data.data.items;
      } else if (Array.isArray(res.data?.data?.items)) {
        items = res.data.data.items;
      } else if (Array.isArray(res.data?.items)) {
        items = res.data.items;
      } else if (Array.isArray(res.data)) {
        items = res.data;
      }

      const threshold = 200000;

      // Sort oldest-first so running total fills Cat A before Cat B
      const sorted = [...items].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      let catACore = 0;
      let catBOverflow = 0;
      let catATxns = 0;
      let catBTxns = 0;
      let catAItemCount = 0;
      let catBItemCount = 0;
      const recentCatATxns: any[] = [];
      const recentCatBTxns: any[] = [];
      const allCatATxns: any[] = [];
      const allCatBTxns: any[] = [];
      let runningTotal = 0;

      for (const inv of sorted) {
        const amt = Number(inv.totalAmount || 0);
        const prevRunning = runningTotal;
        runningTotal += amt;

        const time = new Date(inv.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const mode = inv.saleType
          ? inv.saleType.charAt(0) + inv.saleType.slice(1).toLowerCase()
          : 'Cash';

        if (prevRunning >= threshold) {
          // Entire invoice is overflow / Cat B
          catBOverflow += amt;
          catBTxns += 1;
          catBItemCount += inv.items?.length || 1;
          const txnObj = { id: inv.invoiceNumber, time, amount: amt.toLocaleString(), mode, type: 'Overflow' };
          if (recentCatBTxns.length < 5) recentCatBTxns.push(txnObj);
          allCatBTxns.push({ ...txnObj, rawAmount: amt });
        } else if (prevRunning + amt <= threshold) {
          // Entire invoice fits within Cat A threshold
          catACore += amt;
          catATxns += 1;
          catAItemCount += inv.items?.length || 1;
          const txnObj = { id: inv.invoiceNumber, time, amount: amt.toLocaleString(), mode, type: 'Taxable' };
          if (recentCatATxns.length < 5) recentCatATxns.push(txnObj);
          allCatATxns.push({ ...txnObj, rawAmount: amt });
        } else {
          // Invoice straddles the threshold — split it
          const catAPortion = threshold - prevRunning;
          const catBPortion = amt - catAPortion;
          catACore += catAPortion;
          catBOverflow += catBPortion;
          catATxns += 1;
          catBTxns += 1;
          catAItemCount += inv.items?.length || 1;
          catBItemCount += inv.items?.length || 1;
          
          const txnObjA = { id: inv.invoiceNumber, time, amount: catAPortion.toLocaleString(), mode, type: 'Taxable' };
          if (recentCatATxns.length < 5) recentCatATxns.push(txnObjA);
          allCatATxns.push({ ...txnObjA, rawAmount: catAPortion });

          const txnObjB = { id: inv.invoiceNumber, time, amount: catBPortion.toLocaleString(), mode, type: 'Overflow' };
          if (recentCatBTxns.length < 5) recentCatBTxns.push(txnObjB);
          allCatBTxns.push({ ...txnObjB, rawAmount: catBPortion });
        }
      }

      const totalSales = runningTotal;

      setData({
        catA: {
          core: catACore,
          vat: Math.round(catACore * 0.18),
          avg: catATxns ? Math.round(catACore / catATxns) : 0,
          items: catAItemCount,
          txns: catATxns,
          recentTxns: recentCatATxns,
          allTxns: allCatATxns,
        },
        catB: {
          core: catBOverflow,
          overflow: catBOverflow,
          baseNonTax: 0,
          avg: catBTxns ? Math.round(catBOverflow / catBTxns) : 0,
          items: catBItemCount,
          txns: catBTxns,
          recentTxns: recentCatBTxns,
          allTxns: allCatBTxns,
          topProducts: [],
        },
        catC: {
          core: Math.round(totalSales * 0.1),
          labour: Math.round(totalSales * 0.05),
          install: Math.round(totalSales * 0.03),
          misc: Math.round(totalSales * 0.02),
          entries: Math.round(items.length * 0.2),
          recentEntries: [],
          allTxns: [], // Placeholder for Cat C
          breakdown: [],
        },
      });
    } catch (error: any) {
      console.error('fetchSales error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { data, loading, refresh: fetchSales };
}
