import React from "react";

interface ReportLayoutProps {
  children: React.ReactNode;
  showGrid?: boolean;
  showMargins?: boolean;
}

export default function ReportLayout({
  children,
  showGrid = false,
  showMargins = false,
}: ReportLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 py-8 flex justify-center items-start print:bg-white print:p-0 print:py-0">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          /* 1. Force exact A4 dimensions and zero out browser margins */
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
          
          /* 2. Global Print Resets */
          body, html {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 3. Hide UI elements */
          .sandbox-controls,
          .print\\:hidden {
            display: none !important;
          }

          /* 4. Neutralize Next.js wrappers that mess up scaling */
          #__next, main, body > div:first-child {
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }

          /* 5. The Flexbox Fix: Flex breaks multi-page printing. Force block. */
          .report-page-container {
            display: block !important;
            width: 210mm !important;
            height: auto !important;
            min-height: auto !important; 
            /* Handle the margin via padding here, not in @page */
            padding: 20mm !important; 
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            page-break-after: auto !important;
          }

          /* 6. Prevent table rows and images from splitting across pages */
          table { page-break-inside: auto; }
          tr, td, th, img { page-break-inside: avoid; page-break-after: auto; }
        }
      `,
        }}
      />

      {/* Main A4 Container */}
      <div
        className="report-page-container relative bg-white w-[210mm] min-h-[297mm] p-[20mm] shadow-lg border border-slate-200 flex flex-col print:shadow-none print:border-none"
        style={{
          backgroundImage: showGrid
            ? `linear-gradient(to right, rgba(99, 102, 241, 0.08) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(99, 102, 241, 0.08) 1px, transparent 1px)`
            : "none",
          backgroundSize: "10mm 10mm",
        }}
      >
        {/* Margin Guide Lines (Screen only) */}
        {showMargins && (
          <div className="absolute top-[20mm] bottom-[20mm] left-[20mm] right-[20mm] border border-dashed border-rose-400 pointer-events-none z-50 print:hidden">
            <div className="absolute top-1 left-1 text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded uppercase tracking-wider opacity-85 shadow-sm">
              20mm safety margin
            </div>
          </div>
        )}

        {/* Content Wrapper */}
        <div className="flex flex-col flex-grow w-full relative z-10 print:block">
          {children}
        </div>
      </div>
    </div>
  );
}
