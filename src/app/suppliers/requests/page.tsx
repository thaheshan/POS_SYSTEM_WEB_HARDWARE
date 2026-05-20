"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import {
  FileText,
  Hourglass,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { MOCK_REQUESTS, MOCK_URGENT_ALERTS } from "@/lib/suppliers-mock-data";
import Link from "next/link";

export default function RequestSupplierPage() {
  const [products, setProducts] = useState([
    { id: 1, name: "PVC Pipe 1/2 inch", stock: 8, qty: 50, isLow: true },
    { id: 2, name: "", stock: 2, qty: 30, isLow: true },
  ]);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20 suppliers-page-shell">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-[30px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-tight">
            Request Supplier
          </h1>
          <p className="text-[14px] font-semibold text-gray-500 tracking-wide mt-1">
            Manage supplier requests and purchase orders
          </p>
        </div>

        {/* 4 KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="suppliers-kpi-card suppliers-hover-card rounded-[20px] p-6 border border-gray-100 flex flex-col justify-between h-[140px] suppliers-delay-1">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-500">
                Total Requests
              </p>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div>
              <h3 className="text-[34px] font-black tracking-tight text-gray-900 leading-none mb-2">
                245
              </h3>
              <p className="text-[12px] font-bold text-emerald-500 flex items-center gap-1">
                12% from last month ↑
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card rounded-[20px] p-6 border border-gray-100 flex flex-col justify-between h-[140px] suppliers-delay-2">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-500">
                Pending Requests
              </p>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div>
              <h3 className="text-[34px] font-black tracking-tight text-gray-900 leading-none mb-2">
                18
              </h3>
              <p className="text-[12px] font-bold text-orange-500 flex items-center gap-1">
                Awaiting approval <Hourglass className="w-3 h-3" />
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card rounded-[20px] p-6 border border-gray-100 flex flex-col justify-between h-[140px] suppliers-delay-3">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-500">
                Completed Orders
              </p>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              </div>
            </div>
            <div>
              <h3 className="text-[34px] font-black tracking-tight text-gray-900 leading-none mb-2">
                187
              </h3>
              <p className="text-[12px] font-bold text-[#059669] flex items-center gap-1">
                Successfully delivered <CheckCircle2 className="w-3 h-3" />
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card rounded-[20px] p-6 border border-gray-100 flex flex-col justify-between h-[140px] suppliers-delay-4">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-500">
                Low Stock Items
              </p>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div>
              <h3 className="text-[34px] font-black tracking-tight text-gray-900 leading-none mb-2">
                12
              </h3>
              <p className="text-[12px] font-bold text-red-500 flex items-center gap-1">
                Urgent reorder needed <AlertTriangle className="w-3 h-3" />
              </p>
            </div>
          </div>
        </div>

        {/* MAIN SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT TIER: CREATE NEW REQUEST (Col span 2) */}
          <div className="lg:col-span-2 suppliers-panel suppliers-hover-card rounded-[24px] border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 p-6 flex justify-between items-center text-white shrink-0">
              <h3 className="text-[18px] font-black tracking-tight">
                Create New Request
              </h3>
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors">
                <Plus className="w-4 h-4" /> New Request
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Supplier & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700">
                    Supplier
                  </label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[13px] font-semibold text-gray-700 outline-none focus:border-blue-500 transition-colors">
                    <option>Select supplier...</option>
                    <option>FUTURA Hardware</option>
                    <option>ABC Shop</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700">
                    Priority
                  </label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[13px] font-semibold text-gray-700 outline-none focus:border-blue-500 transition-colors">
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>

              {/* Products List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[15px] font-black text-gray-900">
                    Products to Request
                  </h4>
                  <button
                    onClick={() =>
                      setProducts([
                        ...products,
                        {
                          id: products.length + 1,
                          name: "",
                          stock: 0,
                          qty: 0,
                          isLow: false,
                        },
                      ])
                    }
                    className="text-[13px] font-black text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                <div className="space-y-4">
                  {products.map((prod, idx) => (
                    <div
                      key={prod.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100"
                    >
                      <div className="md:col-span-5 space-y-2">
                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                          Product
                        </label>
                        <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-semibold text-gray-700 outline-none focus:border-blue-500 transition-colors">
                          <option>Select Product</option>
                        </select>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                          Current Stock
                        </label>
                        <div className="flex items-center gap-2 h-[46px]">
                          <span
                            className={`text-[13px] font-black ${prod.isLow ? "text-red-600" : "text-gray-900"}`}
                          >
                            {prod.stock} units
                          </span>
                          {prod.isLow && (
                            <span className="bg-red-50 text-red-500 px-2 py-1 rounded text-[10px] font-black tracking-widest">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={prod.qty}
                          onChange={(e) => {}}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-black text-gray-900 outline-none focus:border-blue-500 transition-colors font-mono"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end h-[46px] items-center">
                        <button className="w-11 h-11 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center text-red-500 transition-colors shadow-sm border border-red-100">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional notes or special instructions..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[13px] font-semibold text-gray-700 outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Actions */}
              <div className="pt-6 border-t border-gray-100 flex justify-end items-center gap-4">
                <button className="px-6 py-3.5 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition-colors min-w-[140px]">
                  Save as Draft
                </button>
                <button className="suppliers-btn-gradient bg-gradient-to-r from-blue-700 to-indigo-500 px-8 py-3.5 rounded-xl text-[14px] font-black min-w-[160px] flex items-center justify-center">
                  Submit Request
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT TIER: ALERTS & RECENT (Col span 1) */}
          <div className="flex flex-col gap-6">
            {/* Urgent Alerts */}
            <div className="suppliers-panel suppliers-hover-card rounded-[24px] border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-[16px] font-black text-gray-900 tracking-tight">
                  Urgent Alerts
                </h3>
              </div>

              <div className="space-y-3 mb-6">
                {MOCK_URGENT_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border ${alert.isYellow ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"} flex gap-3 items-start shadow-sm`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 shrink-0 mt-0.5 ${alert.isYellow ? "text-amber-500" : "text-red-500"}`}
                    />
                    <div>
                      <h4
                        className={`text-[13px] font-black ${alert.isYellow ? "text-amber-900" : "text-red-900"}`}
                      >
                        {alert.product}
                      </h4>
                      <p
                        className={`text-[11px] font-bold mt-1 ${alert.isYellow ? "text-amber-700" : "text-red-700"}`}
                      >
                        Stock: {alert.current} units (Min: {alert.min})
                      </p>
                      <p
                        className={`text-[11.5px] font-black mt-1 ${alert.isYellow ? "text-amber-600" : "text-red-600"}`}
                      >
                        Suggest: {alert.suggest} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="suppliers-btn-gradient w-full bg-gradient-to-r from-red-600 to-rose-500 py-3.5 rounded-xl text-[13px] font-black flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Order All Urgent Items
              </button>
            </div>

            {/* Recent Requests */}
            <div className="suppliers-panel suppliers-hover-card rounded-[24px] border border-gray-100 p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[16px] font-black text-gray-900 tracking-tight">
                  Recent Requests
                </h3>
                <Link
                  href="/suppliers/purchases"
                  className="text-[12px] font-black text-blue-600 hover:text-blue-800"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4 flex-1">
                {MOCK_REQUESTS.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col justify-between items-start gap-1 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[13px] font-bold text-gray-900 font-mono">
                        {req.id}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                          req.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : req.status === "Pending"
                              ? "bg-amber-100 text-amber-700"
                              : req.status === "Ordered"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-50 text-red-500"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <span className="text-[12px] font-semibold text-gray-500">
                      {req.supplier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}