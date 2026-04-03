import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

interface CheckoutHeaderProps {
  step?: number;
  totalSteps?: number;
  backLink?: string;
  onBack?: () => void;
}

export default function CheckoutHeader({
  step = 3,
  totalSteps = 4,
  backLink = "/dashboard",
  onBack,
}: CheckoutHeaderProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-5xl mx-auto">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
        ) : (
          <Link
            href={backLink}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
        )}
        <span className="text-blue-600 font-semibold text-xs sm:text-sm">
          Step {step} of {totalSteps}
        </span>
        <button
          type="button"
          className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Get help"
        >
          <HelpCircle className="w-5 h-5 text-slate-500" />
        </button>
      </div>
      <div className="w-full h-1 bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-blue-700 to-teal-400"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
