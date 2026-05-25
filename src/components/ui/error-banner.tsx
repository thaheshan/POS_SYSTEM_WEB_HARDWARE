/*  `ErrorBanner` shows API errors and offers a retry action.
  Added while improving error handling for inventory fetches. */

import { AlertCircle, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorBanner({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-900",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      ) : null}
    </div>
  );
}
