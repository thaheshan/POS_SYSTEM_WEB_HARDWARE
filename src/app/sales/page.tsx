"use client";

import MainLayout from "@/components/layout/MainLayout";
import { Calendar, Plus, Download, Info, ArrowRight } from "lucide-react";

export default function SalesDashboardPage() {
  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20 px-4 sm:px-6 lg:px-8">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-black text-gray-900 tracking-tight mb-1">
              Sales Dashboard - Tax Category View
            </h1>
            <p className="text-[14px] font-bold text-gray-400 opacity-80">
              Sri Lanka IRD Compliant - Daily Tax Threshold: Rs. 200,000
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] hover:shadow-[0_10px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 text-white px-5 py-2.5 rounded-lg font-bold text-[13.5px] transition-all duration-300 shadow-[0_8px_18px_rgba(37,99,235,0.25)] active:scale-95">
              Sales Dashboard
            </button>
          </div>
        </div>

        {/* TOP ACTION BAR */}
        <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
              <span className="text-[13.5px] font-bold text-gray-600">
                Today - Jan 20, 2026
              </span>
              <Calendar className="w-4 h-4 text-gray-400 ml-5" />
            </div>
            <button className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] hover:shadow-[0_10px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] flex items-center gap-2 shadow-[0_8px_18px_rgba(37,99,235,0.25)] transition-all duration-300 active:scale-95">
              <Plus className="w-4 h-4" /> Add Sale
            </button>
            <button className="w-11 h-11 border border-gray-200 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 shadow-sm transition-all duration-300 text-gray-600 active:scale-95">
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="w-[160px]">
            <select className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-[13px] font-semibold text-gray-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        {/* TAXABLE STATUS BANNER (BLUE INFO BOX) */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#f4fbff] via-[#eef8ff] to-[#edf6ff] border border-[#8ab9ff] rounded-xl p-4 mb-8 flex items-center shadow-[0_2px_10px_-3px_rgba(37,99,235,0.12)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2f6fed] rounded-full flex items-center justify-center shadow-[0_0_0_4px_rgba(47,111,237,0.12)]">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-[14.5px] font-bold text-blue-900 mb-0.5">
                Today's Taxable Sales (Category A): Rs. 145,650 / Rs. 200,000
              </h4>
              <p className="text-[12px] font-semibold text-blue-600">
                Remaining before non-tax threshold: Rs. 54,350
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/70" />
          <div className="absolute left-3 right-3 bottom-2 h-[2px] rounded-full bg-blue-500/70" />
        </div>

        {/* THREE CATEGORY COLUMNS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch relative">
          {/* CATEGORY A: TAXABLE SALES (BLUE) */}
          <div className="group bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-200/25">
            <div className="bg-gradient-to-br from-[#1f3fae] to-[#2b64e4] text-white">
              <div className="p-6 pb-5 transition-all duration-300 group-hover:brightness-[1.01]">
                <span className="text-[11px] font-bold tracking-widest uppercase block mb-3">
                  CATEGORY A
                </span>
                <h3 className="text-[22px] font-bold tracking-wide leading-tight mb-2">
                  Taxable Sales
                </h3>
                <p className="text-[11px] font-medium opacity-80 mb-6">
                  First Rs. 2,00,000 daily sales
                </p>
                <div className="text-[40px] font-black tracking-tight mb-2">
                  Rs. 145,650
                </div>
                <p className="text-[12px] font-medium opacity-90">
                  42 Transactions
                </p>
              </div>

              <div className="px-6 py-4 flex items-center justify-between border-t border-white/20">
                <span className="text-[12px] opacity-90 font-medium">
                  VAT (18%)
                </span>
                <span className="text-[14px] font-bold">Rs. 22,290</span>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 bg-white">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 mb-1 block">
                    Average Bill
                  </span>
                  <span className="text-[17px] font-black text-gray-900">
                    Rs. 3,468
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 mb-1 block">
                    Items Sold
                  </span>
                  <span className="text-[17px] font-black text-gray-900">
                    158 Units
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-[13px] font-black text-gray-900">
                    Recent Transactions
                  </h5>
                  <button className="text-[12px] font-bold text-[#2563eb]">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      id: "INV-2026-001234",
                      time: "10:24 AM",
                      amount: "5,450",
                      mode: "Cash",
                      amountColor: "text-[#2563eb]",
                      modeColor: "text-[#2563eb]",
                    },
                    {
                      id: "INV-2026-001233",
                      time: "9:58 AM",
                      amount: "3,200",
                      mode: "Card",
                      amountColor: "text-[#2563eb]",
                      modeColor: "text-[#16a34a]",
                    },
                    {
                      id: "INV-2026-001232",
                      time: "9:15 AM",
                      amount: "12,450",
                      mode: "Credit",
                      amountColor: "text-[#2563eb]",
                      modeColor: "text-[#b45309]",
                    },
                  ].map((txn) => (
                    <div
                      key={txn.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-800">
                          {txn.id}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                          {txn.time}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-[13px] font-bold ${txn.amountColor}`}
                        >
                          Rs. {txn.amount}
                        </span>
                        <span
                          className={`text-[11px] font-medium mt-0.5 ${txn.modeColor}`}
                        >
                          {txn.mode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 mt-auto bg-white flex justify-center">
              <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#2563eb] transition-all duration-300 hover:text-blue-700 hover:gap-2 group-hover:translate-x-0.5">
                View Detailed Report
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* CATEGORY B: NON-TAX & OVERFLOW (GREEN) */}
          <div className="group bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-200/25">
            <div className="bg-gradient-to-br from-[#1a8340] to-[#1ea54b] text-white">
              <div className="p-6 pb-5 transition-all duration-300 group-hover:brightness-[1.01]">
                <span className="text-[11px] font-bold tracking-widest uppercase block mb-3">
                  CATEGORY B
                </span>
                <h3 className="text-[22px] font-bold tracking-wide leading-tight mb-2">
                  Non-Tax & Overflow
                </h3>
                <p className="text-[11px] font-medium opacity-80 mb-6">
                  Sales &gt; Rs. 2,00,000 + Non-taxable items
                </p>
                <div className="text-[40px] font-black tracking-tight mb-2">
                  Rs. 68,450
                </div>
                <p className="text-[12px] font-medium opacity-90">
                  18 Transactions
                </p>
              </div>

              <div className="px-6 py-4 space-y-2 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] opacity-90 font-medium">
                    Overflow (&gt; Rs. 2L)
                  </span>
                  <span className="text-[14px] font-bold">Rs. 45,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] opacity-90 font-medium">
                    Non-taxable Products
                  </span>
                  <span className="text-[14px] font-bold">Rs. 23,200</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 bg-white">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 mb-1 block">
                    Average Bill
                  </span>
                  <span className="text-[17px] font-black text-gray-900">
                    Rs. 3,803
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-500 mb-1 block">
                    Items Sold
                  </span>
                  <span className="text-[17px] font-black text-gray-900">
                    62 Units
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-[13px] font-black text-gray-900">
                    Top Non-Taxable Products
                  </h5>
                  <button className="text-[12px] font-bold text-[#16a34a]">
                    View All
                  </button>
                </div>
                <div className="space-y-4 mb-6">
                  {[
                    {
                      name: "Educational Books",
                      sold: "12 units sold",
                      amount: "8,450",
                    },
                    {
                      name: "Medical Supplies",
                      sold: "8 units sold",
                      amount: "6,750",
                    },
                    {
                      name: "Agricultural Tools",
                      sold: "5 units sold",
                      amount: "8,000",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center"
                    >
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-800">
                          {item.name}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                          {item.sold}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-[#16a34a]">
                        Rs. {item.amount}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4 mt-8">
                  <h5 className="text-[13px] font-black text-gray-900">
                    Recent Transactions
                  </h5>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      id: "INV-2026-001240",
                      time: "2:15 PM",
                      amount: "8,200",
                      type: "Non-Tax",
                      amountColor: "text-[#16a34a]",
                      typeColor: "text-[#16a34a]",
                    },
                    {
                      id: "INV-2026-001239",
                      time: "1:48 PM",
                      amount: "15,250",
                      type: "Overflow",
                      amountColor: "text-[#16a34a]",
                      typeColor: "text-[#b45309]",
                    },
                  ].map((txn) => (
                    <div
                      key={txn.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-800">
                          {txn.id}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                          {txn.time}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-[13px] font-bold ${txn.amountColor}`}
                        >
                          Rs. {txn.amount}
                        </span>
                        <span
                          className={`text-[11px] font-medium mt-0.5 ${txn.typeColor}`}
                        >
                          {txn.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 mt-auto bg-white flex justify-center">
              <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#16a34a] transition-all duration-300 hover:text-emerald-700 hover:gap-2 group-hover:translate-x-0.5">
                View Detailed Report
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* CATEGORY C: LABOUR & MISC (AMBER) */}
          <div className="group bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-200/25">
            <div className="bg-gradient-to-br from-[#b7771d] to-[#d18a1f] text-white">
              <div className="p-6 pb-5 transition-all duration-300 group-hover:brightness-[1.01]">
                <span className="text-[11px] font-bold tracking-widest uppercase block mb-3">
                  CATEGORY C
                </span>
                <h3 className="text-[22px] font-bold tracking-wide leading-tight mb-2">
                  Labour & Miscellaneous
                </h3>
                <p className="text-[11px] font-medium opacity-80 mb-6">
                  Labour charges, expenses, & other costs
                </p>
                <div className="text-[40px] font-black tracking-tight mb-2">
                  Rs. 35,800
                </div>
                <p className="text-[12px] font-medium opacity-90">14 Entries</p>
              </div>

              <div className="px-6 py-4 space-y-2 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] opacity-90 font-medium">
                    Labour Charges
                  </span>
                  <span className="text-[14px] font-bold">Rs. 22,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] opacity-90 font-medium">
                    Installation Fees
                  </span>
                  <span className="text-[14px] font-bold">Rs. 8,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] opacity-90 font-medium">
                    Other Expenses
                  </span>
                  <span className="text-[14px] font-bold">Rs. 4,800</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 bg-white">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-[13px] font-black text-gray-900">
                    Labour Type Breakdown
                  </h5>
                  <button className="text-[12px] font-bold text-[#ca8a04]">
                    View All
                  </button>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    {
                      name: "Plumbing Installation",
                      jobs: "5 jobs completed",
                      amount: "12,500",
                    },
                    {
                      name: "Electrical Work",
                      jobs: "3 jobs completed",
                      amount: "8,500",
                    },
                    {
                      name: "Carpentry Services",
                      jobs: "2 jobs completed",
                      amount: "6,000",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center"
                    >
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-800">
                          {item.name}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                          {item.jobs}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-[#ca8a04]">
                        Rs. {item.amount}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4 mt-8">
                  <h5 className="text-[13px] font-black text-gray-900">
                    Recent Entries
                  </h5>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      id: "LAB-2026-0034",
                      date: "3:45 PM",
                      amount: "4,500",
                      desc: "Pipe installation - Mr. Perera",
                      type: "Labour",
                    },
                  ].map((txn) => (
                    <div key={txn.id} className="flex flex-col gap-1 pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-gray-800">
                            {txn.id}
                          </span>
                          <span className="text-[13px] font-medium text-gray-500 mt-1">
                            {txn.desc}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 mt-1">
                            {txn.date}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[13px] font-bold text-[#ca8a04]">
                            Rs. {txn.amount}
                          </span>
                          <span className="text-[11px] font-medium mt-0.5 text-[#e11d48]">
                            {txn.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 mt-auto bg-white flex justify-center">
              <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#ca8a04] transition-all duration-300 hover:text-amber-700 hover:gap-2 group-hover:translate-x-0.5">
                View All Entries
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
