"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Printer, TriangleAlert, X, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";

interface StockAlertHeaderProps {
  onClose: () => void;
  onExportPdf: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  criticalCount: number;
  veryLowCount: number;
  totalValueAtRisk: string;
}

export default function StockAlertHeader({
  onClose,
  onExportPdf,
  onExportCsv,
  onPrint,
  criticalCount,
  veryLowCount,
  totalValueAtRisk,
}: StockAlertHeaderProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-10 px-4 py-3 text-white sm:px-6 sm:py-3.5 border-b border-white/10">
      <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
        {/* Left Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 shadow-sm">
            <TriangleAlert className="h-4.5 w-4.5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Low Stock Alert
              </h2>
            </div>
            <p className="text-xs text-white/70 font-medium">
              Products requiring immediate attention
            </p>
          </div>
        </div>

        {/* Center Compact Metric Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/25 px-2.5 py-1 border border-rose-400/30 text-rose-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Critical:</span>
            <span className="text-sm font-bold text-white">{criticalCount}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/25 px-2.5 py-1 border border-amber-400/30 text-amber-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Very Low:</span>
            <span className="text-sm font-bold text-white">{veryLowCount}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/25 px-2.5 py-1 border border-blue-400/30 text-blue-200 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Value at Risk:</span>
            <span className="text-sm font-bold text-white">{totalValueAtRisk}</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Download Dropdown */}
          <div className="relative z-50" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDownloadOpen((prev) => !prev)}
              aria-label="Download options"
              title="Download report options"
              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 text-white transition-all hover:bg-white/20 focus:outline-none"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>

            {downloadOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white p-1.5 text-slate-800 shadow-2xl ring-1 ring-black/10 z-[9999] animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setDownloadOpen(false);
                    onExportPdf();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <FileText className="h-4 w-4 text-red-500" />
                  <span>Download as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDownloadOpen(false);
                    onExportCsv();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span>Download as CSV</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onPrint}
            aria-label="Print low stock list"
            title="Print PDF report"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 focus:outline-none"
          >
            <Printer className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-all hover:bg-rose-600/80 focus:outline-none"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}