import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
  isPrimary?: boolean;
  className?: string;
}

export default function OptionCard({
  icon,
  title,
  description,
  isActive = false,
  onClick,
  isPrimary = false,
  className,
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full min-w-0 min-h-[96px] rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 p-3.5 text-center sm:min-h-[108px] sm:flex-row sm:items-center sm:text-left sm:gap-4 sm:p-4.5 md:p-5",
        isPrimary
          ? "bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 text-white shadow-lg"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-900",
        isActive && "ring-2 ring-offset-2 ring-blue-500",
        className,
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center sm:w-11 sm:h-11 sm:rounded-lg md:w-12 md:h-12",
          isPrimary ? "bg-white/20" : "bg-gray-100",
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base leading-tight break-words">
          {title}
        </h3>
        <p
          className={cn(
            "mt-1 text-xs sm:text-sm leading-relaxed break-words",
            isPrimary ? "text-white/80" : "text-gray-600",
          )}
        >
          {description}
        </p>
      </div>
      <div className="hidden flex-shrink-0 sm:block">
        <ChevronRight
          className={cn("w-5 h-5", isPrimary ? "text-white" : "text-gray-400")}
        />
      </div>
    </button>
  );
}