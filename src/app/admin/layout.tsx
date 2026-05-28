"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, LogOut, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/marketing/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    document.cookie = "pos_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    localStorage.removeItem("pos_token");
    router.push("/auth/login");
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-emerald-700">
            <Store className="h-6 w-6" />
            <span className="font-bold text-lg">Futura Admin</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-md font-medium text-sm"
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md font-medium text-sm transition-colors opacity-50 cursor-not-allowed">
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2 justify-center text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-gray-800">Super Admin Portal</h1>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
              FS
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
