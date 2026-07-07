"use client";

import { useState } from "react";
import { Button } from "@/components/marketing/ui/button";
import { Card } from "@/components/marketing/ui/card";
import { Check } from "lucide-react";

const pricingPlans = [
  {
    name: "Starter",
    subtitle: "Perfect for small hardware stores",
    priceMonthly: "Rs. 4,999",
    priceAnnual: "Rs. 3,999",
    periodMonthly: "per month",
    periodAnnual: "per month, billed annually",
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
    priceMonthly: "Rs. 9,999",
    priceAnnual: "Rs. 7,999",
    periodMonthly: "per month",
    periodAnnual: "per month, billed annually",
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
    priceMonthly: "Custom",
    priceAnnual: "Custom",
    periodMonthly: "Contact us",
    periodAnnual: "Contact us",
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
  const [isAnnual, setIsAnnual] = useState(true);

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
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-8">
            Choose the plan that fits your business needs. All plans include a
            30-day free trial.
          </p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${!isAnnual ? "text-gray-900" : "text-gray-500"}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              style={{ backgroundColor: isAnnual ? "#059669" : "#D1D5DB" }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
            <span className={`text-sm font-semibold flex items-center gap-1 ${isAnnual ? "text-gray-900" : "text-gray-500"}`}>
              Yearly
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full ml-1">Save 20%</span>
            </span>
          </div>
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
                        (isAnnual ? plan.priceAnnual : plan.priceMonthly) === "Custom" ? "text-3xl" : "text-4xl"
                      }`}
                    >
                      {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="text-gray-400 text-xs mt-1">
                      {isAnnual ? plan.periodAnnual : plan.periodMonthly}
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
