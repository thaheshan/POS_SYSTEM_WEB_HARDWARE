'use client';

import { Card } from '@/components/marketing/ui/card';
import {
  Zap,
  TrendingUp,
  Users,
  Settings,
  Shield,
  Headphones,
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Process transactions in seconds with our optimized point-of-sale system',
  },
  {
    icon: TrendingUp,
    title: 'Inventory Analytics',
    description:
      'Get real-time insights into your stock levels and sales trends',
  },
  {
    icon: Users,
    title: 'Customer Management',
    description:
      'Build customer profiles and track purchase history effortlessly',
  },
  {
    icon: Settings,
    title: 'Easy Configuration',
    description:
      'Customize workflows and settings to match your business needs',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-level encryption and compliance with industry standards',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description:
      'Our expert support team is always available to help you succeed',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-teal-600 font-semibold mb-2">CORE FEATURES</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Store
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive suite of tools designed specifically for hardware
            retailers to streamline operations
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-8 border-2 border-teal-100 hover:border-teal-300 hover:shadow-lg transition-all"
              >
                <div className="mb-4">
                  <div className="inline-flex p-3 bg-teal-100 rounded-lg">
                    <Icon size={28} className="text-teal-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
