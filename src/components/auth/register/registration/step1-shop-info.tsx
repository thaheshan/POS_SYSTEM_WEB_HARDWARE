"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegistration } from "@/lib/register/registration-context";
import {
  shopDataSchema,
  ShopDataForm,
} from "@/lib/register/validation-schemas";
import { Input } from "@/components/auth/register/ui/input";
import { Button } from "@/components/auth/register/ui/button";
import { Store, ArrowRight, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/auth/register/ui/select";

const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad"];
const DISTRICTS = ["District 1", "District 2", "District 3", "District 4"];
const PROVINCES = ["Punjab", "Sindh", "KPK", "Balochistan"];

interface Step1ShopInfoProps {
  onNext: () => void;
}

export function Step1ShopInfo({ onNext }: Step1ShopInfoProps) {
  const { data, updateShopData } = useRegistration();
  // React Hook Form + Zod keeps validation rules centralized.
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
    watch,
    setValue,
  } = useForm<ShopDataForm>({
    resolver: zodResolver(shopDataSchema),
    defaultValues: data.shop as ShopDataForm,
    mode: "onBlur",
  });

  const selectedCity = watch("city");

  useEffect(() => {
    // Rehydrate form when user navigates back to this step.
    if (data.shop) {
      Object.entries(data.shop).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
  }, []);

  const onSubmit = (formData: ShopDataForm) => {
    // Save current step data into shared registration context, then move next.
    updateShopData(formData);
    onNext();
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
              <Store className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Register Your Shop
          </h1>
          <p className="text-gray-600 text-lg">
            Let's set up your hardware shop management system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Business Information Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Business Information
            </h2>

            {/* Shop Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                Shop Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="ABC Hardware Store"
                  {...register("shopName")}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                />
              </div>
              {errors.shopName && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.shopName.message}
                </p>
              )}
            </div>

            {/* Business Registration Number */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                Business Registration Number{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="BR-2024-001234"
                {...register("businessRegistration")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
              />
              {errors.businessRegistration && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.businessRegistration.message}
                </p>
              )}
              <p className="text-gray-600 text-xs mt-1.5">
                Your official business registration number
              </p>
            </div>

            {/* Shop Address */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                Shop Address <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="123 Galle Road, Dehwala"
                {...register("shopAddress")}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all resize-none"
              />
              {errors.shopAddress && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.shopAddress.message}
                </p>
              )}
            </div>
            {/* City & Postal Code */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("city")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                >
                  <option value="">Select City</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-600 text-sm font-medium mt-1.5">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="00300"
                  {...register("postalCode")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                />
                {errors.postalCode && (
                  <p className="text-red-600 text-sm font-medium mt-1.5">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            {/* District & Province */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("district")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                >
                  <option value="">Select District</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="text-red-600 text-sm font-medium mt-1.5">
                    {errors.district.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("province")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
                >
                  <option value="">Select Province</option>
                  {PROVINCES.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="text-red-600 text-sm font-medium mt-1.5">
                    {errors.province.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tax Information Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Tax Information
            </h2>

            {/* Tax Identification Number */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                Tax Identification Number (TIN){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="TAX-ABC-123456"
                {...register("tin")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
              />
              {errors.tin && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.tin.message}
                </p>
              )}
              <p className="text-gray-600 text-xs mt-1.5">
                Your tax identification number for business registration
              </p>
            </div>

            {/* VAT Registration Number */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                VAT Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VAT-UK-987654"
                {...register("vat")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
              />
              {errors.vat && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.vat.message}
                </p>
              )}
              <p className="text-gray-600 text-xs mt-1.5">
                Your VAT identification number if applicable
              </p>
            </div>

            {/* VAT Registration Date */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                VAT Registration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="mm/dd/yyyy"
                {...register("vatDate")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 hover:border-gray-400 transition-all"
              />
              {errors.vatDate && (
                <p className="text-red-600 text-sm font-medium mt-1.5">
                  {errors.vatDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-base transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <span>Continue to Owner Details</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
