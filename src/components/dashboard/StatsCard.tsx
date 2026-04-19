'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  subtext?: string;
  badge?: number;
  viewAllHref?: string;
  onClick?: () => void;
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBg, 
  trend, 
  subtext,
  badge,
  viewAllHref = '#',
  onClick
}: StatsCardProps) {
  const handleViewAllClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="flex justify-between items-start">
        {/* Top Left Icon Block */}
        <div className={cn("w-[52px] h-[52px] rounded-[16px] flex items-center justify-center shadow-sm", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} strokeWidth={2.5} />
        </div>
        
        {/* Top Right Trend/Badge */}
        {trend && (
          <div className={cn(
            "flex items-center gap-1.5 text-[14px] font-bold tracking-tight px-3 py-1 rounded-full",
            trend.isUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          )}>
            <span className="text-sm font-black">{trend.isUp ? '↑' : '↓'}</span>
            <span>{trend.value}</span>
          </div>
        )}
        {badge !== undefined && (
          <div className="flex items-center gap-1.5 text-[14px] font-bold tracking-tight text-white bg-red-500 px-3 py-1 rounded-full shadow-sm">
            <span className="text-sm font-black">!</span>
            <span>{badge}</span>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h3 className="text-[#64748b] text-[15px] font-semibold tracking-tight mb-2">{title}</h3>
        <p className="text-[32px] font-black text-gray-900 tracking-tighter leading-none">{value}</p>
        
        {subtext && (
          <p className="text-[#94a3b8] text-[13.5px] font-medium tracking-tight mt-3">
            {subtext}
          </p>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-gray-50 flex justify-center">
         <a 
           href={viewAllHref} 
           onClick={handleViewAllClick}
           className="text-[12px] font-black text-blue-600 hover:text-blue-800 transition-colors tracking-wide uppercase"
         >
            View All →
         </a>
      </div>
    </div>
  );
}
