'use client';

import { Card } from '@/components/marketing/ui/card';
import {
  ShoppingCart,
  Package,
  LineChart,
  Users,
  ClipboardList,
  Settings,
  Check
} from 'lucide-react';

const modules = [
  {
    icon: ShoppingCart,
    title: 'Point of Sale',
    description: 'Complete checkout system with product search, discounts, and payment processing',
    features: ['Multiple payment methods', 'Quick item lookup', 'Discount & loyalty points', 'Receipt printing'],
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Real-time stock tracking, adjustments, and automated reorder points',
    features: ['Stock level monitoring', 'Low stock alerts', 'Stock transfers', 'Physical counting'],
  },
  {
    icon: LineChart,
    title: 'Reports & Analytics',
    description: 'Comprehensive reports on sales, inventory, and financial performance',
    features: ['Sales reports', 'Profit & Loss statements', 'Inventory analytics', 'Custom reports'],
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Maintain customer profiles, loyalty programs, and purchase history',
    features: ['Customer profiles', 'Loyalty programs', 'Credit management', 'Purchase history'],
  },
  {
    icon: ClipboardList,
    title: 'Purchase Orders',
    description: 'Manage supplier orders, goods receipt, and payment tracking',
    features: ['Create purchase orders', 'Goods receipt notes', 'Supplier management', 'Payment tracking'],
  },
  {
    icon: Settings,
    title: 'Settings & Admin',
    description: 'System configuration, user management, and security settings',
    features: ['User management', 'Role-based access', 'System configuration', 'Backup & security'],
  },
];

export function Modules() {
  return (
    <section id="modules" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-emerald-600 font-semibold tracking-widest text-xs mb-3 uppercase">SYSTEM MODULES</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Comprehensive Module Suite
          </h2>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card
                key={index}
                className="p-7 border border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white rounded-xl"
              >
                <div className="mb-3">
                  <Icon size={22} className="text-emerald-600" strokeWidth={2} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {module.title}
                </h3>
                <p className="text-gray-500 text-xs mb-5 leading-relaxed">
                  {module.description}
                </p>
                <ul className="space-y-2">
                  {module.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                      <Check size={13} className="text-emerald-600 flex-shrink-0" strokeWidth={3} />
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
