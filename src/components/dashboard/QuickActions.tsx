'use client';

import { 
  Plus, 
  UserPlus, 
  FileText, 
  PieChart, 
  Terminal,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const actions = [
  { id: 1, label: 'New Sale', icon: Terminal, iconBg: 'bg-transparent', iconColor: 'text-white', isPrimary: true, href: '/pos', roles: ['admin', 'owner', 'manager', 'staff', 'cashier'] },
  { id: 2, label: 'Add Product', icon: Plus, iconBg: 'bg-emerald-500', iconColor: 'text-white', isPrimary: false, roles: ['admin', 'owner', 'manager'] },
  { id: 3, label: 'Add Customer', icon: UserPlus, iconBg: 'bg-orange-500', iconColor: 'text-white', isPrimary: false, roles: ['admin', 'owner', 'manager', 'staff', 'cashier'] },
  { id: 4, label: 'Create Quotation', icon: FileText, iconBg: 'bg-purple-500', iconColor: 'text-white', isPrimary: false, roles: ['admin', 'owner', 'manager'] },
  { id: 5, label: 'View Reports', icon: PieChart, iconBg: 'bg-blue-500', iconColor: 'text-white', isPrimary: false, roles: ['admin', 'owner'] },
];

export default function QuickActions() {
  const { user } = useAuth();
  
  const visibleActions = actions.filter(action => 
    user?.role && action.roles.includes(user.role as any)
  );

  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 w-full">
      <h3 className="text-[17px] font-black text-gray-900 tracking-tight mb-6">Quick Actions</h3>

      <div className="space-y-3">
        {visibleActions.map((action) => {
          const content = (
            <>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-full shrink-0",
                  action.isPrimary ? "bg-white/20" : action.iconBg
                )}>
                  <action.icon className={cn("w-5 h-5", action.iconColor)} strokeWidth={2.5} />
                </div>
                <span className="text-[14px] font-bold tracking-tight">{action.label}</span>
              </div>
              <ArrowRight className={cn(
                "w-5 h-5 transition-transform group-hover:translate-x-1",
                action.isPrimary ? "text-white/80" : "text-gray-400"
              )} />
            </>
          );
          
          const className = cn(
            "w-full flex items-center justify-between p-3.5 rounded-2xl transition-all group hover:scale-[1.02] text-left",
            action.isPrimary 
              ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20" 
              : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-100 shadow-sm"
          );

          if (action.href) {
            return (
              <Link key={action.id} href={action.href} className={className}>
                {content}
              </Link>
            );
          }

          return (
            <button key={action.id} className={className}>
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
