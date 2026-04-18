'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
   Calendar, ChevronDown, Download, FileText, Filter,
   TrendingUp, TrendingDown, CheckCircle, AlertCircle,
   Info, Search, X, ArrowLeft, ShieldAlert, Printer
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import SalesDatePicker from '@/components/sales/SalesDatePicker';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ALL_TRANSACTIONS = [
   { time: '14:45', id: 'INV-001245', customer: 'John Silva', items: 3, amount: 4250.50, type: 'Card', status: 'Completed' },
   { time: '14:38', id: 'INV-001244', customer: 'Walk-in Customer', items: 2, amount: 1850.00, type: 'Cash', status: 'Pending' },
   { time: '14:25', id: 'RET-000892', customer: 'Silva Constructions', items: 1, amount: -2180.00, type: 'Return', status: 'Completed' },
   { time: '14:10', id: 'INV-001243', customer: 'Walk-in Customer', items: 5, amount: 12450.00, type: 'Cash', status: 'Completed' },
   { time: '13:55', id: 'INV-001242', customer: 'Kamal Perera', items: 1, amount: 450.00, type: 'Mobile', status: 'Pending' },
   { time: '13:42', id: 'INV-001241', customer: 'Walk-in Customer', items: 8, amount: 8900.00, type: 'Cash', status: 'Completed' },
   { time: '13:20', id: 'INV-001240', customer: 'ABC Hardware', items: 15, amount: 45000.00, type: 'Card', status: 'Completed' },
   { time: '13:05', id: 'INV-001239', customer: 'Walk-in Customer', items: 2, amount: 1200.00, type: 'Cash', status: 'Completed' },
   { time: '12:50', id: 'INV-001238', customer: 'Nimal Fernando', items: 4, amount: 5600.00, type: 'Card', status: 'Completed' },
   { time: '12:35', id: 'INV-001237', customer: 'Walk-in Customer', items: 1, amount: 850.00, type: 'Cash', status: 'Completed' },
   { time: '12:10', id: 'INV-001236', customer: 'Perera Builders', items: 10, amount: 28000.00, type: 'Card', status: 'Completed' },
   { time: '11:50', id: 'INV-001235', customer: 'Ravi Kumar', items: 2, amount: 3200.00, type: 'Mobile', status: 'Completed' },
];

const COMPARISON_DATA: Record<string, Array<{ metric: string; today: string; prev: string; change: string; up: boolean }>> = {
   today: [
      { metric: 'Total Sales', today: 'Rs. 145,200', prev: 'Rs. 132,100', change: '+9.8%', up: true },
      { metric: 'Invoices', today: '142', prev: '128', change: '+10.9%', up: true },
      { metric: 'Avg Order Value', today: 'Rs. 1,022', prev: 'Rs. 1,032', change: '-0.9%', up: false },
      { metric: 'Gross Profit', today: 'Rs. 42,450', prev: 'Rs. 38,500', change: '+10.2%', up: true },
      { metric: 'Return Rate', today: '1.2%', prev: '0.8%', change: '+0.4%', up: false },
   ],
   week: [
      { metric: 'Total Sales', today: 'Rs. 890,000', prev: 'Rs. 820,000', change: '+8.5%', up: true },
      { metric: 'Invoices', today: '820', prev: '740', change: '+10.8%', up: true },
      { metric: 'Avg Order Value', today: 'Rs. 1,085', prev: 'Rs. 1,108', change: '-2.1%', up: false },
      { metric: 'Gross Profit', today: 'Rs. 267,000', prev: 'Rs. 246,000', change: '+8.5%', up: true },
      { metric: 'Return Rate', today: '1.5%', prev: '1.8%', change: '-0.3%', up: true },
   ],
   month: [
      { metric: 'Total Sales', today: 'Rs. 3.8M', prev: 'Rs. 3.5M', change: '+8.6%', up: true },
      { metric: 'Invoices', today: '3,420', prev: '3,100', change: '+10.3%', up: true },
      { metric: 'Avg Order Value', today: 'Rs. 1,111', prev: 'Rs. 1,129', change: '-1.6%', up: false },
      { metric: 'Gross Profit', today: 'Rs. 1.14M', prev: 'Rs. 1.05M', change: '+8.6%', up: true },
      { metric: 'Return Rate', today: '1.1%', prev: '1.4%', change: '-0.3%', up: true },
   ],
};

const TOP_PRODUCTS = [
   { n: 'Holcim Cement 50kg', r: '1', q: '145', p: '18%', rev: 'Rs. 239,250' },
   { n: 'Steel Bars 12mm', r: '2', q: '82', p: '14%', rev: 'Rs. 185,000' },
   { n: 'Premium Emulsion Paint', r: '3', q: '65', p: '11%', rev: 'Rs. 145,600' },
   { n: 'PVC Pipes 2 inch', r: '4', q: '210', p: '8%', rev: 'Rs. 106,050' },
   { n: 'Electric Cables Roll', r: '5', q: '45', p: '6%', rev: 'Rs. 79,500' },
];

const BRANCHES = ['All Branches', 'Main Branch', 'Colombo Outlet'];
const CASHIERS = ['All Cashiers', 'Nimal Fernando', 'Kamal Perera'];
const CATEGORIES = ['All Categories', 'Building Materials', 'Paint', 'Plumbing', 'Electricals', 'Tools'];
const TXNS_PER_PAGE = 5;

const ANALYTICS_TREND_DATA: Record<string, { label: string; total: number; cash: number; card: number }[]> = {
  'today': [
    { label: '08:00', total: 6000,   cash: 4000,  card: 2000  },
    { label: '09:00', total: 18000,  cash: 12000, card: 6000  },
    { label: '10:00', total: 32000,  cash: 18000, card: 14000 },
    { label: '11:00', total: 45000,  cash: 25000, card: 20000 },
    { label: '12:00', total: 52000,  cash: 28000, card: 24000 },
    { label: '13:00', total: 38000,  cash: 20000, card: 18000 },
    { label: '14:00', total: 42000,  cash: 24000, card: 18000 },
    { label: '15:00', total: 30000,  cash: 16000, card: 14000 },
  ],
  'custom': [
    { label: 'Mon', total: 45000, cash: 25000, card: 20000 },
    { label: 'Tue', total: 38000, cash: 18000, card: 20000 },
    { label: 'Wed', total: 52000, cash: 28000, card: 24000 },
    { label: 'Thu', total: 48000, cash: 24000, card: 24000 },
    { label: 'Fri', total: 61000, cash: 31000, card: 30000 },
    { label: 'Sat', total: 72000, cash: 40000, card: 32000 },
    { label: 'Sun', total: 65000, cash: 38000, card: 27000 },
  ]
};

