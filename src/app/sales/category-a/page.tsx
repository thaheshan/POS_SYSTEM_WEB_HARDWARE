"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useSalesData } from "@/hooks/useSales";
import { DateRange } from "react-day-picker";
import {
  ArrowLeft, Download, FileText, FileSpreadsheet,
  TrendingUp, Receipt, Percent, MoreVertical, Trash2, AlertCircle,
  Calendar, ChevronDown, X
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import SalesDatePicker from "@/components/sales/SalesDatePicker";
import { format } from "date-fns";
import api from "@/api/axiosInstance";
import TransactionDetailsModal from "@/components/sales/TransactionDetailsModal";

function CategoryAReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date();

  // Restore date range from query params if present
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: fromParam ? new Date(fromParam) : today,
    to: toParam ? new Date(toParam) : today,
  });

  const { data, loading, refresh } = useSalesData(dateRange);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // ── Three-dot menu & delete state ────────────────────────────────────────────
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [txnToDelete, setTxnToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const catA = data.catA;
  const threshold = 200000;
  const remaining = Math.max(0, threshold - catA.core);
  const progressPct = Math.min(100, (catA.core / threshold) * 100);

  const handleCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Category A Taxable Sales", catA.core],
      ["VAT (18%)", catA.vat],
      ["Transactions", catA.txns],
      ["Average Bill", catA.avg],
      ["Items Sold", catA.items],
      ["Remaining to Threshold", remaining],
    ].map((r) => r.join(",")).join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `category_a_report_${format(dateRange?.from || today, "yyyyMMdd")}.csv`;
    a.click();
    setShowExportMenu(false);
  };

  const dateLabel =
    dateRange?.from && dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : dateRange?.from
      ? format(dateRange.from, "MMMM d, yyyy")
      : "All Dates";

  const handlePDF = () => {
    setShowExportMenu(false);
    const txns = catA.allTxns || [];
    const rowsHtml = txns.map((t: any, i: number) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td>${t.id}</td>
        <td>${t.time}</td>
        <td>${t.mode}</td>
        <td>${t.customerName || 'Walk-in'}</td>
        <td style="text-align:right">Rs. ${Number(t.rawAmount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:right">Rs. ${Math.round((t.rawAmount || 0) * 0.18).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Category A Taxable Sales — ${dateLabel}</title>
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
  table{width:100%;border-collapse:collapse;margin-top:4px;}
  thead tr{background:#1e40af;color:#fff;}
  thead th{padding:9px 12px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;text-align:left;}
  tbody tr.even{background:#f8fafc;}
  tbody tr.odd{background:#fff;}
  tbody td{padding:8px 12px;font-size:11px;border-bottom:1px solid #f1f5f9;color:#374151;}
  .footer{margin-top:32px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;}
  .badge{display:inline-block;background:#ecfdf5;color:#059669;border:1px solid #6ee7b7;border-radius:5px;padding:2px 8px;font-size:10px;font-weight:700;}
</style></head><body>
<div class="header">
  <div>
    <div class="brand">Futura Hardware POS</div>
    <div class="brand-sub">Category A Taxable Sales Report</div>
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
    <div class="kpi-label">Total Taxable Sales</div>
    <div class="kpi-value">Rs. ${(catA.core || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">VAT Collected (18%)</div>
    <div class="kpi-value">Rs. ${(catA.vat || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Total Transactions</div>
    <div class="kpi-value">${catA.txns || 0} records</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Average Bill</div>
    <div class="kpi-value">Rs. ${(catA.avg || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}</div>
  </div>
</div>

<div class="section-title">Transactions Ledger (${txns.length} records)</div>
<table>
  <thead><tr>
    <th>Invoice #</th><th>Time</th><th>Mode</th><th>Customer</th><th style="text-align:right">Amount</th><th style="text-align:right">VAT (18%)</th>
  </tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>

<div class="footer">
  <span>Futura Hardware POS &mdash; Confidential Business Report</span>
  <span>Page 1</span>
</div>
</body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 400);
  };

  // Opens the dropdown for a row
  const toggleMenu = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setOpenMenuId(prev => (prev === key ? null : key));
  };

  // Transfers from dropdown to confirmation modal
  const openDeleteConfirm = (txn: any) => {
    setOpenMenuId(null);
    setTxnToDelete(txn);
  };

  // Actual deletion
  const confirmDelete = async () => {
    if (!txnToDelete) return;
    setIsDeleting(true);
    try {
      const id = txnToDelete.rawId || txnToDelete.id;
      await api.delete(`/sales/${id}`);
      setTxnToDelete(null);
      refresh();
    } catch (err: any) {
      console.error("[CategoryA] Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete invoice. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };



  return (
    <MainLayout>
      {/* Close any open dropdown when clicking outside */}
      <div className="max-w-[1200px] mx-auto pb-20" onClick={() => setOpenMenuId(null)}>

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/sales')}
              className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 shadow-sm transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-blue-100 text-blue-700 px-3 py-1 rounded-md">
                  Category A
                </span>
                <span className="text-[12px] font-bold text-gray-400">{dateLabel}</span>
              </div>
              <h1 className="text-[26px] font-black text-gray-900 tracking-tight">
                Taxable Sales — Detailed Report
              </h1>
              <p className="text-[13px] text-gray-400 font-medium mt-0.5">
                Sri Lanka IRD Compliant · First Rs. 200,000 daily sales
              </p>
            </div>
          </div>

          {/* Export & Date Filter */}
          <div className="flex items-center gap-3">
             <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors min-w-[200px]">
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
                   className="bg-white p-7 rounded-[32px] shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in w-[380px]"
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
                        <SalesDatePicker dateRange={dateRange} onSelect={setDateRange} />
                      </div>
                      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between pl-1">
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">Selected Range</span>
                            <div className="text-[13px] font-black text-blue-700 flex items-center gap-2">
                               {dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : '---'}
                               {dateRange?.to && (<><span className="text-gray-300 font-light">—</span>{format(dateRange.to, 'MMM d, yyyy')}</>)}
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

            <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
              className="flex items-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] shadow-sm transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 w-[185px]">
                <button onClick={handlePDF} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  <FileText className="w-4 h-4 text-red-500" /> Download PDF
                </button>
                <button onClick={handleCSV} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  <FileSpreadsheet className="w-4 h-4 text-blue-500" /> Download CSV
                </button>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* PROGRESS BANNER */}
        <div className="bg-gradient-to-r from-[#1e40af] to-[#1e3a8a] rounded-2xl p-6 mb-8 text-white shadow-xl shadow-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-1">Daily Threshold Progress</p>
              <p className="text-[28px] font-black">
                Rs. {loading ? "..." : catA.core.toLocaleString()}
                <span className="text-[16px] font-bold text-blue-300 ml-2">/ Rs. 200,000</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-1">Remaining</p>
              <p className="text-[22px] font-black text-yellow-300">Rs. {loading ? "..." : remaining.toLocaleString()}</p>
            </div>
          </div>
          <div className="w-full h-3 bg-blue-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[12px] font-bold text-blue-200 mt-2">{progressPct.toFixed(1)}% of daily taxable threshold used</p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Taxable Sales", value: `Rs. ${(catA.core || 0).toLocaleString()}`, icon: Receipt, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "VAT Collected (18%)", value: `Rs. ${(catA.vat || 0).toLocaleString()}`, icon: Percent, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Total Transactions", value: `${catA.txns || 0}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Average Bill", value: `Rs. ${(catA.avg || 0).toLocaleString()}`, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className="text-[20px] font-black text-gray-900">{loading ? "..." : kpi.value}</p>
            </div>
          ))}
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h3 className="text-[16px] font-black text-gray-900">Category A Transactions</h3>
            <span className="text-[12px] font-bold text-gray-400">{catA.txns || 0} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">VAT</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</th>
                  <th className="py-3 px-6 w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="py-4 px-6">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : (catA.recentTxns || []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[13px] font-bold text-gray-300">
                      No Category A transactions found for this period.
                    </td>
                  </tr>
                ) : (
                  (catA.recentTxns || []).map((txn: any, i: number) => {
                    const amt = Number(String(txn.amount).replace(/,/g, ""));
                    const menuKey = txn.rawId || txn.id || String(i);
                    const isOpen = openMenuId === menuKey;
                    return (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-4 px-6 text-[13px] font-bold text-gray-900 font-mono">{txn.id}</td>
                        <td className="py-4 px-4 text-[13px] font-medium text-gray-500">{txn.time}</td>
                        <td className="py-4 px-4 text-right text-[13px] font-black text-blue-600 font-mono">Rs. {txn.amount}</td>
                        <td className="py-4 px-4 text-right text-[13px] font-medium text-gray-400 font-mono">Rs. {Math.round(amt * 0.18).toLocaleString()}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-wider">{txn.mode}</span>
                        </td>
                        {/* ── Three-dot Actions ── */}
                        <td className="py-4 px-6">
                          <div className="relative flex justify-end">
                            <button
                              onClick={(e) => toggleMenu(e, menuKey)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
                              title="Actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isOpen && (
                              <div
                                className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 w-[175px]"
                                style={{ animation: 'fadeInScale 0.15s ease-out' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setSelectedInvoiceId(txn.rawId || txn.id);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all rounded-xl"
                                >
                                  <FileText className="w-4 h-4 text-blue-500" />
                                  View Receipt / PDF
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(txn)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-bold text-red-600 hover:bg-red-50 transition-all rounded-xl"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete / Void
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* TOTALS FOOTER */}
          {!loading && catA.txns > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-2">
              <div className="flex justify-between text-[13px] font-bold text-gray-500">
                <span>Subtotal</span>
                <span className="font-mono">Rs. {catA.core.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-gray-500">
                <span>VAT (18%)</span>
                <span className="font-mono">Rs. {catA.vat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[17px] font-black text-gray-900 pt-3 border-t border-gray-200">
                <span>Total Taxable</span>
                <span className="text-blue-600 font-mono">Rs. {(catA.core + catA.vat).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Delete Confirmation Modal ──────────────────────────────────────────── */}
      {txnToDelete && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !isDeleting && setTxnToDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: 'fadeInScale 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-[16px]">Delete Invoice</h3>
                <p className="text-red-100 text-[11px] font-medium mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-gray-700 text-[14px] leading-relaxed">
                You are about to permanently delete invoice{' '}
                <span className="font-black text-gray-900">{txnToDelete.id}</span>.
              </p>
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-[12px] leading-relaxed">
                  All invoice items, payment records, and associated data will be{' '}
                  <strong>permanently removed</strong> from the database. This cannot be recovered.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setTxnToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[13px] font-black transition shadow-sm disabled:opacity-70 disabled:cursor-wait"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.92); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* ── Transaction Details Modal (Receipt/PDF) ───────────────────────────── */}
      <TransactionDetailsModal
        isOpen={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
        invoiceId={selectedInvoiceId as string}
        initialMode="receipt"
      />
    </MainLayout>
  );
}

export default function CategoryAReportPage() {
  return (
    <Suspense fallback={<div />}>
      <CategoryAReportPageContent />
    </Suspense>
  );
}
