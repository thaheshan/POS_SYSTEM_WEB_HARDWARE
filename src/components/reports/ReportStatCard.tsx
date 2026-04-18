'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

export interface ReportStatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  variant: 'blue' | 'green' | 'white';
  trend?: string;
  trendText?: string;
  marginText?: string;
  badge?: string;
}

export default function ReportStatCard({
  title,
  value,
  icon,
  variant,
  trend,
  trendText,
  marginText,
  badge
}: ReportStatCardProps) {
  return (
    <div className={cn(
      "rounded-[24px] p-6 flex flex-col justify-between min-h-[160px] shadow-sm border",
      variant === 'blue' ? "bg-[#2563eb] border-transparent text-white" : "",
      variant === 'green' ? "bg-[#059669] border-transparent text-white" : "",
      variant === 'white' ? "bg-white border-gray-100 text-gray-900" : ""
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className={cn(
          "text-[13px] font-bold tracking-tight",
          variant === 'white' ? "text-gray-500" : "opacity-90"
        )}>{title}</h3>
        {icon}
      </div>
      
      <div>
        <h2 className={cn(
          "text-[32px] md:text-[34px] font-black tracking-tighter leading-none mb-3",
          variant === 'white' ? "text-gray-900" : "text-white"
        )}>
          {value}
        </h2>
        
        <div className="flex justify-between items-end min-h-[20px]">
          <div>
            {trend && (
              <div className={cn(
                "flex items-center gap-1.5 text-[12px] font-bold",
                variant === 'white' ? "text-[#059669]" : "text-emerald-300"
              )}>
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{trend}</span>
              </div>
            )}
            {marginText && (
              <div className="text-[12px] font-bold opacity-90">
                Margin: <span className="text-[15px] font-black">{marginText}</span>
              </div>
            )}
            {badge && (
              <div className="bg-[#f3e8ff] text-[#9333ea] px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mt-1">
                {badge}
              </div>
            )}
          </div>
          
          {trendText && (
            <span className={cn(
              "text-[10px] font-medium opacity-60",
              variant === 'white' ? "text-gray-400" : ""
            )}>
              {trendText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
