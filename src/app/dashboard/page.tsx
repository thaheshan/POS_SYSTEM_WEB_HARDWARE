'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Sales Today', value: 'Rs 0', icon: DollarSign, color: 'bg-blue-500', change: '+0%' },
    { title: 'Orders', value: '0', icon: ShoppingBag, color: 'bg-green-500', change: '+0%' },
    { title: 'Products', value: '0', icon: Package, color: 'bg-purple-500', change: '0 total' },
    { title: 'Low Stock Items', value: '0', icon: AlertTriangle, color: 'bg-red-500', change: 'Items' },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">?? Hello World!</h1>
          <p className="text-xl opacity-90">Welcome to Hardware POS System</p>
          {user && (
            <div className="mt-4 flex items-center gap-2">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <p className="text-sm opacity-80">Logged in as</p>
                <p className="font-semibold">{user.name} ({user.role})</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} text-white rounded-lg p-3`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-green-600 font-semibold">{stat.change}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              System Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-gray-700">? Redux Store configured</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-gray-700">? Authentication implemented</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-gray-700">? Layout with sidebar created</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-gray-700">? All components working</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-gray-700">? Ready for development!</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left">
                <ShoppingBag className="w-5 h-5 text-blue-600 mb-2" />
                <p className="font-semibold text-sm">New Sale</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left">
                <Package className="w-5 h-5 text-green-600 mb-2" />
                <p className="font-semibold text-sm">Add Product</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-left">
                <Users className="w-5 h-5 text-purple-600 mb-2" />
                <p className="font-semibold text-sm">New Customer</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-left">
                <TrendingUp className="w-5 h-5 text-orange-600 mb-2" />
                <p className="font-semibold text-sm">View Reports</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
