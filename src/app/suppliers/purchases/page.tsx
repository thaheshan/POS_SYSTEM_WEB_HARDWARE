"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  CloudDownload,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Receipt,
  XCircle,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { MOCK_PURCHASE_ACTIVITY } from "@/lib/suppliers-mock-data";

export default function PurchaseActivityPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20 suppliers-page-shell">
        {/* HEADER */}
        <div className="flex items-start gap-4 mb-8">
          <Link
            href="/suppliers"
            className="mt-1 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-[30px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-tight">
              All Purchase Activity
            </h1>
            <p className="text-[14px] font-semibold text-gray-500 tracking-wide mt-1">
              Complete history of supplier purchases and goods received
            </p>
          </div>
        </div>

        {/* 4 KPI CARDS (Matching wireframe text inch by inch) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="suppliers-kpi-card suppliers-hover-card rounded-[20px] p-6 border border-gray-100 flex flex-col gap-4 min-h-[155px] suppliers-delay-1">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-[#059669]" />
              </div>
              <div className="text-[12px] font-black text-emerald-500">
                ↑ 14%
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-500 mb-1">
                Today's Transactions
              </p>
              <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none mb-2">
                1,248
              </h3>
              <p className="text-[11px] font-bold text-emerald-500">
                +34 from yesterday
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card rounded-[20px] p-6 border border-gray-100 flex flex-col gap-4 min-h-[155px] suppliers-delay-2">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-[12px] font-black text-emerald-500">
                ↑ 14%
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-500 mb-1">
                Today's Revenue
              </p>
              <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none mb-2">
                LKR 12.4M
              </h3>
              <p className="text-[11px] font-bold text-orange-500">
                +LKR 280k from yesterday
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card rounded-[20px] p-6 border border-gray-100 flex flex-col gap-4 min-h-[155px] suppliers-delay-3">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-yellow-100/50 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-[12px] font-black text-emerald-500">
                ↑ 14%
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-500 mb-1">
                Average Bill Value
              </p>
              <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none mb-2">
                LKR 16,900
              </h3>
              <p className="text-[11px] font-bold text-yellow-600">
                Per transactions
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card rounded-[20px] p-6 border border-gray-100 flex flex-col gap-4 min-h-[155px] suppliers-delay-4">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-[12px] font-black text-emerald-500">
                ↑ 14%
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-500 mb-1">
                Total VAT Collected
              </p>
              <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none mb-2">
                LKR 350 K
              </h3>
              <p className="text-[11px] font-bold text-red-500">
                15% VAT on transactions
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH AND TABLE WRAPPER */}
        <div className="suppliers-panel rounded-[24px] border border-gray-100 flex flex-col mb-8 overflow-hidden">
          {/* Top Toolbar */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-xl w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by supplier, PO , GRN , or Invoice"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-[12px] text-[13px] font-medium outline-none focus:border-[#059669] transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 border border-gray-200 px-5 py-3 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" /> Filters
              </button>
              <button className="suppliers-btn-gradient bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center gap-2 px-6 py-3 rounded-[12px] text-[13px] font-black">
                <CloudDownload className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="py-4 px-6 text-[12px] font-black text-gray-700 tracking-wide w-[140px]">
                    Date & Time
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-700 tracking-wide min-w-[200px]">
                    Supplier
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-700 tracking-wide">
                    PO No
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-700 tracking-wide">
                    Invoice no
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-700 tracking-wide text-center">
                    Items
                  </th>
                  <th className="py-4 px-6 text-[12px] font-black text-gray-700 tracking-wide text-right">
                    Amount
                  </th>
                  <th className="py-4 px-6 text-[12px] font-black text-gray-700 tracking-wide text-center">
                    Status
                  </th>
                  <th className="py-4 px-6 text-[12px] font-black text-gray-700 tracking-wide text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_PURCHASE_ACTIVITY.filter(
                  (p) =>
                    p.supplier
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    p.poNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.invoice.toLowerCase().includes(searchTerm.toLowerCase()),
                ).map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="text-[13px] font-semibold text-gray-600">
                        {activity.date}
                      </p>
                      <p className="text-[12px] font-semibold text-gray-400 mt-0.5">
                        {activity.time}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 uppercase text-[10px] font-black">
                          {activity.supplier.substring(0, 2)}
                        </div>
                        <span className="text-[13.5px] font-bold text-gray-900">
                          {activity.supplier}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight">
                        {activity.poNo}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[13px] font-bold text-blue-600 font-mono tracking-tight">
                      {activity.invoice}
                    </td>
                    <td className="py-4 px-4 text-[14px] font-semibold text-gray-800 text-center">
                      {activity.items}
                    </td>
                    <td className="py-4 px-6 text-[14px] font-black text-gray-800 tracking-tight text-right w-[140px]">
                      LKR {activity.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full border text-[11px] font-bold tracking-wide capitalize ${
                          activity.status === "completed"
                            ? "border-emerald-500 text-emerald-600"
                            : activity.status === "Returned"
                              ? "border-red-500 text-red-600"
                              : activity.status === "Pending"
                                ? "border-amber-400 bg-amber-50 text-amber-600"
                                : "border-blue-400 text-blue-600"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex justify-end gap-2">
                      <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] font-semibold text-gray-500">
            <div className="flex items-center gap-2">
              <span>Row Per Page</span>
              <select className="border border-gray-200 rounded-md px-2 py-1 outline-none font-bold text-gray-700 bg-white">
                <option>10 </option>
                <option>25 </option>
                <option>50 </option>
              </select>
              <span className="ml-2">Entries</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full">
                1
              </button>
              <button className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full">
                2
              </button>
              <button className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full">
                3
              </button>
              <button className="w-7 h-7 flex items-center justify-center bg-[#1e40af] text-white rounded-full font-bold">
                4
              </button>
              <span className="px-1 text-gray-400">...</span>
              <button className="w-7 h-7 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full">
                15
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
