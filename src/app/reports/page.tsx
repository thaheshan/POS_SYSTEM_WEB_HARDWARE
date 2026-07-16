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
  const enableAllReports = process.env.NEXT_PUBLIC_ENABLE_ALL_PDF_REPORTS === 'true';

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
     from: new Date(),
     to: new Date()
  });
  const [reportModal, setReportModal]     = useState<null | 'A' | 'B' | 'C'>(null);
  const [printCategory, setPrintCategory] = useState<null | 'A' | 'B' | 'C'>(null);
  const [printTimeFilter, setPrintTimeFilter] = useState('Last 24 Hours');

  const { data, loading } = useSalesData(dateRange);

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

  const exportPdf = () => {
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

    const rowsHtml = rows.map((r, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td>${r.id}</td>
        <td>${r.time ?? ''}</td>
        <td>${r.mode ?? ''}</td>
        <td>${r.category}</td>
        <td style="text-align:right;font-weight:700;">Rs. ${(r.rawAmount ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
      </tr>`).join('');

    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Business Analytics Report — ${dateLabel}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#1e293b;background:#fff;padding:32px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1e40af;padding-bottom:18px;margin-bottom:24px;}
  .brand{font-size:22px;font-weight:900;color:#1e40af;letter-spacing:-1px;}  
  .brand-sub{font-size:11px;color:#64748b;font-weight:500;margin-top:2px;}
  .meta{text-align:right;font-size:11px;color:#64748b;line-height:1.7;}
  .meta strong{color:#1e293b;}
  .section-title{font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin:22px 0 10px;}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:10px;}
  .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;}
  .kpi-label{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;}
  .kpi-value{font-size:18px;font-weight:900;color:#1e40af;}
  .kpi-sub{font-size:10px;color:#94a3b8;margin-top:3px;}
  .kpi.green .kpi-value{color:#059669;}
  .kpi.amber .kpi-value{color:#b45309;}
  .kpi.purple .kpi-value{color:#7c3aed;}
  table{width:100%;border-collapse:collapse;margin-top:4px;}
  thead tr{background:#1e40af;color:#fff;}
  thead th{padding:9px 12px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;text-align:left;}
  thead th:last-child{text-align:right;}
  tbody tr.even{background:#f8fafc;}
  tbody tr.odd{background:#fff;}
  tbody td{padding:8px 12px;font-size:11px;border-bottom:1px solid #f1f5f9;color:#374151;}
  tbody tr:last-child td{border-bottom:none;}
  .footer{margin-top:32px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;}
  .badge{display:inline-block;background:#ecfdf5;color:#059669;border:1px solid #6ee7b7;border-radius:5px;padding:2px 8px;font-size:10px;font-weight:700;}
  @media print{body{padding:20px;}}
</style></head><body>
<div class="header">
  <div>
    <div class="brand">Futura Hardware POS</div>
    <div class="brand-sub">Business Analytics &amp; Financial Report</div>
  </div>
  <div class="meta">
    <div><strong>Report Period:</strong> ${dateLabel}</div>
    <div><strong>Generated:</strong> ${format(new Date(), 'MMM d, yyyy — h:mm a')}</div>
    <div><strong>Status:</strong> <span class="badge">IRD Compliant</span></div>
  </div>
</div>

<div class="section-title">Performance Summary</div>
<div class="kpi-grid">
  <div class="kpi">
    <div class="kpi-label">Total Revenue</div>
    <div class="kpi-value">Rs. ${totalRevenue}</div>
    <div class="kpi-sub">All categories combined</div>
  </div>
  <div class="kpi green">
    <div class="kpi-label">Gross Profit</div>
    <div class="kpi-value">Rs. ${grossProfit}</div>
    <div class="kpi-sub">${margin}% gross margin</div>
  </div>
  <div class="kpi amber">
    <div class="kpi-label">Transactions</div>
    <div class="kpi-value">${txnCount}</div>
    <div class="kpi-sub">Invoices in period</div>
  </div>
  <div class="kpi purple">
    <div class="kpi-label">VAT Collected</div>
    <div class="kpi-value">Rs. ${vatCollected}</div>
    <div class="kpi-sub">Remittable to IRD</div>
  </div>
</div>

<div class="section-title">Tax Category Breakdown</div>
<div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
  <div class="kpi">
    <div class="kpi-label">Category A — Taxable (18% VAT)</div>
    <div class="kpi-value">Rs. ${catATotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
    <div class="kpi-sub">Net (ex-VAT): Rs. ${catANet.toLocaleString('en-LK', { minimumFractionDigits: 2 })} &nbsp;|&nbsp; VAT: Rs. ${vatAmt.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
    <div class="kpi-sub">${data.catA?.txns || 0} transactions</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Category B — Non-Taxable</div>
    <div class="kpi-value">Rs. ${catBTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
    <div class="kpi-sub">${data.catB?.txns || 0} transactions</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Category C — Labour / Services</div>
    <div class="kpi-value">Rs. ${catCTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
    <div class="kpi-sub">${data.catC?.entries || 0} entries</div>
  </div>
</div>

<div class="section-title">All Transactions Ledger (${rows.length} records)</div>
<table>
  <thead><tr>
    <th>Invoice #</th><th>Time</th><th>Mode</th><th>Category</th><th style="text-align:right">Amount</th>
  </tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>

<div class="footer">
  <span>Futura Hardware POS &mdash; Confidential Business Report</span>
  <span>Page 1 &mdash; Generated by Futura POS Analytics Engine</span>
</div>
</body></html>`;

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

        {/* 4 TOP KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
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
            onButtonClick={() => router.push('/reports/sales')}
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
            onButtonClick={() => router.push('/reports/tax')}
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
            onButtonClick={() => router.push('/reports/inventory')}
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
