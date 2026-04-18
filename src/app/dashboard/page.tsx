"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import SalesChart from "@/components/dashboard/SalesChart";
import ProductList from "@/components/dashboard/ProductList";
import TransactionTable from "@/components/dashboard/TransactionTable";
import QuickActions from "@/components/dashboard/QuickActions";
import AlertBanner from "@/components/dashboard/AlertBanner";
import LowStockAlertModal from "@/components/dashboard/low-stock-alert";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);

  return (
    <>
      <MainLayout>
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">
                Dashboard Overview
              </h1>
              <p className="text-[15px] font-bold text-gray-400 opacity-80">
                Welcome back, {user?.name?.split(" ")[0] || "John"}! Here's
                what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/pos"
                className="bg-[#1e40af] hover:bg-blue-800 text-white px-6 py-3.5 rounded-xl font-bold tracking-wide flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm"
              >
                <PlusCircle className="w-5 h-5" />
                <span>New Sale</span>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Today's Sales"
              value="LKR 245,680"
              icon={DollarSign}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              trend={{ value: "12.5%", isUp: true }}
              subtext="38 transactions"
              viewAllHref="/sales"
            />
            <StatsCard
              title="Low Stock Items"
              value="15 Products"
              icon={Package}
              iconBg="bg-green-50"
              iconColor="text-green-600"
              badge={15}
              subtext="Need reordering"
              viewAllHref="/inventory"
            />
            <StatsCard
              title="Active Customers"
              value="1,248"
              icon={Users}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
              trend={{ value: "8.2%", isUp: true }}
              subtext="23 new this week"
              viewAllHref="/customers"
            />
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
          </div>

          {/* Chart and Products Row */}
          <div className="flex flex-col lg:flex-row gap-8">
            <SalesChart />
            <ProductList />
          </div>

          {/* Transactions and Quick Actions Row */}
          <div className="flex flex-col lg:flex-row gap-8">
            <TransactionTable />
            <QuickActions />
          </div>

          {/* Alert Banners */}
          <div className="flex flex-col lg:flex-row gap-8">
            <AlertBanner
              type="stock"
              title="Low Stock Alert"
              message="15 products are running low on stock and need immediate reordering."
              actionText="View Low Stock Items"
              onActionClick={() => setIsLowStockModalOpen(true)}
            />
            <AlertBanner
              type="payment"
              title="Pending Payments"
              message="You have 8 pending payments totaling LKR 125,450 that require follow-up."
              actionText="Process Payments"
            />
          </div>
        </div>
      </MainLayout>
      <LowStockAlertModal
        isOpen={isLowStockModalOpen}
        onClose={() => setIsLowStockModalOpen(false)}
      />
    </>
  );
}