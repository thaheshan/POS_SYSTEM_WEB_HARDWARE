'use client';

import { Button } from '@/components/marketing/ui/button';
import { CheckCircle2 } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-balance">
              Revolutionary POS System for Hardware Stores
            </h1>
            <p className="text-xl text-teal-50 mb-10 leading-relaxed max-w-3xl">
              Streamline your inventory, sales, and customer management all in one powerful platform built specifically for hardware retailers.
            </p>

            {/* Feature List */}
            <ul className="space-y-3 mb-10">
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <CheckCircle2 size={20} className="text-teal-200 flex-shrink-0" />
                <span className="text-lg">Real-time inventory tracking and management</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <CheckCircle2 size={20} className="text-teal-200 flex-shrink-0" />
                <span className="text-lg">Advanced analytics and reporting tools</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <CheckCircle2 size={20} className="text-teal-200 flex-shrink-0" />
                <span className="text-lg">Multi-location support and cloud-based sync</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <CheckCircle2 size={20} className="text-teal-200 flex-shrink-0" />
                <span className="text-lg">24/7 dedicated customer support</span>
              </li>
            </ul>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-12">
              <Button className="bg-white text-teal-600 hover:bg-gray-100 font-semibold text-lg px-8 py-6">
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-teal-700 font-semibold text-lg px-8 py-6"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-teal-100 justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 bg-teal-300 rounded-full"></span>
                Trusted by 500+ stores
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 bg-teal-300 rounded-full"></span>
                99.9% Uptime SLA
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 bg-teal-300 rounded-full"></span>
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
