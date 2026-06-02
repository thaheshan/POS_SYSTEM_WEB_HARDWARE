"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import api from "@/api/axiosInstance";
import { toast } from "react-hot-toast";
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

export default function SuppliersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalOutstandingPayable: 0,
    thisMonthPurchases: 0,
    overduePayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);


  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/suppliers');
      const raw = res.data;
      let data = raw?.data?.data || raw?.data || raw || [];
      const list = Array.isArray(data) ? data : [];
      setSuppliers(list);
      
      setStats((prev: any) => ({
        ...prev,
        totalSuppliers: list.length,
        activeSuppliers: list.filter((s: any) => s.status === 'Active' || s.isActive === true).length,
      }));
    } catch (error) {
      console.error('Failed to fetch suppliers', error);
      toast.error('Failed to fetch suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/suppliers/stats');
      const raw = res.data;
      let data = raw?.data?.data?.totalOutstandingPayable !== undefined
        ? raw.data.data
        : raw?.data?.totalOutstandingPayable !== undefined
          ? raw.data
          : raw?.totalOutstandingPayable !== undefined
            ? raw
            : null;
            
      if (data) {
        setStats(prev => ({
          ...prev,
          totalOutstandingPayable: data.totalOutstandingPayable ?? prev.totalOutstandingPayable,
          thisMonthPurchases: data.thisMonthPurchases ?? prev.thisMonthPurchases,
          overduePayments: data.overduePayments ?? prev.overduePayments,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch supplier stats', error);
    }
  };

  const fetchRecentRequests = async () => {
    try {
      const res = await api.get('/suppliers/requests/list');
      const raw = res.data;
      let list = raw?.data?.data || raw?.data || raw;
      if (list && !Array.isArray(list) && Array.isArray(list.data)) {
        list = list.data;
      }
      
      const fullList = Array.isArray(list) ? list : [];
      setRecentRequests(fullList.slice(0, 5));

      // Calculate pseudo-financials based on requests data
      // Assuming average item cost of LKR 5,000 for demonstration
      const AVG_ITEM_PRICE = 5000;
      
      let outstandingPayable = 0;
      let monthPurchases = 0;
      let overdue = 0;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      fullList.forEach((req: any) => {
        const reqDate = req.createdAt ? new Date(req.createdAt) : new Date();
        const itemCount = Array.isArray(req.items) 
          ? req.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
          : 0;
        
        const reqValue = itemCount * AVG_ITEM_PRICE;

        // Pending or Ordered means we are liable to pay (Outstanding)
        if (req.status === 'Pending' || req.status === 'Ordered') {
          outstandingPayable += reqValue;
          
          // Let's assume if it's pending for more than 7 days, it's overdue
          const diffDays = Math.floor((new Date().getTime() - reqDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays > 7) {
            overdue += reqValue;
          }
        }

        // Purchases made this month (Completed or In Progress)
        if (reqDate.getMonth() === currentMonth && reqDate.getFullYear() === currentYear) {
          if (req.status === 'Completed' || req.status === 'In Progress' || req.status === 'Ordered') {
            monthPurchases += reqValue;
          }
        }
      });

      setStats(prev => ({
        ...prev,
        totalOutstandingPayable: outstandingPayable,
        thisMonthPurchases: monthPurchases,
        overduePayments: overdue,
      }));

    } catch (error) {
      console.error('Failed to fetch recent requests', error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchStats();
    fetchRecentRequests();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    
    try {
      setIsDeleting(id);
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier deleted successfully");
      fetchSuppliers();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete supplier", error);
      toast.error("Failed to delete supplier");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setIsAddModalOpen(true);
  };

  const handleModalClose = (refresh?: boolean) => {
    setIsAddModalOpen(false);
    setEditingSupplier(null);
    if (refresh) {
      fetchSuppliers();
      fetchStats();
    }
  };

  const handleNotImplemented = (feature: string) => {
    toast.error(`${feature} is pending the purchasing module update.`);
  };

  const RADIAN = Math.PI / 180;

  const chartData = recentRequests && recentRequests.length > 0 
    ? [
        { name: "Completed", value: recentRequests.filter(r => r.status === "Completed").length, gradientId: "completedGradient" },
        { name: "Pending", value: recentRequests.filter(r => r.status === "Pending").length, gradientId: "pendingGradient" },
        { name: "Ordered", value: recentRequests.filter(r => r.status === "Ordered" || r.status === "In Progress").length, gradientId: "orderedGradient" }
      ].filter(d => d.value > 0)
    : [{ name: "no data", value: 100, gradientId: "noDataGradient" }];

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
          <div className="suppliers-kpi-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-1">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1e40af] flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                Live
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              Total Suppliers
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              {stats.totalSuppliers !== undefined ? stats.totalSuppliers : 0}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              Based on active and inactive
            </p>
          </div>

          <div className="suppliers-kpi-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-2">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                Live
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              Active Suppliers
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              {stats.activeSuppliers !== undefined ? stats.activeSuppliers : 0}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              Currently active in the system
            </p>
          </div>

          <div className="suppliers-kpi-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-3">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#9333ea] flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                Live
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              Total Outstanding Payable
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              LKR {stats.totalOutstandingPayable !== undefined ? stats.totalOutstandingPayable.toLocaleString() : 0}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              Based on pending & ordered items
            </p>
          </div>

          <div className="suppliers-kpi-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-4">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center shadow-sm">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                Live
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              This Month Purchases
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              LKR {stats.thisMonthPurchases !== undefined ? stats.thisMonthPurchases.toLocaleString() : 0}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              Based on completed items this month
            </p>
          </div>

          <div className="suppliers-kpi-card bg-white rounded-[20px] p-6 border border-gray-100 suppliers-delay-5">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#dc2626] flex items-center justify-center shadow-sm">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-[12px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                Live
              </span>
            </div>
            <p className="text-[12px] font-bold text-gray-500 mb-1">
              Overdue Payments
            </p>
            <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none">
              LKR {stats.overduePayments !== undefined ? stats.overduePayments.toLocaleString() : 0}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 mt-2">
              Based on pending &gt; 7 days
            </p>
          </div>
        </div>

        {/* TOP ACTION BARS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="suppliers-btn-gradient rounded-[16px] p-4 flex items-center justify-center gap-3 active:scale-[0.98] bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
          >
            <div className="bg-white/20 p-1.5 rounded-full">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-black">Add New Supplier</span>
          </button>
          <button onClick={() => router.push("/suppliers/requests")} className="suppliers-btn-gradient rounded-[16px] p-4 flex items-center justify-center gap-3 active:scale-[0.98] bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <div className="bg-white/20 p-1.5 rounded-md">
              <FileBadge className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-black">
              Create Purchase Order
            </span>
          </button>
          <button
            onClick={() => router.push("/reports")}
            className="suppliers-btn-gradient rounded-[16px] p-4 flex items-center justify-center gap-3 active:scale-[0.98] bg-gradient-to-r from-sky-600 to-cyan-500 text-white"
          >
            <div className="bg-white/20 p-1.5 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-black">
              View Supplier Reports
            </span>
          </button>
          <button onClick={() => handleNotImplemented("Payment Records")} className="suppliers-btn-gradient rounded-[16px] p-4 flex items-center justify-center gap-3 active:scale-[0.98] bg-gradient-to-r from-amber-600 to-yellow-500 text-white">
            <span className="text-[16px] font-black bg-white/20 w-7 h-7 rounded-full flex items-center justify-center">
              $
            </span>
            <span className="text-[14px] font-black">Payment Records</span>
          </button>
        </div>

        {/* SUPPLIER TABLE STRIP */}
        <div className="suppliers-panel rounded-[24px] border border-gray-100 flex flex-col mb-8 overflow-hidden bg-white">
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
              <button onClick={() => { fetchSuppliers(); fetchStats(); }} className="w-11 h-11 border border-gray-200 rounded-[12px] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <RefreshCcw className="w-4 h-4" />
              </button>
              <button className="w-11 h-11 border border-gray-200 rounded-[12px] flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push("/suppliers/requests")}
                className="suppliers-btn-gradient bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-[12px] px-6 py-3 flex items-center gap-2 text-[13px] font-black ml-2 hover:opacity-90"
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
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 font-bold">Loading suppliers...</td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 font-bold">No suppliers found.</td>
                  </tr>
                ) : suppliers.filter((s) =>
                  s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
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
                      {sup.supplierCode}
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
                      <button 
                        onClick={() => handleEdit(sup)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sup.id)}
                        disabled={isDeleting === sup.id}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
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
            <span>Showing {suppliers.length > 0 ? 1 : 0} to {suppliers.length} of {stats.totalSuppliers || suppliers.length} suppliers</span>
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
          <div className="lg:col-span-2 suppliers-panel rounded-[24px] border border-gray-100 p-6 flex flex-col h-full min-h-[400px] bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
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
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Supplier</th>
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Request No</th>
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest">Priority</th>
                    <th className="py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[13px] font-bold text-gray-400">
                        No recent purchase activity found.
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map((req: any) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 text-[12px] font-semibold text-gray-500">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3 text-[13px] font-bold text-gray-800">{req.supplier || 'Unassigned'}</td>
                        <td className="py-3 text-[12px] font-mono font-bold text-blue-700">{req.id}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                            req.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                          }`}>{req.priority}</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                            req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            req.status === 'Ordered' ? 'bg-blue-100 text-blue-700' :
                            req.status === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>{req.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payable Status Donut */}
          <div className="suppliers-panel rounded-[24px] border border-gray-100 p-8 flex flex-col items-center min-h-[400px] bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <h3 className="text-[16px] font-black text-gray-900 tracking-tight w-full text-left mb-4">
              Payable status
            </h3>

            <div className="w-[200px] h-[200px] relative flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="noDataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e5e7eb" />
                      <stop offset="100%" stopColor="#d1d5db" />
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="pendingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="orderedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#2563eb" />
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
            <div className="flex flex-wrap items-center gap-4 mt-6 w-full justify-center">
              {chartData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    d.gradientId === 'completedGradient' ? 'bg-[#059669]' :
                    d.gradientId === 'pendingGradient' ? 'bg-[#d97706]' :
                    d.gradientId === 'orderedGradient' ? 'bg-[#2563eb]' :
                    'bg-gray-300'
                  }`} />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddSupplierModal
        isOpen={isAddModalOpen}
        supplier={editingSupplier}
        onClose={handleModalClose}
      />
    </MainLayout>
  );
}