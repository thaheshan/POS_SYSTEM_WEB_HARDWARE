"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, CircleAlert, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AuthLayout from "@/components/login/auth/auth-layout";

export default function PendingPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {

    const hasAccess = sessionStorage.getItem("allowPendingAccess");

    if (!hasAccess) {
      router.replace("/auth/login"); 
    } else {
      setIsAuthorized(true);
      //sessionStorage.removeItem("allowPendingAccess");
    }
  }, [router]);

  if (!isAuthorized) return null;

  return (
    <AuthLayout>
      <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        <div className="flex flex-col items-center text-center mb-8 mt-4">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full shadow-sm mb-6">
            <Monitor className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Account Pending Approval
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-sm">
            Your staff account exists, but it is currently inactive. It may be pending Shop Owner verification.
          </p>
        </div>

        <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CircleAlert className="text-orange-500 size-5" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Current Status</p>
              <p className="text-xs text-orange-500 font-medium">Pending Review / Inactive</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 border-t border-slate-100 pt-4">
            We have notified your shop owner. You will receive an email once your access is approved and your account is activated. If you believe this is an error, please contact your manager.
          </p>
        </div>

        <div className="w-full mt-8 flex flex-col items-center gap-3">
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all"
          >
            <ArrowLeft className="size-4" />
            Return to Login
          </Link>
          
          <Link
            href="/support"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all"
          >
            <HelpCircle className="size-4" />
            Contact Support
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}