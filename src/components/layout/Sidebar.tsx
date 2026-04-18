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
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { icon: LineChart, label: 'Dashboard', href: '/dashboard' },
  { icon: Printer, label: 'Point of Sale', href: '/pos' },
  { icon: Boxes, label: 'Inventory', href: '/inventory', badge: 15 },
  { icon: Users, label: 'Customers', href: '/customers' },
  { icon: Truck, label: 'Suppliers', href: '/suppliers' },
  { icon: FileText, label: 'Sales', href: '/sales' },
  { icon: LayoutList, label: 'Reports', href: '/reports' },
  { icon: User, label: 'Staff Management', href: '/staff-management' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-[260px] bg-gradient-to-b from-[#1E429F] to-[#1A56DB] text-white h-screen fixed left-0 top-0 flex flex-col z-50 overflow-hidden shadow-2xl">
      {/* Branding */}
      <div className="px-5 pt-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/20">
             <Store className="w-5 h-5 text-[#1E429F]" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold tracking-wide leading-tight uppercase text-white">FUTURA HARDWARE</h1>
            <p className="text-[11px] text-white/70 font-normal mt-0.5">Management System</p>
          </div>
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
        {menuItems.map((item) => {
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
              {item.badge && (
                <span className="text-[12px] font-semibold text-white pr-1">
                  {item.badge}
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
            <div className="w-[38px] h-[38px] rounded-full overflow-hidden shrink-0 border border-white/20 bg-blue-800 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold truncate text-white leading-tight">John Silva</span>
              <span className="text-[12px] text-white/70 font-medium leading-tight mt-0.5">Shop Owner</span>
            </div>
          </div>
          <button className="text-white hover:text-white/80 transition-colors shrink-0">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}
