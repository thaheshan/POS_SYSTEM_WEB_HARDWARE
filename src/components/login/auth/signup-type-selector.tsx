"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OptionCard from "./option-card";
import AuthHeader from "./auth-header";
import { Store, Users, ArrowLeft } from "lucide-react";

export default function SignupTypeSelector() {
  const router = useRouter();
  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  const handleShopOwnerClick = () => {
    setSelectedType("shop-owner");
    // Navigate to shop owner signup
    router.push("/auth/register/shop-owner");
  };

  const handleAdminStaffClick = () => {
    setSelectedType("admin-staff");
    // Navigate to admin/staff signup
    router.push("/auth/register/staff");
  };

  const handleBackClick = () => {
    router.push("/auth/login");
  };

  return (
    <div className="w-full">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="mb-5 inline-flex items-center gap-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        Back to Login
      </button>

      <AuthHeader
        title="Welcome to Futura Hardware"
        subtitle="Please select your signup type"
      />

      {/* Options */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <OptionCard
          isPrimary
          icon={<Store className="w-6 h-6 text-white" />}
          title="Shop Owner"
          description="Register new shop & manage business"
          isActive={selectedType === "shop-owner"}
          onClick={handleShopOwnerClick}
        />

        <OptionCard
          icon={<Users className="w-6 h-6 text-green-500" />}
          title="Admin / Staff"
          description="Login to existing shop account"
          isActive={selectedType === "admin-staff"}
          onClick={handleAdminStaffClick}
        />
      </div>

      {/* Support Link */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm">
          Need help getting started?{" "}
          <Link
            href="/contact-support"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
