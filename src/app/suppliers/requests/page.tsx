"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import {
  FileText,
  Hourglass,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import api from "@/api/axiosInstance";
import { toast } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

interface RequestItem {
  id: string;
  productId: string;
  qty: number;
  stock: number;
  isLow: boolean;
}

interface Alert {
  id: string;
  product: string;
  current: number;
  min: number;
  suggest: number;
  isYellow: boolean;
  isRed: boolean;
}

export default function RequestSupplierPage() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedOrders: 0,
    lowStockItems: 0,
  });
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [supplierId, setSupplierId] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [notes, setNotes] = useState("");
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [statsRes, supRes, stockRes, reqListRes] = await Promise.allSettled([
        api.get("/suppliers/requests/stats"),
        api.get("/suppliers"),
        api.get("/stock"), // Fetch existing stock endpoint
        api.get("/suppliers/requests/list"),
      ]);

      // Stats will be set after stock computation below (with correct lowStockItems override)
      if (supRes.status === "fulfilled") {
        let rawSup = supRes.value.data?.data || supRes.value.data || supRes.value;
        if (rawSup && !Array.isArray(rawSup) && Array.isArray(rawSup.data)) {
          rawSup = rawSup.data;
        }
        setSuppliers(Array.isArray(rawSup) ? rawSup : []);
      }
      
      // Map stock to products & compute low stock alerts on frontend!
      let localAlertsCount = 0;
      if (stockRes.status === "fulfilled") {
        const stockItems = stockRes.value.data?.data || stockRes.value.data || [];
        
        const products = stockItems.map((item: any) => {
          const qty = item.available_quantity ?? item.quantity ?? 0;
          const minStock = item.minimum_stock_level ?? item.product?.minimumStockLevel ?? 0;
          return {
            id: item.product_id || item.id,
            name: item.product_name || item.product?.name || "Unknown",
            sku: item.sku || item.product?.sku || "N/A",
            stock: qty,
            minStock: minStock,
          };
        });
        
        // Remove duplicates by product ID in case of multiple warehouses
        const uniqueProducts = Array.from(new Map(products.map((p: any) => [p.id, p])).values()) as any[];
        setAllProducts(uniqueProducts);

        // Generate Urgent Alerts
        const alertsData = uniqueProducts
          .filter((p) => p.stock === 0 || (p.minStock > 0 && p.stock <= p.minStock))
          .map((p) => {
            const isOutOfStock = p.stock === 0;
            const suggestQty = p.minStock > 0 ? p.minStock * 2 : 10;
            return {
              id: p.id,
              product: p.name,
              current: p.stock,
              min: p.minStock,
              suggest: suggestQty,
              isYellow: !isOutOfStock && p.minStock > 0 && p.stock <= p.minStock,
              isRed: isOutOfStock,
            };
          });
        setAlerts(alertsData);
        localAlertsCount = alertsData.length;
      }



      let allRequests: any[] = [];
      if (reqListRes.status === "fulfilled") {
        let rawList = reqListRes.value.data?.data || reqListRes.value.data;
        // Handle double-wrapping from global interceptors
        if (rawList && !Array.isArray(rawList) && Array.isArray(rawList.data)) {
          rawList = rawList.data;
        }
        allRequests = Array.isArray(rawList) ? rawList : [];
        setRecentRequests(allRequests);
      }

      // Always compute stats from the actual fetched list as the ground truth
      const total = allRequests.length;
      const pending = allRequests.filter((r: any) => r.status === "Pending").length;
      const completed = allRequests.filter((r: any) => r.status === "Completed").length;

      setStats({
        totalRequests: total,
        pendingRequests: pending,
        completedOrders: completed,
        lowStockItems: localAlertsCount,
      });

    } catch (error) {
      console.error("Failed to load request data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProductRow = () => {
    setRequestItems([
      ...requestItems,
      {
        id: Date.now().toString() + Math.random(),
        productId: "",
        qty: 1,
        stock: 0,
        isLow: false,
      },
    ]);
  };

  const handleRemoveProductRow = (rowId: string) => {
    setRequestItems((prev) => prev.filter((item) => item.id !== rowId));
  };

  const handleProductChange = (rowId: string, productId: string) => {
    const selected = allProducts.find((p) => p.id === productId);
    setRequestItems((prev) =>
      prev.map((item) =>
        item.id === rowId
          ? {
              ...item,
              productId,
              stock: selected ? selected.stock : 0,
              isLow: selected ? selected.stock <= selected.minStock : false,
            }
          : item
      )
    );
  };

  const updateRequestStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/suppliers/requests/${id}/status`, { status: newStatus });
      toast.success(`Request ${id} updated to ${newStatus}`);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
    }
  };

  const handleQtyChange = (rowId: string, qty: number) => {
    setRequestItems((prev) => prev.map((item) => (item.id === rowId ? { ...item, qty } : item)));
  };

  const handleSubmit = async (status: string) => {
    if (requestItems.length === 0) {
      toast.error("Please add at least one product to the request");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        supplierId: supplierId || null,
        priority,
        notes,
        status,
        items: requestItems.map((item) => {
          const p = allProducts.find((ap) => ap.id === item.productId);
          return {
            productId: item.productId,
            productName: p ? p.name : "Unknown",
            quantity: item.qty,
          };
        }),
      };

      await api.post("/suppliers/requests", payload);
      toast.success(`Request saved as ${status}`);

      // Reset form
      setSupplierId("");
      setPriority("Normal");
      setNotes("");
      setRequestItems([]);
      
      // Refresh Data
      fetchData();
    } catch (error) {
      console.error("Failed to submit request", error);
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderAllUrgent = () => {
    if (alerts.length === 0) {
      toast.error("No urgent items to order!");
      return;
    }
    const newItems = alerts.map((alert) => {
      return {
        id: Date.now().toString() + Math.random(),
        productId: alert.id,
        qty: alert.suggest,
        stock: alert.current,
        isLow: true,
      };
    });
    setRequestItems(newItems);
    setSupplierId(""); // Reset supplier, creating a general request
    toast.success("Added all urgent items to request");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </MainLayout>
    );
  }

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
          <div className="suppliers-kpi-card rounded-[20px] p-6 border border-gray-100 flex flex-col justify-between h-[140px] suppliers-delay-1 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-500">Total Requests</p>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div>
              <h3 className="text-[34px] font-black tracking-tight text-gray-900 leading-none mb-2">
                {stats.totalRequests !== undefined ? stats.totalRequests : 0}
              </h3>
              <p className="text-[12px] font-bold text-emerald-500 flex items-center gap-1">
                Active tracked requests
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card rounded-[20px] p-6 border border-gray-100 flex flex-col justify-between h-[140px] suppliers-delay-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-500">Pending Requests</p>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div>
              <h3 className="text-[34px] font-black tracking-tight text-gray-900 leading-none mb-2">
                {stats.pendingRequests !== undefined ? stats.pendingRequests : 0}
              </h3>
              <p className="text-[12px] font-bold text-orange-500 flex items-center gap-1">
                Awaiting approval <Hourglass className="w-3 h-3" />
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card rounded-[20px] p-6 border border-gray-100 flex flex-col justify-between h-[140px] suppliers-delay-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-500">Completed Orders</p>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
              </div>
            </div>
            <div>
              <h3 className="text-[34px] font-black tracking-tight text-gray-900 leading-none mb-2">
                {stats.completedOrders !== undefined ? stats.completedOrders : 0}
              </h3>
              <p className="text-[12px] font-bold text-[#059669] flex items-center gap-1">
                Successfully delivered <CheckCircle2 className="w-3 h-3" />
              </p>
            </div>
          </div>

          <div className="suppliers-kpi-card rounded-[20px] p-6 border border-gray-100 flex flex-col justify-between h-[140px] suppliers-delay-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-500">Low Stock Items</p>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div>
              <h3 className="text-[34px] font-black tracking-tight text-gray-900 leading-none mb-2">
                {stats.lowStockItems !== undefined ? stats.lowStockItems : 0}
              </h3>
              <p className="text-[12px] font-bold text-red-500 flex items-center gap-1">
                Urgent reorder needed <AlertTriangle className="w-3 h-3" />
              </p>
            </div>
          </div>
        </div>

        {/* MAIN SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT TIER: CREATE NEW REQUEST */}
          <div className="lg:col-span-2 suppliers-panel rounded-[24px] border border-gray-100 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 p-6 flex justify-between items-center text-white shrink-0">
              <h3 className="text-[18px] font-black tracking-tight">Create New Request</h3>
              <button
                onClick={() => {
                  setSupplierId("");
                  setPriority("Normal");
                  setNotes("");
                  setRequestItems([]);
                }}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors"
              >
                <Plus className="w-4 h-4" /> Reset Form
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Supplier & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700">Supplier (Optional)</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[13px] font-semibold text-gray-700 outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">General (Unassigned)</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[13px] font-semibold text-gray-700 outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Products List */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[15px] font-black text-gray-900">Products to Request</h4>
                  <button
                    onClick={handleAddProductRow}
                    className="text-[13px] font-black text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                <div className="space-y-4">
                  {requestItems.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-sm font-bold text-gray-400">No products added yet.</p>
                    </div>
                  ) : (
                    requestItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100"
                      >
                        <div className="md:col-span-5 space-y-2">
                          <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                            Product
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(item.id, e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-semibold text-gray-700 outline-none focus:border-blue-500 transition-colors"
                          >
                            <option value="">Select Product</option>
                            {allProducts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-3 space-y-2">
                          <label className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">
                            Current Stock
                          </label>
                          <div className="flex items-center gap-2 h-[46px]">
                            <span
                              className={`text-[13px] font-black ${
                                item.isLow ? "text-red-600" : "text-gray-900"
                              }`}
                            >
                              {item.stock} units
                            </span>
                            {item.isLow && (
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
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-black text-gray-900 outline-none focus:border-blue-500 transition-colors font-mono"
                          />
                        </div>
                        <div className="md:col-span-1 flex justify-end h-[46px] items-center">
                          <button
                            onClick={() => handleRemoveProductRow(item.id)}
                            className="w-11 h-11 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center text-red-500 transition-colors shadow-sm border border-red-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-gray-700">Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or special instructions..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-[13px] font-semibold text-gray-700 outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Actions */}
              <div className="pt-6 border-t border-gray-100 flex justify-end items-center gap-4">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("Draft")}
                  className="px-6 py-3.5 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition-colors min-w-[140px]"
                >
                  Save as Draft
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSubmit("Pending")}
                  className="suppliers-btn-gradient bg-gradient-to-r from-blue-700 to-indigo-500 px-8 py-3.5 rounded-xl text-[14px] font-black min-w-[160px] flex items-center justify-center text-white disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT TIER: ALERTS & RECENT */}
          <div className="flex flex-col gap-6">
            {/* Urgent Alerts */}
            <div className="suppliers-panel rounded-[24px] border border-gray-100 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-[16px] font-black text-gray-900 tracking-tight">Urgent Alerts</h3>
              </div>

              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-sm font-bold text-gray-400">No urgent alerts.</p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border ${
                        alert.isYellow ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100"
                      } flex gap-3 items-start shadow-sm`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          alert.isYellow ? "text-amber-500" : "text-red-500"
                        }`}
                      />
                      <div>
                        <h4
                          className={`text-[13px] font-black ${
                            alert.isYellow ? "text-amber-900" : "text-red-900"
                          }`}
                        >
                          {alert.product}
                        </h4>
                        <p
                          className={`text-[11px] font-bold mt-1 ${
                            alert.isYellow ? "text-amber-700" : "text-red-700"
                          }`}
                        >
                          Stock: {alert.current} units (Min: {alert.min})
                        </p>
                        <p
                          className={`text-[11.5px] font-black mt-1 ${
                            alert.isYellow ? "text-amber-600" : "text-red-600"
                          }`}
                        >
                          Suggest: {alert.suggest} units
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={handleOrderAllUrgent}
                className="suppliers-btn-gradient w-full bg-gradient-to-r from-red-600 to-rose-500 py-3.5 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 text-white"
              >
                <ShoppingCart className="w-4 h-4" /> Order All Urgent Items
              </button>
            </div>

            {/* Recent Requests */}
            <div className="suppliers-panel rounded-[24px] border border-gray-100 p-6 flex-1 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
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
                {recentRequests.length === 0 ? (
                  <p className="text-sm font-bold text-gray-400">No requests found.</p>
                ) : (
                  recentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex flex-col justify-between items-start gap-1 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100"
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-[13px] font-bold text-gray-900 font-mono">
                          {req.id}
                        </span>
                        <select
                          value={req.status}
                          onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                          className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest outline-none border-none cursor-pointer appearance-none ${
                            req.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : req.status === "Pending"
                              ? "bg-amber-100 text-amber-700"
                              : req.status === "Ordered"
                              ? "bg-blue-100 text-blue-700"
                              : req.status === "In Progress"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Pending">Pending</option>
                          <option value="Ordered">Ordered</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      <span className="text-[12px] font-semibold text-gray-500">
                        {req.supplier}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}