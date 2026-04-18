'use client';

import { useState } from 'react';
import { ArrowLeft, Download, FileText, Calendar, ChevronDown, Activity, User, Briefcase, Plus, FileSpreadsheet, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import MainLayout from '@/components/layout/MainLayout';
import AddExpenseModal from '@/components/sales/AddExpenseModal';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import CategoryPrintView from '@/components/sales/CategoryPrintView';
import { getMockSalesData } from '@/lib/sales-mock-data';

export default function CategoryCDetailsPage() {
  const router = useRouter();
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
     from: subDays(new Date(), 7),
     to: new Date()
  });

  const globalData = getMockSalesData(dateRange);
  
  const topMetrics = {
    totalSales: 18500,
    assignees: 12,
    entries: 34,
    vsYesterday: '-2.1%'
  };

  const hourlyData = [
    { time: '8AM', value: 5 }, { time: '9AM', value: 15 },
    { time: '10AM', value: 20 }, { time: '11AM', value: 10 },
    { time: '12PM', value: 5 }, { time: '1PM', value: 8 },
    { time: '2PM', value: 25 }, { time: '3PM', value: 30 },
    { time: '4PM', value: 12 }
  ];
  const maxHourly = 30;

  const paymentMethods = [
    { method: 'Cash (Petty)', amount: 12000, percentage: 65, color: 'bg-amber-500' },
    { method: 'Bank Transfer', amount: 6500, percentage: 35, color: 'bg-amber-600' },
  ];

  const topLabour = [
    { name: 'Nimal Silva', role: 'Senior Tech', amount: 4500 },
    { name: 'Kamal Perera', role: 'Assistant', amount: 3200 },
    { name: 'Sunil Fernando', role: 'Driver', amount: 2800 },
    { name: 'Delivery Co.', role: 'Logistics', amount: 1500 },
  ];

  const transactions = [
    { id: 'LAB-1098', assignee: 'Sunil Fernando', type: 'Driver', initial: 'S', color: 'bg-amber-100 text-amber-700', time: '14:30 PM', expense: 'Travel', subtotal: 1500 },
    { id: 'LAB-1099', assignee: 'Kamal Perera', type: 'Assistant', initial: 'K', color: 'bg-amber-100 text-amber-700', time: '11:15 AM', expense: 'Salary', subtotal: 3500 },
    { id: 'LAB-1100', assignee: 'Nimal Silva', type: 'Senior Tech', initial: 'N', color: 'bg-amber-100 text-amber-700', time: '09:00 AM', expense: 'Salary', subtotal: 4500 },
  ];

  const handleExportCSV = () => {
    const rows = [
      ['Entry ID', 'Assignee', 'Time', 'Expense Type', 'Total'],
      ...transactions.map(t => [t.id, t.assignee, t.time, t.expense, t.subtotal])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'category_c_detailed_report.csv';
    a.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <MainLayout>
      {/* PROFESSIONAL RAW PRINT ENGINE */}
      <CategoryPrintView category="C" dateRange={dateRange} timeFilter="Custom Range" data={globalData} />

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
              <span className="font-black text-gray-900">Category C — Detailed Report</span>
              <span className="ml-3 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-amber-100">SERVICES</span>
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
                        <FileSpreadsheet className="w-4 h-4 text-amber-500" /> Download as CSV
                     </DropdownMenu.Item>
                  </DropdownMenu.Content>
               </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <button 
               onClick={() => setShowAddExpense(true)}
               className="bg-[#a16207] hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl font-bold text-[13px] flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
               <Plus className="w-4 h-4" /> Create Expense
            </button>
          </div>
        </div>

        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-8">
           <div>
              <h1 className="text-[28px] font-black tracking-tight text-gray-900 mb-1">Category C — Services & Internal</h1>
              <p className="text-[14px] font-bold text-gray-400">Labour charges, tea expenses, travel, and setup fees</p>
           </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-10">
           <div className="bg-gradient-to-br from-[#b45309] to-[#78350f] rounded-3xl p-7 text-white shadow-xl shadow-amber-900/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase className="w-5 h-5 text-white" />
             </div>
             <p className="text-[12px] font-black text-amber-200 uppercase tracking-widest mb-1">Total Expenses</p>
             <h2 className="text-[36px] font-black leading-none mb-3">Rs. {topMetrics.totalSales.toLocaleString()}</h2>
             <div className="flex items-center gap-1.5 text-amber-200 text-[12px] font-bold">
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">↓</span>
                <span>{topMetrics.vsYesterday} vs yesterday</span>
             </div>
           </div>

           <div className="bg-white border border-gray-100 rounded-3xl p-7 text-gray-900 shadow-sm relative overflow-hidden">
             <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                <User className="w-5 h-5 text-amber-600" />
             </div>
             <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Assignees</p>
             <h2 className="text-[36px] font-black leading-none mb-3">{topMetrics.assignees}</h2>
             <p className="text-gray-400 text-[12px] font-bold">Staff & Contractors</p>
           </div>

           <div className="bg-white border border-gray-100 rounded-3xl p-7 text-gray-900 shadow-sm relative overflow-hidden">
             <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                <Activity className="w-5 h-5 text-amber-600" />
             </div>
             <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Entries</p>
             <h2 className="text-[36px] font-black leading-none mb-3">{topMetrics.entries}</h2>
             <p className="text-gray-400 text-[12px] font-bold">Vouchers Created</p>
           </div>
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-[1fr_350px] gap-6 mb-6">
           {/* Hourly Sales Bar Chart */}
           <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-7">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-[15px] font-black text-gray-900">Expense Timeline</h3>
                    <p className="text-[12px] font-bold text-gray-400 mt-1">Category C disbursements over the day</p>
                 </div>
              </div>
              <div className="h-[200px] flex items-end justify-between gap-2 relative mt-4">
                 <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-bold text-gray-300 w-8">
                    <span>50k</span><span>30k</span><span>20k</span><span>10k</span><span className="opacity-0">0</span>
                 </div>
                 <div className="flex-1 ml-10 flex items-end justify-between border-b border-gray-100 pb-2 relative h-full">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none -mr-4 border-l border-gray-100">
                       <div className="border-b border-gray-50/50 w-full h-0"></div>
                       <div className="border-b border-gray-50/50 w-full h-0"></div>
                       <div className="border-b border-gray-50/50 w-full h-0"></div>
                    </div>
                    {hourlyData.map(h => (
                       <div key={h.time} className="flex flex-col items-center gap-2 group z-10 w-full">
                          <div className="w-[85%] bg-amber-500 rounded-t-[4px] transition-all group-hover:bg-amber-400 cursor-pointer" 
                               style={{ height: `${(h.value / maxHourly) * 100}%` }}></div>
                          <span className="text-[10px] font-black text-gray-400 absolute -bottom-6">{h.time}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Top Labour List */}
           <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-7">
               <h3 className="text-[15px] font-black text-gray-900 mb-6">Top Assignees</h3>
               <div className="space-y-4">
                  {topLabour.map((l, i) => (
                     <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div>
                           <p className="text-[13px] font-black text-gray-900">{l.name}</p>
                           <p className="text-[11px] font-bold text-amber-600">{l.role}</p>
                        </div>
                        <span className="text-[14px] font-black text-gray-900 font-mono">Rs. {l.amount.toLocaleString()}</span>
                     </div>
                  ))}
               </div>
           </div>
        </div>

        {/* ── TRANSACTIONS TABLE ── */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-1">
           <div className="p-6 pb-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <h3 className="text-[15px] font-black text-gray-900">All Category C Entries</h3>
                 <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100/50">34 records</span>
              </div>
              <div className="relative">
                 <input placeholder="Search..." className="border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-bold outline-none focus:ring-2 focus:ring-amber-100" />
              </div>
           </div>
           
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-gray-50 bg-gray-50/30">
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry ID</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assignee</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Time</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Expense Type</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                 </tr>
              </thead>
              <tbody className="text-[13px] font-semibold text-gray-700">
                 {transactions.map((t, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                       <td className="py-4 px-6 font-bold text-amber-600">{t.id}</td>
                       <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black ${t.color}`}>{t.initial}</div>
                             <div>
                                <p className="font-bold text-gray-900">{t.assignee}</p>
                                <p className="text-[10px] font-bold text-gray-400">{t.type}</p>
                             </div>
                          </div>
                       </td>
                       <td className="py-4 px-6 text-center">
                          <p className="font-bold">{t.time}</p>
                       </td>
                       <td className="py-4 px-6 text-center">
                          <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-black tracking-widest">{t.expense}</span>
                       </td>
                       <td className="py-4 px-6 text-right font-black text-gray-900 font-mono">Rs. {t.subtotal.toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Expense Modal Mount */}
        <AddExpenseModal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} />

      </div>
    </MainLayout>
  );
}
