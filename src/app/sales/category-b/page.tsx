"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useSalesData } from "@/hooks/useSales";
import { DateRange } from "react-day-picker";
import { ArrowLeft, Download, FileText, FileSpreadsheet, TrendingUp, Package, BarChart2, Tag, MoreVertical, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import api from "@/api/axiosInstance";

export default function CategoryBReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const [dateRange] = useState<DateRange | undefined>({
    from: fromParam ? new Date(fromParam) : today,
    to: toParam ? new Date(toParam) : today,
  });

  const { data, loading, refresh } = useSalesData(dateRange);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "overflow" | "nontax">("all");

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [txnToDelete, setTxnToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!txnToDelete) return;
    setIsDeleting(true);
    try {
      const id = txnToDelete.rawId || txnToDelete.id;
      await api.delete(`/sales/${id}`);
      setTxnToDelete(null);
      refresh();
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || "Failed to delete invoice.");
    } finally {
      setIsDeleting(false);
    }
  };

  const catB = data.catB;

  const handleCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Category B Total", catB.core],
      ["Overflow (> Rs. 2L)", catB.overflow],
      ["Non-Taxable Products", catB.baseNonTax],
      ["Transactions", catB.txns],
      ["Average Bill", catB.avg],
    ].map((r) => r.join(",")).join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `category_b_report_${format(dateRange?.from || today, "yyyyMMdd")}.csv`;
    a.click();
    setShowExportMenu(false);
  };

  const dateLabel =
    dateRange?.from && dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : dateRange?.from
      ? format(dateRange.from, "MMMM d, yyyy")
      : "Today";

  const filteredTxns = (catB.recentTxns || []).filter((txn: any) => {
    if (typeFilter === "overflow") return txn.type === "Overflow";
    if (typeFilter === "nontax") return txn.type !== "Overflow";
    return true;
  });

  return (
    <MainLayout>
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
                <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md">
                  Category B
                </span>
                <span className="text-[12px] font-bold text-gray-400">{dateLabel}</span>
              </div>
              <h1 className="text-[26px] font-black text-gray-900 tracking-tight">
                Non-Tax & Overflow — Detailed Report
              </h1>
              <p className="text-[13px] text-gray-400 font-medium mt-0.5">
                Sales above Rs. 200,000 threshold + Non-taxable product sales
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-[#15803d] hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] shadow-sm transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            {showExportMenu && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 w-[185px]">
                <button onClick={() => { setShowExportMenu(false); window.print(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  <FileText className="w-4 h-4 text-red-500" /> Download PDF
                </button>
                <button onClick={handleCSV} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Download CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SUMMARY BANNER */}
        <div className="bg-gradient-to-r from-[#15803d] to-[#166534] rounded-2xl p-6 mb-8 text-white shadow-xl shadow-emerald-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-black text-emerald-200 uppercase tracking-widest mb-1">Total Category B</p>
              <p className="text-[32px] font-black">Rs. {loading ? "..." : catB.core.toLocaleString()}</p>
              <p className="text-[12px] font-bold text-emerald-300 mt-1">{catB.txns} transactions</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/15 rounded-2xl p-4">
                <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Overflow</p>
                <p className="text-[18px] font-black">Rs. {loading ? "..." : catB.overflow.toLocaleString()}</p>
              </div>
              <div className="bg-white/15 rounded-2xl p-4">
                <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Non-Taxable</p>
                <p className="text-[18px] font-black">Rs. {loading ? "..." : catB.baseNonTax.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Cat B", value: `Rs. ${(catB.core || 0).toLocaleString()}`, icon: BarChart2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Overflow Amount", value: `Rs. ${(catB.overflow || 0).toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Transactions", value: `${catB.txns || 0}`, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Average Bill", value: `Rs. ${(catB.avg || 0).toLocaleString()}`, icon: Tag, color: "text-amber-600", bg: "bg-amber-50" },
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

        {/* TYPE FILTER TABS */}
        <div className="flex gap-2 mb-5">
          {[
            { key: "all", label: "All Transactions" },
            { key: "overflow", label: "Overflow Only" },
            { key: "nontax", label: "Non-Taxable Only" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key as any)}
              className={`px-5 py-2 rounded-xl text-[12.5px] font-black transition-all ${
                typeFilter === tab.key
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h3 className="text-[16px] font-black text-gray-900">Category B Transactions</h3>
            <span className="text-[12px] font-bold text-gray-400">{filteredTxns.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</th>
                  <th className="text-right py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
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
                ) : filteredTxns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[13px] font-bold text-gray-300">
                      No Category B transactions found for this period.
                    </td>
                  </tr>
                ) : (
                  filteredTxns.map((txn: any, i: number) => {
                    const menuKey = txn.rawId || txn.id || String(i);
                    const isOpen = openMenuId === menuKey;
                    return (
                    <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-4 px-6 text-[13px] font-bold text-gray-900 font-mono">{txn.id}</td>
                      <td className="py-4 px-4 text-[13px] font-medium text-gray-500">{txn.time}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          txn.type === "Overflow"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-[13px] font-black text-emerald-600 font-mono">Rs. {txn.amount}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="px-3 py-1 bg-gray-50 text-gray-600 text-[10px] font-black rounded-full uppercase tracking-wider">{txn.mode}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="relative flex justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(isOpen ? null : menuKey); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {isOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 w-[175px]" onClick={e => e.stopPropagation()}>
                              <button onClick={() => { setOpenMenuId(null); setTxnToDelete(txn); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-bold text-red-600 hover:bg-red-50 transition-all rounded-xl">
                                <Trash2 className="w-4 h-4" /> Delete / Void
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

          {!loading && catB.txns > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-2">
              <div className="flex justify-between text-[13px] font-bold text-gray-500">
                <span>Overflow Amount</span>
                <span className="font-mono">Rs. {catB.overflow.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-gray-500">
                <span>Non-Taxable Products</span>
                <span className="font-mono">Rs. {catB.baseNonTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[17px] font-black text-gray-900 pt-3 border-t border-gray-200">
                <span>Total Category B</span>
                <span className="text-emerald-600 font-mono">Rs. {catB.core.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* TOP NON-TAXABLE PRODUCTS */}
        {(catB.topProducts || []).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h3 className="text-[16px] font-black text-gray-900">Top Non-Taxable Products</h3>
            </div>
            <div className="p-6 space-y-4">
              {catB.topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Package className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">{p.name}</p>
                      <p className="text-[11px] font-bold text-gray-400">{p.sold} units sold</p>
                    </div>
                  </div>
                  <span className="text-[14px] font-black text-gray-900 font-mono">Rs. {p.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-[16px]">Delete Invoice</h3>
                <p className="text-red-100 text-[11px] font-medium mt-0.5">This action cannot be undone</p>
              </div>
            </div>
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
                {isDeleting ? "Deleting..." : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
