"use client";

import React, { useEffect, useRef, useState } from "react";
import { StaffRegisterData } from "../page";
import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Search,
  Store,
  User,
  UserPlus,
} from "lucide-react";
import { SHOP_OPTIONS, STAFF_ROLES } from "@/utils/StaffRegisterData";

interface StepOneProps {
  data: StaffRegisterData;
  updateFields: (fields: Partial<StaffRegisterData>) => void;
  onNext: () => void;
}

const StepOne = ({ data, updateFields, onNext }: StepOneProps) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [shopSearch, setShopSearch] = useState("");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const selectedShop = SHOP_OPTIONS.find((s) => s.id === data.shopId);
  const selectedRole = STAFF_ROLES.find((r) => r.id === data.role);
  const filteredShops = SHOP_OPTIONS.filter((shop) =>
    shop.name.toLowerCase().includes(shopSearch.toLowerCase())
  );

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        shopDropdownRef.current &&
        !shopDropdownRef.current.contains(e.target as Node)
      ) {
        setShopDropdownOpen(false);
        setShopSearch("");
      }
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(e.target as Node)
      ) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isPasswordValid = data.password.length >= 8;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const isPhoneValid = data.phoneNumber.length >= 10;
  const passwordsMatch =
    data.password === data.confirmPassword;

  const canGoNext =
    data.shopId.length > 0 &&
    data.fullName.trim().length > 2 &&
    isEmailValid &&
    isPhoneValid &&
    // isPasswordValid &&
    // passwordsMatch &&
    agreedToTerms;
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col items-center text-center mb-10 mt-10">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-bl from-[#1E429F] to-[#1A56DB] rounded-xl shadow-md shadow-blue-500/20 mb-6 ">
          <UserPlus className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Create Staff Account
        </h1>
        <p className="text-slate-500 mt-2 text-sm lg:text-base">
          Register new staff member for your shop
        </p>
      </div>

      <form
        className="w-full space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Shop Name <span className="text-red-500">*</span>
          </label>
          <div className="relative" ref={shopDropdownRef}>
            {/* Trigger button */}
            <button
              type="button"
              onClick={() => {
                setShopDropdownOpen(!shopDropdownOpen);
                setShopSearch("");
              }}
              className={`w-full pl-12 pr-10 py-3.5 bg-white border rounded-xl text-left focus:outline-none focus:ring-4 transition-all cursor-pointer font-medium ${
                data.shopId.length === 0
                  ? "border-red-300 focus:ring-red-100 text-slate-400"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700"
              }`}
            >
              {selectedShop ? selectedShop.name : "Select your shop"}
            </button>

            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Store size={20} />
            </div>
            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform duration-200 ${
                shopDropdownOpen ? "rotate-180" : ""
              }`}
            >
              <ChevronDown size={18} />
            </div>

            {/* Dropdown panel */}
            {shopDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Search */}
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                    <input
                      type="text"
                      value={shopSearch}
                      onChange={(e) => setShopSearch(e.target.value)}
                      placeholder="Search shops..."
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Options list — max 5 visible */}
                <ul className="max-h-[220px] overflow-y-auto py-1">
                  {filteredShops.length > 0 ? (
                    filteredShops.map((shop) => (
                      <li key={shop.id}>
                        <button
                          type="button"
                          onClick={() => {
                            updateFields({ shopId: shop.id });
                            setShopDropdownOpen(false);
                            setShopSearch("");
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            data.shopId === shop.id
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{shop.name}</span>
                          {data.shopId === shop.id && (
                            <Check className="size-4 text-blue-600" />
                          )}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-slate-400 text-center">
                      No shops found
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => updateFields({ fullName: e.target.value })}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-medium"
              placeholder="Enter full name"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
              <User size={20} />
            </div>
          </div>
        </div>

        {/* email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.email}
              onChange={(e) => updateFields({ email: e.target.value })}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all outline-none ${
                !isEmailValid && data.email.length > 0
                  ? "border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              }`}
              placeholder="staff@abchardware.lk"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
              <Mail size={20} />
            </div>
          </div>
        </div>

        {/* phone number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.phoneNumber}
              onChange={(e) => updateFields({ phoneNumber: e.target.value })}
              className={`w-full pl-12 pr-10 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 font-medium ${
                !isPhoneValid && data.phoneNumber.length > 0
                  ? "border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-blue-500"
              }`}
              placeholder="+94 77 000 0000"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
              <Phone size={20} />
            </div>
          </div>
        </div>

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Staff Role <span className="text-red-500">*</span>
          </label>
          <div className="relative" ref={roleDropdownRef}>
            {/* Trigger button */}
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className={`w-full pl-12 pr-10 py-3.5 bg-white border rounded-xl text-left focus:outline-none focus:ring-4 transition-all cursor-pointer font-medium ${
                data.role.length === 0
                  ? "border-red-300 focus:ring-red-100 text-slate-400"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 text-slate-700"
              }`}
            >
              {selectedRole ? selectedRole.label : "Select staff role"}
            </button>

            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <BriefcaseBusiness size={20} />
            </div>
            <div
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform duration-200 ${
                roleDropdownOpen ? "rotate-180" : ""
              }`}
            >
              <ChevronDown size={18} />
            </div>

            {/* Dropdown panel */}
            {roleDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                <ul className="py-1">
                  {STAFF_ROLES.map((role) => (
                    <li key={role.id}>
                      <button
                        type="button"
                        onClick={() => {
                          updateFields({ role: role.id });
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          data.role === role.id
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{role.label}</span>
                        {data.role === role.id && (
                          <Check className="size-4 text-blue-600" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Password */}
        {/* <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
              <Lock size={20} />
            </div>
            <input
              type={showPass ? "text" : "password"}
              value={data.password}
              onChange={(e) => updateFields({ password: e.target.value })}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-medium"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors pointer-events-auto"
            >
              {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 ml-1 mt-1">
            Minimum 8 characters with letters and numbers
          </p>
        </div> */}

        {/* confirm password */}
        {/* <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700 ml-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock
              className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors ${
                !passwordsMatch
                  ? "text-red-500"
                  : "text-slate-400 group-focus-within:text-blue-600"
              }`}
            />

            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={data.confirmPassword}
              onChange={(e) =>
                updateFields({ confirmPassword: e.target.value })
              }
              // Dynamic Border Color: Red if mismatch, Blue if focused
              className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl outline-none transition-all ${
                !passwordsMatch
                  ? "border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          {!passwordsMatch && (
            <p className="text-[10px] text-red-500 ml-1 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
              Passwords do not match
            </p>
          )}
        </div> */}

        <div className=" flex items-start gap-3 my-8">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
          <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
            I agree to the{" "}
            <a href="/terms" className="text-blue-600 font-medium hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 font-medium hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={!canGoNext}
          className={`w-full mt-8 py-4 rounded-xl font-bold transition-all duration-200 ${
            canGoNext
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </form>

      {/* Sign In Link & Footer */}
      <div className="flex flex-col items-center mt-10 gap-1">
        <p className="text-sm text-slate-500">Already have an account?</p>
        <a
          href="/auth/login"
          className="text-sm text-blue-600 font-semibold hover:underline"
        >
          Sign In to Your Account
        </a>
      </div>

      <div className="flex flex-col items-center mt-8 gap-0.5 text-xs text-slate-400">
        <span>v1.0.0</span>
        <span>&copy; {new Date().getFullYear()} Futura Solutions PVT LTD</span>
      </div>
    </div>
  );
};

export default StepOne;
