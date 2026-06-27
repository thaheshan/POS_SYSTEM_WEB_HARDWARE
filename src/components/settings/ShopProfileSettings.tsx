"use client";

import { Store, Image as ImageIcon, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { shopApi } from "@/api/shop";

import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../lib/store/authSlice";
import { useGetSettingsQuery } from "@/lib/services/settingsApi";
import {
  selectSettingsDraft,
  updateDraftField,
} from "@/store/slices/settingsDraftSlice";
import { StoreSettings } from "../../../types";

export default function ShopProfileSettings() {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // We only FETCH here. Updating is handled globally by page.tsx!
  const { data: settings, isLoading: isFetching } = useGetSettingsQuery();
  const draft = useSelector(selectSettingsDraft);

  const displayData = {
    shopName:
      draft.shopName !== undefined ? draft.shopName : settings?.shopName || "",
    businessRegistration:
      draft.businessRegistration !== undefined
        ? draft.businessRegistration
        : settings?.businessRegistration || "",
    businessPhone:
      draft.businessPhone !== undefined
        ? draft.businessPhone
        : settings?.businessPhone || "",
    businessEmail:
      draft.businessEmail !== undefined
        ? draft.businessEmail
        : settings?.businessEmail || "",
    shopAddress:
      draft.shopAddress !== undefined
        ? draft.shopAddress
        : settings?.shopAddress || "",
    city: draft.city !== undefined ? draft.city : settings?.city || "",
    district:
      draft.district !== undefined ? draft.district : settings?.district || "",
    province:
      draft.province !== undefined ? draft.province : settings?.province || "",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Dispatch to Redux so the Global Banner knows to pop up!
    dispatch(
      updateDraftField({
        field: name as keyof StoreSettings,
        value,
      })
    );
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const response = await shopApi.uploadLogo(file, token);

      const updatedUser = { ...user, logoUrl: response.logo_url };
      dispatch(setUser(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Shop logo uploaded successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to upload logo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-[24px] shadow-sm border border-gray-100">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      {/* --- HEADER (CLEANED UP - NO BUTTON) --- */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-[12px] flex items-center justify-center border border-blue-100">
            <Store className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">
              Shop Profile
            </h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Update your shop information, branding, and business details
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Logo Section */}
        <div className="bg-gray-50 rounded-[20px] p-6 mb-8 border border-gray-100 flex items-center gap-6">
          <div className="w-24 h-24 bg-white border border-gray-200 rounded-[16px] overflow-hidden flex items-center justify-center shadow-sm shrink-0">
            {user?.logoUrl ? (
              <img
                src={user.logoUrl}
                alt="Shop Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-gray-900">Shop Logo</h4>
            <p className="text-[11px] font-medium text-gray-400 mt-1 mb-4">
              Recommended: 200x200px PNG or JPG, max 2MB
            </p>
            <div className="flex gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
              />
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="bg-[#1e40af] text-white px-4 py-2 rounded-lg text-[12px] font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {isUploading ? "Uploading..." : "Upload New Logo"}
              </button>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="shopName"
              value={displayData.shopName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Business Registration No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessRegistration"
              value={displayData.businessRegistration}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Business Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="businessPhone"
              value={displayData.businessPhone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Business Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="businessEmail"
              value={displayData.businessEmail}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <label className="text-[12px] font-black text-gray-700">
            Shop Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="shopAddress"
            value={displayData.shopAddress}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">City</label>
            <select
              name="city"
              value={displayData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select City</option>
              <option value="Dehiwala">Dehiwala</option>
              <option value="Colombo">Colombo</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              District
            </label>
            <select
              name="district"
              value={displayData.district}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select District</option>
              <option value="Colombo">Colombo</option>
              <option value="Gampaha">Gampaha</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-black text-gray-700">
              Province
            </label>
            <select
              name="province"
              value={displayData.province}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select Province</option>
              <option value="Western">Western</option>
              <option value="Southern">Southern</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
