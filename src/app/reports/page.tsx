'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Download, 
  FileText,
  BarChart2,
  Boxes,
  Coins,
  ShieldCheck,
  ChevronDown,
  X,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import { useSalesData } from '@/hooks/useSales';
import { shopApi } from '@/api/shop';

// Modals from previous implementation
import CategoryAReportModal from '@/components/sales/CategoryAReportModal';
import CategoryBReportModal from '@/components/sales/CategoryBReportModal';
import CategoryCReportModal from '@/components/sales/CategoryCReportModal';
import CategoryPrintView from '@/components/sales/CategoryPrintView';

// New Components
import ReportStatCard from '@/components/reports/ReportStatCard';
import ReportCategoryCard from '@/components/reports/ReportCategoryCard';
import RevenueTrendChart from '@/components/reports/RevenueTrendChart';
import TaxBreakdownChart from '@/components/reports/TaxBreakdownChart';
import AllTransactionsTable from '@/components/reports/AllTransactionsTable';

export default function ReportsPage() {
  const router = useRouter();
  // Enable all reports cards navigation as requested by the user
  const enableAllReports = true;

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
     from: new Date(),
     to: new Date()
  });
  const [reportModal, setReportModal]     = useState<null | 'A' | 'B' | 'C'>(null);
  const [printCategory, setPrintCategory] = useState<null | 'A' | 'B' | 'C'>(null);
  const [printTimeFilter, setPrintTimeFilter] = useState('Last 24 Hours');
  const [shopProfile, setShopProfile]     = useState<any>(null);

  const { data, loading } = useSalesData(dateRange);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await shopApi.getProfile();
        setShopProfile(profile);
      } catch (err) {
        console.error('Failed to load shop profile for reports export:', err);
      }
    };
    fetchProfile();
  }, []);

  // ── Export All dropdown ────────────────────────────────────────
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dateLabel = dateRange?.from
    ? `${format(dateRange.from, 'MMM d yyyy')}${dateRange.to ? ` - ${format(dateRange.to, 'MMM d yyyy')}` : ''}`
    : 'All Dates';

  // Build flat transaction rows (same logic as AllTransactionsTable)
  function getAllRows() {
    const catA = (data?.catA?.allTxns ?? []).map((t: any) => ({ ...t, category: 'Cat A (Taxable)' }));
    const catB = (data?.catB?.allTxns ?? []).map((t: any) => ({ ...t, category: 'Cat B (Non-Tax)' }));
    const seen = new Set<string>();
    const merged: any[] = [];
    for (const r of [...catA, ...catB]) {
      if (!seen.has(r.id)) { seen.add(r.id); merged.push(r); }
    }
    return merged;
  }

  const exportCsv = () => {
    const rows = getAllRows();
    const headers = ['Invoice #', 'Time', 'Mode', 'Category', 'Amount (Rs.)'];
    const csvRows = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.id}"`,
        `"${r.time ?? ''}"`  ,
        `"${r.mode ?? ''}"`  ,
        `"${r.category}"`,
        r.rawAmount ?? r.amount,
      ].join(',')),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `reports-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const exportPdf = async () => {
    let currentProfile = shopProfile;
    if (!currentProfile) {
      try {
        currentProfile = await shopApi.getProfile();
        setShopProfile(currentProfile);
      } catch (e) {
        console.error('Could not fetch shop profile', e);
      }
    }

    const shopName = currentProfile?.name || 'Futura Hardware POS';
    const addressParts = [
      currentProfile?.address,
      currentProfile?.city,
      currentProfile?.district,
      currentProfile?.province
    ].filter(Boolean);
    const shopAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Sri Lanka';
    const phone = currentProfile?.phone ? `Tel: ${currentProfile.phone}` : '';
    const email = currentProfile?.email ? `Email: ${currentProfile.email}` : '';
    const regNum = currentProfile?.businessRegistration ? `Reg/TRN: ${currentProfile.businessRegistration}` : '';
    const contactLine = [phone, email, regNum].filter(Boolean).join(' | ');

    const rows = getAllRows();
    const catATotal    = data.catA?.core     || 0;
    const catBTotal    = data.catB?.core     || 0;
    const catCTotal    = data.catC?.core     || 0;
    const vatAmt       = data.catA?.vat      || 0;
    const catANet      = catATotal - vatAmt;           // Net ex-VAT
    const totalRevenue = (data.summary?.totalSales || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 });
    const grossProfit  = (data.summary?.netProfit  || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 });
    const vatCollected = vatAmt.toLocaleString('en-LK', { minimumFractionDigits: 2 });
    const txnCount     = (data.catA?.txns || 0) + (data.catB?.txns || 0);
    const margin       = data.summary?.totalSales > 0
      ? Math.round(((data.summary?.netProfit || 0) / data.summary.totalSales) * 100)
      : 0;

    const rowsHtml = rows.length === 0 ? `
      <tr>
        <td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">No transaction records found for the selected period.</td>
      </tr>
    ` : rows.map((r, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td><strong>${r.id}</strong></td>
        <td>${r.time ?? ''}</td>
        <td>${r.mode ?? ''}</td>
        <td>${r.category}</td>
        <td style="text-align:right;font-weight:700;">Rs. ${(r.rawAmount ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
      </tr>`).join('');

    const generatedTimeStr = format(new Date(), 'MMM d, yyyy — h:mm a');

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${shopName} — Business Analytics & Financial Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page {
    size: A4 portrait;
    margin: 0 !important;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 9.5pt;
    color: #0f172a;
    background: #ffffff;
    padding: 36pt 40pt;
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .header {
    border-bottom: 6px solid #1e3a8a;
    padding-bottom: 18pt;
    margin-bottom: 18pt;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .brand-logo { max-height: 45px; width: auto; margin-bottom: 6px; }
  .brand-title { font-size: 34pt; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; line-height: 0.9; text-transform: uppercase; }
  .brand-sub { font-size: 13pt; font-weight: 900; color: #1d4ed8; letter-spacing: -0.5px; text-transform: uppercase; margin-bottom: 8pt; margin-top: 2pt; }
  .brand-info { font-size: 8pt; color: #64748b; line-height: 1.5; font-weight: 600; }
  .meta-container { text-align: right; }
  .report-badge {
    display: inline-block;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 3pt 10pt;
    font-size: 7.5pt;
    font-weight: 900;
    color: #1d4ed8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 6pt;
  }
  .period-heading { font-size: 7.5pt; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
  .period-value { font-size: 15pt; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; margin: 2pt 0; }
  .gen-date { font-size: 7.5pt; color: #94a3b8; font-weight: 600; }
  .ref-id { font-size: 7pt; color: #94a3b8; font-weight: 800; margin-top: 2pt; letter-spacing: 0.5px; }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 8pt;
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 4pt;
    margin-bottom: 10pt;
    margin-top: 16pt;
  }
  .section-dot { width: 9px; height: 9px; background: #1e3a8a; border-radius: 50%; display: inline-block; }
  .section-title { font-size: 10.5pt; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: -0.3px; }

  .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8pt; margin-bottom: 16pt; }
  .kpi-card {
    border-radius: 10px;
    padding: 10pt 12pt;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 75pt;
  }
  .kpi-card.dark { background: #1e3a8a; color: #ffffff; }
  .kpi-card.light { background: #f8fafc; border: 1.5px solid #e2e8f0; }
  .kpi-card.amber { background: #fffbeb; border: 1.5px solid #fde68a; }
  .kpi-card.purple { background: #fdf4ff; border: 1.5px solid #e9d5ff; }
  .kpi-card.green { background: #f0fdf4; border: 1.5px solid #bbf7d0; }

  .kpi-label { font-size: 7pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi-card.dark .kpi-label { opacity: 0.65; }
  .kpi-card.light .kpi-label { color: #1e3a8a; opacity: 0.65; }
  .kpi-card.amber .kpi-label { color: #78350f; opacity: 0.65; }
  .kpi-card.purple .kpi-label { color: #581c87; opacity: 0.65; }
  .kpi-card.green .kpi-label { color: #14532d; opacity: 0.65; }

  .kpi-value { font-size: 15pt; font-weight: 900; letter-spacing: -0.5px; line-height: 1; margin-top: 4pt; }
  .kpi-card.dark .kpi-value { color: #ffffff; }
  .kpi-card.light .kpi-value { color: #1e3a8a; }
  .kpi-card.amber .kpi-value { color: #b45309; }
  .kpi-card.purple .kpi-value { color: #7c3aed; }
  .kpi-card.green .kpi-value { color: #059669; }

  .kpi-sub { font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 2pt; }
  .kpi-card.dark .kpi-sub { opacity: 0.55; }
  .kpi-card.light .kpi-sub { color: #3b82f6; }
  .kpi-card.amber .kpi-sub { color: #d97706; }
  .kpi-card.purple .kpi-sub { color: #9333ea; }
  .kpi-card.green .kpi-sub { color: #10b981; }

  .tax-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10pt; margin-bottom: 16pt; }
  .tax-card { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 12pt 14pt; }
  .tax-title { font-size: 8pt; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4pt; }
  .tax-amount { font-size: 18pt; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
  .tax-sub { font-size: 7.5pt; color: #64748b; font-weight: 600; margin-top: 3pt; }

  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 12pt; }
  thead tr { background: #f1f5f9; border-bottom: 1.5px solid #cbd5e1; }
  th {
    padding: 6pt 8pt;
    font-size: 7pt;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
    text-align: left;
    white-space: nowrap;
  }
  th.right { text-align: right; }
  th.center { text-align: center; }
  td { padding: 5pt 8pt; border-bottom: 1px solid #f1f5f9; color: #334155; }
  td.right { text-align: right; }
  td.center { text-align: center; }
  tr.even { background: #ffffff; }
  tr.odd { background: #f8fafc; }
  .badge-mode { display: inline-block; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 4px; padding: 1pt 5pt; font-size: 7pt; font-weight: 800; text-transform: uppercase; }

  .grand-banner {
    background: #1e3a8a;
    border-radius: 10px;
    padding: 10pt 16pt;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12pt;
    margin-bottom: 20pt;
    color: #ffffff;
  }
  .grand-title { font-size: 9.5pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
  .grand-value { font-size: 16pt; font-weight: 900; letter-spacing: -0.5px; }

  .footer-grid {
    border-top: 1px solid #e2e8f0;
    padding-top: 16pt;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30pt;
    margin-top: 20pt;
    page-break-inside: avoid;
  }
  .statement-title { font-size: 7.5pt; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4pt; }
  .statement-body { font-size: 7.5pt; color: #94a3b8; line-height: 1.6; font-style: italic; border-left: 3px solid #bfdbfe; padding-left: 8pt; }
  .sig-container { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; }
  .signatures { display: flex; gap: 28pt; }
  .sig-block { text-align: center; }
  .sig-line { width: 110px; border-bottom: 1px solid #cbd5e1; margin-bottom: 4pt; }
  .sig-label { font-size: 7pt; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #cbd5e1; }
  .copyright { font-size: 7.5pt; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 10pt; }

  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div>
    ${currentProfile?.logo_url ? `<img src="${currentProfile.logo_url}" alt="Logo" class="brand-logo" />` : ''}
    <div class="brand-title">Futura</div>
    <div class="brand-sub">Hardware &amp; Solutions</div>
    <div class="brand-info">
      <div>${shopAddress}</div>
      <div>${contactLine || 'TIN: 12345678-0000 | VAT REG: 22334455'}</div>
    </div>
  </div>
  <div class="meta-container">
    <div class="report-badge">Business Analytics &amp; Financial Report</div>
    <div class="period-heading">Reporting Period</div>
    <div class="period-value">${dateLabel}</div>
    <div class="gen-date">Generated: ${generatedTimeStr}</div>
    <div class="ref-id">REF: FIN-${format(new Date(), 'yyyyMMdd')}-X</div>
  </div>
</div>

<!-- PERFORMANCE SUMMARY CARDS -->
<div class="section-heading">
  <span class="section-dot"></span>
  <span class="section-title">Financial Performance Summary</span>
</div>
<div class="kpi-grid">
  <div class="kpi-card dark">
    <div class="kpi-label">Total Revenue</div>
    <div>
      <div class="kpi-value">Rs. ${totalRevenue}</div>
      <div class="kpi-sub">All Categories</div>
    </div>
  </div>
  <div class="kpi-card green">
    <div class="kpi-label">Gross Profit</div>
    <div>
      <div class="kpi-value">Rs. ${grossProfit}</div>
      <div class="kpi-sub">${margin}% Margin</div>
    </div>
  </div>
  <div class="kpi-card amber">
    <div class="kpi-label">Credit Sales</div>
    <div>
      <div class="kpi-value">Rs. ${(data.creditSummary?.creditSalesTotal || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
      <div class="kpi-sub">${data.creditSummary?.creditTxnCount || 0} Credit Txns</div>
    </div>
  </div>
  <div class="kpi-card light">
    <div class="kpi-label">Transactions</div>
    <div>
      <div class="kpi-value">${txnCount}</div>
      <div class="kpi-sub">Active Invoices</div>
    </div>
  </div>
  <div class="kpi-card purple">
    <div class="kpi-label">VAT Collected</div>
    <div>
      <div class="kpi-value">Rs. ${vatCollected}</div>
      <div class="kpi-sub">IRD Remittable (18%)</div>
    </div>
  </div>
</div>

<!-- TAX CATEGORY BREAKDOWN -->
<div class="section-heading">
  <span class="section-dot"></span>
  <span class="section-title">Tax Category Breakdown (Sri Lanka Standard)</span>
</div>
<div class="tax-grid">
  <div class="tax-card">
    <div class="tax-title">Category A — Taxable (18% VAT)</div>
    <div class="tax-amount">Rs. ${catATotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
    <div class="tax-sub">Net ex-VAT: Rs. ${catANet.toLocaleString('en-LK', { minimumFractionDigits: 2 })} &nbsp;|&nbsp; VAT: Rs. ${vatAmt.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
  </div>
  <div class="tax-card">
    <div class="tax-title">Category B — Non-Taxable &amp; Overflow</div>
    <div class="tax-amount">Rs. ${catBTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
    <div class="tax-sub">${data.catB?.txns || 0} overflow txns &nbsp;|&nbsp; ${data.catB?.items || 0} exempt items</div>
  </div>
  <div class="tax-card">
    <div class="tax-title">Category C — Labour &amp; Services</div>
    <div class="tax-amount">Rs. ${catCTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
    <div class="tax-sub">${data.catC?.entries || 0} man-hour &amp; service entries</div>
  </div>
</div>

<!-- ALL TRANSACTIONS LEDGER TABLE -->
<div class="section-heading">
  <span class="section-dot"></span>
  <span class="section-title">All Transactions Ledger (${rows.length} records)</span>
</div>
<table>
  <colgroup>
    <col style="width: 22%" />
    <col style="width: 18%" />
    <col style="width: 15%" />
    <col style="width: 25%" />
    <col style="width: 20%" />
  </colgroup>
  <thead>
    <tr>
      <th>Invoice #</th>
      <th>Time</th>
      <th>Mode</th>
      <th>Category</th>
      <th class="right">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${rows.length === 0 ? `
      <tr>
        <td colspan="5" style="text-align:center;padding:16px;color:#94a3b8;font-weight:600;">No transaction records found for the selected period.</td>
      </tr>
    ` : rows.map((r, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td style="font-weight: 700; font-family: monospace; color: #0f172a;">${r.id}</td>
        <td style="color: #64748b;">${r.time ?? '—'}</td>
        <td><span class="badge-mode">${r.mode ?? 'CASH'}</span></td>
        <td style="font-weight: 600; color: #334155;">${r.category}</td>
        <td class="right" style="font-weight: 900; color: #1e3a8a; font-family: monospace;">Rs. ${(r.rawAmount ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('')}
  </tbody>
</table>

<!-- GRAND TOTAL BANNER -->
<div class="grand-banner">
  <div class="grand-title">Total Audited Period Revenue</div>
  <div class="grand-value">Rs. ${totalRevenue}</div>
</div>

<!-- FOOTER -->
<div class="footer-grid">
  <div>
    <div class="statement-title">Financial Accountability Statement</div>
    <div class="statement-body">
      This automated fiscal output is generated by the Futura Hardware Core Management Engine. Figures reflect closed accounts for the specified period. Approved for Internal Audit and IRD Tier-2 Declaration.
    </div>
  </div>
  <div class="sig-container">
    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Auditor Signature</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-label">Finance Approval</div>
      </div>
    </div>
    <div class="copyright">
      Futura Hardware Solutions &copy; ${new Date().getFullYear()}
    </div>
  </div>
</div>

</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 400);
    setExportOpen(false);
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20 print:hidden">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[32px] md:text-[36px] font-black text-gray-900 tracking-tighter leading-tight mb-2">
              Reports & Analytics
            </h1>
            <p className="text-[14px] font-medium text-gray-500 tracking-wide">
              Comprehensive business insights, tax reports, and performance analytics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-[12px] px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors min-w-[200px]">
                   <div className="flex items-center gap-2.5">
                     <Calendar className="w-4 h-4 text-gray-500" />
                     <span className="text-[13px] font-bold text-gray-700">
                       {dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : 'Select Date...'}
                     </span>
                   </div>
                   <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                   className="bg-white p-7 rounded-[32px] shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in duration-300 w-[380px] print:hidden"
                   sideOffset={12}
                   align="end"
                >
                   <div className="flex flex-col min-h-[460px]">
                      <div className="flex justify-between items-center mb-6 pl-2">
                         <h4 className="text-[17px] font-black text-blue-900 tracking-tight">Select Time Period</h4>
                         <Popover.Close className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all">
                            <X className="w-5 h-5" />
                         </Popover.Close>
                      </div>
                      <div className="flex-1 py-2">
                        <SalesDatePicker
                           dateRange={dateRange}
                           onSelect={setDateRange}
                        />
                      </div>
                      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between pl-1">
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">Selected Range</span>
                            <div className="text-[13px] font-black text-blue-700 flex items-center gap-2">
                               {dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : '---'}
                               {dateRange?.to && (
                                  <>
                                     <span className="text-gray-300 font-light">—</span>
                                     {format(dateRange.to, 'MMM d, yyyy')}
                                  </>
                               )}
                            </div>
                         </div>
                         <Popover.Close asChild>
                            <button className="bg-blue-900 hover:bg-blue-800 text-white px-7 py-3 rounded-2xl font-black text-[13px] shadow-lg shadow-blue-100 transition-all active:scale-95">
                               Apply
                            </button>
                         </Popover.Close>
                      </div>
                   </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>



            {/* Export All Dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setExportOpen(o => !o)}
                className="flex items-center gap-2 bg-[#1e40af] text-white rounded-[12px] px-5 py-2.5 shadow-sm hover:bg-blue-800 transition-colors text-[13px] font-black tracking-wide"
              >
                <Download className="w-4 h-4" />
                Export All
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${exportOpen ? 'rotate-180' : ''}`} />
              </button>

              {exportOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2">
                    <button
                      onClick={exportPdf}
                      disabled={!enableAllReports}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <Printer className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-800">Export as PDF</div>
                        <div className="text-[11px] text-gray-400">Full structured report</div>
                      </div>
                    </button>
                    <button
                      onClick={exportCsv}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-800">Export as CSV</div>
                        <div className="text-[11px] text-gray-400">Raw data spreadsheet</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5 TOP KPI CARDS INCLUDING CREDIT MANAGEMENT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <ReportStatCard 
             title="Total Revenue"
             value={loading ? '...' : `Rs. ${(data.summary.totalSales || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
             icon={<div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><Coins className="w-5 h-5 text-white" /></div>}
             variant="blue"
             trendText={`${(data.catA?.txns || 0) + (data.catB?.txns || 0)} transactions`}
          />
          <ReportStatCard 
             title="Gross Profit"
             value={loading ? '...' : `Rs. ${(data.summary.netProfit || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
             icon={<div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><BarChart2 className="w-5 h-5 text-white" /></div>}
             variant="green"
             marginText={`${data.summary.totalSales > 0 ? Math.round(((data.summary.netProfit || 0) / data.summary.totalSales) * 100) : 0}% margin`}
          />
          <ReportStatCard 
             title="Credit Sales"
             value={loading ? '...' : `Rs. ${(data.creditSummary?.creditSalesTotal || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
             icon={<div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-amber-700" /></div>}
             variant="white"
             trendText={`${data.creditSummary?.creditTxnCount || 0} credit txns • Bal: Rs. ${(data.creditSummary?.totalOutstandingCredit || 0).toLocaleString('en-LK')}`}
          />
          <ReportStatCard 
             title="Transactions"
             value={loading ? '...' : (data.catA.txns + data.catB.txns).toLocaleString()}
             icon={<div className="w-9 h-9 rounded-xl bg-[#fef08a] flex items-center justify-center"><FileText className="w-5 h-5 text-[#854d0e]" /></div>}
             variant="white"
             trendText={`Cat A: ${data.catA?.txns || 0}  •  Cat B: ${data.catB?.txns || 0}`}
          />
          <ReportStatCard 
             title="VAT Collected"
             value={loading ? '...' : `Rs. ${(data.catA.vat || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`}
             icon={<div className="w-9 h-9 rounded-xl bg-[#f3e8ff] flex items-center justify-center"><FileText className="w-5 h-5 text-[#9333ea]" /></div>}
             variant="white"
             badge="IRD Compliant"
          />
        </div>

        {/* 3 CATEGORY CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
          <ReportCategoryCard 
            title="Sales Reports"
            description="Daily, weekly, and monthly sales summaries, product performance, and cashier reports"
            icon={<BarChart2 className="w-7 h-7 text-white" />}
            iconBgClass="bg-[#2563eb]"
            badge={{ text: "8 Reports", colorClass: "bg-[#eff6ff] text-[#2563eb]" }}
            reports={["Daily Sales Summary", "Sales by Product", "Sales by Cashier"]}
            href="/reports/sales"
            buttonText="View All Sales Reports"
            buttonColorClass="bg-[#1e40af] hover:bg-blue-800"
            disabled={!enableAllReports}
          />
          <ReportCategoryCard 
            title="Tax & Compliance"
            description="IRD tax compliance reports, VAT summaries, Category A/B/C breakdowns for Sri Lanka"
            icon={<FileText className="w-7 h-7 text-white" />}
            iconBgClass="bg-[#8b5cf6]"
            badge={{ text: "6 Reports", colorClass: "bg-[#f3e8ff] text-[#9333ea]" }}
            cardContext={
               <div className="bg-[#ecfdf5] border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2 max-w-max">
                 <ShieldCheck className="w-4 h-4 text-[#059669]" />
                 <span className="text-[11px] font-black text-[#059669] uppercase tracking-widest">IRD Compliant Format</span>
               </div>
            }
            reports={["Category A Report", "Monthly VAT Summary"]}
            onReportClick={(r) => { 
                if(r === 'Category A Report') setReportModal('A');
            }}
            href="/reports/tax"
            buttonText="View All Tax Reports"
            buttonColorClass="bg-[#8b5cf6] hover:bg-purple-600"
            disabled={!enableAllReports}
          />
          <ReportCategoryCard 
            title="Inventory Reports"
            description="Stock levels, movement history, valuation, low stock alerts, and reorder analysis"
            icon={<Boxes className="w-7 h-7 text-white" />}
            iconBgClass="bg-[#059669]"
            badge={{ text: "7 Reports", colorClass: "bg-[#ecfdf5] text-[#059669]" }}
            reports={["Current Stock Overview", "Low Stock Report", "Inventory Valuation"]}
            href="/reports/inventory"
            buttonText="View All Inventory Reports"
            buttonColorClass="bg-[#059669] hover:bg-green-700"
          />
        </div>

        {/* CHARTS SECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-0 mb-8">
          <RevenueTrendChart />
          <TaxBreakdownChart salesData={data} loading={loading} />
        </div>

        {/* ALL TRANSACTIONS LEDGER */}
        <div className="relative z-0">
          <AllTransactionsTable dateRange={dateRange} />
        </div>
      </div>

      {/* KEEP EXISTING CATEGORY MODALS FOR TAX SECTION BUTTONS */}
      <CategoryAReportModal
         isOpen={reportModal === 'A'}
         onClose={() => setReportModal(null)}
         onPrintPDF={(timeFilter) => { setPrintCategory('A'); setPrintTimeFilter(timeFilter); setTimeout(() => { window.print(); setPrintCategory(null); }, 100); }}
         data={data}
      />
      <CategoryBReportModal
         isOpen={reportModal === 'B'}
         onClose={() => setReportModal(null)}
         onPrintPDF={(timeFilter) => { setPrintCategory('B'); setPrintTimeFilter(timeFilter); setTimeout(() => { window.print(); setPrintCategory(null); }, 100); }}
         data={data}
      />
      <CategoryCReportModal
         isOpen={reportModal === 'C'}
         onClose={() => setReportModal(null)}
         onPrintPDF={(timeFilter) => { setPrintCategory('C'); setPrintTimeFilter(timeFilter); setTimeout(() => { window.print(); setPrintCategory(null); }, 100); }}
         data={data}
      />

      {/* PER-CATEGORY PRINT VIEW */}
      <CategoryPrintView
         category={printCategory}
         dateRange={dateRange}
         timeFilter={printTimeFilter}
         data={data}
      />
    </MainLayout>
  );
}
