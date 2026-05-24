"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { useSalesData } from "@/hooks/useSales";
import { DateRange } from "react-day-picker";
import { ArrowLeft, Download, FileText, FileSpreadsheet, TrendingUp, Receipt, Percent } from "lucide-react";
import { format } from "date-fns";

export default function CategoryAReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date();

  // Restore date range from query params if present
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const [dateRange] = useState<DateRange | undefined>({
    from: fromParam ? new Date(fromParam) : today,
    to: toParam ? new Date(toParam) : today,
  });

  const { data, loading } = useSalesData(dateRange);
  const [showExportMenu, setShowExportMenu] = useState(false);

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

  const handlePDF = () => {
    setShowExportMenu(false);
    window.print();
  };

  const dateLabel =
    dateRange?.from && dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : dateRange?.from
      ? format(dateRange.from, "MMMM d, yyyy")
      : "Today";

  return (
    <MainLayout>
      <div className="max-w-[1200px] mx-auto pb-20">

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

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
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
                  <th className="text-right py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="py-4 px-6">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : (catA.recentTxns || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-[13px] font-bold text-gray-300">
                      No Category A transactions found for this period.
                    </td>
                  </tr>
                ) : (
                  (catA.recentTxns || []).map((txn: any, i: number) => {
                    const amt = Number(String(txn.amount).replace(/,/g, ""));
                    return (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-4 px-6 text-[13px] font-bold text-gray-900 font-mono">{txn.id}</td>
                        <td className="py-4 px-4 text-[13px] font-medium text-gray-500">{txn.time}</td>
                        <td className="py-4 px-4 text-right text-[13px] font-black text-blue-600 font-mono">Rs. {txn.amount}</td>
                        <td className="py-4 px-4 text-right text-[13px] font-medium text-gray-400 font-mono">Rs. {Math.round(amt * 0.18).toLocaleString()}</td>
                        <td className="py-4 px-6 text-right">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-wider">{txn.mode}</span>
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
    </MainLayout>
  );
}
