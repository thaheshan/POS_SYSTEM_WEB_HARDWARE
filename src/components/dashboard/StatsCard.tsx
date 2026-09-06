'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { MouseEvent, KeyboardEvent } from 'react';

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
  const router = useRouter();

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick();
    } else if (viewAllHref && viewAllHref !== '#') {
      router.push(viewAllHref);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onClick) {
        onClick();
      } else if (viewAllHref && viewAllHref !== '#') {
        router.push(viewAllHref);
      }
    }
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 cursor-pointer active:scale-[0.99] group focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      <div className="flex justify-between items-start">
        {/* Top Left Icon Block */}
        <div className={cn("w-[52px] h-[52px] rounded-[16px] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105", iconBg)}>
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
        <h3 className="text-[#64748b] text-[15px] font-semibold tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-[32px] font-black text-gray-900 tracking-tighter leading-none">{value}</p>
        
        {subtext && (
          <p className="text-[#94a3b8] text-[13.5px] font-medium tracking-tight mt-3">
            {subtext}
          </p>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-gray-50 flex justify-center">
        <span className="inline-flex items-center justify-center text-[12px] font-black text-blue-600 group-hover:text-blue-800 transition-colors tracking-wide uppercase transition-transform group-hover:translate-x-0.5">
          View All →
        </span>
      </div>
    </div>
  );
}
