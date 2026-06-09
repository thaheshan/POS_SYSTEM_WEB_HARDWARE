'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LineChart, 
  Printer, 
  Boxes, 
  Users, 
  Truck, 
  FileText, 
  LayoutList, 
  User,
  Settings, 
  Store,
  ChevronDown,
  MoreVertical,
  Wrench,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import api from '@/api/axiosInstance';

const menuItems = [
  { icon: LineChart, label: 'Dashboard', href: '/dashboard', roles: ['admin', 'owner', 'manager', 'staff', 'cashier'] },
  { icon: Printer, label: 'Point of Sale', href: '/pos', roles: ['admin', 'owner', 'manager', 'cashier', 'staff'] },
  { icon: Boxes, label: 'Inventory', href: '/inventory', roles: ['admin', 'owner', 'manager', 'staff'] },
  { icon: Users, label: 'Customers', href: '/customers', roles: ['admin', 'owner', 'manager', 'cashier', 'staff'] },
  { icon: Truck, label: 'Suppliers', href: '/suppliers', roles: ['admin', 'owner', 'manager'] },
  { icon: FileText, label: 'Sales', href: '/sales', roles: ['admin', 'owner', 'manager'] },
  { icon: Wrench, label: 'Labour & Services', href: '/labour-services', roles: ['staff', 'cashier'] },
  { icon: LayoutList, label: 'Reports', href: '/reports', roles: ['admin', 'owner'] },
  { icon: User, label: 'Staff Management', href: '/staff-management', roles: ['admin', 'owner', 'manager'] },
  { icon: Settings, label: 'Settings', href: '/settings', roles: ['admin', 'owner'] },
  { icon: Settings, label: 'Staff Settings', href: '/staff-settings', roles: ['staff', 'cashier'] },
];

export default function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [lowStockCount, setLowStockCount] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/stock')
        .then(res => {
          const items = res.data?.data || res.data || [];
          const count = items.filter((item: any) => {
             const qty = item.available_quantity ?? item.quantity ?? 0;
             const minStock = item.minimum_stock_level ?? 0;
             return qty <= minStock;
          }).length;
          setLowStockCount(count > 0 ? count : null);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);
  
  const visibleMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role as any)
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "w-[260px] bg-gradient-to-b from-[#1E429F] to-[#1A56DB] text-white h-screen fixed left-0 top-0 flex flex-col z-50 overflow-hidden shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Branding */}
        <div className="px-5 pt-6 pb-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/20">
                 <Store className="w-5 h-5 text-[#1E429F]" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-bold tracking-wide leading-tight uppercase text-white">FUTURA HARDWARE</h1>
                <p className="text-[11px] text-white/70 font-normal mt-0.5">Management System</p>
              </div>
            </div>
            {/* Close button — only visible on mobile/tablet */}
            <button
              onClick={onClose}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

      {/* Branch Selector */}
      <div className="px-5 mt-5 mb-5">
        <p className="text-[11px] text-white/80 font-semibold mb-2">Current Shop</p>
        <button className="w-full bg-white text-gray-900 rounded-[8px] p-2.5 flex items-center justify-between text-sm shadow-sm transition-colors hover:bg-gray-50 group">
          <div className="flex items-center gap-2.5">
            <Store className="w-[18px] h-[18px] text-[#1E429F]" />
            <span className="font-semibold text-[13px] text-gray-800">Main Branch</span>
          </div>
          <ChevronDown className="w-[14px] h-[14px] text-gray-400 group-hover:text-gray-900 transition-colors" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 pb-6 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/') || (item.href === '/dashboard' && pathname === '/');
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-[8px] transition-all duration-200 group relative",
                isActive 
                  ? "bg-white/15 text-white" 
                  : "text-white hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={cn(
                  "w-[18px] h-[18px] transition-colors",
                  isActive ? "text-white" : "text-white/80 group-hover:text-white"
                )} />
                <span className={cn(
                  "text-[13.5px]",
                  isActive ? "font-semibold text-white" : "font-medium text-white/90"
                )}>{item.label}</span>
              </div>
              {(item.label === 'Inventory' ? lowStockCount : (item as any).badge) && (
                <span className="text-[12px] font-semibold text-white pr-1">
                  {item.label === 'Inventory' ? lowStockCount : (item as any).badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Block */}
      <div className="mt-auto px-5 py-5 border-t border-white/10">
        <div className="flex items-center justify-between group cursor-pointer">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-[38px] h-[38px] rounded-full overflow-hidden shrink-0 border border-white/20 bg-blue-800 flex items-center justify-center text-[12px] font-black">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'JS'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold truncate text-white leading-tight">
                {user?.name || (isAuthenticated ? 'Connecting...' : 'Guest User')}
              </span>
              <span className="text-[12px] text-white/70 font-medium leading-tight mt-0.5 capitalize">
                {user?.role ? `${user.role} Member Profile` : 'Restricted Mode'}
              </span>
            </div>
          </div>
          <button className="text-white hover:text-white/80 transition-colors shrink-0">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
