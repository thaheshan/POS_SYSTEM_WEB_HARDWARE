'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Calendar, ChevronDown, Activity, FileBarChart, ShieldCheck, FileText, FileSpreadsheet, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import MainLayout from '@/components/layout/MainLayout';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import CategoryPrintView from '@/components/sales/CategoryPrintView';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function CategoryBDetailsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Protect page at component level
  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/sales');
    }
  }, [user, isAdmin, router]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
     from: subDays(new Date(), 7),
     to: new Date()
  });

  const globalData = getMockSalesData(dateRange);
  
  const topMetrics = {
    totalSales: 45250,
    itemsSold: 124,
    avgBill: 3450,
    vsYesterday: '+5.2%'
  };

  const hourlyData = [
    { time: '8AM', value: 10 }, { time: '9AM', value: 35 },
    { time: '10AM', value: 45 }, { time: '11AM', value: 40 },
    { time: '12PM', value: 20 }, { time: '1PM', value: 25 },
    { time: '2PM', value: 30 }, { time: '3PM', value: 65 },
    { time: '4PM', value: 15 }
  ];
  const maxHourly = 65;

  const paymentMethods = [
    { method: 'Cash', amount: 25450, percentage: 56, color: 'bg-emerald-500' },
    { method: 'Card', amount: 15700, percentage: 34, color: 'bg-emerald-600' },
    { method: 'Mobile', amount: 4100, percentage: 10, color: 'bg-emerald-400' },
  ];

  const topProducts = [
    { name: 'Educational Books', units: 45, total: 12400 },
    { name: 'Medical Supplies', units: 32, total: 10500 },
    { name: 'Agricultural Tools', units: 28, total: 9800 },
    { name: 'Solar Panels (Sub)', units: 15, total: 8500 },
  ];

  const transactions = [
    { id: 'INV-2026-001245', customer: 'Walk-in', type: 'Exempt', initial: 'W', color: 'bg-emerald-100 text-emerald-700', time: '11:15 AM', status: 'NON-TAXABLE', subtotal: 5000 },
    { id: 'INV-2026-001242', customer: 'ABC Farm', type: 'Regular', initial: 'A', color: 'bg-emerald-100 text-emerald-700', time: '10:32 AM', status: 'NON-TAXABLE', subtotal: 3500 },
    { id: 'INV-2026-001239', customer: 'City Clinic', type: 'Corporate', initial: 'C', color: 'bg-emerald-100 text-emerald-700', time: '09:20 AM', status: 'NON-TAXABLE', subtotal: 4250 },
  ];

  const handleExportCSV = () => {
    const rows = [
      ['Invoice #', 'Customer', 'Time', 'Tax Status', 'Total'],
      ...transactions.map(t => [t.id, t.customer, t.time, t.status, t.subtotal])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'category_b_detailed_report.csv';
    a.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <MainLayout>
      {/* PROFESSIONAL RAW PRINT ENGINE */}
      <CategoryPrintView category="B" dateRange={dateRange} timeFilter="Custom Range" data={globalData} />

      <div className="max-w-[1280px] mx-auto pb-20 print:hidden">
        
        {/* BREADCRUMBS & TOP NAV */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/sales')} className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-2 text-[14px]">
              <button onClick={() => router.push('/sales')} className="text-gray-500 hover:text-gray-900 font-bold transition-all">Sales</button>
              <span className="text-gray-300">/</span>
              <span className="font-black text-gray-900">Category B — Detailed Report</span>
              <span className="ml-3 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-emerald-100">NON-TAXABLE</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Popover.Root>
               <Popover.Trigger asChild>
                  <button className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-2.5 shadow-sm hover:shadow-md transition-all active:scale-95 group">
                     <Calendar className="w-4 h-4 text-gray-500" />
                     <span className="text-[13px] font-black text-gray-700">
                        {dateRange?.from ? (
                           dateRange.to ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}` : format(dateRange.from, 'MMM d, yyyy')
                        ) : 'Select Dates'}
                     </span>
                     <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
               </Popover.Trigger>
               <Popover.Portal>
                  <Popover.Content className="bg-white p-7 rounded-[32px] shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in w-[380px] print:hidden" sideOffset={12} align="end">
                     <div className="flex items-center justify-between mb-4">
                        <span className="font-black text-gray-900">Select Range</span>
                        <Popover.Close><X className="w-4 h-4 text-gray-400" /></Popover.Close>
                     </div>
                     <SalesDatePicker dateRange={dateRange} onSelect={setDateRange} />
                  </Popover.Content>
               </Popover.Portal>
            </Popover.Root>

            <DropdownMenu.Root>
               <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-5 py-2.5 hover:bg-gray-50 shadow-sm transition-all font-bold text-[13px] text-gray-700">
                     <Download className="w-4 h-4" /> Export
                  </button>
               </DropdownMenu.Trigger>
               <DropdownMenu.Portal>
                  <DropdownMenu.Content className="bg-white min-w-[180px] p-2 rounded-xl shadow-xl border border-gray-100 z-50 print:hidden" sideOffset={8} align="end">
                     <DropdownMenu.Item onClick={handleExportPDF} className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-bold text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <FileText className="w-4 h-4 text-red-500" /> Download as PDF
                     </DropdownMenu.Item>
                     <DropdownMenu.Item onClick={handleExportCSV} className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-bold text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Download as CSV
                     </DropdownMenu.Item>
                  </DropdownMenu.Content>
               </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-8">
           <div>
              <h1 className="text-[28px] font-black tracking-tight text-gray-900 mb-1">Category B — Exempt Sales Report</h1>
              <p className="text-[14px] font-bold text-gray-400">Non-taxable items & overflow amounts above the daily threshold</p>
           </div>
           <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Live Updates</span>
           </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-10">
           <div className="bg-gradient-to-br from-[#15803d] to-[#14532d] rounded-3xl p-7 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-5 h-5 text-white" />
             </div>
             <p className="text-[12px] font-black text-emerald-200 uppercase tracking-widest mb-1">Total Exempt</p>
             <h2 className="text-[36px] font-black leading-none mb-3">Rs. {topMetrics.totalSales.toLocaleString()}</h2>
             <div className="flex items-center gap-1.5 text-emerald-200 text-[12px] font-bold">
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">↑</span>
                <span>{topMetrics.vsYesterday} vs yesterday</span>
             </div>
           </div>

           <div className="bg-white border border-gray-100 rounded-3xl p-7 text-gray-900 shadow-sm relative overflow-hidden">
             <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                <FileBarChart className="w-5 h-5 text-emerald-600" />
             </div>
             <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Items Sold</p>
             <h2 className="text-[36px] font-black leading-none mb-3">{topMetrics.itemsSold}</h2>
             <p className="text-gray-400 text-[12px] font-bold">Units Dispensed</p>
           </div>

           <div className="bg-white border border-gray-100 rounded-3xl p-7 text-gray-900 shadow-sm relative overflow-hidden">
             <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                <Activity className="w-5 h-5 text-emerald-600" />
             </div>
             <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Average Bill</p>
             <h2 className="text-[36px] font-black leading-none mb-3">Rs. {topMetrics.avgBill.toLocaleString()}</h2>
             <p className="text-gray-400 text-[12px] font-bold">Per Invoice Avg</p>
           </div>
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-2 gap-6 mb-6">
           <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-7">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-[15px] font-black text-gray-900">Hourly Overflow</h3>
                    <p className="text-[12px] font-bold text-gray-400 mt-1">Category B traffic throughout the day</p>
                 </div>
              </div>
              <div className="h-[200px] flex items-end justify-between gap-2 relative mt-4">
                 <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-bold text-gray-300 w-8">
                    <span>100k</span><span>75k</span><span>50k</span><span>25k</span><span className="opacity-0">0</span>
                 </div>
                 <div className="flex-1 ml-10 flex items-end justify-between border-b border-gray-100 pb-2 relative h-full">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none -mr-4 border-l border-gray-100">
                       <div className="border-b border-gray-50/50 w-full h-0"></div>
                       <div className="border-b border-gray-50/50 w-full h-0"></div>
                       <div className="border-b border-gray-50/50 w-full h-0"></div>
                    </div>
                    {hourlyData.map(h => (
                       <div key={h.time} className="flex flex-col items-center gap-2 group z-10 w-full">
                          <div className="w-[85%] bg-emerald-500 rounded-t-[4px] transition-all group-hover:bg-emerald-400 cursor-pointer" 
                               style={{ height: `${(h.value / maxHourly) * 100}%` }}></div>
                          <span className="text-[10px] font-black text-gray-400 absolute -bottom-6">{h.time}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-7 flex flex-col">
              <div>
                 <h3 className="text-[15px] font-black text-gray-900">Exempt Categories</h3>
                 <p className="text-[12px] font-bold text-gray-400 mt-1">Non-taxable breakdown</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center mt-6">
                 <div className="relative w-[220px] h-[220px]">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                       <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                       <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="120" />
                       <circle cx="50" cy="50" r="40" fill="transparent" stroke="#059669" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="180" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-[22px] shadow-sm border border-gray-50">
                       <span className="text-[18px] font-black text-gray-900 mt-1">Rs. 45,250</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Exempt</span>
                    </div>
                 </div>
                 <div className="flex justify-between w-full mt-8 px-4">
                    {[
                      { l: 'Books', v: 'Rs. 12,400', c: 'bg-emerald-500' },
                      { l: 'Medical', v: 'Rs. 10,500', c: 'bg-emerald-600' },
                      { l: 'Agri', v: 'Rs. 9,800', c: 'bg-emerald-700' },
                    ].map(s => (
                       <div key={s.l} className="flex gap-2">
                          <span className={`w-2 h-2 rounded-full mt-1 ${s.c}`}></span>
                          <div>
                             <p className="text-[11px] font-black text-gray-800 leading-tight">{s.l}</p>
                             <p className="text-[10px] font-bold text-gray-400">{s.v}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* ── TRANSACTIONS TABLE ── */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-1">
           <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <h3 className="text-[15px] font-black text-gray-900">All Category B Invoices</h3>
                 <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100/50">24 records</span>
              </div>
              <div className="relative">
                 <input placeholder="Search..." className="border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-bold outline-none focus:ring-2 focus:ring-emerald-100" />
              </div>
           </div>
           
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-gray-50 bg-gray-50/30">
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice #</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Time</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tax Status</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                 </tr>
              </thead>
              <tbody className="text-[13px] font-semibold text-gray-700">
                 {transactions.map((t, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                       <td className="py-4 px-6 font-bold text-emerald-600">{t.id}</td>
                       <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black ${t.color}`}>{t.initial}</div>
                             <div>
                                <p className="font-bold text-gray-900">{t.customer}</p>
                                <p className="text-[10px] font-bold text-gray-400">{t.type}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-4 px-6 text-center">
                          <p className="font-bold">{t.time}</p>
                       </td>
                       <td className="py-4 px-6 text-center">
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black tracking-widest">{t.status}</span>
                       </td>
                       <td className="py-4 px-6 text-right font-black text-gray-900 font-mono">Rs. {t.subtotal.toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

      </div>
    </MainLayout>
  );
}
