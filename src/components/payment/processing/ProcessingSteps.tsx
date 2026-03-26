import React from "react";
import { Check } from "lucide-react";

interface ProcessingStepsProps {
  steps: string[];
  activeStep: number;
}

export default function ProcessingSteps({
  steps,
  activeStep,
}: ProcessingStepsProps) {
  return (
    <div className="w-full space-y-3 mb-10 sm:mb-12 px-2 sm:px-4">
      {steps.map((text, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        const isPending = index > activeStep;

        return (
          <div
            key={text}
            className={`flex items-center gap-4 transition-all duration-500 ${
              isPending ? "opacity-40" : "opacity-100"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                isCompleted
                  ? "bg-[#10B981] text-white"
                  : isActive
                    ? "border-2 border-[#10B981] border-l-transparent animate-spin"
                    : "border-2 border-white/20"
              }`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
            </div>
            <span
              className={`text-sm font-medium leading-relaxed ${
                isCompleted ? "text-white" : "text-blue-50"
              }`}
            >
              {text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
