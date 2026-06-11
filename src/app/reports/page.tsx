'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Download, 
  Clock, 
  FileText,
  BarChart2,
  Boxes,
  Coins,
  ShieldCheck,
  ChevronDown,
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import { useSalesData } from '@/hooks/useSales';

import { 
  useGetSalesReportQuery,
  useGetInventoryReportQuery,
  useGetTaxReportQuery,
  useGetTopProductsQuery
} from '@/store/reportApi';

// Modals from previous implementation
import CategoryAReportModal from '@/components/sales/CategoryAReportModal';
import CategoryBReportModal from '@/components/sales/CategoryBReportModal';
import CategoryCReportModal from '@/components/sales/CategoryCReportModal';
import CategoryPrintView from '@/components/sales/CategoryPrintView';

// New Components
import ReportStatCard from '@/components/reports/ReportStatCard';
import ReportCategoryCard from '@/components/reports/ReportCategoryCard';
import RevenueTrendChart from '@/components/reports/RevenueTrendChart';
import TaxBreakdownChart from '@/components/reports/TaxBreakdownChart';
import AllTransactionsTable from '@/components/reports/AllTransactionsTable';

export default function ReportsPage() {
  const router = useRouter();

  // Step 2: Add Date Range State
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const [reportModal, setReportModal]     = useState<null | 'A' | 'B' | 'C'>(null);
  const [printCategory, setPrintCategory] = useState<null | 'A' | 'B' | 'C'>(null);
  const [printTimeFilter, setPrintTimeFilter] = useState('Last 24 Hours');

  // Convert string dateRange to DateRange object for picker, legacy hook, and print views
  const dateRangeForPicker: DateRange | undefined = {
    from: parseISO(dateRange.startDate),
    to: parseISO(dateRange.endDate)
  };

  const { data: legacyData, loading: legacyLoading } = useSalesData(dateRangeForPicker);

  // Step 3: Connect Analytics Queries
  const {
    data: salesReport,
    isLoading: isSalesLoading,
    isFetching: isSalesFetching,
    error: salesError
  } = useGetSalesReportQuery(dateRange);

  const {
    data: inventoryReport,
    isLoading: isInventoryLoading,
    isFetching: isInventoryFetching,
    error: inventoryError
  } = useGetInventoryReportQuery(dateRange);

  const {
    data: taxReport,
    isLoading: isTaxLoading,
    isFetching: isTaxFetching,
    error: taxError
  } = useGetTaxReportQuery(dateRange);

  const {
    data: topProducts,
    isLoading: isTopProductsLoading,
    isFetching: isTopProductsFetching,
    error: topProductsError
  } = useGetTopProductsQuery(dateRange);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      const startStr = format(range.from, 'yyyy-MM-dd');
      const endStr = range.to ? format(range.to, 'yyyy-MM-dd') : startStr;
      setDateRange({ startDate: startStr, endDate: endStr });
    }
  };

  // Step 9: Report Export
  const handleExport = (type: string, formatStr: string) => {
    const url =
      `/api/reports/${type}/export` +
      `?format=${formatStr}` +
      `&startDate=${dateRange.startDate}` +
      `&endDate=${dateRange.endDate}`;

    window.open(url, "_blank");
  };

  const isSalesSectionLoading = isSalesLoading || isSalesFetching;
  const isTaxSectionLoading = isTaxLoading || isTaxFetching;

  // Map API values dynamically to the TaxBreakdownChart
  const mappedSalesData = {
    catA: {
      core: taxReport?.vatAmount ? Math.round(taxReport.vatAmount / 0.18) : (legacyData?.catA?.core || 0),
      vat: taxReport?.vatAmount ?? (legacyData?.catA?.vat || 0),
      txns: legacyData?.catA?.txns || 0,
      recentTxns: legacyData?.catA?.recentTxns || [],
      allTxns: legacyData?.catA?.allTxns || [],
    },
    catB: {
      core: taxReport?.nbtAmount ? Math.round(taxReport.nbtAmount / 0.02) : (legacyData?.catB?.core || 0),
      overflow: taxReport?.nbtAmount ? Math.round(taxReport.nbtAmount / 0.02) : (legacyData?.catB?.overflow || 0),
      baseNonTax: legacyData?.catB?.baseNonTax || 0,
      txns: legacyData?.catB?.txns || 0,
      recentTxns: legacyData?.catB?.recentTxns || [],
      allTxns: legacyData?.catB?.allTxns || [],
      topProducts: legacyData?.catB?.topProducts || [],
    },
    catC: {
      core: taxReport?.netRevenue ? Math.round(taxReport.netRevenue) : (legacyData?.catC?.core || 0),
      labour: legacyData?.catC?.labour || 0,
      install: legacyData?.catC?.install || 0,
      misc: legacyData?.catC?.misc || 0,
      entries: legacyData?.catC?.entries || 0,
      recentEntries: legacyData?.catC?.recentEntries || [],
      allTxns: legacyData?.catC?.allTxns || [],
      breakdown: legacyData?.catC?.breakdown || [],
    },
    summary: {
      totalSales: salesReport?.totalRevenue ?? (legacyData?.summary?.totalSales || 0),
      totalPurchases: legacyData?.summary?.totalPurchases || 0,
      totalExpenses: legacyData?.summary?.totalExpenses || 0,
      netProfit: salesReport?.netProfit ?? salesReport?.grossProfit ?? (legacyData?.summary?.netProfit || 0),
    }
  };

  const hasError = salesError || taxError || inventoryError || topProductsError;

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20 print:hidden">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[32px] md:text-[36px] font-black text-gray-900 tracking-tighter leading-tight mb-2">
              Reports & Analytics
            </h1>
            <p className="text-[14px] font-medium text-gray-500 tracking-wide">
              Comprehensive business insights, tax reports, and performance analytics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-[12px] px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors min-w-[200px]">
                   <div className="flex items-center gap-2.5">
                     <Calendar className="w-4 h-4 text-gray-500" />
                     <span className="text-[13px] font-bold text-gray-700">
                       {dateRangeForPicker?.from ? format(dateRangeForPicker.from, 'MMM d, yyyy') : 'Select Date...'}
                     </span>
                   </div>
                   <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                   className="bg-white p-7 rounded-[32px] shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in duration-300 w-[380px] print:hidden"
                   sideOffset={12}
                   align="end"
                >
                   <div className="flex flex-col min-h-[460px]">
                      <div className="flex justify-between items-center mb-6 pl-2">
                         <h4 className="text-[17px] font-black text-blue-900 tracking-tight">Select Time Period</h4>
                         <Popover.Close className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all">
                            <X className="w-5 h-5" />
                         </Popover.Close>
                      </div>
                      <div className="flex-1 py-2">
                        <SalesDatePicker
                           dateRange={dateRangeForPicker}
                           onSelect={handleDateRangeChange}
                        />
                      </div>
                      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between pl-1">
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">Selected Range</span>
                            <div className="text-[13px] font-black text-blue-700 flex items-center gap-2">
                               {dateRangeForPicker?.from ? format(dateRangeForPicker.from, 'MMM d, yyyy') : '---'}
                               {dateRangeForPicker?.to && (
                                  <>
                                     <span className="text-gray-300 font-light">—</span>
                                     {format(dateRangeForPicker.to, 'MMM d, yyyy')}
                                  </>
                               )}
                            </div>
                         </div>
                         <Popover.Close asChild>
                            <button className="bg-blue-900 hover:bg-blue-800 text-white px-7 py-3 rounded-2xl font-black text-[13px] shadow-lg shadow-blue-100 transition-all active:scale-95">
                               Apply
                            </button>
                         </Popover.Close>
                      </div>
                   </div>
                </Popover.Content>
              </Popover.Portal>
             </Popover.Root>

             <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-[12px] px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-700">
               <Clock className="w-4 h-4 text-gray-400" />
               Scheduled
             </button>

             <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 bg-[#1e40af] text-white rounded-[12px] px-6 py-2.5 shadow-sm hover:bg-blue-800 transition-colors text-[13px] font-black tracking-wide">
                  <Download className="w-4 h-4" />
                  Export All
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[180px] z-[100] animate-in fade-in zoom-in-95 print:hidden">
                  <DropdownMenu.Item onClick={() => handleExport('sales', 'pdf')} className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 outline-none rounded-lg transition-colors">
                    <FileText className="w-4 h-4 text-red-500" /> Download PDF
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={() => handleExport('sales', 'csv')} className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 outline-none rounded-lg transition-colors">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Download CSV
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
             </DropdownMenu.Root>
          </div>
        </div>

        {/* Step 11: Error States */}
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-[20px] p-6 mb-8 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-[13px] font-bold">Failed to load live reports data. Displaying legacy data as fallback.</span>
          </div>
        )}

        {/* 4 TOP KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <ReportStatCard 
             title="Total Revenue"
             value={isSalesSectionLoading ? '...' : `Rs. ${(salesReport?.totalRevenue ?? legacyData.summary.totalSales ?? 0).toLocaleString()}`}
             icon={<div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><Coins className="w-5 h-5 text-white" /></div>}
             variant="blue"
             trend="+18.5%"
             trendText="vs last month"
          />
          <ReportStatCard 
             title="Gross Profit"
             value={isSalesSectionLoading ? '...' : `Rs. ${(salesReport?.netProfit ?? salesReport?.grossProfit ?? legacyData.summary.netProfit ?? 0).toLocaleString()}`}
             icon={<div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><BarChart2 className="w-5 h-5 text-white" /></div>}
             variant="green"
             marginText={`${(salesReport?.totalRevenue ?? legacyData.summary.totalSales) > 0 ? Math.round(((salesReport?.netProfit ?? salesReport?.grossProfit ?? legacyData.summary.netProfit ?? 0) / (salesReport?.totalRevenue ?? legacyData.summary.totalSales)) * 100) : 0}% margin`}
          />
          <ReportStatCard 
             title="Transactions"
             value={isSalesSectionLoading ? '...' : (salesReport?.totalTransactions ?? (legacyData.catA.txns + legacyData.catB.txns)).toLocaleString()}
             icon={<div className="w-9 h-9 rounded-xl bg-[#fef08a] flex items-center justify-center"><FileText className="w-5 h-5 text-[#854d0e]" /></div>}
             variant="white"
             trend="+8.2%"
             trendText="vs last month"
          />
          <ReportStatCard 
             title="VAT Collected"
             value={isTaxSectionLoading ? '...' : `Rs. ${(taxReport?.vatAmount ?? legacyData.catA.vat ?? 0).toLocaleString()}`}
             icon={<div className="w-9 h-9 rounded-xl bg-[#f3e8ff] flex items-center justify-center"><FileText className="w-5 h-5 text-[#9333ea]" /></div>}
             variant="white"
             badge="IRD Compliant"
          />
        </div>

        {/* 3 CATEGORY CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
          <ReportCategoryCard 
            title="Sales Reports"
            description="Daily, weekly, and monthly sales summaries, product performance, and cashier reports"
            icon={<BarChart2 className="w-7 h-7 text-white" />}
            iconBgClass="bg-[#2563eb]"
            badge={{ text: "8 Reports", colorClass: "bg-[#eff6ff] text-[#2563eb]" }}
            reports={["Daily Sales Summary", "Sales by Product", "Sales by Cashier"]}
            onButtonClick={() => router.push('/reports/sales')}
            buttonText="View All Sales Reports"
            buttonColorClass="bg-[#1e40af] hover:bg-blue-800"
          />
          <ReportCategoryCard 
            title="Tax & Compliance"
            description="IRD tax compliance reports, VAT summaries, Category A/B/C breakdowns for Sri Lanka"
            icon={<FileText className="w-7 h-7 text-white" />}
            iconBgClass="bg-[#8b5cf6]"
            badge={{ text: "6 Reports", colorClass: "bg-[#f3e8ff] text-[#9333ea]" }}
            cardContext={
               <div className="bg-[#ecfdf5] border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2 max-w-max">
                 <ShieldCheck className="w-4 h-4 text-[#059669]" />
                 <span className="text-[11px] font-black text-[#059669] uppercase tracking-widest">IRD Compliant Format</span>
               </div>
            }
            reports={["Category A Report", "Monthly VAT Summary"]}
            onReportClick={(r) => { 
                if(r === 'Category A Report') setReportModal('A');
            }}
            onButtonClick={() => router.push('/reports/tax')}
            buttonText="View All Tax Reports"
            buttonColorClass="bg-[#8b5cf6] hover:bg-purple-600"
          />
          <ReportCategoryCard 
            title="Inventory Reports"
            description="Stock levels, movement history, valuation, low stock alerts, and reorder analysis"
            icon={<Boxes className="w-7 h-7 text-white" />}
            iconBgClass="bg-[#059669]"
            badge={{ text: "7 Reports", colorClass: "bg-[#ecfdf5] text-[#059669]" }}
            reports={["Current Stock Overview", "Low Stock Report", "Inventory Valuation"]}
            onButtonClick={() => router.push('/reports/inventory')}
            buttonText="View All Inventory Reports"
            buttonColorClass="bg-[#059669] hover:bg-green-700"
          />
        </div>

        {/* CHARTS SECTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-0 mb-8">
          <RevenueTrendChart />
          <TaxBreakdownChart salesData={mappedSalesData} loading={isTaxSectionLoading || legacyLoading} />
        </div>

        {/* ALL TRANSACTIONS LEDGER */}
        <div className="relative z-0">
          <AllTransactionsTable dateRange={dateRangeForPicker} />
        </div>
      </div>

      {/* KEEP EXISTING CATEGORY MODALS FOR TAX SECTION BUTTONS */}
      <CategoryAReportModal
         isOpen={reportModal === 'A'}
         onClose={() => setReportModal(null)}
         onPrintPDF={(timeFilter) => { setPrintCategory('A'); setPrintTimeFilter(timeFilter); setTimeout(() => { window.print(); setPrintCategory(null); }, 100); }}
         data={mappedSalesData}
      />
      <CategoryBReportModal
         isOpen={reportModal === 'B'}
         onClose={() => setReportModal(null)}
         onPrintPDF={(timeFilter) => { setPrintCategory('B'); setPrintTimeFilter(timeFilter); setTimeout(() => { window.print(); setPrintCategory(null); }, 100); }}
         data={mappedSalesData}
      />
      <CategoryCReportModal
         isOpen={reportModal === 'C'}
         onClose={() => setReportModal(null)}
         onPrintPDF={(timeFilter) => { setPrintCategory('C'); setPrintTimeFilter(timeFilter); setTimeout(() => { window.print(); setPrintCategory(null); }, 100); }}
         data={mappedSalesData}
      />

      {/* PER-CATEGORY PRINT VIEW */}
      <CategoryPrintView
         category={printCategory}
         dateRange={dateRangeForPicker}
         timeFilter={printTimeFilter}
         data={mappedSalesData}
      />
    </MainLayout>
  );
}
