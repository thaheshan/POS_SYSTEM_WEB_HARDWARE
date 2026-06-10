"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  PlusCircle,
  FileText,
  ShoppingCart,
  Wrench,
  Copy,
  Check,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StatsCard from "@/components/dashboard/StatsCard";
import SalesChart from "@/components/dashboard/SalesChart";
import ProductList from "@/components/dashboard/ProductList";
import TransactionTable from "@/components/dashboard/TransactionTable";
import QuickActions from "@/components/dashboard/QuickActions";
import AlertBanner from "@/components/dashboard/AlertBanner";
import LowStockAlertModal from "@/components/dashboard/low-stock-alert";
import { useDashboardStats, useLowStockCount, usePendingPayments } from '@/hooks/useDashboard';
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const isAdmin = user?.role === "admin" || user?.role === "owner";
  const isStaff = user?.role === "staff" || user?.role === "cashier";
  
  const { stats, loading } = useDashboardStats();
  const lowStockCount = useLowStockCount();
  const { data: pendingPayments, loading: pendingLoading } = usePendingPayments();

  const [shopOwnerId, setShopOwnerId] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate or fetch Shop Owner ID
    const getOrGenerateId = () => {
      const savedId = localStorage.getItem("shopOwnerId");
      const savedShopName = localStorage.getItem("shopName_saved") || "";
      const currentShopName = localStorage.getItem("shopName") || "ABC Hardware Store";

      if (savedId && savedShopName === currentShopName) {
        setShopOwnerId(savedId);
      } else {
        const cleanName = currentShopName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const newId = `${cleanName}${randomNum}`;
        localStorage.setItem("shopOwnerId", newId);
        localStorage.setItem("shopName_saved", currentShopName);
        setShopOwnerId(newId);
      }
    };

    getOrGenerateId();

    // Listen to custom updates (e.g. from ShopProfileSettings saving changes)
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setShopOwnerId(customEvent.detail);
      } else {
        getOrGenerateId();
      }
    };

    window.addEventListener("shop-owner-id-updated", handleUpdate);
    return () => {
      window.removeEventListener("shop-owner-id-updated", handleUpdate);
    };
  }, []);

  const handleCopyId = async () => {
    if (!shopOwnerId) return;
    try {
      await navigator.clipboard.writeText(shopOwnerId);
      setCopied(true);
      toast.success("Shop Owner ID copied successfully", {
        id: "shop-owner-id-copy-toast",
        style: {
          fontWeight: "bold",
          fontSize: "13px",
          borderRadius: "12px",
        }
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy Shop Owner ID");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "owner", "manager", "staff", "cashier"]}>
      <MainLayout>
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isStaff ? "Employee Dashboard" : "Dashboard Overview"}
              </h2>
              <p className="text-gray-500 mt-1 font-medium italic">
                {user?.role === "admin" 
                  ? "Welcome back, Shop Owner! Management mode active." 
                  : user?.role === "manager" 
                  ? `Welcome back, ${user?.name || "Member"}! Reviewing operational data.`
                  : `Welcome back, ${user?.name || "Member"}! Here are your service and sales stats.`}
              </p>
              
              {/* Shop Owner ID section */}
              {isAdmin && shopOwnerId && (
                <div className="mt-4 flex items-center gap-3 bg-white border border-gray-100 rounded-[14px] p-3 shadow-sm max-w-[340px] hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-[10px] bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                    <Store className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">
                      Shop Owner ID
                    </p>
                    <span className="font-mono text-[14px] font-black text-gray-800 tracking-wider">
                      {shopOwnerId}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className={cn(
                      "p-2 rounded-[8px] transition-all active:scale-95 border",
                      copied
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "hover:bg-gray-50 text-gray-400 hover:text-gray-600 border-transparent hover:border-gray-100"
                    )}
                    title="Copy Shop Owner ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
            <Link 
              href="/pos"
              className="bg-[#2563eb] text-white px-8 py-3.5 rounded-[12px] font-black text-sm hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              New Sale
            </Link>
          </div>

          {/* Stats Grid - Role Based Access */}
          <div className={cn(
            "grid gap-6",
            isAdmin 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" 
              : "grid-cols-1 md:grid-cols-3 w-full"
          )}>
            {!isStaff ? (
              <StatsCard
                title={isAdmin ? "Today's Sales" : "Today's Operations"}
                value={loading ? "Loading..." : `LKR ${(stats?.todaySales || 0).toLocaleString()}`}
                icon={FileText}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                subtext={loading ? "..." : isAdmin ? `${stats?.todayTransactions || 0} transactions` : "Operational Records"}
                viewAllHref="/sales"
              />
            ) : (
              <StatsCard
                title="Your Service Entries"
                value={loading ? "Loading..." : `LKR ${(stats?.staffServiceRevenue || 0).toLocaleString()}`}
                icon={Wrench}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                subtext={loading ? "..." : `${stats?.staffServiceEntries || 0} logs today`}
                viewAllHref="/sales/category-c"
              />
            )}

            <StatsCard
              title={isStaff ? "Your Sales" : "Low Stock Items"}
              value={isStaff ? (loading ? "Loading..." : `LKR ${(stats?.staffSales || 0).toLocaleString()}`) : (loading ? "..." : `${lowStockCount} Products`)}
              icon={isStaff ? DollarSign : Package}
              iconBg={isStaff ? "bg-emerald-50" : "bg-green-50"}
              iconColor={isStaff ? "text-emerald-600" : "text-green-600"}
              subtext={isStaff ? (loading ? "..." : `${stats?.staffTransactions || 0} transactions`) : "Need reordering"}
              viewAllHref={isStaff ? "/pos" : "/inventory"}
              onClick={!isStaff ? () => setIsLowStockModalOpen(true) : undefined}
            />

            <StatsCard
              title={isStaff ? "Active Orders" : "Active Customers"}
              value={isStaff ? (loading ? "Loading..." : `${stats?.staffActiveOrders || 0} Orders`) : (loading ? "..." : (stats?.totalCustomers || 0).toLocaleString())}
              icon={isStaff ? ShoppingCart : Users}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext={isStaff ? "Pending processing" : "Registered customers"}
              viewAllHref={isStaff ? "/sales" : "/customers"}
            />

            {isAdmin && (
              <StatsCard
                title="Monthly Revenue"
                value={loading ? "Loading..." : `LKR ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
                icon={TrendingUp}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
                trend={{ value: "15.3%", isUp: true }}
                subtext="Target: LKR 6M"
                viewAllHref="/reports"
              />
            )}
          </div>

          {/* Charts Row - Adaptive Based on Role */}
          {!isStaff && (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-2/3">
                <SalesChart title="Revenue Analytics" />
              </div>
              <div className="lg:w-1/3">
                <ProductList />
              </div>
            </div>
          )}

          {/* Transactions and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TransactionTable />
            </div>
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>

          {/* Alert Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {!isStaff && (
              <AlertBanner
                type="stock"
                title="Low Stock Alert"
                message={
                  lowStockCount > 0
                    ? `${lowStockCount} product${lowStockCount !== 1 ? 's are' : ' is'} running low on stock and need immediate reordering.`
                    : "All products are sufficiently stocked. No reordering needed right now."
                }
                actionText="View Inventory"
                onActionClick={lowStockCount > 0 ? () => setIsLowStockModalOpen(true) : undefined}
              />
            )}
            {isAdmin && (
              <AlertBanner
                type="payment"
                title="Pending Payments"
                message={
                  pendingLoading
                    ? "Loading pending payment data..."
                    : pendingPayments.count > 0
                    ? `You have ${pendingPayments.count} pending payment${pendingPayments.count !== 1 ? 's' : ''} totaling LKR ${pendingPayments.total.toLocaleString()} that require follow-up.`
                    : "No pending payments at the moment. All payments are up to date."
                }
                actionText="Process Payments"
              />
            )}
          </div>
        </div>
      </MainLayout>
      <LowStockAlertModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
      />
    </ProtectedRoute>
  );
}