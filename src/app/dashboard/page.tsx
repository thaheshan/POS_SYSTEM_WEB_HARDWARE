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

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff" || user?.role === "cashier";

  return (
    <ProtectedRoute allowedRoles={["admin", "manager", "staff", "cashier"]}>
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
                value={isAdmin ? "LKR 245,680" : "LKR 68,450"}
                icon={FileText}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                subtext={isAdmin ? "38 transactions" : "Operational Records"}
                viewAllHref="/sales"
              />
            ) : (
              <StatsCard
                title="Your Service Entries"
                value="LKR 12,500"
                icon={Wrench}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                trend={{ value: "15.2%", isUp: true }}
                subtext="4 logs today"
                viewAllHref="/labour-services"
              />
            )}

            <StatsCard
              title={isStaff ? "Your Sales" : "Low Stock Items"}
              value={isStaff ? "LKR 42,300" : "15 Products"}
              icon={isStaff ? DollarSign : Package}
              iconBg={isStaff ? "bg-emerald-50" : "bg-green-50"}
              iconColor={isStaff ? "text-emerald-600" : "text-green-600"}
              trend={isStaff ? { value: "5.4%", isUp: true } : undefined}
              subtext={isStaff ? "8 transactions" : "Need reordering"}
              viewAllHref={isStaff ? "/pos" : "/inventory"}
              onClick={!isStaff ? () => setIsLowStockModalOpen(true) : undefined}
            />

            <StatsCard
              title={isStaff ? "Active Orders" : "Active Customers"}
              value={isStaff ? "3 Orders" : "1,248"}
              icon={isStaff ? ShoppingCart : Users}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subtext={isStaff ? "Pending processing" : "23 new this week"}
              viewAllHref={isStaff ? "/pos" : "/customers"}
            />

            {isAdmin && (
              <StatsCard
                title="Monthly Revenue"
                value="LKR 5.2M"
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
          <div className="flex flex-col lg:flex-row gap-8">
            {isAdmin && (
              <div className="lg:w-2/3">
                <SalesChart title="Revenue Analytics" />
              </div>
            )}
            <div className={cn(isAdmin ? "lg:w-1/3" : "w-full")}>
              <ProductList />
            </div>
          </div>

          {/* Transactions and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TransactionTable />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Alert Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {!isStaff && (
              <AlertBanner
                type="stock"
                title="Low Stock Alert"
                message="15 products are running low on stock and need immediate reordering."
                actionText="View Low Stock Items"
                onActionClick={() => setIsLowStockModalOpen(true)}
              />
            )}
            {isAdmin && (
              <AlertBanner
                type="payment"
                title="Pending Payments"
                message="You have 8 pending payments totaling LKR 125,450 that require follow-up."
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