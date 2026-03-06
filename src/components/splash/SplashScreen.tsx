"use client";

import { Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const TARGET_ROUTE = "/role-selection";
const BG_IMAGE =
  "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1920&q=80";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Keep splash visible briefly, then continue to role selection.
    const redirectTimer = setTimeout(() => {
      router.replace(TARGET_ROUTE);
    }, 2800);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(31, 110, 236, 0.78) 0%, rgba(19, 176, 150, 0.78) 100%)",
        }}
        aria-hidden="true"
      />

      <section className="relative z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center text-white">
        <div className="mb-8 flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-[0_24px_65px_rgba(0,0,0,0.28)]">
          <Store className="h-12 w-12 text-blue-600" strokeWidth={2.5} />
        </div>

        <h1 className="text-5xl font-extrabold tracking-[0.08em] sm:text-6xl">
          POS SYSTEM
        </h1>
        <p className="mt-4 text-lg text-white/90 sm:text-2xl">
          Complete Shop Management System
        </p>

        <div className="mt-24 flex flex-col items-center gap-3">
          <div className="relative h-14 w-14">
            <svg className="h-14 w-14" viewBox="0 0 40 40" aria-hidden="true">
              {/* Static background outline - empty circle */}
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
              />

              {/* Animated filling circle - grows from center dot to full circle */}
              <circle cx="20" cy="20" r="16" fill="white">
                <animate
                  attributeName="r"
                  values="0;16"
                  dur="2s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </circle>
            </svg>
          </div>

          <p className="text-sm font-semibold text-white/85">Version 1.0.0</p>
          <p className="text-sm font-semibold text-white/85">
            Powered by Futura Solutions
          </p>
        </div>
      </section>
    </main>
  );
}
