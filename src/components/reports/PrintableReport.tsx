"use client";

import React, { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import api from "@/api/axiosInstance";
import ReportLayout from "./ReportLayout";
import ReportHeader from "./ReportHeader";
import ReportFooter from "./ReportFooter";
import { ShopDetails, ReportMetadata } from "@/types/report";
import { Printer, Loader2 } from "lucide-react";

interface PrintableReportProps {
  shopDetails: ShopDetails;
  metadata: ReportMetadata;
  children: React.ReactNode;
  showDeveloperControls?: boolean;
}

export default function PrintableReport({
  shopDetails,
  metadata,
  children,
  showDeveloperControls = false,
}: PrintableReportProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [showMargins, setShowMargins] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const params = useParams();
  const searchParams = useSearchParams();
  const reportType = params.type as string;
  const id = searchParams.get("id");

  const handlePrint = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const idQuery = id ? `&id=${id}` : "";
      const response = await api.get(
        `/reports/download?type=${reportType}${idQuery}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${reportType.toUpperCase()}_Report_${new Date().getTime()}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[Report Download] Export failed:", error);
      alert(
        "Failed to export PDF report. Please verify that the API backend is running.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div id="report-print-root" className="relative">
      {/* Optional Developer / Print Controls */}
      {showDeveloperControls && (
        <div className="sandbox-controls fixed top-8 left-8 z-50 p-6 rounded-xl backdrop-blur-md bg-slate-800/90 border border-slate-600 shadow-xl flex flex-col gap-4 text-white w-64">
          <button
            onClick={handlePrint}
            disabled={downloading}
            className={`${
              downloading
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500"
            } text-white font-medium py-2 px-4 rounded shadow transition-colors flex items-center justify-center gap-2`}
          >
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Printer size={16} />
            )}
            {downloading ? "Exporting PDF..." : "Export PDF"}
          </button>

          <div className="h-px w-full bg-white/20 my-1"></div>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="h-4 w-4 text-indigo-500 rounded border-slate-500 bg-slate-700"
            />
            <span className="text-sm font-medium">Toggle 10mm Grid</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showMargins}
              onChange={(e) => setShowMargins(e.target.checked)}
              className="h-4 w-4 text-indigo-500 rounded border-slate-500 bg-slate-700"
            />
            <span className="text-sm font-medium">Highlight Margins</span>
          </label>
        </div>
      )}

      {/* The Unified Layout */}
      <ReportLayout showGrid={showGrid} showMargins={showMargins}>
        <ReportHeader shopDetails={shopDetails} metadata={metadata} />

        {/* Module Specific Content Injected Here */}
        <div className="flex-grow flex flex-col w-full">{children}</div>

        {/* Note: Puppeteer will handle pagination on the backend, this is a placeholder for the web view */}
        <ReportFooter
          generatedTimestamp={`${metadata.generatedDate} ${metadata.generatedTime}`}
          pageNumber={1}
          totalPages={1}
        />
      </ReportLayout>
    </div>
  );
}
