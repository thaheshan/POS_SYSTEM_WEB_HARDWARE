"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useSalesData } from "@/hooks/useSales";
import { DateRange } from "react-day-picker";
import {
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  Briefcase,
  Wrench,
  FilePlus,
  Trash2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import api from "@/api/axiosInstance";
import AddLabourModal from "@/components/sales/AddLabourModal";

function CategoryCReportPageContent() {
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
  const [showAddModal, setShowAddModal] = useState(false);

  const [entryToDelete, setEntryToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/expenses/${entryToDelete.id}`);
      setEntryToDelete(null);
      refresh();
    } catch (err: any) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || "Failed to delete entry.");
    } finally {
      setIsDeleting(false);
    }
  };

  const catC = data.catC;
  // Use all transactions from hook
  const allEntries: any[] = catC.allTxns || [];

  const handleCSV = () => {
    const rows = [
      ["ID", "Type", "Description", "Labourer", "Amount", "Date"],
      ...allEntries.map((e: any) => [
        e.id,
        e.entryType,
        e.description,
        e.labourerName || "",
        e.amount,
        e.createdAt ? format(new Date(e.createdAt), "MMM d, yyyy HH:mm") : "",
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `category_c_report_${format(dateRange?.from || today, "yyyyMMdd")}.csv`;
    a.click();
    setShowExportMenu(false);
  };

  const dateLabel =
    dateRange?.from && dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : dateRange?.from
      ? format(dateRange.from, "MMMM d, yyyy")
      : "Today";

  const typeColor = (type: string) => {
    const t = (type || "").toUpperCase();
    if (t === "LABOUR") return "bg-blue-50 text-blue-700";
    if (t === "INSTALLATION") return "bg-purple-50 text-purple-700";
    return "bg-emerald-50 text-emerald-700";
  };

  return (
    <MainLayout>
      <div className="max-w-[1200px] mx-auto pb-20">

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/sales")}
              className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 shadow-sm transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-amber-100 text-amber-700 px-3 py-1 rounded-md">
                  Category C
                </span>
                <span className="text-[12px] font-bold text-gray-400">{dateLabel}</span>
              </div>
              <h1 className="text-[26px] font-black text-gray-900 tracking-tight">
                Labour &amp; Miscellaneous — All Entries
              </h1>
              <p className="text-[13px] text-gray-400 font-medium mt-0.5">
                Labour charges, installation fees, and other non-product expenses
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create Expense
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-[13.5px] shadow-sm transition-all active:scale-95 hover:bg-gray-50"
              >
                <Download className="w-4 h-4" /> Export
              </button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 w-[185px]">
                  <button
                    onClick={() => { setShowExportMenu(false); window.print(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <FileText className="w-4 h-4 text-red-500" /> Download PDF
                  </button>
                  <button
                    onClick={handleCSV}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" /> Download CSV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY BANNER */}
        <div className="bg-gradient-to-r from-[#a16207] to-[#92400e] rounded-2xl p-6 mb-8 text-white shadow-xl shadow-amber-200">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-black text-amber-200 uppercase tracking-widest mb-1">Total Category C</p>
              <p className="text-[32px] font-black">Rs. {loading ? "..." : catC.core.toLocaleString()}</p>
              <p className="text-[12px] font-bold text-amber-300 mt-1">{catC.entries} entries</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/15 rounded-2xl p-4">
                <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-1">Labour</p>
                <p className="text-[16px] font-black">Rs. {loading ? "..." : catC.labour.toLocaleString()}</p>
              </div>
              <div className="bg-white/15 rounded-2xl p-4">
                <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-1">Install</p>
                <p className="text-[16px] font-black">Rs. {loading ? "..." : catC.install.toLocaleString()}</p>
              </div>
              <div className="bg-white/15 rounded-2xl p-4">
                <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest mb-1">Other</p>
                <p className="text-[16px] font-black">Rs. {loading ? "..." : catC.misc.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Category C", value: `Rs. ${(catC.core || 0).toLocaleString()}`, icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Labour Charges", value: `Rs. ${(catC.labour || 0).toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Installation Fees", value: `Rs. ${(catC.install || 0).toLocaleString()}`, icon: Wrench, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Other Expenses", value: `Rs. ${(catC.misc || 0).toLocaleString()}`, icon: FilePlus, color: "text-emerald-600", bg: "bg-emerald-50" },
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

        {/* ENTRIES TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-50">
            <h3 className="text-[16px] font-black text-gray-900">All Entries (Category C)</h3>
            <span className="text-[12px] font-bold text-gray-400">{allEntries.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="text-right py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="py-4 px-6">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : allEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center">
                          <Briefcase className="w-7 h-7 text-amber-400" />
                        </div>
                        <p className="text-[14px] font-bold text-gray-400">No entries found for this period.</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-1 flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl font-bold text-[13px] transition-all"
                        >
                          <Plus className="w-4 h-4" /> Add First Entry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allEntries.map((entry: any, i: number) => (
                    <tr key={entry.id || i} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-4 px-6 text-[12px] font-bold text-gray-500 font-mono">
                        #{(entry.id || "").toString().slice(-8).toUpperCase()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${typeColor(entry.entryType)}`}>
                          {entry.entryType || "MISC"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[13px] font-medium text-gray-700 max-w-[200px] truncate">
                        {entry.description || "—"}
                        {entry.labourerName && (
                          <span className="block text-[11px] text-gray-400 font-medium mt-0.5">
                            👷 {entry.labourerName}
                            {entry.labourerPhone ? ` · ${entry.labourerPhone}` : ""}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-[12.5px] font-bold text-gray-500">
                        {entry.staffName || "—"}
                      </td>
                      <td className="py-4 px-4 text-[12.5px] font-medium text-gray-500">
                        {entry.createdAt
                          ? format(new Date(entry.createdAt), "MMM d, yyyy · h:mm a")
                          : "—"}
                      </td>
                      <td className="py-4 px-4 text-right text-[13px] font-black text-amber-600 font-mono">
                        Rs. {Number(entry.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all ml-auto"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          {!loading && catC.entries > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-2">
              <div className="flex justify-between text-[13px] font-bold text-gray-500">
                <span>Labour Charges</span>
                <span className="font-mono">Rs. {catC.labour.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-gray-500">
                <span>Installation Fees</span>
                <span className="font-mono">Rs. {catC.install.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-gray-500">
                <span>Other Expenses</span>
                <span className="font-mono">Rs. {catC.misc.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[17px] font-black text-gray-900 pt-3 border-t border-gray-200">
                <span>Total Category C</span>
                <span className="text-amber-600 font-mono">Rs. {catC.core.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Labour / Expense Modal */}
      <AddLabourModal
        isOpen={showAddModal}
        onClose={(shouldRefresh) => {
          setShowAddModal(false);
          if (shouldRefresh) refresh();
        }}
      />

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !isDeleting && setEntryToDelete(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: "fadeInScale 0.2s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-[16px]">Delete Expense Entry</h3>
                <p className="text-red-100 text-[11px] font-medium mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            <div className="px-6 py-6">
              <p className="text-gray-700 text-[14px] leading-relaxed">
                You are about to permanently delete the entry:{" "}
                <span className="font-black text-gray-900">{entryToDelete.description}</span>
              </p>
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-[12px] leading-relaxed">
                  This expense record will be <strong>permanently removed</strong> and will affect Category C totals.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setEntryToDelete(null)}
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
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default function CategoryCReportPage() {
  return (
    <Suspense fallback={<div />}>
      <CategoryCReportPageContent />
    </Suspense>
  );
}
