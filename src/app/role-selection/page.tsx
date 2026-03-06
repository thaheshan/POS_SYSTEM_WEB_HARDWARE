"use client";

import { UserRound, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
          Select Entry Point
        </h1>
        <p className="mt-3 text-center text-slate-600">
          Choose your role to continue into the POS system.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Staff</h2>
            <p className="mt-2 text-sm text-slate-600">
              Login as cashier, manager, or admin.
            </p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <UserRound className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Customer</h2>
            <p className="mt-2 text-sm text-slate-600">
              Continue as customer to browse and purchase.
            </p>
          </button>
        </div>
      </section>
    </main>
  );
}
