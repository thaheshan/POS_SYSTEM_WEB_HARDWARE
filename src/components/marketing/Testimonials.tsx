'use client';

import { Card } from '@/components/marketing/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    title: 'Owner, Singh Hardware Store',
    quote:
      'This POS system has completely transformed how we manage our store. Inventory tracking is now automatic and we rarely run out of stock.',
    image: '👨‍💼',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    title: 'Manager, Sharma Tools & Hardware',
    quote:
      'The customer support team is incredible. They helped us set up everything in just one day. Our checkout process is 3x faster now.',
    image: '👩‍💼',
    rating: 5,
  },
  {
    name: 'Amit Patel',
    title: 'Director, Patel Hardware Chain',
    quote:
      'Managing multiple locations has never been easier. Real-time sync across all stores gives us complete visibility into our business.',
    image: '👨‍💼',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-teal-600 font-semibold mb-2">
            TRUSTED BY 500+ HARDWARE STORES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Trusted by 500+ Hardware Stores
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-8 border-2 border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all"
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="text-3xl">{testimonial.image}</div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
