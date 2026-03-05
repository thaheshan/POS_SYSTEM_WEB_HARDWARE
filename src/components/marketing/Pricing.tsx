'use client';

import { Button } from '@/components/marketing/ui/button';
import { Card } from '@/components/marketing/ui/card';
import { Check } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Starter',
    price: '₹ 4,999',
    description: 'Perfect for small hardware stores',
    features: [
      'Up to 100 products',
      'Single location support',
      'Basic reporting',
      'Email support',
      '5 user accounts',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₹ 9,999',
    description: 'For growing hardware retailers',
    features: [
      'Unlimited products',
      'Multi-location support',
      'Advanced analytics',
      'Phone & email support',
      '20 user accounts',
      'Customer loyalty program',
      'Mobile app access',
    ],
    cta: 'Start 14-Day Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large retail chains',
    features: [
      'Everything in Professional',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 priority support',
      'Unlimited user accounts',
      'Advanced customization',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-teal-600 font-semibold mb-2">FLEXIBLE PRICING</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Plans for Every Business Size
          </h2>
          <p className="text-lg text-gray-600">
            Choose the perfect plan to grow your hardware retail business
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden transition-all ${
                plan.highlighted
                  ? 'ring-2 ring-teal-600 md:scale-105 shadow-xl'
                  : 'border-2 border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-teal-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-gray-600 text-sm">/month</span>
                  )}
                </div>

                <Button
                  className={`w-full mb-8 ${
                    plan.highlighted
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'border-2 border-teal-600 text-teal-600 bg-white hover:bg-teal-50'
                  }`}
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        size={20}
                        className="text-teal-600 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
