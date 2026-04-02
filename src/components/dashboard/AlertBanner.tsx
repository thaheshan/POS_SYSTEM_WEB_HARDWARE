'use client';

import { 
  AlertTriangle, 
  Clock, 
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertBannerProps {
  type: 'stock' | 'payment';
  title: string;
  message: string;
  actionText: string;
}

export default function AlertBanner({ type, title, message, actionText }: AlertBannerProps) {
  const isStock = type === 'stock';

  return (
    <div className={cn(
      "p-6 rounded-[20px] flex-1 border transition-all duration-200",
      isStock 
        ? "bg-[#fff5f5] border-red-100" 
        : "bg-[#f0f7ff] border-blue-100"
    )}>
      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm",
          isStock ? "bg-[#ef4444] text-white" : "bg-[#3b82f6] text-white"
        )}>
          {isStock ? <AlertTriangle className="w-6 h-6" strokeWidth={2.5} /> : <Clock className="w-6 h-6" strokeWidth={2.5} />}
        </div>
        <h4 className={cn(
          "text-[18px] font-bold tracking-tight",
          isStock ? "text-[#7f1d1d]" : "text-[#1e3a8a]"
        )}>{title}</h4>
      </div>
      
      <p className={cn(
        "text-[14px] font-medium leading-relaxed mb-6 max-w-sm",
        isStock ? "text-[#b91c1c]" : "text-[#1d4ed8]"
      )}>{message}</p>

      <button className={cn(
        "px-5 py-2.5 rounded-[10px] text-[13px] font-bold transition-all duration-200 active:scale-95 shadow-sm inline-block",
        isStock 
          ? "bg-[#dc2626] text-white hover:bg-[#b91c1c]" 
          : "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
      )}>
        {actionText}
      </button>
    </div>
  );
}
