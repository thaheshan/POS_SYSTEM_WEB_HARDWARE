'use client';

import MainLayout from '@/components/layout/MainLayout';
import {
  Download, ChevronLeft, Search, FileSpreadsheet, FileText,
  Calendar, X, ChevronDown, RefreshCw, TrendingUp, ShoppingBag, Receipt
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import api from '@/api/axiosInstance';

interface SaleRow {
  id: string;
  rawId: string;
  invoiceNumber: string;
  date: string;
  time: string;
  product: string;
  cashierName: string;
  customerId?: string;
  customerName: string;
  amount: number;
  saleType: string;
  status: string;
  taxAmount: number;
  items: any[];
}

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  PAID:      'bg-emerald-100 text-emerald-700',
  REFUNDED:  'bg-amber-100 text-amber-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  VOIDED:    'bg-red-100 text-red-700',
};

function getStatusLabel(s: string) {
  const map: Record<string, string> = {
    COMPLETED: 'Completed', PAID: 'Paid',
    REFUNDED: 'Refunded', PENDING: 'Pending', VOIDED: 'Voided',
  };
  return map[s?.toUpperCase()] ?? (s?.charAt(0) + s?.slice(1).toLowerCase());
}

export default function SalesReportsPage() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: firstOfMonth, to: today });
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { limit: 2000 };
      if (dateRange?.from) params.startDate = format(dateRange.from, 'yyyy-MM-dd');
      if (dateRange?.to)   params.endDate   = format(dateRange.to,   'yyyy-MM-dd');

      const res = await api.get('/sales', { params });

      let items: any[] = [];
      if (Array.isArray(res.data?.data?.data?.items)) items = res.data.data.data.items;
      else if (Array.isArray(res.data?.data?.items)) items = res.data.data.items;
      else if (Array.isArray(res.data?.items))       items = res.data.items;
      else if (Array.isArray(res.data))              items = res.data;

      const rows: SaleRow[] = items.map((inv: any) => ({
        id:           inv.invoiceNumber || inv.id,
        rawId:        inv.id,
        invoiceNumber: inv.invoiceNumber || inv.id,
        date:         format(new Date(inv.createdAt), 'yyyy-MM-dd'),
        time:         format(new Date(inv.createdAt), 'hh:mm a'),
        product:      inv.items?.[0]?.product?.name ?? '—',
        cashierName:  inv.cashier?.first_name
                        ? `${inv.cashier.first_name} ${inv.cashier.last_name ?? ''}`.trim()
                        : '—',
        customerName: inv.customer?.name || 'Walk-in',
        amount:       Number(inv.totalAmount || 0),
        saleType:     inv.saleType || 'CASH',
        status:       inv.status || 'COMPLETED',
        taxAmount:    Number(inv.taxAmount || 0),
        items:        inv.items || [],
      }));

      // newest-first
      rows.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
      setSales(rows);
      setCurrentPage(1);
    } catch (err) {
      console.error('[SalesReport] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  // Filter
  const filtered = sales.filter(s => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.invoiceNumber.toLowerCase().includes(q) ||
      s.product.toLowerCase().includes(q) ||
      s.cashierName.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q)
    );
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentData = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // KPIs
  const totalRevenue = sales.reduce((s, r) => s + r.amount, 0);
  const totalItems   = sales.reduce((s, r) => s + (r.items?.length || 1), 0);
  const avgTicket    = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0;
  const totalVAT     = sales.reduce((s, r) => s + r.taxAmount, 0);

  const dateLabel = dateRange?.from
    ? `${format(dateRange.from, 'MMM d, yyyy')}${dateRange.to ? ` – ${format(dateRange.to, 'MMM d, yyyy')}` : ''}`
    : 'All Dates';

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const rows = [
      ['Invoice ID', 'Date', 'Time', 'Customer', 'Product', 'Cashier', 'Sale Type', 'Tax', 'Amount', 'Status'],
      ...filtered.map(s => [
        s.invoiceNumber, s.date, s.time, s.customerName,
        `"${s.product}"`, s.cashierName, s.saleType,
        s.taxAmount.toFixed(2), s.amount.toFixed(2), s.status
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Export PDF (print view) ───────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    try {
      const rowsHtml = filtered.map((s, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td>${s.date}</td>
          <td>${s.time}</td>
          <td style="font-family:monospace;font-size:10px">${s.invoiceNumber}</td>
          <td>${s.customerName}</td>
          <td>${s.product}</td>
          <td>${s.cashierName}</td>
          <td style="text-align:right">Rs.${s.taxAmount.toLocaleString('en-LK', {minimumFractionDigits:2})}</td>
          <td style="text-align:right;font-weight:800">Rs.${s.amount.toLocaleString('en-LK', {minimumFractionDigits:2})}</td>
          <td><span class="badge ${s.status === 'COMPLETED' || s.status === 'PAID' ? 'badge-green' : 'badge-amber'}">${getStatusLabel(s.status)}</span></td>
        </tr>`).join('');

      const html = `<!DOCTYPE html><html><head><title>Sales Report – ${dateLabel}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#1e293b;padding:32px 40px;background:#fff;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1e40af;}
  .brand{font-size:20px;font-weight:900;color:#1e40af;letter-spacing:-0.5px;}
  .brand-sub{font-size:11px;color:#64748b;font-weight:600;margin-top:2px;}
  .meta{text-align:right;font-size:10px;color:#64748b;line-height:1.8;}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
  .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;}
  .kpi-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:4px;}
  .kpi-value{font-size:16px;font-weight:900;color:#1e293b;}
  .section-title{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:#1e40af;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;}
  table{width:100%;border-collapse:collapse;}
  thead tr{background:#1e40af;color:#fff;}
  thead th{padding:8px 10px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;text-align:left;}
  thead th:last-child,thead th:nth-last-child(2){text-align:right;}
  tbody tr.even{background:#f8fafc;}
  tbody tr.odd{background:#fff;}
  tbody td{padding:7px 10px;font-size:10px;border-bottom:1px solid #f1f5f9;color:#374151;}
  .badge{display:inline-block;border-radius:4px;padding:1px 6px;font-size:9px;font-weight:800;text-transform:uppercase;}
  .badge-green{background:#dcfce7;color:#166534;}
  .badge-amber{background:#fef3c7;color:#92400e;}
  .footer{margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;}
</style></head><body>
<div class="header">
  <div><div class="brand">Futura Hardware POS</div><div class="brand-sub">Sales Report — ${dateLabel}</div></div>
  <div class="meta">
    <div><strong>Generated:</strong> ${format(new Date(), 'MMM d, yyyy — h:mm a')}</div>
    <div><strong>Period:</strong> ${dateLabel}</div>
    <div><strong>Total Records:</strong> ${filtered.length}</div>
  </div>
</div>
<div class="kpi-grid">
  <div class="kpi"><div class="kpi-label">Total Revenue</div><div class="kpi-value">Rs.${totalRevenue.toLocaleString('en-LK',{minimumFractionDigits:2})}</div></div>
  <div class="kpi"><div class="kpi-label">Transactions</div><div class="kpi-value">${sales.length}</div></div>
  <div class="kpi"><div class="kpi-label">Items Sold</div><div class="kpi-value">${totalItems.toLocaleString()}</div></div>
  <div class="kpi"><div class="kpi-label">Avg Ticket</div><div class="kpi-value">Rs.${avgTicket.toLocaleString('en-LK')}</div></div>
</div>
<div class="section-title">Transaction Log (${filtered.length} records)</div>
<table>
  <thead><tr>
    <th>Date</th><th>Time</th><th>Invoice #</th><th>Customer</th><th>Product</th><th>Cashier</th><th style="text-align:right">VAT</th><th style="text-align:right">Amount</th><th>Status</th>
  </tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>
<div class="footer">
  <span>Futura Hardware POS — Confidential Business Report</span>
  <span>Generated by Futura POS Analytics Engine</span>
</div>
</body></html>`;

      const win = window.open('', '_blank');
      if (!win) { alert('Please allow popups for PDF export.'); return; }
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 400);
    } catch (err) {
      console.error('[SalesReport] PDF failed:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20">

        {/* ── HEADER ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <Link href="/reports" className="flex items-center gap-2 text-[13px] font-black text-blue-600 hover:text-blue-800 mb-4 transition-colors w-max">
              <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight mb-2">
              Sales Reports
            </h1>
            <p className="text-[14px] font-medium text-gray-500">
              Detailed chronological log of all sales, product performance, and cashier metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker */}
            <div className="relative" ref={calRef}>
              <button
                onClick={() => setCalOpen(o => !o)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-[12px] px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{dateLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {calOpen && (
                <div className="absolute right-0 top-12 z-[200] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-[340px] animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-black text-gray-900">Select Date Range</span>
                    <button onClick={() => setCalOpen(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <SalesDatePicker dateRange={dateRange} onSelect={setDateRange} />
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => { setDateRange(undefined); setCalOpen(false); }}
                      className="flex-1 py-2 border border-gray-200 rounded-xl text-[12px] font-bold text-gray-500 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setCalOpen(false)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[12px] font-bold hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={fetchSales}
              className="h-10 w-10 rounded-[12px] border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-blue-600 shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 bg-[#1e40af] text-white rounded-[12px] px-6 py-2.5 shadow-sm hover:bg-blue-800 transition-colors text-[13px] font-black tracking-wide">
                  <Download className="w-4 h-4" /> Export Data
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[180px] z-[100] animate-in fade-in zoom-in-95">
                  <DropdownMenu.Item
                    disabled={isExportingPDF}
                    onClick={handleExportPDF}
                    className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 outline-none rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    {isExportingPDF ? 'Generating…' : 'Download PDF'}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onClick={handleExportCSV}
                    className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 outline-none rounded-lg transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Download CSV
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* ── KPI STRIP ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[20px] p-6 shadow-sm text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-[11px] font-black text-blue-200 uppercase tracking-widest">Total Revenue</span>
            </div>
            <span className="text-[26px] font-black tracking-tighter block">
              {loading ? '…' : `Rs. ${totalRevenue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Transactions</span>
            </div>
            <span className="text-[26px] font-black tracking-tighter text-gray-900 block">
              {loading ? '…' : sales.length.toLocaleString()}
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Items Sold</span>
            </div>
            <span className="text-[26px] font-black tracking-tighter text-gray-900 block">
              {loading ? '…' : totalItems.toLocaleString()}
            </span>
          </div>
          <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Avg Ticket</span>
            </div>
            <span className="text-[26px] font-black tracking-tighter text-blue-600 block">
              {loading ? '…' : `Rs. ${avgTicket.toLocaleString('en-LK')}`}
            </span>
          </div>
        </div>

        {/* ── DATA TABLE ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Table toolbar */}
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID, Customer, Product, or Cashier…"
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <span className="text-[12px] font-bold text-gray-400">
              {loading ? 'Loading…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col gap-0 divide-y divide-gray-100">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-6 px-6 py-4">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse flex-1" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {['Date & Time', 'Invoice ID', 'Customer', 'Primary Product', 'Cashier', 'Sale Type', 'VAT', 'Amount', 'Status'].map(h => (
                      <th key={h} className="py-4 px-5 text-[10.5px] font-black text-gray-400 uppercase tracking-widest last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Receipt className="w-10 h-10 text-gray-200" />
                          <p className="text-[14px] font-semibold text-gray-400">No transactions found.</p>
                          <p className="text-[12px]">Try adjusting the date range or search term.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentData.map(sale => (
                      <tr key={sale.rawId} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-5">
                          <p className="text-[13px] font-bold text-gray-900">{sale.date}</p>
                          <p className="text-[11px] font-semibold text-gray-400">{sale.time}</p>
                        </td>
                        <td className="py-4 px-5 text-[12px] font-bold text-blue-600 font-mono tracking-tight">{sale.invoiceNumber}</td>
                        <td className="py-4 px-5 text-[13px] font-semibold text-gray-800">{sale.customerName}</td>
                        <td className="py-4 px-5 text-[13px] font-semibold text-gray-700">
                          <span className="max-w-[180px] truncate block">{sale.product}</span>
                          {sale.items.length > 1 && (
                            <span className="text-[11px] text-gray-400 font-medium">+{sale.items.length - 1} more</span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                              {sale.cashierName.charAt(0)}
                            </div>
                            <span className="text-[13px] font-semibold text-gray-700">{sale.cashierName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-[12px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {sale.saleType}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-[13px] font-semibold text-purple-600 font-mono">
                          {sale.taxAmount > 0 ? `Rs. ${sale.taxAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="py-4 px-5 text-[14px] font-black text-gray-900 font-mono tracking-tighter text-right">
                          Rs. {sale.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10.5px] font-black uppercase tracking-widest ${STATUS_STYLE[sale.status.toUpperCase()] ?? 'bg-gray-100 text-gray-600'}`}>
                            {getStatusLabel(sale.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-[12px] font-bold text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-500 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    p = currentPage - 2 + i;
                    if (p > totalPages) p = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${currentPage === p ? 'bg-[#1e40af] text-white' : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-600'}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-500 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {!loading && filtered.length > 0 && filtered.length <= PAGE_SIZE && (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-[12px] font-bold text-gray-500">
                Showing {filtered.length} of {filtered.length} results
              </span>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
