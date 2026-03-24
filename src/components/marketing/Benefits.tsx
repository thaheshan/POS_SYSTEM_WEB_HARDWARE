'use client';

import { LineChart, Zap, Eye, UserCheck, Lock, Phone } from 'lucide-react';

const benefits = [
  {
    icon: LineChart,
    title: 'Increase Revenue',
    description:
      'Average 25% increase in sales with faster checkout and optimized inventory management.',
  },
  {
    icon: Zap,
    title: 'Save Time',
    description:
      'Automate manual processes and reduce paperwork by 80%, freeing up staff for customer service.',
  },
  {
    icon: Eye,
    title: 'Better Visibility',
    description:
      'Real-time insights into stock levels, sales trends, and customer behavior across all locations.',
  },
  {
    icon: UserCheck,
    title: 'Improve Customer Experience',
    description:
      'Faster transactions, personalized service, and loyalty rewards keep customers coming back.',
  },
  {
    icon: Lock,
    title: 'Secure Operations',
    description:
      'Enterprise-grade security protects sensitive data with automatic backups and compliance.',
  },
  {
    icon: Phone,
    title: 'Expert Support',
    description:
      '24/7 dedicated support team ready to help with onboarding, training, and troubleshooting.',
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="py-20 md:py-28" style={{ backgroundColor: '#e8f5ee' }}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="font-semibold tracking-widest text-xs mb-3 uppercase" style={{ color: '#059669' }}>
            WHY CHOOSE US
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Proven Benefits for Hardware Retailers
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-x-24 lg:gap-y-12 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex gap-5 items-start group">
                <div className="flex-shrink-0">
                  {/* Icon box with linear gradient #10B981 → #059669 */}
                  <div
                    className="p-3 rounded-xl shadow-sm text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    }}
                  >
                    <Icon size={22} strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
