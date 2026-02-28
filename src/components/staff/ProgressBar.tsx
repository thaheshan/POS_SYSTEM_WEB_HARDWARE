import { ArrowLeft,CircleHelp   } from 'lucide-react';
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}

const ProgressBar = ({ currentStep, totalSteps, onBack }: ProgressBarProps) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full h-2.5">
      <div className="p-3 md:mx-6 bg-[#FFFFFF] flex justify-between items-center">
        <button className="text-black hover:text-slate-600" disabled={currentStep === 1} onClick={onBack}>
          <ArrowLeft size={20}  />
        </button>
        <span className="text-sm font-medium text-[#1A56DB]">
          Step {currentStep} of {totalSteps}
        </span>
        <CircleHelp size={20} className="text-slate-400 hover:text-slate-600" />
      </div>
      <div className="w-full bg-[#E5E7EB] h-1.5  overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#1A56DB] to-[#0E9F6E]  h-1.5  transition-all duration-300 ease-in-out "
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
