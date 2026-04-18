'use client';

import { 
  PlusCircle, 
  UserPlus, 
  FileText, 
  BarChart, 
  ShoppingCart,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const actions = [
  { id: 1, label: 'New Sale', icon: ShoppingCart, color: 'text-white', bg: 'bg-[#1e3a8a]', href: '/pos' },
  { id: 2, label: 'Add Product', icon: PlusCircle, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 3, label: 'Add Customer', icon: UserPlus, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 4, label: 'Create Quotation', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 5, label: 'View Reports', icon: BarChart, color: 'text-blue-500', bg: 'bg-blue-50' },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 w-full lg:w-[320px]">
      <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Quick Actions</h3>

      <div className="space-y-3">
        {actions.map((action) => {
          const content = (
            <>
              <div className="flex items-center gap-3">
                <action.icon className={cn("w-[22px] h-[22px]", action.color)} strokeWidth={2.5} />
                <span className="text-[14px] font-bold tracking-tight">{action.label}</span>
              </div>
              <ArrowRight className={cn(
                "w-[18px] h-[18px] transition-transform group-hover:translate-x-1",
                action.bg === 'bg-[#1e3a8a]' ? "text-white" : "text-gray-500"
              )} />
            </>
          );
          
          const className = cn(
            "w-full flex items-center justify-between p-4 rounded-xl transition-all group hover:scale-[1.02] text-left",
            action.bg === 'bg-[#1e3a8a]' ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-md shadow-blue-500/20" : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-transparent shadow-sm"
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
