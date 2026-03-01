"use client";
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle,
  CircleAlert,
  Clock,
  HelpCircle,
  Info,
  Loader,
  Monitor,
  Store,
} from "lucide-react";
import React from "react";
import { StaffRegisterData } from "../page";
import { SHOP_OPTIONS } from "@/utils/StaffRegisterData";

interface StepThreeProps {
  data: StaffRegisterData;
}

const StepThree = ({ data }: StepThreeProps) => {
  const selectedShop = SHOP_OPTIONS.find((shop) => shop.id === data.shopId);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 mt-10">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-bl from-[#0E9F6E] to-[#046C4E] rounded-full shadow-md shadow-green-500/20 mb-6">
          <Check className="w-10 h-10 text-white stroke-[2.75px]" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Account Created!
        </h1>
        <p className="text-slate-500 mt-2 text-sm lg:text-base">
          Your staff account has been successfully created and is now pending
          approval
        </p>
      </div>

      {/* Registration Complete Card */}
      <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="text-green-500 size-5" />
          <div>
            <p className="font-semibold text-slate-900 text-sm">
              Registration Complete
            </p>
            <p className="text-xs text-slate-400">
              Account created successfully
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            { label: "Full Name", value: data.fullName },
            { label: "Email", value: data.email },
            { label: "Mobile", value: data.phoneNumber },
            { label: "Shop", value: selectedShop?.name || data.shopId },
          ].map((item) => (
            <div
              key={item.label}
              className="flex justify-between py-3 text-sm"
            >
              <span className="text-slate-500">{item.label}</span>
              <span className="font-medium text-slate-900">{item.value}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 text-sm">
            <span className="text-slate-500">Status</span>
            <span className="flex items-center gap-1.5 text-orange-500 font-medium text-sm">
              <CircleAlert className="size-4" />
              Pending Approval
            </span>
          </div>
        </div>
      </div>

      {/* Approval Process */}
      <div className="w-full mt-6 border border-slate-200 rounded-xl p-5 shadow-sm ">
        <h3 className="text-base font-bold text-slate-900 mb-5">
          Approval Process
        </h3>

        <div className="relative ml-1">
          {/* Vertical line */}
          <div className="absolute left-[14px] top-8 bottom-8 w-0.5 bg-slate-200" />

          {/* Step 1: Account Created */}
          <div className="flex gap-4 mb-8 relative">
            <div className="flex-shrink-0 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center z-10">
              <Check className="text-white size-4 stroke-[3]" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                Account Created
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Your registration details have been submitted successfully.
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">
                Completed
              </p>
            </div>
          </div>

          {/* Step 2: Shop Owner Review */}
          <div className="flex gap-4 mb-8 relative">
            <div className="flex-shrink-0 w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center z-10">
              <Loader className="text-white size-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                Shop Owner Review
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Your shop owner will verify your details and approve your
                request.
              </p>
              <p className="text-xs text-orange-500 font-medium mt-1">
                In Progress
              </p>
            </div>
          </div>

          {/* Step 3: Account Activated */}
          <div className="flex gap-4 relative">
            <div className="flex-shrink-0 w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center z-10">
              <Monitor className="text-slate-400 size-4" />
            </div>
            <div>
              <p className="font-medium text-slate-400 text-sm">
                Account Activated
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                You&apos;ll receive access to the shop management system.
              </p>
              <p className="text-xs text-slate-400 mt-1">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* What happens next? */}
      <div className="w-full mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="text-blue-600 size-4" />
          <p className="font-semibold text-slate-900 text-sm">
            What happens next?
          </p>
        </div>
        <ul className="space-y-2">
          {[
            "You'll receive an email notification once approved",
            "Your shop owner can contact you for verification",
            "Approval typically takes 24-48 hours",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="text-blue-500 size-4 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Shop Info Card */}
      <div className="w-full mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Store className="text-blue-600 size-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">
              {selectedShop?.name || "Shop"}
            </p>
            <p className="text-xs text-slate-400">
              Colombo, Western Province
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="flex justify-between py-3 text-sm">
            <span className="text-slate-500">Shop Owner</span>
            <span className="font-medium text-slate-900">{selectedShop?.shopOwner || "Unknown Owner"}</span>
          </div>
          <div className="flex justify-between py-3 text-sm">
            <span className="text-slate-500">Shop ID</span>
            <span className="font-medium text-slate-900">
              {data.shopPrivateId || "SHP-ABC-2024-001234"}
            </span>
          </div>
          <div className="flex justify-between py-3 text-sm">
            <span className="text-slate-500">Contact</span>
            <span className="font-medium text-slate-900">{selectedShop?.contact || "No contact information available"}</span>
          </div>
        </div>
      </div>

      {/* Need Help */}
      <div className="w-full mt-6 bg-amber-50 border border-amber-100 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="text-amber-500 size-4" />
          <p className="font-semibold text-slate-900 text-sm">Need Help?</p>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          If you have any questions or haven&apos;t received approval within 48
          hours, please contact your shop owner directly.
        </p>
        <a
          href="/support"
          className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium mt-2 hover:underline"
        >
          Contact Support
          <ArrowRight className="size-4" />
        </a>
      </div>

      {/* Go to Login */}
      <div className="w-full mt-10 flex flex-col items-center gap-3">
        <p className="text-xs text-slate-400">
          Your account is pending approval from the shop owner
        </p>
        <a
          href="/auth/login"
          className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 active:scale-[0.98]"
        >
          Go to Login
          <ArrowRight className="size-5" />
        </a>
      </div>
    </div>
  );
};

export default StepThree;
