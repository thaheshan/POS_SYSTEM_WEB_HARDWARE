'use client';

import MainLayout from '@/components/layout/MainLayout';
import {
  Download, ChevronLeft, ShieldCheck, FileSpreadsheet, FileText,
  Calendar, X, ChevronDown, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth } from 'date-fns';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import { useSalesData } from '@/hooks/useSales';

const VAT_RATE = 0.18;

// Build per-day Cat A / Cat B / Cat C rows from the real useSalesData result
function buildTaxRows(data: any) {
  const allA: any[] = data?.catA?.allTxns ?? [];
  const allB: any[] = data?.catB?.allTxns ?? [];
  const allC: any[] = data?.catC?.allTxns ?? [];

  // Group by date
  const dayMap: Map<string, { catA: number; catB: number; catC: number; txns: number }> = new Map();

  const addToDay = (date: string, cat: 'catA' | 'catB' | 'catC', amt: number) => {
    if (!dayMap.has(date)) dayMap.set(date, { catA: 0, catB: 0, catC: 0, txns: 0 });
    const d = dayMap.get(date)!;
    d[cat] += amt;
    d.txns += 1;
  };

  for (const t of allA) {
    const dateKey = t.id ? t.id.split(' ')[0] : '';
    // Use timestamp if available, else fallback label
    const d = t.timestamp ? format(new Date(t.timestamp), 'yyyy-MM-dd') : dateKey;
    addToDay(d || 'Unknown', 'catA', t.rawAmount || 0);
  }
  for (const t of allB) {
    const d = t.timestamp ? format(new Date(t.timestamp), 'yyyy-MM-dd') : '';
    addToDay(d || 'Unknown', 'catB', t.rawAmount || 0);
  }
  for (const t of allC) {
    const d = t.createdAt ? format(new Date(t.createdAt), 'yyyy-MM-dd') : '';
    addToDay(d || 'Unknown', 'catC', Number(t.amount || 0));
  }

  // Convert to sorted array
  const rows = Array.from(dayMap.entries())
    .map(([date, v]) => ({ date, ...v }))
    .filter(r => r.date !== 'Unknown')
    .sort((a, b) => b.date.localeCompare(a.date));

  return rows;
}

