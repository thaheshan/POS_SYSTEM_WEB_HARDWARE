import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

interface CheckoutHeaderProps {
  step?: number;
  totalSteps?: number;
  backLink?: string;
}

export default function CheckoutHeader({
  step = 3,
  totalSteps = 4,
  backLink = "/dashboard",
}: CheckoutHeaderProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <Link
          href={backLink}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <span className="text-blue-600 font-semibold text-sm">
          Step {step} of {totalSteps}
        </span>
        <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
          <HelpCircle className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-blue-700 to-teal-400"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
