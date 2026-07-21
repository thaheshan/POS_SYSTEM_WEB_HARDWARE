'use client';
import { ReactNode } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
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
  href?: string;
  disabled?: boolean;
  disabledBadgeText?: string;
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
  onReportClick,
  href,
  disabled = false,
  disabledBadgeText = "Coming Soon"
}: ReportCategoryProps) {
  return (
    <div className={cn("bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 flex flex-col h-full transition-all", disabled && "opacity-60 select-none")}>
      <div className="flex justify-between items-start mb-6">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", disabled ? "bg-gray-100 text-gray-400" : iconBgClass)}>
          {icon}
        </div>
        {disabled ? (
          <div className="px-3 py-1.5 rounded-full text-[11px] font-black bg-gray-100 text-gray-500 uppercase tracking-wider">
            {disabledBadgeText}
          </div>
        ) : badge && (
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
            disabled={disabled}
            onClick={() => onReportClick && onReportClick(report)}
            className={cn("flex items-center gap-3 w-full group text-left", disabled ? "cursor-not-allowed" : "")}
          >
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform shrink-0" />
            <span className={cn("text-[13.5px] font-bold text-gray-700 transition-colors", !disabled && "group-hover:text-gray-900")}>
              {report}
            </span>
          </button>
        ))}
      </div>
      
      {disabled ? (
        <button 
          disabled
          className="w-full py-3.5 rounded-[12px] flex justify-center items-center gap-2 text-[13px] font-black transition-all mt-auto text-white bg-gray-200 text-gray-400 cursor-not-allowed shadow-none active:scale-100"
        >
          {disabledBadgeText}
        </button>
      ) : href ? (
        <Link 
          href={href}
          className={cn(
            "w-full py-3.5 rounded-[12px] flex justify-center items-center gap-2 text-[13px] font-black transition-all hover:opacity-90 active:scale-[0.98] mt-auto text-white",
            buttonColorClass
          )}
        >
          {buttonText} <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <button 
          onClick={onButtonClick}
          className={cn(
            "w-full py-3.5 rounded-[12px] flex justify-center items-center gap-2 text-[13px] font-black transition-all hover:opacity-90 active:scale-[0.98] mt-auto text-white",
            buttonColorClass
          )}
        >
          {buttonText} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}