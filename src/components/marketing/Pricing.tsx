"use client";

import { Button } from "@/components/marketing/ui/button";
import { Card } from "@/components/marketing/ui/card";
import { Check } from "lucide-react";

const pricingPlans = [
  {
    name: "Starter",
    subtitle: "Perfect for small hardware stores",
    price: "Rs. 4,999",
    period: "per month",
    features: [
      "1 Checkout Terminal",
      "Basic Inventory Management",
      "Customer Profiles",
      "Daily Sales Reports",
      "Single Location",
      "Email Support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    subtitle: "Ideal for growing stores",
    price: "Rs. 9,999",
    period: "per month",
    features: [
      "5 Checkout Terminals",
      "Advanced Inventory Management",
      "Customer Loyalty Program",
      "Detailed Analytics & Reports",
      "Multi-Location Support",
      "Priority Support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    subtitle: "For large retail chains",
    price: "Custom",
    period: "Contact us",
    features: [
      "Unlimited Terminals",
      "Complete Custom Integration",
      "Advanced Security Features",
      "Dedicated Account Manager",
      "Unlimited Locations",
      "24/7 Phone Support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="py-20 md:py-28"
      style={{ backgroundColor: "#F9FAFB" }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-emerald-600 font-semibold tracking-widest text-xs mb-3 uppercase">
            FLEXIBLE PRICING
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
            Plans for Every Business Size
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Choose the plan that fits your business needs. All plans include a
            30-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="relative flex flex-col">
              {/* POPULAR badge */}
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-10">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold tracking-widest px-6 py-1 rounded-full shadow-md">
                    POPULAR
                  </span>
                </div>
              )}

              <Card
                className={`flex-1 flex flex-col p-8 rounded-xl transition-all duration-300 ${
                  plan.highlighted
                    ? "border-2 border-emerald-600 shadow-lg scale-[1.03] hover:scale-[1.05] hover:shadow-xl bg-white"
                    : "border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 bg-white"
                }`}
              >
                {/* Plan Header */}
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-xs mb-5">{plan.subtitle}</p>
                  <div className="flex flex-col items-center">
                    <span
                      className={`font-semibold tracking-tight text-emerald-500 ${
                        plan.price === "Custom" ? "text-3xl" : "text-4xl"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-gray-400 text-xs mt-1">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check
                        size={14}
                        className="text-emerald-600 flex-shrink-0"
                        strokeWidth={3}
                      />
                      <span className="text-gray-600 text-xs">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full py-5 text-sm rounded-md font-semibold mt-auto transition-colors ${
                    plan.highlighted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-white border border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
