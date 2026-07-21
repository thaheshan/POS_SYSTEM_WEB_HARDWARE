"use client";

import { createPortal } from "react-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useState, useEffect, Suspense } from "react";
import {
  Search,
  Store,
  CreditCard,
  Receipt,
  Printer,
  ShieldCheck,
  Bell,
  Blocks,
  Database,
  Lock,
  Settings,
  History,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import ShopProfileSettings from "@/components/settings/ShopProfileSettings";
import TaxSettings from "@/components/settings/TaxSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import PrintingSettings from "@/components/settings/PrintingSettings";
import RolesSettings from "@/components/settings/RolesSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import BackupSettings from "@/components/settings/BackupSettings";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SystemPreferencesSettings from "@/components/settings/SystemPreferencesSettings";

// --- REDUX & API IMPORTS ---
import { useAppDispatch } from "@/store/hooks";
import { useSelector } from "react-redux";
import {
  selectSettingsDraft,
  clearDraft,
} from "@/store/slices/settingsDraftSlice";
import { useUpdateSettingsMutation } from "@/lib/services/settingsApi";

const MENU_ITEMS = [
  { id: "profile", label: "Shop Profile", icon: Store },
  { id: "tax", label: "Tax Configuration", icon: Receipt },
  { id: "billing", label: "Subscription & Billing", icon: CreditCard },
  { id: "printing", label: "Printing & Receipts", icon: Printer },
  { id: "roles", label: "Roles & Permissions", icon: ShieldCheck },
  { id: "security", label: "Security", icon: Lock },
  { id: "backup", label: "Backup & Data", icon: Database },
  { id: "integrations", label: "Integrations", icon: Blocks },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "system", label: "System Preferences", icon: Settings },
];

function EditSettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromUrl = searchParams.get("tab");
  const initialTab = MENU_ITEMS.some((m) => m.id === tabFromUrl)
    ? tabFromUrl
    : "profile";

  const [activeMenu, setActiveMenu] = useState(initialTab as string);

  // --- NEXT.JS PORTAL STATE ---
  const [mounted, setMounted] = useState(false);

  // --- REDUX STATE ---
  const dispatch = useAppDispatch();
  const draftData = useSelector(selectSettingsDraft);
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  // Derived state: Show banner if draft has any typing in it
  const hasUnsavedChanges = Object.keys(draftData).length > 0;

  useEffect(() => {
    setMounted(true);
    if (tabFromUrl && MENU_ITEMS.some((m) => m.id === tabFromUrl)) {
      setActiveMenu(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    router.push(`/settings/edit?tab=${id}`, { scroll: false });
  };

  // --- THE GLOBAL SAVE FUNCTION ---
  const handleGlobalSave = async () => {
    try {
      await updateSettings(draftData).unwrap();
      dispatch(clearDraft());
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const renderContent = () => {
    // Removed the broken setHasUnsavedChanges props since Redux handles it now!
    switch (activeMenu) {
      case "profile":
        return <ShopProfileSettings />;
      case "tax":
        return <TaxSettings />;
      case "billing":
        return <BillingSettings />;
      case "printing":
        return <PrintingSettings />;
      case "roles":
        return <RolesSettings />;
      case "security":
        return <SecuritySettings />;
      case "backup":
        return <BackupSettings />;
      case "integrations":
        return <IntegrationSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "system":
        return <SystemPreferencesSettings />;
      default:
        return <ShopProfileSettings />;
    }
  };

  return (
    <>
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/settings"
              className="text-[13px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
            >
              ← Back to Hub
            </Link>
          </div>
          <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight">
            Edit Settings
          </h1>
          <p className="text-[14px] font-medium text-gray-500 tracking-wide mt-1">
            Manage shop configuration, billing, integrations, and system
            preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white shadow-sm">
            <History className="w-4 h-4" /> Activity Log
          </button>
        </div>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDEBAR navigation inside page */}
        <div className="w-full lg:w-[280px] shrink-0">
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 sticky top-6">
            <div className="relative mb-6">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search settings..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
              />
            </div>

            <nav className="space-y-1">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[13px] font-bold transition-all ${
                    activeMenu === item.id
                      ? "bg-[#eff6ff] text-[#1e40af]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 space-y-6">{renderContent()}</div>
      </div>

      {/* FIXED BOTTOM ACTION BAR VIA PORTAL */}
      {mounted &&
        hasUnsavedChanges &&
        createPortal(
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 ml-0 md:ml-[130px] z-[9999] bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-2 border-orange-200 py-4 px-6 md:px-8 w-[90%] md:w-auto max-w-[800px] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[13px] font-black text-gray-900">
                You have unsaved changes
              </span>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => dispatch(clearDraft())}
                disabled={isSaving}
                className="flex-1 md:flex-none border border-gray-200 px-6 py-3 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white disabled:opacity-50"
              >
                Discard Changes
              </button>
              <button
                onClick={handleGlobalSave}
                disabled={isSaving}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white px-8 py-3 rounded-[12px] text-[13px] font-black transition-colors shadow-sm disabled:opacity-70"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save All Changes"}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default function EditSettingsPage() {
  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-24 relative">
        <Suspense
          fallback={
            <div className="p-10 font-bold text-gray-400">
              Loading settings...
            </div>
          }
        >
          <EditSettingsContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}
