"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/marketing/ui/card";

const testimonials = [
  {
    name: "Roshan Silva",
    title: "Owner, Silva Hardware Store",
    quote:
      "The POS system has transformed our store operations. We've reduced checkout time by 40% and inventory discrepancies are now almost zero.",
    avatar: "https://i.pravatar.cc/80?img=12",
    rating: 5,
  },
  {
    name: "Amara Fernando",
    title: "Manager, Central Hardware",
    quote:
      "Excellent customer support and intuitive interface. Our staff was trained within hours. Highly recommended for any hardware retailer.",
    avatar: "https://i.pravatar.cc/80?img=47",
    rating: 5,
  },
  {
    name: "Kapila Perera",
    title: "Director, Colombo Hardware Co.",
    quote:
      "The real-time analytics have given us insights we never had before. We're now making better decisions about inventory and pricing.",
    avatar: "https://i.pravatar.cc/80?img=68",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-emerald-600 font-semibold tracking-widest text-xs mb-3 uppercase">
            CLIENT SUCCESS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Trusted by 50+ Hardware Stores
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-7 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-7 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col shadow-sm"
              style={{ backgroundColor: "#F9FAFB" }}
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 text-sm mb-6 leading-relaxed flex-grow">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
