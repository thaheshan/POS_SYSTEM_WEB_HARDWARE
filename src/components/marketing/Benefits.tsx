'use client';

import { CheckCircle2 } from 'lucide-react';

const benefits = [
  {
    title: 'Increased Revenue',
    description:
      'Speed up transactions and reduce checkout time to serve more customers',
  },
  {
    title: 'Save Time',
    description:
      'Automate manual processes and free up staff to focus on customer service',
  },
  {
    title: 'Stock Validation',
    description:
      'Real-time inventory tracking prevents overselling and stockouts',
  },
  {
    title: 'Improved Customer Experience',
    description:
      'Faster checkouts and personalized service keep customers coming back',
  },
  {
    title: 'Data-Driven Decisions',
    description:
      'Comprehensive analytics help you understand trends and optimize operations',
  },
  {
    title: 'Expert Support',
    description:
      'Dedicated account managers and 24/7 technical support included',
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="py-16 md:py-24 bg-gradient-to-b from-green-50 to-teal-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-teal-600 font-semibold mb-2">PROVEN BENEFITS</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Proven Benefits for Hardware Retailers
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2
                  size={24}
                  className="text-teal-600 mt-1"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
