"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Building2,
  UserCircle2,
  CreditCard,
  Paperclip,
  CheckCircle2,
  ChevronDown,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/api/axiosInstance";
import { toast } from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  supplier?: any;
}

const TABS = [
  { id: "basic", label: "Basic Info", icon: Building2 },
  { id: "contact", label: "Contact Persons", icon: UserCircle2 },
  { id: "payment", label: "Payment & Bank", icon: CreditCard },
  { id: "docs", label: "Documents", icon: Paperclip },
];

const PRESET_CATEGORIES = [
  "Tools & Machinery",
  "Paints & Chemicals",
  "Electrical",
  "Plumbing",
  "Other",
];

export default function AddSupplierModal({ isOpen, onClose, supplier }: Props) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [categorySelect, setCategorySelect] = useState("Tools & Machinery");
  const [customCategory, setCustomCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [location, setLocation] = useState("");

  const customCategoryRef = useRef<HTMLInputElement>(null);

  // Derived: actual category value sent to backend
  const effectiveCategory =
    categorySelect === "Other"
      ? customCategory.trim() || "Other"
      : categorySelect;

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setName(supplier.name || "");
        setSupplierCode(supplier.supplierCode || "");
        setStatus(supplier.status || "Active");
        setPhone(supplier.phone || "");
        setEmail(supplier.email || "");
        setContactPerson(supplier.contactPerson || "");
        setLocation(supplier.location || "");
        // If stored category matches a preset, select it; otherwise show as custom "Other"
        const storedCat = supplier.category || "Tools & Machinery";
        if (PRESET_CATEGORIES.includes(storedCat)) {
          setCategorySelect(storedCat);
          setCustomCategory("");
        } else {
          setCategorySelect("Other");
          setCustomCategory(storedCat);
        }
      } else {
        setName("");
        setSupplierCode("");
        setCategorySelect("Tools & Machinery");
        setCustomCategory("");
        setStatus("Active");
        setPhone("");
        setEmail("");
        setContactPerson("");
        setLocation("");
      }
      setActiveTab("basic");
    }
  }, [isOpen, supplier]);

  // Auto-focus custom category input when "Other" is selected
  useEffect(() => {
    if (categorySelect === "Other") {
      setTimeout(() => customCategoryRef.current?.focus(), 50);
    }
  }, [categorySelect]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name || !phone) {
      toast.error("Please fill in the required fields (Name, Phone)");
      return;
    }
    if (categorySelect === "Other" && !customCategory.trim()) {
      toast.error("Please enter a category name or choose a preset category");
      customCategoryRef.current?.focus();
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name,
        supplierCode: supplierCode || undefined,
        status,
        phone,
        email,
        contactPerson,
        location,
        category: effectiveCategory,
      };

      if (supplier && supplier.id) {
        await api.put(`/suppliers/${supplier.id}`, payload);
        toast.success("Supplier updated successfully");
      } else {
        await api.post("/suppliers", payload);
        toast.success("Supplier created successfully");
      }
      onClose(true);
    } catch (error: any) {
      console.error("Failed to save supplier", error);
      const msg = error.response?.data?.message || "Failed to save supplier";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onClose()}
      />
      {/* ↓ max-h-[90vh] + overflow-hidden so it never exceeds the viewport */}
      <div className="relative bg-[#f8fafc] w-full max-w-[780px] rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] stock-modal-enter">
        {/* GREEN HEADER — compact */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 px-7 py-5 flex justify-between items-center text-white shrink-0 shadow-sm relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-black tracking-tight leading-tight">
                {supplier ? "Edit Supplier" : "Add New Supplier"}
              </h2>
              <p className="text-[12px] font-semibold text-emerald-100">
                {supplier
                  ? "Update supplier information"
                  : "Register a new supplier with full contact and payment details"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose()}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* WHITE CONTENT WRAPPER — scrollable */}
        <div className="bg-white flex flex-col flex-1 rounded-t-[28px] -mt-5 relative z-20 overflow-hidden">
          {/* TABS */}
          <div className="flex items-center gap-5 px-7 border-b border-gray-100 pt-5 bg-gradient-to-b from-blue-50/40 to-transparent shrink-0">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 pb-3 px-1 border-b-4 transition-all text-[12px] font-semibold",
                    isActive
                      ? "border-[#059669] text-[#059669]"
                      : "border-transparent text-gray-400 hover:text-gray-600",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* FORM AREA — scrollable */}
          <div className="flex-1 px-7 py-5 overflow-y-auto">
            {activeTab === "basic" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* ── Section: Identity ── */}
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#059669] rounded-full" />
                  <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-wide">
                    Supplier Identity
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-700 uppercase tracking-wide">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Silva Hardware Distributors"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                      />
                    </div>
                  </div>

                  {/* Supplier Code */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-700 uppercase tracking-wide">
                      Supplier Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 font-bold text-[12px]">#</span>
                      </div>
                      <input
                        type="text"
                        value={supplierCode}
                        onChange={(e) => setSupplierCode(e.target.value)}
                        placeholder="Leave empty to auto-generate"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-600 rounded-xl text-[13px] font-mono outline-none focus:border-[#059669] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-700 uppercase tracking-wide">
                      Supplier Category
                    </label>
                    <div className="relative">
                      <select
                        value={categorySelect}
                        onChange={(e) => setCategorySelect(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium appearance-none outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all bg-white text-gray-600"
                      >
                        <option>Tools &amp; Machinery</option>
                        <option>Paints &amp; Chemicals</option>
                        <option>Electrical</option>
                        <option>Plumbing</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {/* Custom category input — shown only when "Other" is selected */}
                    {categorySelect === "Other" && (
                      <div className="relative mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PenLine className="w-3.5 h-3.5 text-[#059669]" />
                        </div>
                        <input
                          ref={customCategoryRef}
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Type your category name…"
                          className="w-full pl-9 pr-4 py-2.5 border-2 border-[#059669]/40 bg-emerald-50/50 rounded-xl text-[13px] font-medium outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-700 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setStatus("Active")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black transition-all",
                          status === "Active"
                            ? "border-2 border-[#059669] bg-[#ecfdf5] text-[#059669]"
                            : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                        )}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            status === "Active" ? "bg-[#059669]" : "bg-gray-300",
                          )}
                        />
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus("Inactive")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black transition-all",
                          status === "Inactive"
                            ? "border-2 border-red-500 bg-red-50 text-red-600"
                            : "border border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                        )}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            status === "Inactive" ? "bg-red-500" : "bg-gray-300",
                          )}
                        />
                        Inactive
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Section: Contact ── */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <div className="w-1 h-4 bg-[#059669] rounded-full" />
                  <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-wide">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-700 uppercase tracking-wide">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <div className="border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 px-3 flex items-center justify-center shrink-0">
                        <span className="text-[14px]">📞</span>
                      </div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="077 123 4567"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-r-xl text-[13px] font-medium outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-gray-700 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 font-bold text-[13px]">@</span>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="supplier@company.com"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
                      />
                    </div>
                  </div>

                  {/* Location — full width */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-black text-gray-700 uppercase tracking-wide">
                      Location / Address
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. 123 Colombo Road, Kandy"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#059669] transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "basic" && (
              <div className="flex flex-col items-center justify-center h-48 text-center opacity-60">
                {(() => {
                  const ActiveIcon = TABS.find((t) => t.id === activeTab)?.icon;
                  return ActiveIcon ? (
                    <ActiveIcon className="w-10 h-10 text-gray-300 mb-3" />
                  ) : null;
                })()}
                <p className="text-[13px] font-bold text-gray-500">
                  Configure {TABS.find((t) => t.id === activeTab)?.label}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  This section is available in future modules.
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-100 px-7 py-4 flex flex-col md:flex-row justify-between items-center gap-3 bg-gray-50/50 shrink-0">
            <span className="text-[10px] font-medium text-gray-400">
              * Required fields must be filled before saving
            </span>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => onClose()}
                className="flex-1 md:flex-none px-5 py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-white transition-all bg-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-emerald-600 to-teal-500 flex-1 md:flex-none px-7 py-2.5 rounded-xl text-[12px] font-black flex items-center justify-center gap-2 text-white disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSaving ? "Saving…" : supplier ? "Update Supplier" : "Save Supplier"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}