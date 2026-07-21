"use client";

import { Printer, Plus, Terminal, Loader2 } from "lucide-react";
import { useGetSettingsQuery } from "@/lib/services/settingsApi";
import { useAppDispatch } from "@/store/hooks";
import { useSelector } from "react-redux";
import {
  selectSettingsDraft,
  updateDraftField,
} from "@/store/slices/settingsDraftSlice";
import { StoreSettings } from "../../../types";

export default function PrintingSettings() {
  const dispatch = useAppDispatch();
  const { data: settings, isLoading: isFetching } = useGetSettingsQuery();
  const draft = useSelector(selectSettingsDraft);

  const displayData = {
    printLogoOnReceipt:
      draft.printLogoOnReceipt !== undefined
        ? draft.printLogoOnReceipt
        : settings?.printLogoOnReceipt ?? true,

    customFooterText:
      draft.customFooterText !== undefined
        ? draft.customFooterText
        : settings?.customFooterText ||
          "Thank you for shopping with us! Goods sold are not returnable.",

    autoPrintOnCheckout:
      draft.autoPrintOnCheckout !== undefined
        ? draft.autoPrintOnCheckout
        : settings?.autoPrintOnCheckout ?? true,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    dispatch(
      updateDraftField({
        field: name as keyof StoreSettings,
        value: type === "checkbox" ? checked : value,
      })
    );
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-[24px] shadow-sm border border-gray-100">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fffbeb]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-[12px] flex items-center justify-center border border-amber-200">
            <Printer className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">
              Printing & Receipts
            </h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Setup POS thermal printers, receipt formats, and printing rules
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-[#d97706] hover:bg-amber-700 text-white px-4 py-2 rounded-[10px] text-[12px] font-bold transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Printer
        </button>
      </div>

      <div className="p-8">
        {/* HARDWARE SECTION (Static for now) */}
        <h3 className="text-[16px] font-black text-gray-900 mb-4">
          Connected Printers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="border-2 border-blue-500 bg-blue-50/30 rounded-[16px] p-5 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>{" "}
                Online
              </span>
            </div>
            <Printer className="w-8 h-8 text-blue-600 mb-3" />
            <h4 className="text-[15px] font-black text-gray-900">
              Epson TM-T82III
            </h4>
            <p className="text-[12px] font-bold text-gray-500 font-mono mt-1">
              192.168.1.100:9100
            </p>
            <p className="text-[11px] font-black text-blue-600 mt-3 uppercase tracking-wider">
              Default POS Printer (80mm)
            </p>
          </div>

          <div className="border border-gray-200 bg-gray-50 rounded-[16px] p-5 relative">
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1.5 bg-gray-200 text-gray-600 px-2 py-1 rounded text-[10px] font-black uppercase">
                Offline
              </span>
            </div>
            <Terminal className="w-8 h-8 text-gray-400 mb-3" />
            <h4 className="text-[15px] font-black text-gray-900">
              Zebra ZD421
            </h4>
            <p className="text-[12px] font-bold text-gray-500 font-mono mt-1">
              USB Connection
            </p>
            <p className="text-[11px] font-black text-gray-500 mt-3 uppercase tracking-wider">
              Barcode Printer
            </p>
          </div>
        </div>

        {/* SETTINGS SECTION (Wired to Redux) */}
        <h3 className="text-[16px] font-black text-gray-900 mb-4">
          Receipt Formatting
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <div>
              <h4 className="text-[13px] font-black text-gray-900">
                Print Logo on Receipt
              </h4>
              <p className="text-[11px] font-bold text-gray-500">
                Prints the shop logo at the top of the thermal receipt
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="printLogoOnReceipt"
                checked={displayData.printLogoOnReceipt}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <div>
              <h4 className="text-[13px] font-black text-gray-900">
                Custom Footer Text
              </h4>
              <p className="text-[11px] font-bold text-gray-500">
                Add a thank you note or return policy at the bottom
              </p>
            </div>
            <input
              type="text"
              name="customFooterText"
              value={displayData.customFooterText}
              onChange={handleChange}
              className="w-[300px] px-3 py-2 border border-gray-200 rounded text-[12px] font-medium focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <div>
              <h4 className="text-[13px] font-black text-gray-900">
                Auto-print on Checkout
              </h4>
              <p className="text-[11px] font-bold text-gray-500">
                Automatically print receipt when a sale is completed
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="autoPrintOnCheckout"
                checked={displayData.autoPrintOnCheckout}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
