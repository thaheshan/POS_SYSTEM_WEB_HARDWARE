"use client";

import { Download, Printer, TriangleAlert, X } from "lucide-react";

interface StockAlertHeaderProps {
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

export default function StockAlertHeader({
  onClose,
  onDownload,
  onPrint,
}: StockAlertHeaderProps) {
  return (
    <div className="relative z-10 px-4 pb-3 pt-3 text-white sm:px-8 sm:pb-5 sm:pt-5">
      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close low stock modal"
          className="absolute right-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-all duration-200 hover:bg-white/20 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-8 sm:w-8 sm:rounded-lg"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
        </button>

        <div className="flex items-start gap-3 pr-9 sm:gap-4 sm:pr-12">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-lg ring-1 ring-white/30 backdrop-blur-sm sm:h-10 sm:w-10">
            <TriangleAlert
              className="h-4 w-4 text-white sm:h-5 sm:w-5"
              strokeWidth={2.5}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h2 className="text-[26px] font-bold tracking-tight leading-tight sm:text-[38px]">
                Low Stock Alert
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDownload}
                  aria-label="Download low stock list"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/15 text-white transition-all duration-200 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-9 sm:w-9 sm:rounded-lg"
                >
                  <Download
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    strokeWidth={2}
                  />
                </button>
                <button
                  type="button"
                  onClick={onPrint}
                  aria-label="Print low stock list"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/15 text-white transition-all duration-200 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-9 sm:w-9 sm:rounded-lg"
                >
                  <Printer
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>

            <p className="mt-1.5 text-[12px] font-medium text-white/80 sm:text-[13px]">
              Products requiring immediate attention
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
