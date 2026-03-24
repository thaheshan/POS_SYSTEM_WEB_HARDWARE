"use client";

import { Card } from "@/components/marketing/ui/card";
import {
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  Store,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Advanced POS Checkout",
    description:
      "Fast, intuitive checkout system with support for multiple payment methods, discounts, and customer management.",
  },
  {
    icon: Package,
    title: "Real-time Inventory",
    description:
      "Track stock levels across all locations with automatic low-stock alerts and reorder points.",
  },
  {
    icon: BarChart3,
    title: "Comprehensive Analytics",
    description:
      "In-depth reports on sales, inventory, customers, and financial performance to guide business decisions.",
  },
  {
    icon: Users,
    title: "Customer Management",
    description:
      "Maintain customer profiles, loyalty programs, credit management, and purchase history.",
  },
  {
    icon: Store,
    title: "Multi-location Support",
    description:
      "Manage multiple warehouses and branches from a single dashboard with cloud synchronization.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description:
      "Bank-level encryption, role-based access control, and comprehensive audit trails.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p
            className="font-semibold tracking-widest text-xs mb-3 uppercase"
            style={{ color: "#059669" }}
          >
            POWERFUL FEATURES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Store
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Complete suite of tools designed to manage every aspect of your
            hardware store operations
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300 bg-gray-50 text-center flex flex-col items-center rounded-2xl group"
              >
                <div
                  className="mb-5 h-14 w-14 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#059669" }}
                >
                  <Icon
                    size={30}
                    strokeWidth={2.2}
                    style={{ color: "#FFFFFF" }}
                  />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
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
