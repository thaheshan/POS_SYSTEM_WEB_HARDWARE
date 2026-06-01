"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut, ShieldAlert, Clock, Store } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <ShieldAlert className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Futura Solutions</h1>
                <p className="text-xs text-gray-500 font-medium">Super Admin Console</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            <Link 
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === '/dashboard' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Clock className="w-5 h-5" />
              Pending Approvals
            </Link>
            <Link 
              href="/dashboard/active-shops"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === '/dashboard/active-shops' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Store className="w-5 h-5" />
              Active Shops
            </Link>
            <Link 
              href="/dashboard/notifications"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === '/dashboard/notifications' 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              Notifications
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 animate-fade-in min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
