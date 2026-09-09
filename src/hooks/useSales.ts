import { useEffect, useState, useCallback } from 'react';
import api from '@/api/axiosInstance';
import { DateRange } from 'react-day-picker';

export function useSalesData(dateRange: DateRange | undefined) {
  const [data, setData] = useState<any>({
    catA: { core: 0, vat: 0, avg: 0, items: 0, txns: 0, recentTxns: [], allTxns: [] },
    catB: { core: 0, overflow: 0, baseNonTax: 0, avg: 0, items: 0, txns: 0, recentTxns: [], allTxns: [], topProducts: [] },
    catC: { core: 0, labour: 0, install: 0, misc: 0, entries: 0, recentEntries: [], allTxns: [], breakdown: [] },
    creditSummary: { creditSalesTotal: 0, creditTxnCount: 0, cashSalesTotal: 0, cashTxnCount: 0, totalOutstandingCredit: 0 },
    summary: { totalSales: 0, totalPurchases: 0, totalExpenses: 0, netProfit: 0 },
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

      // Fetch sales invoices, expenses, summary, and customers in parallel
      const [salesRes, expensesRes, summaryRes, customersRes] = await Promise.all([
        api.get('/sales', { params }),
        api.get('/expenses', { params: { startDate: params.startDate, endDate: params.endDate } }),
        api.get('/dashboard/summary', { params: { startDate: params.startDate, endDate: params.endDate } }).catch(() => ({ data: { totalSales: 0, totalPurchases: 0, totalExpenses: 0, netProfit: 0 } })),
        api.get('/customers').catch(() => ({ data: [] })),
      ]);

      // ── SALES PROCESSING ─────────────────────────────────────────────────────
      let items: any[] = [];
      if (Array.isArray(salesRes.data?.data?.data?.items)) {
        items = salesRes.data.data.data.items;
      } else if (Array.isArray(salesRes.data?.data?.items)) {
        items = salesRes.data.data.items;
      } else if (Array.isArray(salesRes.data?.items)) {
        items = salesRes.data.items;
      } else if (Array.isArray(salesRes.data)) {
        items = salesRes.data;
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
      let creditSalesTotal = 0;
      let cashSalesTotal = 0;
      let creditTxnCount = 0;
      let cashTxnCount = 0;
      const recentCatATxns: any[] = [];
      const recentCatBTxns: any[] = [];
      const allCatATxns: any[] = [];
      const allCatBTxns: any[] = [];
      
      let creditSettlementsTotal = 0;
      let creditSettlementCount = 0;

      for (const inv of sorted) {
        const invDay = new Date(inv.createdAt).toISOString().split('T')[0];
        if (invDay !== currentDay) {
          currentDay = invDay;
          runningTotal = 0; // Reset daily threshold running total
        }

        const invNum: string = inv.invoiceNumber || inv.id || '';

        // ── Credit settlements (CRD- prefix): customer pays shop ────────────
        // These are CASH INFLOWS, not sales. Do NOT count in catA/catB revenue.
        const isCreditSettlement =
          invNum.startsWith('CRD-') ||
          (inv.saleType || '').toUpperCase() === 'CREDIT_SETTLEMENT' ||
          (inv.type || '').toUpperCase() === 'CREDIT_SETTLEMENT' ||
          (inv.transactionType || '').toUpperCase() === 'CREDIT_SETTLEMENT';

        if (isCreditSettlement) {
          const settleAmt = Math.abs(Number(inv.totalAmount || inv.amount || 0));
          creditSettlementsTotal += settleAmt;
          creditSettlementCount += 1;
          // Add to cash totals (money received by shop)
          cashSalesTotal += settleAmt;
          cashTxnCount += 1;
          continue; // Skip catA/catB revenue accumulation
        }

        const amt = Number(inv.totalAmount || 0);

        // Skip negative-amount non-settlement entries (e.g. returns recorded without RET- prefix)
        if (amt < 0) continue;

        const st = (inv.status || inv.paymentStatus || inv.payment_status || '').toString().toUpperCase();
        const isUnpaid = st === 'UNPAID' || st === 'PENDING';

        const isCredit =
          isUnpaid ||
          st === 'PARTIAL' ||
          (inv.saleType || '').toString().toUpperCase() === 'CREDIT' ||
          (inv.paymentMethod || '').toString().toUpperCase() === 'CREDIT' ||
          Number(inv.balance || 0) > 0 ||
          Number(inv.creditAmount || 0) > 0 ||
          inv.isCredit === true;

        // Calculate upfront cash paid for credit sales
        let paidUpfront = amt;
        if (isCredit) {
          if (inv.paidAmount !== undefined && inv.paidAmount !== null) {
            paidUpfront = Math.max(0, Number(inv.paidAmount));
          } else if (inv.amountPaid !== undefined && inv.amountPaid !== null) {
            paidUpfront = Math.max(0, Number(inv.amountPaid));
          } else if (inv.paid !== undefined && inv.paid !== null) {
            paidUpfront = Math.max(0, Number(inv.paid));
          } else if (isUnpaid) {
            paidUpfront = 0;
          } else {
            const uncollected = Number(inv.balance ?? inv.creditAmount ?? 0);
            paidUpfront = Math.max(0, amt - uncollected);
          }
        }

        const uncollectedCredit = Math.max(0, amt - paidUpfront);

        if (isCredit) {
          creditSalesTotal += uncollectedCredit;
          creditTxnCount += 1;
          cashSalesTotal += paidUpfront;
        } else {
          cashSalesTotal += amt;
          cashTxnCount += 1;
        }

        const rawId = inv.id || inv._id || '';
        const time = new Date(inv.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const mode = inv.saleType
          ? inv.saleType.charAt(0) + inv.saleType.slice(1).toLowerCase()
          : 'Cash';

        // Determine special type label for Returns/Exchanges
        const isReturn = invNum.startsWith('RET-');
        const isExchange = invNum.startsWith('EXC-');
        const typeLabel = isReturn ? 'Return' : (isExchange ? 'Exchange' : null);

        const customerName = inv.customer?.name || inv.customerName || 'Walk-in Customer';
        const date = new Date(inv.createdAt).toISOString().split('T')[0];
        const status = inv.status ? (inv.status.charAt(0).toUpperCase() + inv.status.slice(1).toLowerCase()) : (isReturn ? 'Refunded' : 'Completed');

        // Realized cash revenue from this transaction today
        const revenueAmt = paidUpfront;

        const prevRunning = runningTotal;
        runningTotal += revenueAmt;

        if (prevRunning >= threshold) {
          // Entire invoice is overflow / Cat B
          catBOverflow += revenueAmt;
          catBTxns += 1;
          catBItemCount += inv.items?.length || 1;
          const txnObj = { id: invNum, rawId, date, time, customerName, amount: amt.toLocaleString(), mode, type: typeLabel || 'Overflow', status };
          allCatBTxns.push({ ...txnObj, rawAmount: amt, timestamp: new Date(inv.createdAt).getTime() });
        } else if (prevRunning + revenueAmt <= threshold) {
          // Entire invoice fits within Cat A threshold
          catACore += revenueAmt;
          catATxns += 1;
          catAItemCount += inv.items?.length || 1;
          const txnObj = { id: invNum, rawId, date, time, customerName, amount: amt.toLocaleString(), mode, type: typeLabel || 'Taxable', status };
          allCatATxns.push({ ...txnObj, rawAmount: amt, timestamp: new Date(inv.createdAt).getTime() });
        } else {
          // Invoice straddles the threshold — split it
          const catAPortion = Math.max(0, threshold - prevRunning);
          const catBPortion = Math.max(0, revenueAmt - catAPortion);
          catACore += catAPortion;
          catBOverflow += catBPortion;
          catATxns += 1;
          catBTxns += 1;
          catAItemCount += inv.items?.length || 1;
          catBItemCount += inv.items?.length || 1;

          const txnObjA = { id: invNum, rawId, date, time, customerName, amount: catAPortion.toLocaleString(), mode, type: typeLabel || 'Taxable', status };
          allCatATxns.push({ ...txnObjA, rawAmount: catAPortion, timestamp: new Date(inv.createdAt).getTime() });

          const txnObjB = { id: invNum, rawId, date, time, customerName, amount: catBPortion.toLocaleString(), mode, type: typeLabel || 'Overflow', status };
          allCatBTxns.push({ ...txnObjB, rawAmount: catBPortion, timestamp: new Date(inv.createdAt).getTime() });
        }
      }

      // Sort newest-first to get the true recent transactions
      allCatATxns.sort((a, b) => b.timestamp - a.timestamp);
      allCatBTxns.sort((a, b) => b.timestamp - a.timestamp);
      
      const finalRecentCatA = allCatATxns.slice(0, 5);
      const finalRecentCatB = allCatBTxns.slice(0, 5);

      // ── CATEGORY C (EXPENSES) PROCESSING ────────────────────────────────────
      let expenseItems: any[] = [];
      const expRaw = expensesRes.data;
      if (Array.isArray(expRaw?.data)) {
        expenseItems = expRaw.data;
      } else if (Array.isArray(expRaw?.data?.data)) {
        expenseItems = expRaw.data.data;
      } else if (Array.isArray(expRaw)) {
        expenseItems = expRaw;
      }

      let labourTotal = 0;
      let installTotal = 0;
      let miscTotal = 0;

      // Count per entryType (LABOUR, INSTALLATION, MISC / other)
      for (const exp of expenseItems) {
        const amt = Number(exp.amount || 0);
        const type = (exp.entryType || '').toUpperCase();
        if (type === 'LABOUR') {
          labourTotal += amt;
        } else if (type === 'INSTALLATION') {
          installTotal += amt;
        } else {
          miscTotal += amt;
        }
      }

      const catCTotal = labourTotal + installTotal + miscTotal;

      // Build recent entries list (last 5)
      const recentExpEntries = expenseItems.slice(0, 5).map((e: any) => ({
        id: e.id,
        type: e.entryType || 'MISC',
        description: e.description || '',
        amount: Number(e.amount),
        time: new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        staffName: e.staffName || 'Unknown',
        role: e.role || 'staff',
        labourerName: e.labourerName,
      }));

      // Build type breakdown
      const breakdown: { type: string; amount: number }[] = [];
      if (labourTotal > 0) breakdown.push({ type: 'Labour', amount: labourTotal });
      if (installTotal > 0) breakdown.push({ type: 'Installation', amount: installTotal });
      if (miscTotal > 0) breakdown.push({ type: 'Misc / Other', amount: miscTotal });

      // Unwrap the ResponseInterceptor envelope
      const summaryPayload = summaryRes.data?.data ?? summaryRes.data ?? {};
      const summaryRaw = summaryPayload;

      // Calculate total customer credit balance
      let customersList: any[] = [];
      const custData = customersRes.data;
      if (Array.isArray(custData?.data?.items)) {
        customersList = custData.data.items;
      } else if (Array.isArray(custData?.data)) {
        customersList = custData.data;
      } else if (Array.isArray(custData)) {
        customersList = custData;
      }

      const totalOutstandingCredit = customersList.reduce(
        (sum: number, c: any) => sum + Number(c.outstandingBalance || c.outstanding_balance || c.creditBalance || c.credit_balance || c.totalCredit || 0),
        0
      );

      setData({
        catA: {
          core: catACore,
          vat: Math.round(catACore - (catACore / 1.18)),
          avg: catATxns ? Math.round(catACore / catATxns) : 0,
          items: catAItemCount,
          txns: catATxns,
          recentTxns: finalRecentCatA,
          allTxns: allCatATxns,
        },
        catB: {
          core: catBOverflow,
          overflow: catBOverflow,
          baseNonTax: 0,
          avg: catBTxns > 0 ? Math.round(catBOverflow / catBTxns) : 0,
          items: catBItemCount,
          txns: catBTxns,
          recentTxns: finalRecentCatB,
          allTxns: allCatBTxns,
          topProducts: [], // Requires product-level data
        },
        catC: {
          core: catCTotal,
          labour: labourTotal,
          install: installTotal,
          misc: miscTotal,
          entries: expenseItems.length,
          recentEntries: expenseItems.slice(-5).reverse().map((e: any) => ({
            id: e.id || e._id,
            time: new Date(e.createdAt || new Date()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            amount: Number(e.amount || 0).toLocaleString(),
            person: e.staffName || 'Staff',
            type: (e.entryType || '').toUpperCase(),
          })),
          allTxns: expenseItems.slice().reverse(),
          breakdown: [
            { name: 'jobs completed', value: labourTotal },
            { name: 'jobs completed', value: miscTotal },
          ],
        },
        creditSummary: {
          creditSalesTotal,
          creditTxnCount,
          cashSalesTotal,
          cashTxnCount,
          totalOutstandingCredit,
        },
        summary: {
          totalSales: runningTotal,
          totalPurchases: summaryRaw?.totalPurchases || 0,
          totalExpenses: catCTotal,
          netProfit: runningTotal - catCTotal,
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
