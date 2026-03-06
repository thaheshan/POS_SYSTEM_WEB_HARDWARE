import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        'w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4',
        isPrimary
          ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 text-white shadow-lg'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-900',
        isActive && 'ring-2 ring-offset-2 ring-blue-500',
        className
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
          isPrimary ? 'bg-white/20' : 'bg-gray-100'
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p
          className={cn(
            'text-sm mt-1',
            isPrimary ? 'text-white/80' : 'text-gray-600'
          )}
        >
          {description}
        </p>
      </div>
      <div className="flex-shrink-0">
        <ChevronRight
          className={cn(
            'w-6 h-6',
            isPrimary ? 'text-white' : 'text-gray-400'
          )}
        />
      </div>
    </button>
  );
}
