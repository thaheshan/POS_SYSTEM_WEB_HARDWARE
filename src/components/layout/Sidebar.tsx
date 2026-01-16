'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Home, ShoppingCart, Package, BarChart3, Users, LogOut } from 'lucide-react';

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Hardware POS</h1>
        <p className="text-sm text-gray-400 mt-1">Point of Sale System</p>
      </div>
      
      <nav className="space-y-2 flex-1">
        <Link href="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
          <Home className="w-5 h-5" /> 
          <span>Dashboard</span>
        </Link>
        <Link href="/pos" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
          <ShoppingCart className="w-5 h-5" /> 
          <span>POS</span>
        </Link>
        <Link href="/products" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
          <Package className="w-5 h-5" /> 
          <span>Products</span>
        </Link>
        <Link href="/inventory" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
          <BarChart3 className="w-5 h-5" /> 
          <span>Inventory</span>
        </Link>
        <Link href="/sales" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
          <BarChart3 className="w-5 h-5" /> 
          <span>Sales</span>
        </Link>
        <Link href="/customers" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
          <Users className="w-5 h-5" /> 
          <span>Customers</span>
        </Link>
      </nav>

      <div className="border-t border-gray-800 pt-4 mt-4">
        <div className="mb-3 px-3">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 p-3 hover:bg-red-600 rounded-lg text-red-400 hover:text-white w-full transition"
        >
          <LogOut className="w-5 h-5" /> 
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
