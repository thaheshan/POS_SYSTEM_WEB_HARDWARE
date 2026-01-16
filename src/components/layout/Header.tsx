'use client';

import { useAuth } from '@/hooks/useAuth';
import { Bell, User } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 ml-64 px-8 py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-sm text-gray-500">Here's what's happening today</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