export default function TaxReportsPage() {
  const today = new Date();
  const firstOfMonth = startOfMonth(today);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: firstOfMonth, to: today });
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, loading, refresh } = useSalesData(dateRange);
  const taxRows = buildTaxRows(data);

  // YTD figures (always full year)
  const ytdCatA    = data?.catA?.core ?? 0;
  const ytdVAT     = data?.catA?.vat ?? 0;
  const ytdCatB    = data?.catB?.core ?? 0;
  const ytdCatC    = data?.catC?.core ?? 0;

  const dateLabel = dateRange?.from
    ? `${format(dateRange.from, 'MMM d, yyyy')}${dateRange.to ? ` – ${format(dateRange.to, 'MMM d, yyyy')}` : ''}`
    : 'All Dates';

  const paged     = taxRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(taxRows.length / PAGE_SIZE));

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Log ID', 'Category A (Taxable)', 'VAT (18%)', 'Cat A Gross', 'Category B (Non-Tax)', 'Category C (Labour)'],
      ...taxRows.map((r, i) => {
        const vatAmt   = Math.round(r.catA * VAT_RATE / (1 + VAT_RATE));
        const catAGross = r.catA;
        return [
          r.date,
          `TX-${r.date.replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
          r.catA.toFixed(2),
          vatAmt.toFixed(2),
          catAGross.toFixed(2),
          r.catB.toFixed(2),
          r.catC.toFixed(2),
        ];
      })
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `tax_compliance_ledger_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Export PDF ──────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const rowsHtml = taxRows.map((r, i) => {
      const vatAmt    = Math.round(r.catA - (r.catA / (1 + VAT_RATE)));
      const catANet   = r.catA - vatAmt;
      const logId     = `TX-${r.date.replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`;
      return `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td>${r.date}</td>
          <td style="font-family:monospace;font-size:10px">${logId}</td>
          <td style="text-align:right">Rs.${catANet.toLocaleString('en-LK',{minimumFractionDigits:2})}</td>
          <td style="text-align:right;color:#9333ea;font-weight:700">Rs.${vatAmt.toLocaleString('en-LK',{minimumFractionDigits:2})}</td>
          <td style="text-align:right;font-weight:800">Rs.${r.catA.toLocaleString('en-LK',{minimumFractionDigits:2})}</td>
          <td style="text-align:right">Rs.${r.catB.toLocaleString('en-LK',{minimumFractionDigits:2})}</td>
          <td style="text-align:right">Rs.${r.catC.toLocaleString('en-LK',{minimumFractionDigits:2})}</td>
        </tr>`;
    }).join('');

    const totalVATCalc = taxRows.reduce((s, r) => s + Math.round(r.catA - (r.catA / (1 + VAT_RATE))), 0);
    const totalA = taxRows.reduce((s, r) => s + r.catA, 0);
    const totalB = taxRows.reduce((s, r) => s + r.catB, 0);
    const totalC = taxRows.reduce((s, r) => s + r.catC, 0);

    const html = `<!DOCTYPE html><html><head><title>Tax & Compliance Ledger – ${dateLabel}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Segoe UI',sans-serif;font-size:11px;color:#1e293b;padding:32px 40px;background:#fff;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #7c3aed;}
  .brand{font-size:20px;font-weight:900;color:#7c3aed;letter-spacing:-0.5px;}
  .brand-sub{font-size:11px;color:#64748b;font-weight:600;margin-top:2px;}
  .ird-badge{display:inline-flex;align-items:center;gap:6px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:4px 10px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:#059669;margin-top:6px;}
  .meta{text-align:right;font-size:10px;color:#64748b;line-height:1.8;}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}
  .kpi{border-radius:10px;padding:12px 14px;border:1px solid;}
  .kpi-a{background:#eff6ff;border-color:#bfdbfe;}
  .kpi-vat{background:#f5f3ff;border-color:#ddd6fe;}
  .kpi-b{background:#ecfdf5;border-color:#a7f3d0;}
  .kpi-c{background:#fff1f2;border-color:#fecdd3;}
  .kpi-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:4px;}
  .kpi-value{font-size:15px;font-weight:900;}
  .section-title{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.1em;color:#7c3aed;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;}
  table{width:100%;border-collapse:collapse;}
  thead tr{background:#7c3aed;color:#fff;}
  thead th{padding:8px 10px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;text-align:left;}
  thead th:nth-child(n+3){text-align:right;}
  tbody tr.even{background:#f8fafc;}
  tbody tr.odd{background:#fff;}
  tbody td{padding:7px 10px;font-size:10px;border-bottom:1px solid #f1f5f9;color:#374151;}
  .total-row{background:#f5f3ff!important;font-weight:900;}
  .footer{margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:9px;color:#94a3b8;}
</style></head><body>
<div class="header">
  <div>
    <div class="brand">Futura Hardware POS</div>
    <div class="brand-sub">Tax & Compliance Ledger — ${dateLabel}</div>
    <div class="ird-badge">✓ IRD Compliant Format</div>
  </div>
  <div class="meta">
    <div><strong>Generated:</strong> ${format(new Date(), 'MMM d, yyyy — h:mm a')}</div>
    <div><strong>Period:</strong> ${dateLabel}</div>
    <div><strong>VAT Rate:</strong> 18% (Sri Lanka IRD)</div>
  </div>
</div>
<div class="kpi-grid">
  <div class="kpi kpi-a"><div class="kpi-label">Taxable Sales (Cat A)</div><div class="kpi-value" style="color:#2563eb">Rs.${totalA.toLocaleString('en-LK',{minimumFractionDigits:2})}</div></div>
  <div class="kpi kpi-vat"><div class="kpi-label">VAT Collected</div><div class="kpi-value" style="color:#9333ea">Rs.${totalVATCalc.toLocaleString('en-LK',{minimumFractionDigits:2})}</div></div>
  <div class="kpi kpi-b"><div class="kpi-label">Non-Taxable (Cat B)</div><div class="kpi-value" style="color:#059669">Rs.${totalB.toLocaleString('en-LK',{minimumFractionDigits:2})}</div></div>
  <div class="kpi kpi-c"><div class="kpi-label">Labour / Services (Cat C)</div><div class="kpi-value" style="color:#dc2626">Rs.${totalC.toLocaleString('en-LK',{minimumFractionDigits:2})}</div></div>
</div>
<div class="section-title">Daily Tax Compilation (${taxRows.length} days)</div>
<table>
  <thead><tr>
    <th>Date</th><th>Log ID</th>
    <th style="text-align:right">Cat A Net (ex-VAT)</th>
    <th style="text-align:right">VAT (18%)</th>
    <th style="text-align:right">Cat A Gross</th>
    <th style="text-align:right">Cat B</th>
    <th style="text-align:right">Cat C</th>
  </tr></thead>
  <tbody>
    ${rowsHtml}
    <tr class="total-row">
      <td colspan="2"><strong>PERIOD TOTALS</strong></td>
      <td style="text-align:right"><strong>Rs.${(totalA - totalVATCalc).toLocaleString('en-LK',{minimumFractionDigits:2})}</strong></td>
      <td style="text-align:right;color:#9333ea"><strong>Rs.${totalVATCalc.toLocaleString('en-LK',{minimumFractionDigits:2})}</strong></td>
      <td style="text-align:right"><strong>Rs.${totalA.toLocaleString('en-LK',{minimumFractionDigits:2})}</strong></td>
      <td style="text-align:right"><strong>Rs.${totalB.toLocaleString('en-LK',{minimumFractionDigits:2})}</strong></td>
      <td style="text-align:right"><strong>Rs.${totalC.toLocaleString('en-LK',{minimumFractionDigits:2})}</strong></td>
    </tr>
  </tbody>
</table>
<div class="footer">
  <span>Futura Hardware POS — IRD Compliant Tax Report</span>
  <span>Sri Lanka VAT @ 18% — Generated by Futura POS Analytics Engine</span>
</div>
</body></html>`;

    const win = window.open('', '_blank');
    if (!win) { alert('Please allow popups for PDF export.'); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 400);
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
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight">
                Tax & Compliance Ledger
              </h1>
              <div className="bg-[#ecfdf5] border border-green-100 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span className="text-[11px] font-black text-[#059669] uppercase tracking-widest">IRD Compliant Format</span>
              </div>
            </div>
            <p className="text-[14px] font-medium text-gray-500">
              Daily compilation of Category A (Taxable 18% VAT), Category B (Non-Tax), and Category C (Labour / Services).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker */}
            <div className="relative" ref={calRef}>
              <button
                onClick={() => setCalOpen(o => !o)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-[12px] px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4 text-purple-500" />
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
                      className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-[12px] font-bold hover:bg-purple-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={refresh}
              className="h-10 w-10 rounded-[12px] border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-purple-600 shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 bg-[#8b5cf6] text-white rounded-[12px] px-6 py-2.5 shadow-sm hover:bg-purple-600 transition-colors text-[13px] font-black tracking-wide">
                  <Download className="w-4 h-4" /> Export Ledger
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[180px] z-[100] animate-in fade-in zoom-in-95">
                  <DropdownMenu.Item onClick={handleExportPDF} className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 outline-none rounded-lg transition-colors">
                    <FileText className="w-4 h-4 text-red-500" /> Download PDF
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={handleExportCSV} className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 outline-none rounded-lg transition-colors">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Download CSV
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* ── KPI STRIP ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-t-4 border-[#2563eb] rounded-[16px] p-5 shadow-sm">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Taxable Sales (Cat A)</span>
            <span className="text-[22px] font-black tracking-tight text-[#2563eb] block">
              {loading ? '…' : `Rs. ${ytdCatA.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-[11px] text-gray-400 font-medium mt-1 block">18% VAT applicable</span>
          </div>
          <div className="bg-white border-t-4 border-[#9333ea] rounded-[16px] p-5 shadow-sm">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1 block">VAT Collected</span>
            <span className="text-[22px] font-black tracking-tight text-[#9333ea] block">
              {loading ? '…' : `Rs. ${ytdVAT.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-[11px] text-gray-400 font-medium mt-1 block">Remittable to IRD</span>
          </div>
          <div className="bg-white border-t-4 border-[#059669] rounded-[16px] p-5 shadow-sm">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Non-Taxable (Cat B)</span>
            <span className="text-[22px] font-black tracking-tight text-[#059669] block">
              {loading ? '…' : `Rs. ${ytdCatB.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-[11px] text-gray-400 font-medium mt-1 block">VAT exempt sales</span>
          </div>
          <div className="bg-white border-t-4 border-[#dc2626] rounded-[16px] p-5 shadow-sm">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Labour / Services (Cat C)</span>
            <span className="text-[22px] font-black tracking-tight text-[#dc2626] block">
              {loading ? '…' : `Rs. ${ytdCatC.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-[11px] text-gray-400 font-medium mt-1 block">Expenses & labour</span>
          </div>
        </div>

        {/* ── DATA TABLE ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">

          {/* Table header info bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-purple-50/40">
            <div>
              <span className="text-[14px] font-black text-gray-900">Daily Tax Compilation</span>
              <span className="ml-3 text-[12px] font-bold text-gray-400">
                {loading ? 'Loading…' : `${taxRows.length} day${taxRows.length !== 1 ? 's' : ''} — ${dateLabel}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[11px] font-black text-green-600 uppercase tracking-widest">IRD Compliant</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-6 px-6 py-4">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse flex-1" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Log ID</th>
                    <th className="py-4 px-6 text-[11px] font-black text-blue-500 uppercase tracking-widest text-right">Cat A Net (ex-VAT)</th>
                    <th className="py-4 px-6 text-[11px] font-black text-purple-500 uppercase tracking-widest text-right">VAT (18%)</th>
                    <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Cat A Gross</th>
                    <th className="py-4 px-6 text-[11px] font-black text-green-500 uppercase tracking-widest text-right">Cat B (Non-Tax)</th>
                    <th className="py-4 px-6 text-[11px] font-black text-red-400 uppercase tracking-widest text-right">Cat C (Labour)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ShieldCheck className="w-10 h-10 text-gray-200" />
                          <p className="text-[14px] font-semibold text-gray-400">No tax data for this period.</p>
                          <p className="text-[12px] text-gray-400">Try selecting a different date range.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paged.map((row, i) => {
                      const vatAmt  = Math.round(row.catA - (row.catA / (1 + VAT_RATE)));
                      const catANet = row.catA - vatAmt;
                      const logId   = `TX-${row.date.replace(/-/g, '')}-${String((currentPage - 1) * PAGE_SIZE + i + 1).padStart(3, '0')}`;
                      return (
                        <tr key={row.date + i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6 text-[13.5px] font-bold text-gray-900">{row.date}</td>
                          <td className="py-4 px-6 text-[12px] font-bold text-gray-500 font-mono tracking-tight">{logId}</td>
                          <td className="py-4 px-6 text-[13px] font-semibold text-blue-700 font-mono text-right">
                            {row.catA > 0 ? `Rs. ${catANet.toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td className="py-4 px-6 text-[13px] font-black text-purple-600 font-mono text-right">
                            {vatAmt > 0 ? `Rs. ${vatAmt.toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td className="py-4 px-6 text-[14px] font-black text-gray-900 font-mono text-right">
                            {row.catA > 0 ? `Rs. ${row.catA.toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td className="py-4 px-6 text-[13px] font-semibold text-green-700 font-mono text-right">
                            {row.catB > 0 ? `Rs. ${row.catB.toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                          <td className="py-4 px-6 text-[13px] font-semibold text-red-500 font-mono text-right">
                            {row.catC > 0 ? `Rs. ${row.catC.toLocaleString('en-LK', { minimumFractionDigits: 2 })}` : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* Totals row */}
                {paged.length > 0 && (
                  <tfoot>
                    <tr className="bg-purple-50/60 border-t-2 border-purple-200">
                      <td colSpan={2} className="py-4 px-6 text-[12px] font-black text-gray-700 uppercase tracking-widest">
                        Period Total
                      </td>
                      <td className="py-4 px-6 text-[13px] font-black text-blue-700 font-mono text-right">
                        Rs. {taxRows.reduce((s, r) => s + (r.catA - Math.round(r.catA - (r.catA / (1 + VAT_RATE)))), 0)
                          .toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-[13px] font-black text-purple-600 font-mono text-right">
                        Rs. {taxRows.reduce((s, r) => s + Math.round(r.catA - (r.catA / (1 + VAT_RATE))), 0)
                          .toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-[13px] font-black text-gray-900 font-mono text-right">
                        Rs. {taxRows.reduce((s, r) => s + r.catA, 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-[13px] font-black text-green-700 font-mono text-right">
                        Rs. {taxRows.reduce((s, r) => s + r.catB, 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-[13px] font-black text-red-500 font-mono text-right">
                        Rs. {taxRows.reduce((s, r) => s + r.catC, 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>

          {/* Footer / Pagination */}
          <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/50">
            <span className="text-[12px] font-bold text-gray-500">
              {loading
                ? 'Loading compliance data…'
                : `Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, taxRows.length)}–${Math.min(currentPage * PAGE_SIZE, taxRows.length)} of ${taxRows.length} daily log${taxRows.length !== 1 ? 's' : ''} for ${dateLabel}`
              }
            </span>
            {totalPages > 1 && (
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
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${currentPage === p ? 'bg-[#8b5cf6] text-white' : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-600'}`}
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
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
