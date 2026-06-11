"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import api from "@/api/axiosInstance";
import {
  ArrowLeft,
  Search,
  Filter,
  CloudDownload,
  Eye,
  Trash2,
  DollarSign,
  Receipt,
  XCircle,
  Coins,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function PurchaseActivityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedOrders: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: string; newStatus: string } | null>(null);

  const confirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;
    try {
      await api.put(`/suppliers/requests/${pendingStatusUpdate.id}/status`, { status: pendingStatusUpdate.newStatus });
      toast.success(`Status updated to ${pendingStatusUpdate.newStatus}`);
      setPendingStatusUpdate(null);
      fetchData(); // refresh the list
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
      setPendingStatusUpdate(null);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, statsRes] = await Promise.allSettled([
        api.get("/suppliers/requests/list"),
        api.get("/suppliers/requests/stats"),
      ]);

      if (reqRes.status === "fulfilled") {
        const raw = reqRes.value.data;
        let list = raw?.data?.data || raw?.data || raw;
        if (list && !Array.isArray(list) && Array.isArray(list.data)) {
          list = list.data;
        }
        setRequests(Array.isArray(list) ? list : []);
      }

      if (statsRes.status === "fulfilled") {
        const raw = statsRes.value.data;
        let d =
          raw?.data?.data?.totalRequests !== undefined
            ? raw.data.data
            : raw?.data?.totalRequests !== undefined
            ? raw.data
            : raw?.totalRequests !== undefined
            ? raw
            : null;
        if (d) {
          setStats({
            totalRequests: d.totalRequests ?? 0,
            pendingRequests: d.pendingRequests ?? 0,
            completedOrders: d.completedOrders ?? 0,
            totalItems: 0,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load purchase activity", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.supplier || "").toLowerCase().includes(term) ||
      (r.id || "").toLowerCase().includes(term) ||
      (r.status || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalItemsCount = requests.reduce((sum, r) => {
    const items = Array.isArray(r.items) ? r.items : [];
    return sum + items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);
  }, 0);

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

        {/* 4 KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="suppliers-kpi-card rounded-[20px] p-6 border border-gray-100 flex flex-col gap-4 min-h-[155px] suppliers-delay-1 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 text-[#059669]" />
              </div>
              <div className="text-[12px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                Live
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-500 mb-1">
                Total Requests
              </p>
              <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none mb-2">
                {isLoading ? "—" : stats.totalRequests}
              </h3>
              <p className="text-[11px] font-bold text-emerald-500">
                All supplier requests
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card rounded-[20px] p-6 border border-gray-100 flex flex-col gap-4 min-h-[155px] suppliers-delay-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-[12px] font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                Live
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-500 mb-1">
                Pending Requests
              </p>
              <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none mb-2">
                {isLoading ? "—" : stats.pendingRequests}
              </h3>
              <p className="text-[11px] font-bold text-orange-500">
                Awaiting approval
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card rounded-[20px] p-6 border border-gray-100 flex flex-col gap-4 min-h-[155px] suppliers-delay-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-yellow-100/50 flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-[12px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                Live
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-500 mb-1">
                Completed Orders
              </p>
              <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none mb-2">
                {isLoading ? "—" : stats.completedOrders}
              </h3>
              <p className="text-[11px] font-bold text-yellow-600">
                Successfully delivered
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card rounded-[20px] p-6 border border-gray-100 flex flex-col gap-4 min-h-[155px] suppliers-delay-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-[12px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                Live
              </div>
            </div>
            <div>
              <p className="text-[12px] font-bold text-gray-500 mb-1">
                Total Items Requested
              </p>
              <h3 className="text-[30px] font-black tracking-tight text-gray-900 leading-none mb-2">
                {isLoading ? "—" : totalItemsCount}
              </h3>
              <p className="text-[11px] font-bold text-red-500">
                Across all requests
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
                placeholder="Search by supplier, request no, or status"
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-[12px] text-[13px] font-medium outline-none focus:border-[#1e40af] transition-colors"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                  <th className="py-4 px-6 text-[12px] font-black text-gray-700 tracking-wide w-[140px]">Date</th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-700 tracking-wide min-w-[180px]">Supplier</th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-700 tracking-wide">Request No</th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-700 tracking-wide">Priority</th>
                  <th className="py-4 px-4 text-[12px] font-black text-gray-700 tracking-wide text-center">Items</th>
                  <th className="py-4 px-6 text-[12px] font-black text-gray-700 tracking-wide text-center">Status</th>
                  <th className="py-4 px-6 text-[12px] font-black text-gray-700 tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[13px] font-bold text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[13px] font-bold text-gray-400">
                      No purchase activity found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((req: any) => {
                    const itemCount = Array.isArray(req.items)
                      ? req.items.reduce((s: number, i: any) => s + (i.quantity || 0), 0)
                      : 0;
                    return (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <p className="text-[13px] font-semibold text-gray-600">
                            {req.createdAt
                              ? new Date(req.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </p>
                          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
                            {req.createdAt
                              ? new Date(req.createdAt).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 uppercase text-[10px] font-black">
                              {(req.supplier || "UN").substring(0, 2)}
                            </div>
                            <span className="text-[13.5px] font-bold text-gray-900">
                              {req.supplier || "Unassigned"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono tracking-tight">
                            {req.id}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                              req.priority === "Urgent"
                                ? "bg-red-100 text-red-700"
                                : req.priority === "High"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[14px] font-semibold text-gray-800 text-center">
                          {itemCount}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <select
                            value={req.status}
                            onChange={(e) => setPendingStatusUpdate({ id: req.id, newStatus: e.target.value })}
                            className={`outline-none cursor-pointer appearance-none inline-flex items-center justify-center px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-wide capitalize ${
                              req.status === "Completed"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                                : req.status === "Pending"
                                ? "border-amber-400 bg-amber-50 text-amber-600"
                                : req.status === "Ordered"
                                ? "border-blue-400 bg-blue-50 text-blue-600"
                                : req.status === "In Progress"
                                ? "border-purple-400 bg-purple-50 text-purple-600"
                                : "border-gray-300 bg-gray-50 text-gray-500"
                            }`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="Ordered">Ordered</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2">
                            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toast.error("Delete not yet implemented")}
                              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] font-semibold text-gray-500">
            <div className="flex items-center gap-2">
              <span>Row Per Page</span>
              <select
                className="border border-gray-200 rounded-md px-2 py-1 outline-none font-bold text-gray-700 bg-white"
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="ml-2">
                {filtered.length > 0
                  ? `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filtered.length)} of ${filtered.length}`
                  : "0 Entries"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 flex items-center justify-center border rounded-full font-bold text-[13px] transition-colors ${
                    currentPage === p
                      ? "bg-[#1e40af] text-white border-[#1e40af]"
                      : "border-gray-200 hover:bg-gray-50 text-gray-500"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-full disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingStatusUpdate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-gray-900 mb-2">Confirm Status Update</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">
              Are you sure you want to change request <strong>{pendingStatusUpdate.id}</strong> to <strong>{pendingStatusUpdate.newStatus}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPendingStatusUpdate(null)}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-200"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}