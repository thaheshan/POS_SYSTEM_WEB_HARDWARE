"use client";

import { AlertTriangle, Clock, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  type: "stock" | "payment" | "critical" | "warning" | "info";
  title: string;
  message: string;
  actionText: string;
  onActionClick?: () => void;
}

export default function AlertBanner({
  type,
  title,
  message,
  actionText,
  onActionClick,
}: AlertBannerProps) {
  const styles = {
    stock:    { bg: "bg-[#fff5f5]", border: "border-red-100",    iconBg: "bg-[#ef4444]", text: "text-[#7f1d1d]", msgText: "text-[#b91c1c]", btnBg: "bg-[#dc2626] hover:bg-[#b91c1c]" },
    payment:  { bg: "bg-[#f0f7ff]", border: "border-blue-100",   iconBg: "bg-[#3b82f6]", text: "text-[#1e3a8a]", msgText: "text-[#1d4ed8]", btnBg: "bg-[#2563eb] hover:bg-[#1d4ed8]" },
    critical: { bg: "bg-red-50",    border: "border-red-200",    iconBg: "bg-red-600",   text: "text-red-900",  msgText: "text-red-700",  btnBg: "bg-red-600 hover:bg-red-700" },
    warning:  { bg: "bg-amber-50",  border: "border-amber-200",  iconBg: "bg-amber-500", text: "text-amber-900",msgText: "text-amber-700",btnBg: "bg-amber-500 hover:bg-amber-600" },
    info:     { bg: "bg-sky-50",    border: "border-sky-200",    iconBg: "bg-sky-500",   text: "text-sky-900",  msgText: "text-sky-700",  btnBg: "bg-sky-500 hover:bg-sky-600" },
  };

  const icons = {
    stock:    <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />,
    payment:  <Clock className="w-6 h-6" strokeWidth={2.5} />,
    critical: <AlertCircle className="w-6 h-6" strokeWidth={2.5} />,
    warning:  <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />,
    info:     <Info className="w-6 h-6" strokeWidth={2.5} />,
  };

  const s = styles[type];

  return (
    <div className={cn("p-6 rounded-[20px] flex-1 border transition-all duration-200", s.bg, s.border)}>
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm text-white", s.iconBg)}>
          {icons[type]}
        </div>
        <h4 className={cn("text-[18px] font-bold tracking-tight", s.text)}>
          {title}
        </h4>
      </div>

      <p className={cn("text-[14px] font-medium leading-relaxed mb-6 max-w-sm", s.msgText)}>
        {message}
      </p>

      <button
        type="button"
        className={cn(
          "px-5 py-2.5 rounded-[10px] text-[13px] font-bold text-white transition-all duration-200 active:scale-95 shadow-sm inline-block",
          s.btnBg,
        )}
        onClick={onActionClick}
      >
        {actionText}
      </button>
    </div>
  );
}
