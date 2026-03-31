import React from 'react';
import { ChevronLeft, Info } from 'lucide-react';

interface HeaderProps {
  step: number;
  onBack?: () => void;
  showInfo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ step, onBack, showInfo = true }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
          {showInfo && (
            <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Info">
              <Info className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>
    </header>
  );
};
