"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut, CreditCard } from "lucide-react";

export default function SuspendedPage() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("pos_user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      setShopName(user.shopName || "Your Shop");
      setEmail(user.email || "");
    } catch (e) {
      router.push("/auth/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    localStorage.removeItem("pos_token");
    document.cookie = "pos_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/auth/login");
  };

  const handleNotifyPayment = async () => {
    setIsSubmitting(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/complete-payment-by-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) throw new Error("Failed to process payment notification.");
      
      setSuccessMsg("Payment verified! Your account is now active. You will be redirected to login.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-red-100">
        <div className="bg-gradient-to-b from-red-50 to-white p-8 text-center border-b border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-200">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h1>
          <p className="text-gray-600">
            Access to <strong>{shopName}</strong> has been temporarily suspended due to overdue subscription payments.
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-500" /> How to restore access?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Please complete your pending payment. Once you've paid, click the button below to reactivate your account instantly.
            </p>
          </div>

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-medium border border-emerald-200">
              {successMsg}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleNotifyPayment}
              disabled={isSubmitting || !!successMsg}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Verifying..." : "I have completed the payment"}
            </button>
            <button
              className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2"
              onClick={() => window.open('mailto:support@futurasolutions.com')}
            >
              Contact Support
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
