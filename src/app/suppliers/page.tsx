"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import {
  Building2,
  Truck,
  Wallet,
  Receipt,
  AlertCircle,
  Search,
  Plus,
  FileText,
  FileSpreadsheet,
  RefreshCcw,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  FileBadge,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import AddSupplierModal from "@/components/suppliers/AddSupplierModal";
import {
  MOCK_SUPPLIERS,
  MOCK_PURCHASE_ACTIVITY,
} from "@/lib/suppliers-mock-data";

export default function SuppliersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const RADIAN = Math.PI / 180;

  const chartData = [
    { name: "pending", value: 20, gradientId: "pendingGradient" },
    { name: "paid", value: 45, gradientId: "paidGradient" },
    { name: "overdue", value: 35, gradientId: "overdueGradient" },
  ];

  const renderPieLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
  }: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    const safeCx = cx ?? 0;
    const safeCy = cy ?? 0;
    const safeMidAngle = midAngle ?? 0;
    const safeOuterRadius = outerRadius ?? 0;
    const radius = safeOuterRadius * 0.62;
    const x = safeCx + radius * Math.cos(-safeMidAngle * RADIAN);
    const y = safeCy + radius * Math.sin(-safeMidAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: "15px",
          fontWeight: 800,
          paintOrder: "stroke",
          stroke: "rgba(15,23,42,0.2)",
          strokeWidth: 1,
        }}
      >
        {`${((percent || 0) * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20 suppliers-page-shell">
        {/* 5 KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="suppliers-kpi-card suppliers-hover-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-1">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1e40af] flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                ↑ 5%
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              Total Suppliers
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              48
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              +4 in this month
            </p>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-2">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                ↑ 14%
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              Active Suppliers
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              45
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              +2 activated this month
            </p>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-3">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#9333ea] flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                ↑ 8.2%
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              Total Outstanding Payable
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              LKR 1,250,000
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              +LKR . 180,000 vs last month
            </p>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-4">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center shadow-sm">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                ↑ 12.2%
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              This Month Purchases
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              LKR 820,000
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              32 purchase orders this month
            </p>
          </div>

          <div className="suppliers-kpi-card suppliers-hover-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#dc2626] flex items-center justify-center shadow-sm">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                ! 3
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              Overdue Payments
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              LKR 180,000
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              3 suppliers overdue
            </p>
          </div>
        </div>

        {/* TOP ACTION BARS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="suppliers-btn-gradient rounded-[16px] p-4 flex items-center justify-center gap-3 active:scale-[0.98] bg-gradient-to-r from-emerald-600 to-emerald-500"
          >
            <div className="bg-white/20 p-1.5 rounded-full">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-black">Add New Supplier</span>
          </button>
          <button className="suppliers-btn-gradient rounded-[16px] p-4 flex items-center justify-center gap-3 active:scale-[0.98] bg-gradient-to-r from-red-500 to-orange-500">
            <div className="bg-white/20 p-1.5 rounded-md">
              <FileBadge className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-black">
              Create Purchase Order
            </span>
          </button>
          <button
            onClick={() => router.push("/reports")}
            className="suppliers-btn-gradient rounded-[16px] p-4 flex items-center justify-center gap-3 active:scale-[0.98] bg-gradient-to-r from-sky-600 to-cyan-500"
          >
            <div className="bg-white/20 p-1.5 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-black">
              View Supplier Reports
            </span>
          </button>
          <button className="suppliers-btn-gradient rounded-[16px] p-4 flex items-center justify-center gap-3 active:scale-[0.98] bg-gradient-to-r from-amber-600 to-yellow-500">
            <span className="text-[16px] font-black bg-white/20 w-7 h-7 rounded-full flex items-center justify-center">
              $
            </span>
            <span className="text-[14px] font-black">Payment Records</span>
          </button>
        </div>

        {/* SUPPLIER TABLE STRIP */}
        <div className="suppliers-panel rounded-[24px] border border-gray-100 flex flex-col mb-8 overflow-hidden">
          {/* Filtering Toolbar */}
          <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Suppliers by Name, company or Email..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-[12px] text-[13px] font-medium outline-none focus:border-[#1e40af] transition-colors bg-gray-50/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <select className="border border-gray-200 rounded-[12px] px-4 py-3 text-[13px] font-bold text-gray-600 outline-none hover:bg-gray-50 bg-white min-w-[120px]">
                <option>Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <button className="w-11 h-11 border border-gray-200 rounded-[12px] flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                <FileText className="w-4 h-4" />
              </button>
              <button className="w-11 h-11 border border-gray-200 rounded-[12px] flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-colors">
                <FileSpreadsheet className="w-4 h-4" />
              </button>
              <button className="w-11 h-11 border border-gray-200 rounded-[12px] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </button>
              <button className="w-11 h-11 border border-gray-200 rounded-[12px] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/suppliers/requests")}
                className="suppliers-btn-gradient bg-gradient-to-r from-blue-700 to-blue-500 rounded-[12px] px-6 py-3 flex items-center gap-2 text-[13px] font-black ml-2"
              >
                <PlusCircle className="w-4 h-4" /> Request Supplier
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="py-4 px-6 w-12">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-600 tracking-wide cursor-pointer">
                    Code ⇅
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-600 tracking-wide">
                    Supplier
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-600 tracking-wide">
                    Email
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-600 tracking-wide">
                    Phone
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-600 tracking-wide">
                    Location
                  </th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-600 tracking-wide">
                    Status
                  </th>
                  <th className="py-4 px-6 text-[12px] font-black text-gray-600 tracking-wide text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_SUPPLIERS.filter((s) =>
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()),
                ).map((sup) => (
                  <tr
                    key={sup.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-4 text-[13px] font-bold text-gray-500 font-mono tracking-tight">
                      {sup.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden shrink-0">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${sup.name}&backgroundColor=f8fafc`}
                            alt={sup.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[13.5px] font-bold text-gray-900">
                          {sup.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[13px] font-semibold text-gray-500">
                      {sup.email}
                    </td>
                    <td className="py-4 px-4 text-[13px] font-semibold text-gray-500">
                      {sup.phone}
                    </td>
                    <td className="py-4 px-4 text-[13px] font-semibold text-gray-500 capitalize">
                      {sup.location}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10.5px] font-black uppercase tracking-widest ${
                          sup.status === "Active"
                            ? "bg-[#ecfdf5] text-[#059669]"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${sup.status === "Active" ? "bg-[#059669]" : "bg-red-500"}`}
                        />
                        {sup.status}
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
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[12px] font-bold text-gray-400">
            <span>Showing 1 to 12 of 1,248 suppliers</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="border border-gray-200 rounded-md px-2 py-1 outline-none bg-white font-bold text-gray-700">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:text-gray-900">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-7 h-7 flex items-center justify-center bg-[#059669] text-white rounded-md">
                  1
                </button>
                <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-700 rounded-md">
                  2
                </button>
                <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-700 rounded-md">
                  3
                </button>
                <span className="px-1 text-gray-400">...</span>
                <button className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-700 rounded-md">
                  25
                </button>
                <button className="p-1 hover:text-gray-900">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Recent Purchase Activity */}
          <div className="lg:col-span-2 suppliers-panel suppliers-hover-card rounded-[24px] border border-gray-100 p-6 flex flex-col h-full min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[16px] font-black text-gray-900 tracking-tight uppercase">
                Recent Purchase Activity
              </h3>
              <button
                onClick={() => router.push("/suppliers/purchases")}
                className="text-[13px] font-bold text-[#1e40af] hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Supplier
                    </th>
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      PO no
                    </th>
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      Invoice no
                    </th>
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {MOCK_PURCHASE_ACTIVITY.slice(0, 4).map((pa) => (
                    <tr key={pa.id} className="hover:bg-gray-50/50">
                      <td className="py-4 text-[13px] font-semibold text-gray-600">
                        {pa.date}
                      </td>
                      <td className="py-4 text-[13.5px] font-bold text-gray-900">
                        {pa.supplier}
                      </td>
                      <td className="py-4">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[11px] font-bold tracking-tight">
                          {pa.poNo}
                        </span>
                      </td>
                      <td className="py-4 text-[13px] font-bold text-[#1e40af] font-mono tracking-tight">
                        {pa.invoice}
                      </td>
                      <td className="py-4 text-[14px] font-black text-gray-900 font-mono tracking-tighter text-right">
                        LKR {pa.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payable Status Donut */}
          <div className="suppliers-panel suppliers-hover-card rounded-[24px] border border-gray-100 p-8 flex flex-col items-center min-h-[400px]">
            <h3 className="text-[16px] font-black text-gray-900 tracking-tight w-full text-left mb-4">
              Payable status
            </h3>

            <div className="w-[200px] h-[200px] relative flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient
                      id="pendingGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <linearGradient
                      id="paidGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient
                      id="overdueGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    label={renderPieLabel as any}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#${entry.gradientId})`}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 w-full justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2563eb]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  pending
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#d97706]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  paid
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#059669]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  overdue
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </MainLayout>
  );
}
