'use client';

import { Button } from '@/components/marketing/ui/button';

export function CTA() {
  return (
    <section className="bg-teal-600 text-white py-16 md:py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Hardware Store?
        </h2>
        <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">
          Join 500+ hardware stores already using our POS system to streamline
          operations and boost revenue. Start your free 14-day trial today.
        </p>
        <Button className="bg-white text-teal-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg">
          Start Your Free Trial Today
        </Button>
      </div>
    </section>
  );
}
