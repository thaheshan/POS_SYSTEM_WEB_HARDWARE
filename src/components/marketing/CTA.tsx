"use client";

import { Button } from "@/components/marketing/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section
      id="cta"
      className="py-20 md:py-28 text-white"
      style={{
        background:
          "linear-gradient(135deg, #064E3B 0%, #047857 35%, #059669 70%, #10B981 100%)",
      }}
    >
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-5 leading-tight">
          Ready to Transform Your Hardware Store?
        </h2>
        <p className="text-emerald-100 text-base mb-10 leading-relaxed">
          Join 500+ hardware stores already using our POS system to streamline
          operations and boost revenue. Start your free 14-day trial today with
          no obligations.
        </p>
        <Link href="/auth/register/role">
          <Button className="bg-white text-emerald-800 hover:bg-gray-50 font-bold px-10 py-5 text-base rounded-lg shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
            Start Your Free Trial Today
          </Button>
        </Link>
      </div>
    </section>
  );
}
