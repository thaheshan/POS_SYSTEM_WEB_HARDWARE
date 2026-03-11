'use client';

import { Card } from '@/components/marketing/ui/card';
import {
  Barcode,
  ShoppingCart,
  Users,
  BarChart3,
  Lock,
  Smartphone,
} from 'lucide-react';

const modules = [
  {
    icon: Barcode,
    title: 'Point of Sale',
    description: 'Fast, reliable transaction processing with multiple payment options',
    features: ['Card payments', 'Cash handling', 'Quick transactions'],
  },
  {
    icon: ShoppingCart,
    title: 'Inventory Management',
    description: 'Track stock levels across multiple locations in real-time',
    features: ['Stock tracking', 'Auto-reorder', 'Multi-location sync'],
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Build customer relationships and loyalty programs',
    features: ['Profile management', 'Purchase history', 'Rewards program'],
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Deep insights into sales, inventory, and business performance',
    features: ['Sales reports', 'Trend analysis', 'Custom dashboards'],
  },
  {
    icon: Lock,
    title: 'Security & Compliance',
    description: 'Enterprise-grade security with industry compliance built-in',
    features: ['Data encryption', 'User permissions', 'Audit logs'],
  },
  {
    icon: Smartphone,
    title: 'Mobile Access',
    description: 'Manage your store from anywhere with mobile apps',
    features: ['iOS & Android', 'Offline mode', 'Real-time sync'],
  },
];

export function Modules() {
  return (
    <section id="modules" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-teal-600 font-semibold mb-2">COMPREHENSIVE SUITE</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Comprehensive Module Suite
          </h2>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card
                key={index}
                className="p-6 border-2 border-teal-100 hover:border-teal-300 transition-all"
              >
                <div className="mb-4">
                  <div className="inline-flex p-3 bg-teal-100 rounded-lg">
                    <Icon size={24} className="text-teal-600" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {module.description}
                </p>
                <ul className="space-y-2 text-sm">
                  {module.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="inline-block w-1.5 h-1.5 bg-teal-600 rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
