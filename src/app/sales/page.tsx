'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Plus, 
  Download, 
  Info, 
  ArrowUpRight, 
  Clock, 
  ChevronRight, 
  FileText,
  Briefcase,
  Wrench,
  User,
  Phone,
  X,
  ChevronDown
} from 'lucide-react';
import AddLabourModal from '@/components/sales/AddLabourModal';
import SalesReportView from '@/components/sales/SalesReportView';

import * as Popover from '@radix-ui/react-popover';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import CategoryAReportModal from '@/components/sales/CategoryAReportModal';
import CategoryBReportModal from '@/components/sales/CategoryBReportModal';
import CategoryCReportModal from '@/components/sales/CategoryCReportModal';
import CategoryPrintView from '@/components/sales/CategoryPrintView';

import { getMockSalesData } from '@/lib/sales-mock-data';

export default function SalesPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
     from: new Date(),
     to: new Date()
  });
  const [reportModal, setReportModal]     = useState<null | 'A' | 'B' | 'C'>(null);
  const [printCategory, setPrintCategory] = useState<null | 'A' | 'B' | 'C'>(null);
  const [printTimeFilter, setPrintTimeFilter] = useState('Last 24 Hours');

  const data = getMockSalesData(dateRange);
  const threshold = 200000;
  
  // Calculate dynamic data based on range
  const daysSelected = dateRange?.from && dateRange.to
     ? Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1)
     : 1;
  const currentThreshold = threshold * daysSelected;
  const taxableTotal = data.catA.core;
  const percentage = Math.min(100, (taxableTotal / currentThreshold) * 100);

  const handleExportCSV = () => {
     const csvContent = [
        ['Category', 'Metric', 'Amount (Rs)', 'Transactions/Entries'],
        ['Category A', 'Taxable Sales', data.catA.core, data.catA.txns],
        ['Category A', 'VAT (18%)', data.catA.vat, ''],
        ['Category B', 'Non-Tax & Overflow', data.catB.core, data.catB.txns],
        ['Category B', 'Overflow (>2L)', data.catB.overflow, ''],
        ['Category C', 'Labour & Misc', data.catC.core, data.catC.entries],
        ['Category C', 'Labour Charges', data.catC.labour, ''],
        ['', 'Total Combined', data.catA.core + data.catB.core + data.catC.core, '']
     ].map(e => e.join(",")).join("\n");

     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement("a");
     const url = URL.createObjectURL(blob);
     link.setAttribute("href", url);
     const fileName = `sales_report_${format(dateRange?.from || new Date(), 'yyyyMMdd')}.csv`;
     link.setAttribute("download", fileName);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  const handleExportPDF = () => {
     window.print();
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20 print:hidden">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-[28px] font-black text-gray-900 tracking-tight mb-1">
              Sales Dashboard – Tax Category View
            </h1>
            <p className="text-[14px] font-bold text-gray-400 opacity-80">
              Sri Lanka IRD Compliant – Daily Tax Threshold: Rs. {threshold.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/sales/dashboard')} className="bg-[#1e40af] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold text-[13.5px] transition-all shadow-sm">
              Sales Dashboard
            </button>
          </div>
        </div>

        {/* TOP ACTION BAR */}
        <div className="flex items-center gap-3 mb-8">
          <Popover.Root>
             <Popover.Trigger asChild>
                <button className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-all active:scale-95 group">
                   <Calendar className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
                   <div className="flex flex-col items-start gap-0 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Reporting Period</span>
                      <span className="text-[14px] font-black text-gray-700 leading-none">
                         {dateRange?.from ? (
                            dateRange.to ? (
                               <>
                                  {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, y')}
                               </>
                            ) : (
                               format(dateRange.from, 'MMMM d, yyyy')
                            )
                         ) : (
                            <span>Select Dates</span>
                         )}
                      </span>
                   </div>
                   <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                </button>
             </Popover.Trigger>
             <Popover.Portal>
                <Popover.Content
                   className="bg-white p-7 rounded-[32px] shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in duration-300 w-[380px] print:hidden"
                   sideOffset={12}
                   align="start"
                >
                   <div className="flex flex-col min-h-[460px]">
                      {/* Header Section */}
                      <div className="flex justify-between items-center mb-6 pl-2">
                         <h4 className="text-[17px] font-black text-blue-900 tracking-tight">Select Sale Period</h4>
                         <Popover.Close className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all">
                            <X className="w-5 h-5" />
                         </Popover.Close>
                      </div>

                      <div className="flex-1 py-2">
                        <SalesDatePicker
                           dateRange={dateRange}
                           onSelect={setDateRange}
                        />
                      </div>

                      {/* Footer Section */}
                      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between pl-1">
                         <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">Selected Range</span>
                            <div className="text-[13px] font-black text-blue-700 flex items-center gap-2">
                               {dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : '---'}
                               {dateRange?.to && (
                                  <>
                                     <span className="text-gray-300 font-light">—</span>
                                     {format(dateRange.to, 'MMM d, yyyy')}
                                  </>
                               )}
                            </div>
                         </div>
                         <Popover.Close asChild>
                            <button className="bg-blue-900 hover:bg-blue-800 text-white px-7 py-3 rounded-2xl font-black text-[13px] shadow-lg shadow-blue-100 transition-all active:scale-95">
                               Confirm
                            </button>
                         </Popover.Close>
                      </div>
                   </div>
                </Popover.Content>
             </Popover.Portal>
          </Popover.Root>

          <button onClick={() => router.push('/pos/select')} className="bg-[#1e40af] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] flex items-center gap-2 shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Add Sale
          </button>
          
          <DropdownMenu.Root>
             <DropdownMenu.Trigger asChild>
                <button className="w-11 h-11 border border-gray-200 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 shadow-sm transition-all active:scale-95">
                   <Download className="w-4 h-4 text-gray-500" />
                </button>
             </DropdownMenu.Trigger>
             <DropdownMenu.Portal>
                <DropdownMenu.Content className="bg-white min-w-[180px] p-2 rounded-xl shadow-xl border border-gray-100 z-50 animate-in slide-in-from-top-1 duration-200 print:hidden" sideOffset={8} align="end">
                   <DropdownMenu.Item
                      onClick={handleExportPDF}
                      className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-bold text-gray-700 outline-none rounded-lg hover:bg-gray-50 cursor-pointer"
                   >
                      <FileText className="w-4 h-4 text-red-500" />
                      Download as PDF
                   </DropdownMenu.Item>
                   <DropdownMenu.Item
                      onClick={handleExportCSV}
                      className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-bold text-gray-700 outline-none rounded-lg hover:bg-gray-50 cursor-pointer"
                   >
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Download as CSV
                   </DropdownMenu.Item>
                </DropdownMenu.Content>
             </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* TAXABLE STATUS BANNER (BLUE INFO BOX) */}
        <div className="bg-[#eff6ff] border border-blue-100 rounded-[18px] p-6 mb-10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100/50 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-blue-900 mb-0.5">
                Today's Taxable Sales (Category A): Rs. {data.catA.core.toLocaleString()} / Rs. {currentThreshold.toLocaleString()}
              </h4>
              <p className="text-[12.5px] font-bold text-blue-600 opacity-80">Remaining before non-tax threshold: Rs. {Math.max(0, currentThreshold - data.catA.core).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[16px] font-black text-blue-900">{percentage.toFixed(1)}%</span>
             <div className="w-[120px] h-2.5 bg-blue-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
             </div>
          </div>
        </div>

        {/* THREE CATEGORY COLUMNS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
          
          {/* CATEGORY A: TAXABLE SALES (BLUE) */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[850px]">
             {/* Header Section (BLUE GRADIENT) */}
             <div className="p-6 pb-8 bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] text-white">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-white/20 px-3 py-1 rounded-md">Category A</span>
                <h3 className="text-[20px] font-black mt-4 mb-1">Taxable Sales</h3>
                <p className="text-[12px] font-medium opacity-80 mb-6 leading-tight">First Rs. 2,00,000 daily sales</p>
                <div className="flex items-baseline gap-2 mb-2">
                   <span className="text-[32px] font-black tracking-tighter text-white">Rs. {data.catA.core.toLocaleString()}</span>
                </div>
                <p className="text-[13px] font-bold text-blue-200 mb-0">{data.catA.txns} Transactions</p>
             </div>

             {/* VAT Breakdown Bar */}
             <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-tight">VAT (18%)</span>
                   <span className="text-[14px] font-black text-gray-900">Rs. {data.catA.vat.toLocaleString()}</span>
                </div>
             </div>

             {/* Statistics Breakdown Section */}
             <div className="p-6 space-y-6 bg-white flex-1">
                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-50">
                   <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase leading-tight mb-2 block">Average Bill</span>
                      <span className="text-[16px] font-black text-gray-900 font-mono tracking-tighter">Rs. {data.catA.avg.toLocaleString()}</span>
                   </div>
                   <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase leading-tight mb-2 block">Items Sold</span>
                      <span className="text-[16px] font-black text-gray-900">{data.catA.items} Units</span>
                   </div>
                </div>

                {/* Recent Items List */}
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <h5 className="text-[13px] font-black uppercase tracking-widest text-gray-900">Recent Transactions</h5>
                      <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                   </div>
                   <div className="space-y-4">
                      {[
                        { id: 'INV-2026-001234', time: '10:24 AM', amount: '5,450', mode: 'Cash' },
                        { id: 'INV-2026-001233', time: '9:58 AM', amount: '3,200', mode: 'Card' },
                        { id: 'INV-2026-001232', time: '9:15 AM', amount: '12,450', mode: 'Credit' }
                      ].map((txn) => (
                        <div key={txn.id} className="flex flex-col gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                           <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                 <span className="text-[12.5px] font-bold text-gray-900 font-mono tracking-tighter">{txn.id}</span>
                                 <span className="text-[11px] font-bold text-gray-400">{txn.time}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="text-[13px] font-black text-blue-600 font-mono tracking-tighter">Rs. {txn.amount}</span>
                                 <span className={`text-[10px] font-black uppercase tracking-wider ${txn.mode === 'Cash' ? 'text-emerald-500' : txn.mode === 'Card' ? 'text-blue-500' : 'text-amber-500'}`}>{txn.mode}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Bottom Link Section */}
             <div className="p-6 border-t border-gray-50 mt-auto bg-gray-50/20">
                <button
                   onClick={() => setReportModal('A')}
                   className="w-full flex items-center justify-center gap-2 text-[13px] font-black text-blue-600 group hover:text-blue-800 transition-colors"
                >
                   View Detailed Report
                   <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
             </div>
          </div>

          {/* CATEGORY B: NON-TAX & OVERFLOW (GREEN) */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[850px]">
             {/* Header Section (GREEN GRADIENT) */}
             <div className="p-6 pb-8 bg-gradient-to-br from-[#15803d] to-[#166534] text-white">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-white/20 px-3 py-1 rounded-md">Category B</span>
                <h3 className="text-[20px] font-black mt-4 mb-1">Non-Tax & Overflow</h3>
                <p className="text-[12px] font-medium opacity-80 mb-6 leading-tight">Sales &gt; Rs. 2,00,000 + Non-taxable items</p>
                <div className="flex items-baseline gap-2 mb-2">
                   <span className="text-[32px] font-black tracking-tighter text-white font-mono tracking-tighter">Rs. {data.catB.core.toLocaleString()}</span>
                </div>
                <p className="text-[13px] font-bold text-emerald-200 mb-0">{data.catB.txns} Transactions</p>
             </div>

             {/* Overflow Breakdown Bar */}
             <div className="px-6 py-4 border-b border-gray-50 space-y-2 bg-gray-50/30">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                     <span>Overflow (&gt; Rs. 2L)</span>
                     <span className="text-gray-900 font-mono tracking-tighter font-bold">Rs. {data.catB.overflow.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                     <span>Non-taxable Products</span>
                     <span className="text-gray-900 font-mono tracking-tighter font-bold">Rs. {data.catB.baseNonTax.toLocaleString()}</span>
                 </div>
              </div>

             {/* Statistics Section */}
             <div className="p-6 space-y-6 flex-1 bg-white">
                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-50">
                   <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase leading-tight mb-2 block">Average Bill</span>
                      <span className="text-[16px] font-black text-gray-900 font-mono tracking-tighter">Rs. {data.catB.avg.toLocaleString()}</span>
                   </div>
                   <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase leading-tight mb-2 block">Items Sold</span>
                      <span className="text-[16px] font-black text-gray-900">{data.catB.items} Units</span>
                   </div>
                </div>

                {/* Top Non-Taxable Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                     <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Top Non-Taxable Products</h5>
                     <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="space-y-4 mb-8">
                     {[
                       { name: 'Educational Books', sold: '12 units sold', amount: '8,450' },
                       { name: 'Medical Supplies', sold: '8 units sold', amount: '6,750' },
                       { name: 'Agricultural Tools', sold: '5 units sold', amount: '8,000' }
                     ].map((item) => (
                       <div key={item.name} className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[12.5px] font-bold text-gray-900 leading-tight">{item.name}</span>
                             <span className="text-[10px] font-bold text-gray-400">{item.sold}</span>
                          </div>
                          <span className="text-[13px] font-black text-gray-900 font-mono tracking-tighter text-left">Rs. {item.amount}</span>
                       </div>
                     ))}
                  </div>

                  <div className="flex items-center justify-between mb-4 mt-8 text-left">
                     <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900 font-mono tracking-tighter">Recent Transactions</h5>
                  </div>
                  <div className="space-y-4">
                      {[
                        { id: 'INV-2026-001240', time: '2:15 PM', amount: '8,200', type: 'Non-Tax' },
                        { id: 'INV-2026-001239', time: '1:48 PM', amount: '15,250', type: 'Overflow' }
                      ].map((txn) => (
                        <div key={txn.id} className="flex flex-col gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                           <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                 <span className="text-[12.5px] font-bold text-gray-900 font-mono tracking-tighter">{txn.id}</span>
                                 <span className="text-[11px] font-bold text-gray-400">{txn.time}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="text-[13px] font-black text-emerald-600 font-mono tracking-tighter">Rs. {txn.amount}</span>
                                 <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">{txn.type}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                  </div>
                </div>
             </div>

             {/* Bottom Link Section */}
             <div className="p-6 border-t border-gray-50 mt-auto bg-gray-50/20">
                <button
                   onClick={() => setReportModal('B')}
                   className="w-full flex items-center justify-center gap-2 text-[13px] font-black text-emerald-600 group hover:text-emerald-800 transition-colors"
                >
                   View Detailed Report
                   <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
             </div>
          </div>

          {/* CATEGORY C: LABOUR & MISC (AMBER) */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[850px]">
             {/* Header Section (AMBER GRADIENT) */}
             <div className="p-6 pb-8 bg-gradient-to-br from-[#a16207] to-[#92400e] text-white">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-white/20 px-3 py-1 rounded-md">Category C</span>
                <h3 className="text-[20px] font-black mt-4 mb-1">Labour & Miscellaneous</h3>
                <p className="text-[12px] font-medium opacity-80 mb-6 leading-tight">Labour charges, expenses, & other costs</p>
                <div className="flex items-baseline gap-2 mb-2">
                   <span className="text-[32px] font-black tracking-tighter text-white font-mono tracking-tighter">Rs. {data.catC.core.toLocaleString()}</span>
                </div>
                <p className="text-[13px] font-bold text-amber-200 mb-0">{data.catC.entries} Entries</p>
             </div>

             {/* Charges Breakdown Bar */}
             <div className="px-6 py-4 border-b border-gray-50 space-y-2 bg-gray-50/30">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Labour Charges</span>
                    <span className="text-gray-900 font-mono tracking-tighter font-bold">Rs. {data.catC.labour.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Installation Fees</span>
                    <span className="text-gray-900 font-mono tracking-tighter font-bold">Rs. {data.catC.install.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Other Expenses</span>
                    <span className="text-gray-900 font-mono tracking-tighter font-bold">Rs. {data.catC.misc.toLocaleString()}</span>
                </div>
             </div>

             {/* Statistics Section */}
             <div className="p-6 space-y-6 flex-1 bg-white">
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Labour Type Breakdown</h5>
                      <button className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">View All</button>
                   </div>
                   <div className="space-y-4 mb-10">
                      {[
                        { name: 'Plumbing Installation', jobs: '5 jobs completed', amount: '12,500' },
                        { name: 'Electrical Work', jobs: '3 jobs completed', amount: '8,500' },
                        { name: 'Carpentry Services', jobs: '2 jobs completed', amount: '6,000' }
                      ].map((item) => (
                        <div key={item.name} className="flex justify-between items-center">
                           <div className="flex flex-col">
                              <span className="text-[12.5px] font-bold text-gray-900 leading-tight">{item.name}</span>
                              <span className="text-[10px] font-bold text-gray-400">{item.jobs}</span>
                           </div>
                           <span className="text-[13px] font-black text-gray-900 font-mono tracking-tighter text-left">Rs. {item.amount}</span>
                        </div>
                      ))}
                   </div>

                   <div className="flex items-center justify-between mb-4 mt-8">
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900 font-mono tracking-tighter text-left">Recent Entries</h5>
                   </div>
                   <div className="space-y-5">
                      {[
                        { id: 'LAB-2026-0034', date: '3:45 PM', amount: '4,500', desc: 'Pipe installation - Mr. Perera', type: 'Labour' }
                      ].map((txn) => (
                        <div key={txn.id} className="flex flex-col gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                           <div className="flex justify-between items-start mb-1">
                              <div className="flex flex-col">
                                 <span className="text-[12.5px] font-bold text-gray-900 font-mono tracking-tighter">{txn.id}</span>
                                 <span className="text-[11px] font-bold text-gray-400">{txn.date}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="text-[13px] font-black text-amber-600 font-mono tracking-tighter">Rs. {txn.amount}</span>
                                 <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">{txn.type}</span>
                              </div>
                           </div>
                           <p className="text-[11.5px] font-bold text-gray-500 tracking-tight leading-relaxed text-left">{txn.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Bottom Link Section */}
             <div className="p-6 border-t border-gray-50 mt-auto bg-gray-50/20">
                <button
                   onClick={() => setReportModal('C')}
                   className="w-full flex items-center justify-center gap-2 text-[13px] font-black text-amber-600 group hover:text-amber-800 transition-colors"
                >
                   View All Entries
                   <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
             </div>
          </div>
        </div>

      </div>
      {/* CATEGORY REPORT MODALS */}
      <CategoryAReportModal
         isOpen={reportModal === 'A'}
         onClose={() => setReportModal(null)}
         onPrintPDF={(timeFilter) => { setPrintCategory('A'); setPrintTimeFilter(timeFilter); setTimeout(() => { window.print(); setPrintCategory(null); }, 100); }}
         data={data}
      />
      <CategoryBReportModal
         isOpen={reportModal === 'B'}
         onClose={() => setReportModal(null)}
         onPrintPDF={(timeFilter) => { setPrintCategory('B'); setPrintTimeFilter(timeFilter); setTimeout(() => { window.print(); setPrintCategory(null); }, 100); }}
         data={data}
      />
      <CategoryCReportModal
         isOpen={reportModal === 'C'}
         onClose={() => setReportModal(null)}
         onPrintPDF={(timeFilter) => { setPrintCategory('C'); setPrintTimeFilter(timeFilter); setTimeout(() => { window.print(); setPrintCategory(null); }, 100); }}
         data={data}
      />

      {/* PER-CATEGORY PRINT VIEW (only visible during print) */}
      <CategoryPrintView
         category={printCategory}
         dateRange={dateRange}
         timeFilter={printTimeFilter}
         data={data}
      />

      {/* FULL REPORT PRINT VIEW (suppressed when category modal is printing) */}
      <SalesReportView
         dateRange={dateRange}
         data={data}
         suppressPrint={printCategory !== null}
      />
    </MainLayout>
  );
}
