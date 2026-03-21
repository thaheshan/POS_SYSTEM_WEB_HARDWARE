"use client";

import { Button } from "@/components/marketing/ui/button";
import { CheckCircle2, ShieldCheck, Link2, Clock } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section
      id="Hero"
      className="text-white py-20 md:py-32"
      style={{
        background:
          "linear-gradient(135deg, #064E3B 0%, #047857 35%, #059669 70%, #10B981 100%)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
              Revolutionary POS System for Hardware Stores
            </h1>
            <p className="text-base md:text-lg text-emerald-100 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Streamline your inventory, sales, and customer management all in
              one powerful platform built specifically for hardware retailers.
            </p>

            {/* Feature List */}
            <ul className="space-y-3 mb-8 max-w-lg mx-auto lg:mx-0">
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2
                  size={20}
                  className="text-emerald-200 flex-shrink-0"
                />
                <span className="text-base text-emerald-50">
                  Real-time inventory tracking and management
                </span>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2
                  size={20}
                  className="text-emerald-200 flex-shrink-0"
                />
                <span className="text-base text-emerald-50">
                  Advanced analytics and reporting tools
                </span>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2
                  size={20}
                  className="text-emerald-200 flex-shrink-0"
                />
                <span className="text-base text-emerald-50">
                  Multi-location support and cloud-based sync
                </span>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2
                  size={20}
                  className="text-emerald-200 flex-shrink-0"
                />
                <span className="text-base text-emerald-50">
                  24/7 dedicated customer support
                </span>
              </li>
            </ul>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold text-base px-7 py-5 shadow-md rounded-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white text-white bg-transparent hover:bg-white/10 font-semibold text-base px-7 py-5 rounded-md transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                View Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-5 text-sm text-emerald-100 justify-center lg:justify-start font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-200" />
                <span>Trusted by 500+ stores</span>
              </div>
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-emerald-200" />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-200" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Right Content — Dashboard Screenshot */}
          <div className="hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-900/50">
              <Image
                src="/images/img.png"
                alt="Hardware POS System Dashboard"
                width={800}
                height={560}
                className="object-cover w-full h-auto"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
