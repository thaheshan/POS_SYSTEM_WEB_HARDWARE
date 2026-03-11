'use client';

import React from 'react';
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  period?: string;
  badge?: string;
  features: string[];
  buttonText: string;
  buttonVariant?: 'primary' | 'secondary' | 'success';
  isHighlighted?: boolean;
  onSelect: () => void;
  subtext?: string;
}

export function PricingCard({
  name,
  description,
  price,
  period = '/month',
  badge,
  features,
  buttonText,
  buttonVariant = 'secondary',
  isHighlighted = false,
  onSelect,
  subtext,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isHighlighted
          ? 'border-0 bg-gradient-to-b from-blue-600 to-blue-700 shadow-2xl scale-105'
          : 'border-gray-200 bg-white shadow-lg'
      }`}
    >
      {/* Badge */}
      {badge && (
        <div className="relative -top-3 flex justify-center">
          <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {badge}
          </span>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <h3
          className={`text-xl font-bold mb-1 ${
            isHighlighted ? 'text-white' : 'text-gray-900'
          }`}
        >
          {name}
        </h3>
        <p
          className={`text-sm mb-6 ${
            isHighlighted ? 'text-blue-100' : 'text-gray-600'
          }`}
        >
          {description}
        </p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span
              className={`text-4xl font-bold ${
                isHighlighted ? 'text-white' : 'text-blue-600'
              }`}
            >
              Rs. {price}
            </span>
            <span
              className={`text-sm ${
                isHighlighted ? 'text-blue-100' : 'text-gray-600'
              }`}
            >
              {period}
            </span>
          </div>
          {subtext && (
            <p
              className={`text-xs mt-2 ${
                isHighlighted ? 'text-blue-100' : 'text-gray-500'
              }`}
            >
              {subtext}
            </p>
          )}
        </div>

        {/* Button */}
        <Button
          onClick={onSelect}
          className={`w-full mb-8 py-3 font-semibold rounded-lg transition-colors ${
            isHighlighted
              ? 'bg-white text-blue-600 hover:bg-gray-100'
              : buttonVariant === 'success'
                ? 'bg-teal-500 hover:bg-teal-600 text-white'
                : buttonVariant === 'primary'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'border-2 border-teal-500 text-teal-500 hover:bg-teal-50'
          }`}
        >
          {buttonText}
        </Button>

        {/* Features */}
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isHighlighted ? 'text-white' : 'text-teal-500'
                }`}
              />
              <span
                className={`text-sm ${
                  isHighlighted ? 'text-white' : 'text-gray-700'
                }`}
              >
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
