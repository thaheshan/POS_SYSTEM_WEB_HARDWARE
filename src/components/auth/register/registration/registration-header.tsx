'use client';

import React from 'react';
import { useRegistration} from '@/lib/register/registration-context';
import { ChevronLeft, HelpCircle } from 'lucide-react';

interface RegistrationHeaderProps {
  onBack: () => void;
}

export function RegistrationHeader({ onBack }: RegistrationHeaderProps) {
  const { currentStep } = useRegistration();

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-2xl px-6 py-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div className="text-center flex-1">
            <h2 className="text-sm font-medium text-blue-600">
              Step {currentStep} of 4
            </h2>
          </div>

          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