const PAYMENT_CHART_DATA = [
  { label: 'Cash', pct: 50, color: '#10b981', fill: 'bg-emerald-500' },
  { label: 'Card', pct: 30, color: '#f59e0b', fill: 'bg-amber-500' },
  { label: 'Mobile', pct: 20, color: '#06b6d4', fill: 'bg-cyan-500' },
];

const PEAK_DATA: Record<string, { time: string; txns: number }[]> = {
  'today': [
    { time: '09:00', txns: 14 }, { time: '10:00', txns: 22 }, { time: '11:00', txns: 30 },
    { time: '12:00', txns: 40 }, { time: '13:00', txns: 32 }, { time: '14:00', txns: 26 }, { time: '15:00', txns: 18 },
  ],
  'custom': [
    { time: 'Mon', txns: 85 }, { time: 'Tue', txns: 120 }, { time: 'Wed', txns: 98 },
    { time: 'Thu', txns: 145 }, { time: 'Fri', txns: 160 }, { time: 'Sat', txns: 190 }, { time: 'Sun', txns: 130 },
  ],
};

export default function AnalyticsPage() {
   const router = useRouter();

   // Filters
   const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: new Date(), to: new Date() });
   const [selectedBranch, setSelectedBranch] = useState('All Branches');
   const [selectedCashier, setSelectedCashier] = useState('All Cashiers');
   const [selectedCategory, setSelectedCategory] = useState('All Categories');
   const [activeView, setActiveView] = useState<'today' | 'custom'>('today');

   // Table & Chart States
   const [searchQuery, setSearchQuery] = useState('');
   const [txnPage, setTxnPage] = useState(1);
   const [compTab, setCompTab] = useState<'today' | 'week' | 'month'>('today');
   const [trendTab, setTrendTab] = useState('Revenue');
   const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
   const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
   const [hoveredBar, setHoveredBar] = useState<number | null>(null);

   // Filtered transactions
   const filteredTxns = useMemo(() => {
      const q = searchQuery.toLowerCase();
      return ALL_TRANSACTIONS.filter(t =>
         t.id.toLowerCase().includes(q) ||
         t.customer.toLowerCase().includes(q) ||
         t.type.toLowerCase().includes(q) ||
         t.status.toLowerCase().includes(q)
      );
   }, [searchQuery]);

   const totalPages = Math.ceil(filteredTxns.length / TXNS_PER_PAGE);
   const pagedTxns = filteredTxns.slice((txnPage - 1) * TXNS_PER_PAGE, txnPage * TXNS_PER_PAGE);

   // Export CSV
   const handleExportCSV = () => {
      const lines = [];
      lines.push('SALES ANALYTICS REPORT');
      lines.push(`Generated on: ${new Date().toLocaleString()}`);
      lines.push('');
      
      lines.push('--- SALES BY CATEGORY ---');
      lines.push('Category,Percentage,Value');
      lines.push('Building Materials,45%,45240');
      lines.push('Paint & Accessories,25%,25600');
      lines.push('Plumbing,15%,15200');
      lines.push('Electricals,10%,10400');
      lines.push('Tools,5%,5100');
      lines.push('');
      
      lines.push('--- BY PAYMENT METHOD ---');
      lines.push('Method,Percentage');
      PAYMENT_CHART_DATA.forEach(p => lines.push(`${p.label},${p.pct}%`));
      lines.push('');
      
      lines.push('--- TOP SELLING PRODUCTS ---');
      lines.push('Rank,Product,Qty,Revenue');
      TOP_PRODUCTS.forEach(p => lines.push(`#${p.r},${p.n},${p.q},"${p.rev}"`));
      lines.push('');
      
      lines.push(`--- PERFORMANCE COMPARISON (${compTab.toUpperCase()}) ---`);
      lines.push('Metric,Current,Previous,Change');
      COMPARISON_DATA[compTab].forEach(c => lines.push(`"${c.metric}","${c.today}","${c.prev}","${c.change}"`));
      lines.push('');

      lines.push('--- TRANSACTION DETAILS ---');
      lines.push('Time,Invoice,Customer,Items,Amount,Type,Status');
      filteredTxns.forEach(t => lines.push(`${t.time},${t.id},"${t.customer}",${t.items},${t.amount},${t.type},${t.status}`));
      
      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales_analytics_full_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
   };

   const handleExportPDF = () => window.print();

   const dateLabel = dateRange?.from
      ? dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
         ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d, yyyy')}`
         : format(dateRange.from, 'MMM d, yyyy')
      : 'Select Range';

   return (
      <MainLayout>
         <div className="max-w-[1600px] mx-auto pb-24 print:hidden">

            {/* 1. HEADER */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-7">
               <div>
                  <button onClick={() => router.push('/sales/dashboard')} className="flex items-center gap-1.5 text-[12px] font-bold text-gray-400 hover:text-emerald-600 mb-3 transition">
                     <ArrowLeft className="w-3.5 h-3.5" /> Back to POS Dashboard
                  </button>
                  <h1 className="text-[24px] font-black text-[#1e3a8a] tracking-tight mb-1">Total Sales & Revenue Analysis</h1>
                  <p className="text-[12.5px] font-bold text-gray-500 flex items-center gap-2">
                     Comprehensive evaluation of sales performance, revenue streams, and growth metrics.
                     <span className="flex items-center gap-1 text-emerald-500"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Updated: Today {format(new Date(), 'HH:mm')}</span>
                  </p>
               </div>
               <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 mr-2">
                     <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-[12px] font-black rounded-lg shadow-sm hover:bg-gray-50 hover:text-[#1e3a8a] transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        CSV
                     </button>
                     <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-4 py-2 bg-[#1e3a8a] text-white text-[12px] font-black rounded-lg shadow-sm hover:bg-blue-800 transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        PDF
                     </button>
                  </div>
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                     <button onClick={() => setActiveView('today')} className={`px-5 py-1.5 text-[12px] font-bold rounded-md transition-all ${activeView === 'today' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Today</button>
                     <Popover.Root>
                        <Popover.Trigger asChild>
                           <button onClick={() => setActiveView('custom')} className={`px-5 py-1.5 text-[12px] font-bold rounded-md transition-all flex items-center gap-1.5 ${activeView === 'custom' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                              <Calendar className="w-3.5 h-3.5" /> {activeView === 'custom' ? dateLabel : 'Custom Range'}
                           </button>
                        </Popover.Trigger>
                        <Popover.Portal>
                           <Popover.Content className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 z-50 w-[340px]" sideOffset={8} align="end">
                              <div className="flex items-center justify-between mb-4">
                                 <h4 className="text-[15px] font-black text-blue-900">Select Period</h4>
                                 <Popover.Close className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">
                                    <X className="w-4 h-4" />
                                 </Popover.Close>
                              </div>
                              <SalesDatePicker dateRange={dateRange} onSelect={setDateRange} />
                              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                 <span className="text-[12px] font-bold text-blue-700">{dateLabel}</span>
                                 <Popover.Close asChild>
                                    <button className="px-5 py-2 bg-blue-900 text-white rounded-xl text-[12px] font-black hover:bg-blue-800 transition">Confirm</button>
                                 </Popover.Close>
                              </div>
                           </Popover.Content>
                        </Popover.Portal>
                     </Popover.Root>
                  </div>
               </div>
            </div>

            {/* 2. FILTER BAR */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-7 flex items-center justify-between gap-4">
               <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-black rounded-md uppercase tracking-wider shrink-0">
                     <Filter className="w-3.5 h-3.5" /> Filters
                  </span>
                  {[
                     { label: selectedBranch, options: BRANCHES, setter: setSelectedBranch },
                     { label: selectedCashier, options: CASHIERS, setter: setSelectedCashier },
                     { label: selectedCategory, options: CATEGORIES, setter: setSelectedCategory },
                  ].map((f) => (
                     <DropdownMenu.Root key={f.label}>
                        <DropdownMenu.Trigger asChild>
                           <button className="flex items-center justify-between min-w-[150px] px-3 py-2 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition gap-3">
                              {f.label} <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                           </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                           <DropdownMenu.Content className="bg-white min-w-[180px] p-1.5 rounded-xl shadow-xl border border-gray-100 z-50 animate-in slide-in-from-top-1 duration-150" sideOffset={6}>
                              {f.options.map(o => (
                                 <DropdownMenu.Item key={o} onClick={() => f.setter(o)} className={`px-3 py-2 text-[12px] font-bold rounded-lg cursor-pointer outline-none transition ${f.label === o ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}>{o}</DropdownMenu.Item>
                              ))}
                           </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                     </DropdownMenu.Root>
                  ))}
                  {(selectedBranch !== 'All Branches' || selectedCashier !== 'All Cashiers' || selectedCategory !== 'All Categories') && (
                     <button
                        onClick={() => { setSelectedBranch('All Branches'); setSelectedCashier('All Cashiers'); setSelectedCategory('All Categories'); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                     >
                        <X className="w-3 h-3" /> Clear Filters
                     </button>
                  )}
               </div>
               <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                     <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[12px] font-black shadow-sm transition-all shrink-0">
                        <Download className="w-3.5 h-3.5" /> Export Options <ChevronDown className="w-3.5 h-3.5" />
                     </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                     <DropdownMenu.Content className="bg-white min-w-[190px] p-1.5 rounded-xl shadow-xl border border-gray-100 z-50" sideOffset={6} align="end">
                        <DropdownMenu.Item onClick={handleExportCSV} className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-gray-700 rounded-lg cursor-pointer hover:bg-emerald-50 outline-none transition">
                           <FileText className="w-4 h-4 text-emerald-600" /> Download as CSV
                        </DropdownMenu.Item>
                        <DropdownMenu.Item onClick={handleExportPDF} className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-gray-700 rounded-lg cursor-pointer hover:bg-red-50 outline-none transition">
                           <Printer className="w-4 h-4 text-red-500" /> Print / Save PDF
                        </DropdownMenu.Item>
                     </DropdownMenu.Content>
                  </DropdownMenu.Portal>
               </DropdownMenu.Root>
            </div>

            {/* 3. ACTIVE FILTERS DISPLAY */}
            {(selectedBranch !== 'All Branches' || selectedCashier !== 'All Cashiers' || selectedCategory !== 'All Categories') && (
               <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <span className="text-[11px] font-bold text-gray-400">Active Filters:</span>
                  {[selectedBranch, selectedCashier, selectedCategory].filter(f => !f.startsWith('All')).map(f => (
                     <span key={f} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">{f}</span>
                  ))}
               </div>
            )}

            {/* 4. SALES TREND LINE CHART */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 mb-7">
               <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <h3 className="text-[15px] font-black text-gray-900">Sales Trend Analysis</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                     <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 border border-gray-200 rounded-lg p-1">
                        {['Revenue', 'Gross Profit', 'Discounts'].map(tab => (
                           <button key={tab} onClick={() => { setTrendTab(tab); setHoveredPoint(null); }} className={`px-3 py-1.5 rounded-md transition ${trendTab === tab ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50'}`}>{tab}</button>
                        ))}
                     </div>
                     <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Total Revenue</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400"></span> Cash</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400"></span> Card</span>
                     </div>
                  </div>
               </div>
               {(() => {
                  const data = ANALYTICS_TREND_DATA[activeView] || ANALYTICS_TREND_DATA['today'];
                  const maxVal = Math.max(...data.map(d => d.total));
                  const chartH = 260; const chartW = 900; const padX = 20; const padY = 20;
                  const points = data.map((d, i) => {
                     const x = padX + (i / (data.length - 1)) * (chartW - padX * 2);
                     return { ...d, x, 
                       yTot: chartH - padY - (d.total / maxVal) * (chartH - padY * 2),
                       yCas: chartH - padY - (d.cash / maxVal) * (chartH - padY * 2),
                       yCar: chartH - padY - (d.card / maxVal) * (chartH - padY * 2) 
                     };
                  });
                  const pathTot = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.yTot}`).join(' ');
                  const areaTot = `${pathTot} L${points[points.length - 1].x},${chartH - padY} L${points[0].x},${chartH - padY} Z`;
                  const pathCas = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.yCas}`).join(' ');
                  const pathCar = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.yCar}`).join(' ');
                  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;
                  
                  return (
                     <div className="h-[260px] w-full relative pl-14 pb-8 select-none">
                        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] font-bold text-gray-400 items-end pr-3 w-14">
                           {[1, 0.8, 0.6, 0.4, 0.2, 0].map(f => <span key={f}>{fmt(Math.round(maxVal * f / 1000) * 1000)}</span>)}
                        </div>
                        <div className="absolute inset-0 left-14 bottom-8 flex flex-col justify-between pointer-events-none">
                           {[0,1,2,3,4,5].map(i => <div key={i} className="border-t border-gray-100 w-full h-0"></div>)}
                        </div>
                        <div className="absolute inset-0 left-14 bottom-8 overflow-visible">
                           <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full cursor-crosshair" preserveAspectRatio="none"
                              onMouseMove={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const mouseX = ((e.clientX - rect.left) / rect.width) * chartW;
                                 let closest = 0; let dist = Infinity;
                                 points.forEach((p, i) => { if (Math.abs(p.x - mouseX) < dist) { dist = Math.abs(p.x - mouseX); closest = i; } });
                                 setHoveredPoint(closest);
                              }}
                              onMouseLeave={() => setHoveredPoint(null)}
                           >
                              <defs>
                                 <linearGradient id="analGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                 </linearGradient>
                              </defs>
                              <path d={areaTot} fill="url(#analGrad)" />
                              <path d={pathTot} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d={pathCas} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 3" />
                              <path d={pathCar} fill="none" stroke="#60a5fa" strokeWidth="1.5" />
                              
                              {points.map((p, i) => (
                                 <g key={i}>
                                    <circle cx={p.x} cy={p.yTot} r={hoveredPoint === i ? 5 : 0} fill="#10b981" stroke="white" strokeWidth="2" style={{ transition: 'r 0.15s' }} />
                                    <circle cx={p.x} cy={p.yCas} r={hoveredPoint === i ? 4 : 0} fill="#ef4444" stroke="white" strokeWidth="1" style={{ transition: 'r 0.15s' }} />
                                    <circle cx={p.x} cy={p.yCar} r={hoveredPoint === i ? 4 : 0} fill="#60a5fa" stroke="white" strokeWidth="1" style={{ transition: 'r 0.15s' }} />
                                 </g>
                              ))}

                              {hoveredPoint !== null && (() => {
                                 const p = points[hoveredPoint];
                                 const tipX = p.x < chartW - 120 ? p.x + 12 : p.x - 110;
                                 const tipY = Math.max(10, p.yTot - 60);
                                 return (
                                    <g pointerEvents="none">
                                       <line x1={p.x} y1={0} x2={p.x} y2={chartH} stroke="#10b981" strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
                                       <rect x={tipX} y={tipY} width={100} height={46} rx={7} ry={7} fill="#111827" opacity={0.93} />
                                       <text x={tipX + 50} y={tipY + 14} textAnchor="middle" fill="#6ee7b7" fontSize={9} fontWeight="bold">{p.label}</text>
                                       <text x={tipX + 50} y={tipY + 28} textAnchor="middle" fill="white" fontSize={10} fontWeight="900">Rs. {p.total.toLocaleString()}</text>
                                       <text x={tipX + 50} y={tipY + 40} textAnchor="middle" fill="#9ca3af" fontSize={8} fontWeight="bold">Ca: {fmt(p.cash)} | Cr: {fmt(p.card)}</text>
                                    </g>
                                 );
                              })()}
                              <rect x={0} y={0} width={chartW} height={chartH} fill="transparent" />
                           </svg>
                        </div>
                        <div className="absolute bottom-0 left-14 w-[calc(100%-56px)] flex justify-between text-[10px] font-bold text-gray-400">
                           {data.map(d => <span key={d.label}>{d.label}</span>)}
                        </div>
                     </div>
                  );
               })()}
            </div>

            {/* 5. SALES BREAKDOWN GRID */}
            <h2 className="text-[14px] font-black text-gray-700 mb-4 uppercase tracking-widest">Sales Breakdown</h2>
            <div className="grid grid-cols-4 gap-5 mb-7">
               {/* By Category */}
               <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">By Category</h4>
                  <div className="space-y-4">
                     {[
                        { title: 'Building Materials', val: 'Rs. 45,240', pct: 45, color: 'bg-emerald-500' },
                        { title: 'Paint & Accessories', val: 'Rs. 25,600', pct: 25, color: 'bg-amber-500' },
                        { title: 'Plumbing', val: 'Rs. 15,200', pct: 15, color: 'bg-cyan-500' },
                        { title: 'Electricals', val: 'Rs. 10,400', pct: 10, color: 'bg-blue-500' },
                        { title: 'Tools', val: 'Rs. 5,100', pct: 5, color: 'bg-indigo-400' },
                     ].map(item => (
                        <div key={item.title}>
                           <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1.5">
                              <span className="truncate pr-2">{item.title}</span>
                              <span className="text-emerald-600 shrink-0">{item.pct}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }}></div>
                           </div>
                           <p className="text-[10px] font-bold text-gray-400 mt-1">{item.val}</p>
                        </div>
                     ))}
                  </div>
               </div>

               {/* By Payment Method - Doughnut */}
               <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 flex flex-col">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">By Payment Method</h4>
                  <div className="flex-1 flex flex-col items-center justify-center">
                     {(() => {
                        const cx = 50; const cy = 50; const r = 38; const innerR = 24;
                        let cumPct = 0;
                        const toRad = (deg: number) => (deg * Math.PI) / 180;
                        const polarToXY = (angle: number, radius: number) => ({
                           x: cx + radius * Math.cos(toRad(angle - 90)),
                           y: cy + radius * Math.sin(toRad(angle - 90)),
                        });
                        const arcPath = (startPct: number, endPct: number, isHovered: boolean) => {
                           const outerR = isHovered ? r + 4 : r;
                           const startAngle = startPct * 360; const endAngle = endPct * 360;
                           const large = endAngle - startAngle > 180 ? 1 : 0;
                           const s = polarToXY(startAngle, outerR); const e = polarToXY(endAngle, outerR);
                           const si = polarToXY(startAngle, innerR); const ei = polarToXY(endAngle, innerR);
                           return `M${s.x},${s.y} A${outerR},${outerR} 0 ${large} 1 ${e.x},${e.y} L${ei.x},${ei.y} A${innerR},${innerR} 0 ${large} 0 ${si.x},${si.y} Z`;
                        };
                        return (
                           <div className="relative w-[140px] h-[140px] mb-5 select-none">
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                 {PAYMENT_CHART_DATA.map((s, i) => {
                                    const startPct = cumPct; cumPct += s.pct / 100; const endPct = cumPct;
                                    const isH = hoveredSlice === i;
                                    const midAngle = (startPct + endPct) / 2 * 360;
                                    const tip = polarToXY(midAngle, isH ? r + 15 : r + 10);
                                    const clampedTipX = Math.max(10, Math.min(90, tip.x));
                                    const clampedTipY = Math.max(8, Math.min(92, tip.y));
                                    return (
                                       <g key={s.label} onMouseEnter={() => setHoveredSlice(i)} onMouseLeave={() => setHoveredSlice(null)} style={{ cursor: 'pointer' }}>
                                          <path d={arcPath(startPct, endPct, isH)} fill={s.color} opacity={hoveredSlice === null || isH ? 1 : 0.6} style={{ transition: 'all 0.2s' }} />
                                          {isH && (
                                             <g pointerEvents="none">
                                                <rect x={clampedTipX - 18} y={clampedTipY - 9} width={36} height={18} rx={3} ry={3} fill="#111827" opacity={0.92} />
                                                <text x={clampedTipX} y={clampedTipY - 2} textAnchor="middle" fill="white" fontSize={5} fontWeight="bold">{s.label}</text>
                                                <text x={clampedTipX} y={clampedTipY + 5} textAnchor="middle" fill="#6ee7b7" fontSize={6} fontWeight="900">{s.pct}%</text>
                                             </g>
                                          )}
                                       </g>
                                    );
                                 })}
                                 <circle cx={cx} cy={cy} r={innerR - 1} fill="white" />
                                 <text x={cx} y={cy - 2} textAnchor="middle" fill="#9ca3af" fontSize={6} fontWeight="bold">TOTAL</text>
                                 <text x={cx} y={cy + 7} textAnchor="middle" fill="#111827" fontSize={9} fontWeight="900">100%</text>
                              </svg>
                           </div>
                        );
                     })()}
                     <div className="grid grid-cols-1 gap-2 w-full text-[11px] font-bold text-gray-600">
                        {PAYMENT_CHART_DATA.map(s => (
                           <span key={s.label} className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${s.fill}`}></span>{s.label}</span><span className="font-black text-gray-900">{s.pct}%</span></span>
                        ))}
                     </div>
                  </div>
               </div>

               {/* By Cashier */}
               <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 flex flex-col">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">By Cashier</h4>
                  <div className="space-y-6 flex-1 flex flex-col justify-center">
                     {[
                        { initials: 'NF', name: 'Nimal Fernando', rev: 'Rs. 54,200', pct: 65, color: 'bg-emerald-500 text-emerald-700', bg: 'bg-emerald-100' },
                        { initials: 'KP', name: 'Kamal Perera', rev: 'Rs. 29,100', pct: 35, color: 'bg-amber-500 text-amber-700', bg: 'bg-amber-100' },
                     ].map(c => (
                        <div key={c.name}>
                           <div className="flex items-center gap-2 mb-2">
                              <span className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center text-[10px] font-black ${c.color.split(' ')[1]}`}>{c.initials}</span>
                              <div className="flex-1 min-w-0">
                                 <p className="text-[12px] font-bold text-gray-700 truncate">{c.name}</p>
                                 <p className="text-[10px] font-bold text-gray-400">{c.rev}</p>
                              </div>
                              <span className="text-[12px] font-black text-gray-900">{c.pct}%</span>
                           </div>
                           <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${c.color.split(' ')[0]} rounded-full transition-all duration-700`} style={{ width: `${c.pct}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* By Branch */}
               <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 flex flex-col">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">By Branch</h4>
                  <div className="flex-1 flex flex-col items-center justify-center">
                     <div className="relative w-[140px] h-[140px] mb-5">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                           <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray={`${2 * Math.PI * 38 * 0.7} ${2 * Math.PI * 38 * 0.3}`} />
                           <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="18" strokeDasharray={`${2 * Math.PI * 38 * 0.3} ${2 * Math.PI * 38 * 0.7}`} strokeDashoffset={-2 * Math.PI * 38 * 0.7} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-[10px] font-bold text-gray-400">2 Branches</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-1 gap-2 w-full text-[11px] font-bold text-gray-600">
                        <span className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Main Branch</span><span className="font-black text-gray-900">70%</span></span>
                        <span className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Colombo</span><span className="font-black text-gray-900">30%</span></span>
                     </div>
                  </div>
               </div>
            </div>

            {/* 6. MID-ROW: PEAK HOURS + SALES SCORE */}
            <div className="grid grid-cols-2 gap-5 mb-7">
               {/* Peak Hours Bar Chart */}
               <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                     <h4 className="text-[14px] font-black text-gray-900">Peak Sales Hours</h4>
                     <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-2 py-1 uppercase">{activeView}</span>
                  </div>
                  {(() => {
                     const bars = PEAK_DATA[activeView] || PEAK_DATA['today'];
                     const maxTxns = Math.max(...bars.map(b => b.txns));
                     const svgW = 400; const svgH = 180;
                     const padLeft = 30; const padRight = 10; const padTop = 15; const xAxisH = 20;
                     const chartAreaH = svgH - padTop - xAxisH;
                     const barW = (svgW - padLeft - padRight) / bars.length;
                     const barPad = barW * 0.2;
                     const yMax = Math.ceil(maxTxns / 10) * 10;
                     const ySteps = 4;
                     return (
                        <div className="relative select-none h-[180px]">
                           <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full cursor-crosshair" preserveAspectRatio="none"
                              onMouseMove={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const mouseX = ((e.clientX - rect.left) / rect.width) * svgW;
                                 let closest = 0; let closestDist = Infinity;
                                 bars.forEach((_, i) => {
                                    const cx = padLeft + i * barW + barW / 2;
                                    if (Math.abs(cx - mouseX) < closestDist) { closestDist = Math.abs(cx - mouseX); closest = i; }
                                 });
                                 setHoveredBar(closest);
                              }}
                              onMouseLeave={() => setHoveredBar(null)}
                           >
                              {Array.from({ length: ySteps + 1 }, (_, idx) => {
                                 const v = Math.round((yMax / ySteps) * idx);
                                 const y = padTop + chartAreaH - (v / yMax) * chartAreaH;
                                 return (
                                    <g key={idx}>
                                       <line x1={padLeft} y1={y} x2={svgW} y2={y} stroke={idx === 0 ? '#e5e7eb' : '#f3f4f6'} strokeWidth={1} />
                                       <text x={padLeft - 5} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize={9} fontWeight="bold">{v}</text>
                                    </g>
                                 );
                              })}
                              {bars.map((bar, i) => {
                                 const barH = Math.max(2, (bar.txns / yMax) * chartAreaH);
                                 const x = padLeft + i * barW + barPad;
                                 const y = padTop + chartAreaH - barH;
                                 const w = barW - barPad * 2;
                                 const isPeak = bar.txns === maxTxns;
                                 const isHovered = hoveredBar === i;
                                 const fill = isPeak ? '#f59e0b' : isHovered ? '#059669' : '#10b981';
                                 return (
                                    <g key={bar.time}>
                                       <rect x={x} y={y} width={w} height={barH} fill={fill} rx={3} ry={3} opacity={hoveredBar === null || isHovered ? 1 : 0.75} style={{ transition: 'all 0.15s' }} />
                                       {isHovered && <text x={x + w / 2} y={Math.max(10, y - 4)} textAnchor="middle" fill={fill} fontSize={9} fontWeight="900" pointerEvents="none">{bar.txns}</text>}
                                       <text x={x + w / 2} y={svgH - 4} textAnchor="middle" fill="#9ca3af" fontSize={8} fontWeight="bold" pointerEvents="none">{bar.time}</text>
                                    </g>
                                 );
                              })}
                              {hoveredBar !== null && (() => {
                                 const bar = bars[hoveredBar];
                                 const barH = Math.max(2, (bar.txns / yMax) * chartAreaH);
                                 const x = padLeft + hoveredBar * barW + barPad;
                                 const w = barW - barPad * 2;
                                 const y = padTop + chartAreaH - barH;
                                 const tipX = Math.max(2, Math.min(svgW - 55, x + w / 2 < svgW - 50 ? x + w / 2 + 5 : x + w / 2 - 58));
                                 const tipY = Math.max(2, y - 25);
                                 return (
                                    <g pointerEvents="none">
                                       <rect x={tipX} y={tipY} width={55} height={22} rx={4} ry={4} fill="#111827" opacity={0.94} />
                                       <text x={tipX + 27.5} y={tipY + 9} textAnchor="middle" fill="#6ee7b7" fontSize={6} fontWeight="bold">{bar.time}</text>
                                       <text x={tipX + 27.5} y={tipY + 18} textAnchor="middle" fill="white" fontSize={8} fontWeight="900">{bar.txns} txns</text>
                                    </g>
                                 );
                              })()}
                              <rect x={0} y={0} width={svgW} height={svgH} fill="transparent" />
                           </svg>
                        </div>
                     );
                  })()}
               </div>

               {/* Sales Score */}
               <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                  <h4 className="text-[14px] font-black text-gray-900 mb-5">Sales Score</h4>
                  <div className="space-y-3">
                     {[
                        { bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Top Product', val: 'Holcim Cement 50kg', sublabel: 'Revenue', subval: 'Rs. 32,500', valColor: 'text-emerald-800', subColor: 'text-emerald-600' },
                        { bg: 'bg-amber-50', border: 'border-amber-100', label: 'Top Customer', val: 'Silva Constructions', sublabel: 'Orders', subval: '24 invoices', valColor: 'text-amber-800', subColor: 'text-amber-600' },
                        { bg: 'bg-blue-50', border: 'border-blue-100', label: 'Avg Invoice Value', val: 'Rs. 4,250.00', sublabel: 'Growth', subval: '+12.5%', valColor: 'text-blue-800', subColor: 'text-blue-600' },
                        { bg: 'bg-purple-50', border: 'border-purple-100', label: 'Payment Success Rate', val: '99.2%', sublabel: 'Failures', subval: '2 today', valColor: 'text-purple-800', subColor: 'text-purple-600' },
                     ].map(s => (
                        <div key={s.label} className={`p-3.5 rounded-xl flex items-center justify-between border ${s.bg} ${s.border}`}>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 mb-0.5">{s.label}</p>
                              <p className={`text-[13px] font-black ${s.valColor}`}>{s.val}</p>
                           </div>
                           <div className="text-right">
                              <p className={`text-[10px] font-bold ${s.subColor}`}>{s.sublabel}</p>
                              <p className={`text-[13px] font-black ${s.subColor}`}>{s.subval}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* 7. DATA TABLES ROW */}
            <div className="grid grid-cols-2 gap-5 mb-7">
               {/* Top 10 Products */}
               <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                     <h4 className="text-[14px] font-black text-gray-900 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Top Selling Products</h4>
                     <button onClick={() => router.push('/inventory')} className="text-[11px] font-bold text-blue-600 hover:underline uppercase tracking-widest">View All →</button>
                  </div>
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-100">
                           <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                           <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rank</th>
                           <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                           <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Revenue</th>
                        </tr>
                     </thead>
                     <tbody className="text-[12.5px]">
                        {TOP_PRODUCTS.map(tr => (
                           <tr key={tr.r} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition cursor-default">
                              <td className="py-3 font-bold text-gray-900">{tr.n}</td>
                              <td className="py-3 text-center"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center mx-auto">#{tr.r}</span></td>
                              <td className="py-3 text-center font-medium text-gray-600">{tr.q}</td>
                              <td className="py-3 font-black text-emerald-600 text-right font-mono">{tr.rev}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Period Comparison */}
               <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-1 mb-5 border-b border-gray-100 overflow-x-auto">
                     {[
                        { key: 'today', label: 'Today vs Yesterday' },
                        { key: 'week', label: 'Week vs Prev Week' },
                        { key: 'month', label: 'Month vs Prev Month' },
                     ].map(tab => (
                        <button key={tab.key} onClick={() => setCompTab(tab.key as any)} className={`pb-3 px-3 text-[12px] font-bold transition whitespace-nowrap border-b-2 ${compTab === tab.key ? 'text-emerald-700 border-emerald-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
                           {tab.label}
                        </button>
                     ))}
                  </div>
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-100">
                           <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Metric</th>
                           <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current</th>
                           <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Previous</th>
                           <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Change</th>
                        </tr>
                     </thead>
                     <tbody className="text-[12.5px]">
                        {COMPARISON_DATA[compTab].map(row => (
                           <tr key={row.metric} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                              <td className="py-3 font-bold text-gray-900">{row.metric}</td>
                              <td className="py-3 font-bold text-gray-900">{row.today}</td>
                              <td className="py-3 text-gray-400 font-medium">{row.prev}</td>
                              <td className="py-3 text-right">
                                 <span className={`flex items-center gap-1 justify-end font-bold ${row.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {row.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />} {row.change}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* 8. TRANSACTIONS TABLE WITH LIVE SEARCH + PAGINATION */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6 mb-7">
               <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                  <h4 className="text-[14px] font-black text-gray-900">Transaction Details</h4>
                  <div className="flex gap-2 flex-wrap">
                     <div className="border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 bg-gray-50/50">
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <input
                           type="text"
                           value={searchQuery}
                           onChange={e => { setSearchQuery(e.target.value); setTxnPage(1); }}
                           placeholder="Search by invoice, customer, type..."
                           className="text-[12px] font-medium outline-none border-none bg-transparent w-[220px] placeholder:text-gray-400"
                        />
                        {searchQuery && (
                           <button onClick={() => { setSearchQuery(''); setTxnPage(1); }} className="text-gray-400 hover:text-gray-600">
                              <X className="w-3.5 h-3.5" />
                           </button>
                        )}
                     </div>
                  </div>
               </div>

               {filteredTxns.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-[13px] font-bold">No transactions match your search.</div>
               ) : (
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                           <th className="py-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                           <th className="py-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                           <th className="py-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                           <th className="py-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                           <th className="py-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                           <th className="py-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                           <th className="py-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                        </tr>
                     </thead>
                     <tbody className="text-[12.5px]">
                        {pagedTxns.map(t => (
                           <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer">
                              <td className="py-3 px-2 font-medium text-gray-500">{t.time}</td>
                              <td className="py-3 px-2 font-bold text-emerald-600">{t.id}</td>
                              <td className="py-3 px-2 font-bold text-gray-900">{t.customer}</td>
                              <td className="py-3 px-2 text-gray-600">{t.items}</td>
                              <td className={`py-3 px-2 font-mono font-bold ${t.amount < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                                 {t.amount < 0 ? '- ' : ''}Rs. {Math.abs(t.amount).toLocaleString()}
                              </td>
                              <td className="py-3 px-2">
                                 <span className={`font-bold ${t.type === 'Return' ? 'text-red-500' : t.type === 'Mobile' ? 'text-purple-500' : t.type === 'Card' ? 'text-blue-500' : 'text-emerald-500'}`}>{t.type}</span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                 <span className={`text-[10px] px-2 py-1 rounded-lg font-black ${t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}

               {filteredTxns.length > 0 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                     <span className="text-[11px] font-bold text-gray-400">
                        Showing {(txnPage - 1) * TXNS_PER_PAGE + 1}–{Math.min(txnPage * TXNS_PER_PAGE, filteredTxns.length)} of {filteredTxns.length}
                     </span>
                     <div className="flex gap-1">
                        <button disabled={txnPage === 1} onClick={() => setTxnPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                           <button key={i} onClick={() => setTxnPage(i + 1)} className={`px-3 py-1.5 rounded text-[11px] font-bold transition ${txnPage === i + 1 ? 'bg-emerald-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{i + 1}</button>
                        ))}
                        <button disabled={txnPage === totalPages} onClick={() => setTxnPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded text-[11px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
                     </div>
                  </div>
               )}
            </div>

            {/* 9. SUMMARY & INSIGHTS */}
            <h2 className="text-[14px] font-black text-gray-900 mb-4 tracking-tight">Summary & Insights</h2>
            <div className="grid grid-cols-3 gap-5 mb-8">
               <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                  <h4 className="flex items-center gap-2 text-[12px] font-black text-emerald-800 mb-4 uppercase tracking-widest"><CheckCircle className="w-4 h-4 text-emerald-500" /> Performance Highlights</h4>
                  <ul className="space-y-3">
                     {['Total Sales exceed daily average by 9.8% — strong momentum.', 'Peak sales volume 12:00–13:00. Assign extra cashiers during this window.', 'Gross profit margin improved +10.2%. Cost control is effective.'].map(l => (
                        <li key={l} className="flex items-start gap-2 text-[12px] font-bold text-emerald-700 leading-relaxed">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span> {l}
                        </li>
                     ))}
                  </ul>
               </div>
               <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <h4 className="flex items-center gap-2 text-[12px] font-black text-amber-800 mb-4 uppercase tracking-widest"><AlertCircle className="w-4 h-4 text-amber-500" /> Areas of Attention</h4>
                  <ul className="space-y-3">
                     {['Return rate rose slightly by +0.4%. Investigate the cause before EoD.', 'High cart abandonment detected during the 14:00–15:00 window.', 'Paint & Accessories category sales are down by 2.1% compared to yesterday.'].map(l => (
                        <li key={l} className="flex items-start gap-2 text-[12px] font-bold text-amber-700 leading-relaxed">
                           <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span> {l}
                        </li>
                     ))}
                  </ul>
               </div>
               <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <h4 className="flex items-center gap-2 text-[12px] font-black text-blue-800 mb-4 uppercase tracking-widest"><Info className="w-4 h-4 text-blue-500" /> Recommendations</h4>
                  <ul className="space-y-3">
                     {['Deploy additional staff to tills during the peak 12:00 window.', 'Run targeted promotions on Paint & Accessories to reverse the dip.', 'Investigate structural returns reported on Cement (Batch #HCM-22).'].map(l => (
                        <li key={l} className="flex items-start gap-2 text-[12px] font-bold text-blue-700 leading-relaxed">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span> {l}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* 10. FOOTER ACTION BUTTONS */}
            <div className="flex items-center gap-3 flex-wrap">
               <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-black shadow-md transition-all shadow-emerald-600/20">
                  <FileText className="w-4 h-4" /> Export PDF Report
               </button>
               <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-[13px] font-black shadow-sm transition-all">
                  <Download className="w-4 h-4" /> Download Excel / CSV
               </button>
               <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-[13px] font-black shadow-sm transition-all">
                  <Printer className="w-4 h-4" /> Print Report
               </button>
               <button onClick={() => router.push('/sales/dashboard')} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-[13px] font-black shadow-sm transition-all ml-auto">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
               </button>
               <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-gray-500 rounded-xl text-[12px] font-bold transition-all">
                  <ShieldAlert className="w-4 h-4" /> Admin Controls
               </button>
            </div>
         </div>

         {/* 11. PRINT LAYOUT: BLUE FINANCIAL AUDIT PDF */}
         <div className="hidden print:block w-full bg-white text-blue-900 font-sans p-8">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-900 pb-6 mb-8">
               <div>
                  <h1 className="text-[28px] font-black text-blue-900 tracking-tight">Financial Sales Audit</h1>
                  <p className="text-[14px] font-bold text-blue-700 mt-1">Official Detailed Report</p>
               </div>
               <div className="text-right">
                  <h2 className="text-[20px] font-black text-blue-900 tracking-tight">Period: {dateLabel}</h2>
                  <p className="text-[12px] font-bold text-gray-500 mt-1">Generated: {format(new Date(), 'PPpp')}</p>
               </div>
            </div>

            {/* Summary Insights */}
            <div className="grid grid-cols-3 gap-6 mb-10">
               <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h4 className="text-[12px] font-black text-blue-900 uppercase tracking-widest mb-2">Total Revenue</h4>
                  <p className="text-[24px] font-black text-blue-900">Rs. {(filteredTxns.reduce((a, b) => a + b.amount, 0)).toLocaleString()}</p>
               </div>
               <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h4 className="text-[12px] font-black text-blue-900 uppercase tracking-widest mb-2">Total Transactions</h4>
                  <p className="text-[24px] font-black text-blue-900">{filteredTxns.length}</p>
               </div>
               <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h4 className="text-[12px] font-black text-blue-900 uppercase tracking-widest mb-2">Filters Applied</h4>
                  <p className="text-[12px] font-bold text-blue-700">{selectedBranch} | {selectedCashier} | {selectedCategory}</p>
               </div>
            </div>

            {/* 01. Transaction Breakdown */}
            <h3 className="text-[18px] font-black text-blue-900 mb-4 tracking-tight border-b border-blue-200 pb-2">01. Transaction Breakdown</h3>
            <table className="w-full text-left bg-white border-collapse mb-10">
               <thead>
                  <tr className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                     <th className="py-2.5 px-3 text-[11px] font-black uppercase tracking-widest border border-blue-800">Time</th>
                     <th className="py-2.5 px-3 text-[11px] font-black uppercase tracking-widest border border-blue-800">Invoice</th>
                     <th className="py-2.5 px-3 text-[11px] font-black uppercase tracking-widest border border-blue-800">Customer</th>
                     <th className="py-2.5 px-3 text-[11px] font-black uppercase tracking-widest border border-blue-800">Type</th>
                     <th className="py-2.5 px-3 text-[11px] font-black uppercase tracking-widest text-right border border-blue-800">Amount</th>
                  </tr>
               </thead>
               <tbody className="text-[12px]">
                  {filteredTxns.map((t, i) => (
                     <tr key={t.id} className={i % 2 === 0 ? 'bg-blue-50/30' : 'bg-white'}>
                        <td className="py-2 px-3 border border-blue-200 text-blue-900 font-bold">{t.time}</td>
                        <td className="py-2 px-3 border border-blue-200 text-blue-900 font-black">{t.id}</td>
                        <td className="py-2 px-3 border border-blue-200 text-blue-800 font-medium">{t.customer}</td>
                        <td className="py-2 px-3 border border-blue-200 text-blue-700 font-bold">{t.type}</td>
                        <td className="py-2 px-3 border border-blue-200 text-right text-blue-900 font-black font-mono">
                           Rs. {t.amount.toLocaleString()}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {/* 02. Sales Breakdown & Performance */}
            <div className="grid grid-cols-2 gap-8 mb-10 print:break-inside-avoid">
               <div>
                  <h3 className="text-[18px] font-black text-blue-900 mb-4 tracking-tight border-b border-blue-200 pb-2">02. Top Selling Products</h3>
                  <table className="w-full text-left bg-white border-collapse shrink-0">
                     <thead className="bg-blue-100 text-blue-900">
                        <tr>
                           <th className="py-2 px-2 text-[10px] font-black uppercase tracking-widest">Rank</th>
                           <th className="py-2 px-2 text-[10px] font-black uppercase tracking-widest">Product</th>
                           <th className="py-2 px-2 text-[10px] font-black uppercase tracking-widest text-center">Qty</th>
                           <th className="py-2 px-2 text-[10px] font-black uppercase tracking-widest text-right">Revenue</th>
                        </tr>
                     </thead>
                     <tbody className="text-[11px]">
                        {TOP_PRODUCTS.map(tr => (
                           <tr key={tr.r} className="border-b border-blue-100">
                              <td className="py-2 px-2 font-black text-blue-900">#{tr.r}</td>
                              <td className="py-2 px-2 font-bold text-blue-800">{tr.n}</td>
                              <td className="py-2 px-2 text-center text-blue-700">{tr.q}</td>
                              <td className="py-2 px-2 text-right font-black text-blue-900 font-mono">{tr.rev}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div>
                  <h3 className="text-[18px] font-black text-blue-900 mb-4 tracking-tight border-b border-blue-200 pb-2">03. Performance Metrics</h3>
                  <table className="w-full text-left bg-white border-collapse shrink-0">
                     <thead className="bg-blue-100 text-blue-900">
                        <tr>
                           <th className="py-2 px-2 text-[10px] font-black uppercase tracking-widest">Metric</th>
                           <th className="py-2 px-2 text-[10px] font-black uppercase tracking-widest">Current</th>
                           <th className="py-2 px-2 text-[10px] font-black uppercase tracking-widest text-right">Change</th>
                        </tr>
                     </thead>
                     <tbody className="text-[11px]">
                        {COMPARISON_DATA[compTab].map(row => (
                           <tr key={row.metric} className="border-b border-blue-100">
                              <td className="py-2 px-2 font-bold text-blue-900">{row.metric}</td>
                              <td className="py-2 px-2 font-bold text-blue-800">{row.today}</td>
                              <td className="py-2 px-2 text-right font-black text-blue-900">{row.up ? '+' : ''}{row.change}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Subtotals & Signatures */}
            <div className="flex justify-between items-end mt-16 pt-8 border-t-2 border-blue-900">
               <div className="flex gap-16">
                  <div className="text-center">
                     <div className="w-48 border-b-2 border-blue-900 mb-2"></div>
                     <p className="text-[11px] font-black text-blue-900 uppercase">Prepared By (Cashier)</p>
                  </div>
                  <div className="text-center">
                     <div className="w-48 border-b-2 border-blue-900 mb-2"></div>
                     <p className="text-[11px] font-black text-blue-900 uppercase">Authorized By (Manager)</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">End of Report</p>
                  <p className="text-[12px] font-bold text-blue-800">System Verified Audit</p>
               </div>
            </div>
         </div>
      </MainLayout>
   );
}
