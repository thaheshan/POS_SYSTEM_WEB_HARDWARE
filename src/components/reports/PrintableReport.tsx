'use client';

import React, { useState } from 'react';
import ReportLayout from './ReportLayout';
import ReportHeader from './ReportHeader';
import ReportFooter from './ReportFooter';
import { ShopDetails, ReportMetadata } from '@/types/report';
import { Printer } from 'lucide-react';

interface PrintableReportProps {
  shopDetails: ShopDetails;
  metadata: ReportMetadata;
  children: React.ReactNode; // This is where the specific table goes
  showDeveloperControls?: boolean; // Set to false in production
}

export default function PrintableReport({ 
  shopDetails, 
  metadata, 
  children,
  showDeveloperControls = false
}: PrintableReportProps) {
  const [showGrid, setShowGrid] = useState(false);
  const [showMargins, setShowMargins] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="report-print-root" className="relative">
      
      {/* Optional Developer / Print Controls */}
      {showDeveloperControls && (
        <div className="sandbox-controls fixed top-8 left-8 z-50 p-6 rounded-xl backdrop-blur-md bg-slate-800/90 border border-slate-600 shadow-xl flex flex-col gap-4 text-white w-64">
          <button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded shadow transition-colors animate-none"
          >
            <Printer size={16} className="inline-block mx-1 animate-none" /> Print / Save PDF
          </button>
          
          <div className="h-px w-full bg-white/20 my-1"></div>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="h-4 w-4 text-indigo-500 rounded border-slate-500 bg-slate-700" />
            <span className="text-sm font-medium">Toggle 10mm Grid</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" checked={showMargins} onChange={(e) => setShowMargins(e.target.checked)} className="h-4 w-4 text-indigo-500 rounded border-slate-500 bg-slate-700" />
            <span className="text-sm font-medium">Highlight Margins</span>
          </label>
        </div>
      )}

      {/* The Unified Layout */}
      <ReportLayout showGrid={showGrid} showMargins={showMargins}>
        <ReportHeader shopDetails={shopDetails} metadata={metadata} />
        
        {/* Module Specific Content Injected Here */}
        <div className="flex-grow flex flex-col w-full">
            {children}
        </div>

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
