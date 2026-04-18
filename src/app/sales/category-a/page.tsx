'use client';

import { useState } from 'react';
import { ArrowLeft, Download, FileText, Calendar, ChevronDown, Check, FileBarChart, PieChart, Activity, FileSpreadsheet, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import MainLayout from '@/components/layout/MainLayout';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import CategoryPrintView from '@/components/sales/CategoryPrintView';
import { getMockSalesData } from '@/lib/sales-mock-data';

export default function CategoryADetailsPage() {
  const router = useRouter();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
     from: subDays(new Date(), 7),
     to: new Date()
  });

  const globalData = getMockSalesData(dateRange);
  
  // Mock Data aligned with Figma design
  const topMetrics = {
    totalSales: 145650,
    vatCollected: 22290,
    transactions: 42,
    vsYesterday: '+12.4%'
  };

  const hourlyData = [
    { time: '8AM', value: 20 }, { time: '9AM', value: 45 },
    { time: '10AM', value: 60 }, { time: '11AM', value: 55 },
    { time: '12PM', value: 30 }, { time: '1PM', value: 35 },
    { time: '2PM', value: 40 }, { time: '3PM', value: 80 },
    { time: '4PM', value: 25 }
  ];
  const maxHourly = 80;

  const paymentMethods = [
    { method: 'Cash', amount: 68450, percentage: 47, color: 'bg-emerald-500' },
    { method: 'Card', amount: 40782, percentage: 28, color: 'bg-blue-600' },
    { method: 'Credit', amount: 21848, percentage: 15, color: 'bg-amber-500' },
    { method: 'Mobile', amount: 14570, percentage: 10, color: 'bg-orange-500' },
  ];

  const topProducts = [
    { name: 'Holcim Cement 50kg', units: 18, total: 29700 },
    { name: 'PVC Pipe 2" x 10ft', units: 24, total: 19200 },
    { name: 'Wire 2.5mm 100m', units: 12, total: 18800 },
    { name: 'Paint White 4L', units: 8, total: 15400 },
  ];

  const transactions = [
    { id: 'INV-2026-001234', customer: 'Kamal Perera', type: 'Walk-in', initial: 'K', color: 'bg-blue-100 text-blue-700', time: '10:24 AM', items: 4, subtotal: 4619 },
    { id: 'INV-2026-001233', customer: 'Nimal Silva', type: 'Regular', initial: 'N', color: 'bg-emerald-100 text-emerald-700', time: '09:47 AM', items: 2, subtotal: 2881 },
    { id: 'INV-2026-001232', customer: 'Sunil Fernando', type: 'Walk-in', initial: 'S', color: 'bg-amber-100 text-amber-700', time: '09:15 AM', items: 6, subtotal: 6350 },
  ];

  const handleExportCSV = () => {
    const rows = [
      ['Invoice #', 'Customer', 'Time', 'Items', 'Subtotal'],
      ...transactions.map(t => [t.id, t.customer, t.time, t.items, t.subtotal])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'category_a_detailed_report.csv';
    a.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <MainLayout>
      {/* PROFESSIONAL RAW PRINT ENGINE */}
      <CategoryPrintView category="A" dateRange={dateRange} timeFilter="Custom Range" data={globalData} />

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
              <span className="font-black text-gray-900">Category A — Detailed Report</span>
              <span className="ml-3 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-100">Taxable</span>
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
                        <FileSpreadsheet className="w-4 h-4 text-blue-500" /> Download as CSV
                     </DropdownMenu.Item>
                  </DropdownMenu.Content>
               </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <button className="bg-[#1e40af] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-[13px] shadow-sm flex items-center gap-2 transition-all">
               <FileText className="w-4 h-4" /> IRD Tax Report
            </button>
          </div>
        </div>

        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-8">
           <div>
              <h1 className="text-[28px] font-black tracking-tight text-gray-900 mb-1">Category A — Taxable Sales Report</h1>
              <p className="text-[14px] font-bold text-gray-400">Taxable sales within the first Rs. 200,000 daily threshold — VAT @ 18% applied</p>
           </div>
           <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Live — Updated just now</span>
           </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-10">
           <div className="bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] rounded-3xl p-7 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="font-black text-[18px]">Rs</span>
             </div>
             <p className="text-[12px] font-black text-blue-200 uppercase tracking-widest mb-1">Total Taxable Sales</p>
             <h2 className="text-[36px] font-black leading-none mb-3">Rs. {topMetrics.totalSales.toLocaleString()}</h2>
             <div className="flex items-center gap-1.5 text-blue-200 text-[12px] font-bold">
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">↑</span>
                <span>{topMetrics.vsYesterday} vs yesterday</span>
             </div>
           </div>

           <div className="bg-gradient-to-br from-[#b45309] to-[#92400e] rounded-3xl p-7 text-white shadow-xl shadow-amber-900/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-5 h-5 text-white" />
             </div>
             <p className="text-[12px] font-black text-yellow-200/80 uppercase tracking-widest mb-1">VAT Collected (18%)</p>
             <h2 className="text-[36px] font-black leading-none mb-3">Rs. {topMetrics.vatCollected.toLocaleString()}</h2>
             <p className="text-yellow-200/70 text-[12px] font-bold">IRD Payable Amount</p>
           </div>

           <div className="bg-gradient-to-br from-[#15803d] to-[#166534] rounded-3xl p-7 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <FileBarChart className="w-5 h-5 text-white" />
             </div>
             <p className="text-[12px] font-black text-emerald-200 uppercase tracking-widest mb-1">Total Transactions</p>
             <h2 className="text-[36px] font-black leading-none mb-3">{topMetrics.transactions}</h2>
             <p className="text-emerald-200 text-[12px] font-bold">Invoices Generated</p>
           </div>
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-2 gap-6 mb-6">
           {/* Hourly Sales Bar Chart */}
           <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-7">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-[15px] font-black text-gray-900">Hourly Sales Flow</h3>
                    <p className="text-[12px] font-bold text-gray-400 mt-1">Category A transactions over the day</p>
                 </div>
                 <div className="flex bg-gray-50 rounded-xl p-1">
                    <button className="px-3 py-1.5 bg-white shadow-sm rounded-lg text-[12px] font-bold"><Activity className="w-4 h-4 text-blue-600"/></button>
                    <button className="px-3 py-1.5 text-gray-400 rounded-lg text-[12px] font-bold"><FileBarChart className="w-4 h-4"/></button>
                 </div>
              </div>
              <div className="h-[200px] flex items-end justify-between gap-2 relative mt-4">
                 {/* Y Axis pseudo-labels */}
                 <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-bold text-gray-300 w-8">
                    <span>200k</span><span>150k</span><span>100k</span><span>50k</span><span className="opacity-0">0</span>
                 </div>
                 {/* Chart area */}
                 <div className="flex-1 ml-10 flex items-end justify-between border-b border-gray-100 pb-2 relative h-full">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none -mr-4 border-l border-gray-100">
                       <div className="border-b border-gray-50/50 w-full h-0"></div>
                       <div className="border-b border-gray-50/50 w-full h-0"></div>
                       <div className="border-b border-gray-50/50 w-full h-0"></div>
                       <div className="border-dashed border-b border-red-200 w-full h-0"></div>
                    </div>
                    {hourlyData.map(h => (
                       <div key={h.time} className="flex flex-col items-center gap-2 group z-10 w-full">
                          <div className="w-[85%] bg-blue-600 rounded-t-[4px] transition-all group-hover:bg-blue-500 cursor-pointer" 
                               style={{ height: `${(h.value / maxHourly) * 100}%` }}></div>
                          <span className="text-[10px] font-black text-gray-400 absolute -bottom-6">{h.time}</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-12">
                 <div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-blue-600"></span><span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Hourly Sales</span></div>
                 <div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-emerald-500"></span><span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Cumulative</span></div>
                 <div className="flex items-center gap-2"><span className="w-3 h-0.5 rounded bg-red-400"></span><span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">Tax Threshold</span></div>
              </div>
           </div>

           {/* Doughnut Chart Mock */}
           <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-7 flex flex-col">
              <div>
                 <h3 className="text-[15px] font-black text-gray-900">Sales by Category</h3>
                 <p className="text-[12px] font-bold text-gray-400 mt-1">Taxable product breakdown today</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center mt-6">
                 {/* CSS SVG Doughnut Mock */}
                 <div className="relative w-[220px] h-[220px]">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                       <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                       <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="180" />
                       <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="210" />
                       <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="230" />
                       <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="90" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-[22px] shadow-sm border border-gray-50">
                       <span className="text-[18px] font-black text-gray-900 mt-1">Rs. 145,650</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Total</span>
                    </div>
                 </div>
                 <div className="flex justify-between w-full mt-8 px-4">
                    {[
                      { l: 'PVC Items', v: 'Rs. 38,500', c: 'bg-blue-600' },
                      { l: 'Electrical', v: 'Rs. 29,800', c: 'bg-emerald-500' },
                      { l: 'Nuts & Bolts', v: 'Rs. 21,700', c: 'bg-amber-500' },
                      { l: 'Tools', v: 'Rs. 18,750', c: 'bg-purple-500' }
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

        {/* ── BREAKDOWN & LIST ROW ── */}
        <div className="grid grid-cols-[1fr_350px] gap-6 mb-6">
           
           {/* LEFT COLUMN: Payment Methods & Products */}
           <div className="space-y-6">
              {/* Payment Methods */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-7">
                 <h3 className="text-[15px] font-black text-gray-900 mb-6">Payment Methods</h3>
                 <div className="space-y-6">
                    {paymentMethods.map(p => (
                       <div key={p.method}>
                          <div className="flex justify-between items-end mb-2">
                             <span className="text-[12px] font-black text-gray-800">{p.method}</span>
                             <span className="text-[12px] font-black text-gray-600 font-mono">Rs. {p.amount.toLocaleString()} <span className="text-gray-400 ml-1">({p.percentage}%)</span></span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.percentage}%` }}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Top Products */}
              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-7">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[15px] font-black text-gray-900">Top Products</h3>
                    <button className="text-[11px] font-black text-blue-600 hover:text-blue-800">View All</button>
                 </div>
                 <div className="space-y-2">
                    {topProducts.map((p, i) => (
                       <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[12px] font-black text-gray-400">{i + 1}</div>
                             <div>
                                <p className="text-[13px] font-black text-gray-900 whitespace-nowrap">{p.name}</p>
                                <p className="text-[11px] font-bold text-gray-400">{p.units} units</p>
                             </div>
                          </div>
                          <span className="text-[14px] font-black text-blue-600 font-mono">Rs. {p.total.toLocaleString()}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* RIGHT COLUMN: Tax Summary */}
           <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-1">
              <div className="bg-white rounded-[22px] p-7 h-full flex flex-col">
                 <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                    <h3 className="text-[16px] font-black text-gray-900">Tax Summary</h3>
                    <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-md tracking-widest">IRD</div>
                 </div>
                 
                 <div className="space-y-6 flex-1">
                    <div className="flex justify-between items-center">
                       <span className="text-[13px] font-bold text-gray-600">Gross Sales</span>
                       <span className="text-[14px] font-black text-gray-900 font-mono">Rs. {topMetrics.totalSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                       <span className="text-[13px] font-bold text-gray-600">Taxable Amount (excl. VAT)</span>
                       <span className="text-[14px] font-black text-gray-900 font-mono">Rs. {(topMetrics.totalSales - topMetrics.vatCollected).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[13px] font-bold text-gray-600">VAT Collected <span className="px-1.5 py-0.5 ml-1 bg-gray-100 rounded text-[10px] font-black">@ 18%</span></span>
                       <span className="text-[14px] font-black text-blue-600 font-mono">Rs. {topMetrics.vatCollected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-6 border-b border-blue-100">
                       <span className="text-[13px] font-bold text-gray-600">Discount Given</span>
                       <span className="text-[14px] font-black text-red-500 font-mono">– Rs. 2,450</span>
                    </div>
                    
                    <div className="bg-blue-50 rounded-2xl p-5 mt-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[14px] font-black text-blue-900">Net VAT Payable</span>
                          <span className="text-[18px] font-black text-blue-600 font-mono">Rs. {topMetrics.vatCollected.toLocaleString()}</span>
                       </div>
                    </div>

                    <div className="mt-4 flex items-start gap-3 bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4">
                       <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-600 text-[10px] font-black">i</span>
                       </div>
                       <p className="text-[11.5px] font-bold text-blue-900/70 leading-relaxed">
                          VAT filing due by end of month. Ensure IRD compliance module is synced.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ── TRANSACTIONS TABLE ── */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-1">
           <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <h3 className="text-[15px] font-black text-gray-900">All Category A Transactions</h3>
                 <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100/50">42 records</span>
              </div>
              <div className="relative">
                 <input placeholder="Search..." className="border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-bold outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
           </div>
           
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-gray-50 bg-gray-50/30">
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest w-12"><div className="w-4 h-4 border-2 border-gray-200 rounded"></div></th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice #</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Time</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Items</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                 </tr>
              </thead>
              <tbody className="text-[13px] font-semibold text-gray-700">
                 {transactions.map((t, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                       <td className="py-4 px-6"><div className="w-4 h-4 border-2 border-gray-200 rounded"></div></td>
                       <td className="py-4 px-6 font-bold text-blue-600">{t.id}</td>
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
                          <p className="text-[10px] font-bold text-gray-400">Today</p>
                       </td>
                       <td className="py-4 px-6 text-center font-bold text-gray-500">{t.items} items</td>
                       <td className="py-4 px-6 text-right font-black text-gray-900 font-mono">Rs. {t.subtotal.toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>

           <div className="p-4 px-6 flex items-center justify-between text-[12px] font-bold text-gray-400 border-t border-gray-50">
              <span>Showing 1–20 of 42 transactions</span>
              <div className="flex items-center gap-2">
                 <span>Rows per page:</span>
                 <select className="border border-gray-200 rounded-lg px-2 py-1 outline-none font-black text-gray-700">
                    <option>20</option>
                 </select>
              </div>
           </div>
        </div>

      </div>
    </MainLayout>
  );
}
