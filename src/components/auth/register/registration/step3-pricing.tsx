'use client';

import React, { useState, useEffect } from 'react';
import { useRegistration } from '@/lib/registration-context';
import { PricingCard } from './pricing-card';
import { Button } from '@/components/ui/button';
import { Shield, RotateCcw, Headphones } from 'lucide-react';

interface Step3PricingProps {
  onComplete: () => void;
}

const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for single shop',
    price: '11,000',
    features: [
      '1 Shop Location',
      'Unlimited Products',
      '5 User Accounts',
      'POS System',
      'Inventory Management',
      'Basic Reports',
      'Email Support',
    ],
    buttonText: 'Select Starter Plan',
    subtext: '30 days free trial included',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Best for growing businesses',
    price: '25,000',
    badge: 'MOST POPULAR',
    features: [
      'Up to 5 Shop Locations',
      'Unlimited Products & Categories',
      '15 User Accounts',
      'Advanced POS with Multiple Terminals',
      'Advanced Inventory & Stock Transfer',
      'Advanced Reports & Analytics',
      'WhatsApp Integration',
      'Priority Phone & Email Support',
    ],
    buttonText: 'Start Free Trial',
    isHighlighted: true,
    subtext: '30 days free trial + Premium support',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large retail chains',
    price: 'Custom Pricing',
    features: [
      'Unlimited Locations',
      'Unlimited Users',
      'Custom Features Development',
      'Dedicated Account Manager',
      '24/7 Priority Support',
      'On-premise Deployment Option',
    ],
    buttonText: 'Contact Sales',
  },
];

const BILLING_OPTIONS = [
  { id: 'monthly', label: 'Monthly', period: '/month' },
  { id: 'yearly', label: 'Yearly', period: '/year' },
];

export function Step3Pricing({ onComplete }: Step3PricingProps) {
  const { data, updatePricingData } = useRegistration();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise' | null>(
    (data.pricing?.plan as any) || null
  );

  const handleSelectPlan = (planId: 'starter' | 'professional' | 'enterprise') => {
    setSelectedPlan(planId);
    updatePricingData({ plan: planId });
    onComplete();
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
          <p className="text-gray-600 mb-8">
            Start with 30 days free trial. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center gap-2 mb-12">
            {BILLING_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setBillingCycle(id as 'monthly' | 'yearly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  billingCycle === id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              description={plan.description}
              price={plan.price}
              badge={plan.badge}
              features={plan.features}
              buttonText={plan.buttonText}
              isHighlighted={plan.isHighlighted}
              subtext={plan.subtext}
              buttonVariant={
                plan.id === 'professional' ? 'primary' : plan.id === 'enterprise' ? 'secondary' : 'secondary'
              }
              onSelect={() => handleSelectPlan(plan.id as 'starter' | 'professional' | 'enterprise')}
            />
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-12 flex-wrap">
          <div className="flex items-center gap-2 text-gray-700">
            <Shield className="w-5 h-5 text-teal-500" />
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <RotateCcw className="w-5 h-5 text-teal-500" />
            <span className="text-sm font-medium">30-Day Money Back</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Headphones className="w-5 h-5 text-teal-500" />
            <span className="text-sm font-medium">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
