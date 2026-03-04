import { ArrowLeft, CircleHelp } from "lucide-react";
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}

const ProgressBar = ({ currentStep, totalSteps, onBack }: ProgressBarProps) => {
  const progress = totalSteps > 0
    ? Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100)
    : 0;

  return (
    <div className="w-full h-2.5">
      <div className="p-3 md:mx-6 bg-[#FFFFFF] flex justify-between items-center">
        <button
          onClick={onBack}
          className="p-1 rounded hover:bg-gray-100 transition"
          aria-label="Go back to previous step"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-sm font-medium text-[#1A56DB]">
          Step {currentStep} of {totalSteps}
        </span>
        <a href="/support">
          <CircleHelp
            size={20}
            className="text-slate-400 hover:text-slate-600"
          />
        </a>
      </div>
      <div
        className="w-full h-1.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep} of ${totalSteps}`}
      >
        <div
          className="h-1.5 bg-gradient-to-r from-[#1A56DB] to-[#0E9F6E] transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
