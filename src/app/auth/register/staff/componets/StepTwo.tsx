"use client";
import { Mail, Phone, Store, User } from "lucide-react";
import React from "react";
import { StaffRegisterData } from "../page";

interface StepTwoProps {
  data: StaffRegisterData;
  updateFields: (fields: Partial<StaffRegisterData>) => void;
  onNext: () => void;
  onBack: () => void;
}
const StepTwo = ({ data, updateFields, onNext, onBack }: StepTwoProps) => {
  const canGoNext =
    data.shopPrivateId.length > 0 && data.shopNameVerification.length > 0;
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-10 mt-10">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-bl from-[#1E429F] to-[#1A56DB] rounded-xl shadow-md shadow-blue-500/20 mb-6 ">
          <Store className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Join Your Shop
        </h1>
        <p className="text-slate-500 mt-2 text-sm lg:text-base">
          Tell us about yourself and request to join a shop
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* Personal Information */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-4 opacity-60">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  readOnly
                  value={data.fullName}
                  className="w-full pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  readOnly
                  value={data.email}
                  className="w-full pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <input
                  readOnly
                  value={data.phoneNumber}
                  className="w-full pl-12 py-3 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StepTwo;
