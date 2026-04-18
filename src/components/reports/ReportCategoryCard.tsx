'use client';

import { ReactNode } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ReportCategoryProps {
  title: string;
  description: string;
  icon: ReactNode;
  badge?: { text: string; colorClass: string };
  reports: string[];
  buttonText: string;
  buttonColorClass: string;
  iconBgClass: string;
  cardContext?: ReactNode;
  onButtonClick?: () => void;
  onReportClick?: (report: string) => void;
}

export default function ReportCategoryCard({
  title,
  description,
  icon,
  badge,
  reports,
  buttonText,
  buttonColorClass,
  iconBgClass,
  cardContext,
  onButtonClick,
  onReportClick
}: ReportCategoryProps) {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", iconBgClass)}>
          {icon}
        </div>
        {badge && (
          <div className={cn("px-3 py-1.5 rounded-full text-[11px] font-black", badge.colorClass)}>
            {badge.text}
          </div>
        )}
      </div>
      
      <h3 className="text-[20px] font-black text-gray-900 tracking-tight mb-3">
        {title}
      </h3>
      
      <p className="text-[13px] font-medium text-gray-500 leading-relaxed mb-6 min-h-[40px]">
        {description}
      </p>

      {cardContext}

      <div className="space-y-4 mb-8 flex-1">
        {reports.map((report) => (
          <button 
            key={report}
            onClick={() => onReportClick && onReportClick(report)}
            className="flex items-center gap-3 w-full group text-left"
          >
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
            <span className="text-[13.5px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
              {report}
            </span>
          </button>
        ))}
      </div>
      
      <button 
        onClick={onButtonClick}
        className={cn(
          "w-full py-3.5 rounded-[12px] flex justify-center items-center gap-2 text-[13px] font-black transition-all hover:opacity-90 active:scale-[0.98] mt-auto text-white",
          buttonColorClass
        )}
      >
        {buttonText} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
