import React from "react";
import { ShopDetails, ReportMetadata } from "@/types/report";

interface ReportHeaderProps {
  shopDetails: ShopDetails;
  metadata: ReportMetadata;
}

export default function ReportHeader({
  shopDetails,
  metadata,
}: ReportHeaderProps) {
  return (
    <div className="w-full border-b-2 border-slate-800 pb-5 mb-5 grid grid-cols-3 gap-4 items-center">
      {/* LEFT: Logo Only */}
      <div className="flex justify-start items-center">
        {shopDetails.logoUrl ? (
          <img
            src={shopDetails.logoUrl}
            alt="Logo"
            className="max-h-16 w-auto object-contain"
          />
        ) : (
          <div className="h-12 w-12 border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
            LOGO
          </div>
        )}
      </div>

      {/* CENTER: Shop Info */}
      <div className="flex flex-col text-center justify-center">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {shopDetails.name}
        </h1>
        <p className="text-xs text-slate-500 mt-1 leading-normal">
          {shopDetails.address}
        </p>
        <div className="text-[10px] text-slate-400 mt-1.5 font-medium flex flex-wrap justify-center gap-x-2 gap-y-0.5">
          <span>{shopDetails.contactNumber}</span>
          <span>•</span>
          <span>{shopDetails.email}</span>
        </div>
        {shopDetails.registrationNumber && (
          <p className="text-[9px] text-slate-400 mt-0.5">
            Reg/TRN: {shopDetails.registrationNumber}
          </p>
        )}
      </div>

      {/* RIGHT: Metadata */}
      <div className="text-right flex flex-col items-end justify-center">
        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[9px] uppercase tracking-wider mb-2 print:border print:border-slate-300">
          Official Report
        </span>
        <h2 className="text-base font-bold text-slate-800 tracking-tight leading-tight">
          {metadata.title}
        </h2>
        <div className="text-[10px] text-slate-400 mt-2 font-medium space-y-0.5">
          <p>
            Generated: {metadata.generatedDate} {metadata.generatedTime}
          </p>
          <p>By: {metadata.generatedBy}</p>
        </div>
      </div>
    </div>
  );
}
