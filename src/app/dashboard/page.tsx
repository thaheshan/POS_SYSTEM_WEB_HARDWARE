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

interface SubscriptionStatus {
  subscriptionStatus: string;
  nextPaymentDue: string | null;
  selfReportedPaid: boolean;
  paymentStatus: string;
  daysUntilDue: number | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const isAdmin = user?.role === "admin" || user?.role === "owner";
  const isStaff = user?.role === "staff" || user?.role === "cashier";
  
  const { stats, loading } = useDashboardStats();
  const lowStockCount = useLowStockCount();
  const { data: pendingPayments, loading: pendingLoading } = usePendingPayments();

  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchSub = async () => {
      try {
        const res = await fetch('/api/shop/subscription-status');
        if (res.ok) {
          const data = await res.json();
          setSubStatus(data.data || data);
        }
      } catch (err) {
        console.error("Failed to fetch sub status", err);
      } finally {
        setSubLoading(false);
      }
    };
    fetchSub();
  }, [isAdmin]);

  const handleSelfReportPayment = async () => {
    try {
      const res = await fetch('/api/shop/self-report-payment', { method: 'POST' });
      if (res.ok) {
        alert("Payment reported successfully! It is now pending admin verification.");
        // refresh status
        const fetchRes = await fetch('/api/shop/subscription-status');
        const data = await fetchRes.json();
        setSubStatus(data.data || data);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to report payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error reporting payment");
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
            {isAdmin && subStatus && subStatus.daysUntilDue !== null && subStatus.daysUntilDue <= 14 && (
              <AlertBanner
                type={subStatus.selfReportedPaid ? "info" : (subStatus.daysUntilDue <= 3 ? "critical" : "warning")}
                title={subStatus.selfReportedPaid ? "Payment Under Review" : "Subscription Payment Due"}
                message={
                  subStatus.selfReportedPaid
                    ? `You marked this month's payment as PAID. Waiting for admin confirmation. Next payment due: ${new Date(subStatus.nextPaymentDue!).toLocaleDateString()}`
                    : `Please complete your subscription payment before ${new Date(subStatus.nextPaymentDue!).toLocaleDateString()} to avoid account suspension.`
                }
                actionText={subStatus.selfReportedPaid ? "Paid" : "Mark as Paid"}
                onActionClick={subStatus.selfReportedPaid ? undefined : handleSelfReportPayment}
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