'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { BarChart3, ShoppingBag, CreditCard, ChevronDown, Clock, Eye, Edit2, TrendingUp, TrendingDown, Package, Activity, Search, Filter, X, SlidersHorizontal, Plus } from 'lucide-react';
import TransactionDetailsModal from '@/components/sales/TransactionDetailsModal';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const ALL_TRANSACTIONS = [
  { id: 'INV-001245', time: '14:45', customer: 'John Silva', items: 3, amount: 4250.50, type: 'Sale', status: 'Completed' },
  { id: 'INV-001244', time: '14:38', customer: 'Walk-in Customer', items: 2, amount: 1850.00, type: 'Quick Sale', status: 'Completed' },
  { id: 'RET-000892', time: '14:25', customer: 'Silva Constructions', items: 1, amount: -2180.00, type: 'Return', status: 'Completed' },
  { id: 'INV-001243', time: '14:10', customer: 'Walk-in Customer', items: 5, amount: 12450.00, type: 'Sale', status: 'Completed' },
  { id: 'INV-001242', time: '13:55', customer: 'Kamal Perera', items: 1, amount: 450.00, type: 'Credit Sale', status: 'Pending' },
  { id: 'INV-001241', time: '13:42', customer: 'Walk-in Customer', items: 8, amount: 8900.00, type: 'Sale', status: 'Completed' },
  { id: 'INV-001240', time: '13:20', customer: 'ABC Hardware', items: 15, amount: 45000.00, type: 'Bulk Sale', status: 'Completed' },
  { id: 'INV-001239', time: '13:05', customer: 'Walk-in Customer', items: 2, amount: 1200.00, type: 'Sale', status: 'Completed' },
  { id: 'INV-001238', time: '12:50', customer: 'Nimal Fernando', items: 4, amount: 5600.00, type: 'Sale', status: 'Completed' },
  { id: 'INV-001237', time: '12:35', customer: 'Walk-in Customer', items: 1, amount: 850.00, type: 'Quick Sale', status: 'Completed' },
  { id: 'INV-001236', time: '12:10', customer: 'Perera Builders', items: 10, amount: 28000.00, type: 'Bulk Sale', status: 'Completed' },
  { id: 'INV-001235', time: '11:55', customer: 'Walk-in Customer', items: 2, amount: 3200.00, type: 'Sale', status: 'Completed' },
  { id: 'INV-001234', time: '11:30', customer: 'Ravi Kumar', items: 1, amount: 750.00, type: 'Quick Sale', status: 'Pending' },
  { id: 'INV-001233', time: '11:10', customer: 'Walk-in Customer', items: 6, amount: 9100.00, type: 'Sale', status: 'Completed' },
  { id: 'INV-001232', time: '10:50', customer: 'City Constructions', items: 20, amount: 65000.00, type: 'Bulk Sale', status: 'Completed' },
];

const ITEMS_PER_PAGE = 5;

const chartRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'];
const trendRanges = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'];
const peakRanges = ['Last 24 Hours', 'Last 7 Days', 'This Month'];

// Dynamic chart data for each trend range
const TREND_DATA: Record<string, { label: string; value: number }[]> = {
  'Last 24 Hours': [
    { label: '09:00', value: 8200 },
    { label: '10:00', value: 11500 },
    { label: '11:00', value: 14800 },
    { label: '12:00', value: 18900 },
    { label: '13:00', value: 16200 },
    { label: '14:00', value: 13400 },
    { label: '15:00', value: 10100 },
  ],
  'Last 7 Days': [
    { label: 'Mon', value: 45000 },
    { label: 'Tue', value: 62000 },
    { label: 'Wed', value: 58000 },
    { label: 'Thu', value: 74000 },
    { label: 'Fri', value: 88000 },
    { label: 'Sat', value: 95000 },
    { label: 'Sun', value: 71000 },
  ],
  'Last 30 Days': [
    { label: 'W1', value: 210000 },
    { label: 'W2', value: 285000 },
    { label: 'W3', value: 260000 },
    { label: 'W4', value: 320000 },
  ],
};

// Sales by Type dynamic data
const CHART_DATA: Record<string, { label: string; pct: number; color: string; fill: string }[]> = {
  'Today': [
    { label: 'Regular Sale', pct: 55, color: '#10b981', fill: 'bg-emerald-500' },
    { label: 'Quick Sale',   pct: 20, color: '#f59e0b', fill: 'bg-amber-500'  },
    { label: 'Credit Sale',  pct: 15, color: '#06b6d4', fill: 'bg-cyan-500'   },
    { label: 'Bulk Sale',    pct: 10, color: '#8b5cf6', fill: 'bg-purple-500' },
  ],
  'Last 7 Days': [
    { label: 'Regular Sale', pct: 60, color: '#10b981', fill: 'bg-emerald-500' },
    { label: 'Quick Sale',   pct: 15, color: '#f59e0b', fill: 'bg-amber-500'  },
    { label: 'Credit Sale',  pct: 15, color: '#06b6d4', fill: 'bg-cyan-500'   },
    { label: 'Bulk Sale',    pct: 10, color: '#8b5cf6', fill: 'bg-purple-500' },
  ],
  'Last 30 Days': [
    { label: 'Regular Sale', pct: 48, color: '#10b981', fill: 'bg-emerald-500' },
    { label: 'Quick Sale',   pct: 22, color: '#f59e0b', fill: 'bg-amber-500'  },
    { label: 'Credit Sale',  pct: 18, color: '#06b6d4', fill: 'bg-cyan-500'   },
    { label: 'Bulk Sale',    pct: 12, color: '#8b5cf6', fill: 'bg-purple-500' },
  ],
  'This Month': [
    { label: 'Regular Sale', pct: 52, color: '#10b981', fill: 'bg-emerald-500' },
    { label: 'Quick Sale',   pct: 18, color: '#f59e0b', fill: 'bg-amber-500'  },
    { label: 'Credit Sale',  pct: 20, color: '#06b6d4', fill: 'bg-cyan-500'   },
    { label: 'Bulk Sale',    pct: 10, color: '#8b5cf6', fill: 'bg-purple-500' },
  ],
};

const CHART_TOTALS: Record<string, number> = {
  'Today': 145, 'Last 7 Days': 892, 'Last 30 Days': 3420, 'This Month': 3980,
};

// Peak hours dynamic data
const PEAK_DATA: Record<string, { time: string; txns: number }[]> = {
  'Last 24 Hours': [
    { time: '09:00', txns: 14 }, { time: '10:00', txns: 22 }, { time: '11:00', txns: 30 },
    { time: '12:00', txns: 40 }, { time: '13:00', txns: 32 }, { time: '14:00', txns: 26 }, { time: '15:00', txns: 18 },
  ],
  'Last 7 Days': [
    { time: 'Mon', txns: 85 }, { time: 'Tue', txns: 120 }, { time: 'Wed', txns: 98 },
    { time: 'Thu', txns: 145 }, { time: 'Fri', txns: 160 }, { time: 'Sat', txns: 190 }, { time: 'Sun', txns: 130 },
  ],
  'This Month': [
    { time: 'W1', txns: 320 }, { time: 'W2', txns: 410 }, { time: 'W3', txns: 380 }, { time: 'W4', txns: 480 },
  ],
};

export default function SalesDashboardPage() {
  const router = useRouter();
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'view' | 'edit'>('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [chartRange, setChartRange] = useState('Last 7 Days');
  const [trendRange, setTrendRange] = useState('Last 24 Hours');
  const [peakRange, setPeakRange] = useState('Last 24 Hours');
  const [clock, setClock] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pendingType, setPendingType] = useState('All');
  const [pendingStatus, setPendingStatus] = useState('All');
  const [appliedType, setAppliedType] = useState('All');
  const [appliedStatus, setAppliedStatus] = useState('All');

  const hasActiveFilter = appliedType !== 'All' || appliedStatus !== 'All';

  const applyFilters = () => {
    setAppliedType(pendingType);
    setAppliedStatus(pendingStatus);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setPendingType('All');
    setPendingStatus('All');
    setAppliedType('All');
    setAppliedStatus('All');
    setCurrentPage(1);
  };

  const openFilterModal = () => {
    setPendingType(appliedType);
    setPendingStatus(appliedStatus);
    setShowFilterModal(true);
  };

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-GB'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Filtered transactions (search + filters)
  const filteredTransactions = ALL_TRANSACTIONS.filter(tx => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || tx.id.toLowerCase().includes(q) || tx.customer.toLowerCase().includes(q) || tx.type.toLowerCase().includes(q);
    const matchType = appliedType === 'All' || tx.type === appliedType;
    const matchStatus = appliedStatus === 'All' || tx.status === appliedStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTxns = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openModal = (id: string, tab: 'view' | 'edit' = 'view') => {
    setSelectedTxn(id);
    setModalTab(tab);
  };

  return (
    <MainLayout>

      <div className="max-w-[1400px] mx-auto py-8 space-y-6">

        {/* TOP ACTIONS */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-black text-gray-900 tracking-tight">Sales Dashboard</h1>
            <p className="text-[13px] font-bold text-gray-400">Manage transactions and monitor performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/sales/analytics')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-100 rounded-xl text-[13px] font-black text-emerald-700 shadow-sm hover:bg-emerald-50 transition-all"
            >
              <BarChart3 className="w-4 h-4" /> View Analytics
            </button>
            <button
              onClick={() => router.push('/inventory')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-black text-gray-600 shadow-sm hover:bg-gray-50 transition-all"
            >
              <Package className="w-4 h-4" /> Check Inventory
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-4 gap-6">
          {[
            { icon: ShoppingBag, color: 'emerald', label: "Today's Sales", val: 'Rs. 125,450', sub: 'From yesterday', badge: '+15.2%', up: true },
            { icon: CreditCard, color: 'amber', label: 'Transactions', val: '145', sub: 'Today so far', badge: '+12 new', up: true },
            { icon: Activity, color: 'blue', label: 'Avg Order Value', val: 'Rs. 865.17', sub: 'Per transaction', badge: '+2.8%', up: true },
            { icon: Clock, color: 'amber', label: 'Pending Orders', val: '8', sub: 'Awaiting pickup', badge: 'Action needed', up: false },
          ].map((card) => {
            const Icon = card.icon;
            const colorMap: Record<string, string> = { emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600' };
            const badgeColor = card.up ? 'text-emerald-500' : 'text-amber-500';
            return (
              <div key={card.label} className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[card.color]}`}><Icon className="w-4 h-4" /></div>
                  <span className={`text-[12px] font-bold flex items-center gap-1 ${badgeColor}`}>
                    {card.up ? <TrendingUp className="w-3 h-3" /> : null}{card.badge}
                  </span>
                </div>
                <p className="text-[12px] font-bold text-gray-400 mb-1">{card.label}</p>
                <h3 className="text-[26px] font-black text-gray-900 mb-1">{card.val}</h3>
                <p className="text-[11px] font-bold text-gray-400 mb-4">{card.sub}</p>
                <button onClick={() => router.push('/sales/analytics')} className="w-full text-center text-[12px] font-black text-emerald-600 hover:text-emerald-700 transition">View All →</button>
              </div>
            );
          })}
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden relative">

          {/* Filter Modal Overlay */}
          {showFilterModal && (
            <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowFilterModal(false)}>
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[360px] p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-[15px] font-black text-gray-900">Filter Transactions</h3>
                  </div>
                  <button onClick={() => setShowFilterModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Transaction Type */}
                <div className="mb-5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Transaction Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Sale', 'Quick Sale', 'Credit Sale', 'Bulk Sale', 'Return'].map(t => (
                      <button key={t} onClick={() => setPendingType(t)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${
                          pendingType === t ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Status</label>
                  <div className="flex gap-2">
                    {['All', 'Completed', 'Pending'].map(s => (
                      <button key={s} onClick={() => setPendingStatus(s)}
                        className={`px-4 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${
                          pendingStatus === s ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-emerald-300'
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button onClick={() => { setPendingType('All'); setPendingStatus('All'); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition">Reset</button>
                  <button onClick={applyFilters} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-black shadow-sm shadow-emerald-600/20 transition">Apply Filters</button>
                </div>
              </div>
            </div>
          )}

          {/* TABLE HEADER WITH SEARCH + FILTER */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[14px] font-black text-gray-900">Today's Transactions</h3>
              <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredTransactions.length} total</span>
              {/* Active filter chips */}
              {hasActiveFilter && (
                <div className="flex items-center gap-2">
                  {appliedType !== 'All' && <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">{appliedType} <button onClick={clearFilters}><X className="w-2.5 h-2.5" /></button></span>}
                  {appliedStatus !== 'All' && <span className="flex items-center gap-1 text-[11px] font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">{appliedStatus} <button onClick={clearFilters}><X className="w-2.5 h-2.5" /></button></span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Search Input */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search invoice, customer..."
                  className="text-[12.5px] font-medium outline-none border-none bg-transparent w-[190px] placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="text-gray-400 hover:text-gray-600 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Filter Button – toggles between Filter and Clear */}
              {hasActiveFilter ? (
                <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[12.5px] font-black hover:bg-red-100 transition-all">
                  <X className="w-3.5 h-3.5" /> Clear Filter
                </button>
              ) : (
                <button onClick={openFilterModal} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[12.5px] font-black hover:bg-gray-50 transition-all">
                  <Filter className="w-3.5 h-3.5" /> Filter
                </button>
              )}
            </div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice #</th>
                <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="py-3 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
            {paginatedTxns.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <p className="text-[13px] font-bold text-gray-400">No transactions match your search or filters.</p>
                    <button onClick={() => { setSearchQuery(''); clearFilters(); }} className="mt-1 text-[12px] font-black text-emerald-600 hover:underline">Clear all & reset</button>
                  </div>
                </td>
              </tr>
            ) : paginatedTxns.map((tx) => (
               <tr
                 key={tx.id}
                 onClick={() => openModal(tx.id, 'view')}
                 className="border-b border-gray-50 last:border-0 hover:bg-emerald-50/30 transition-all cursor-pointer"
               >
                 <td className="py-4 px-6 font-medium text-gray-500">{tx.time}</td>
                 <td className="py-4 px-6 font-bold text-emerald-600">{tx.id}</td>
                 <td className="py-4 px-6 font-medium text-gray-900">{tx.customer}</td>
                 <td className="py-4 px-6 font-medium text-gray-600">{tx.items}</td>
                 <td className={`py-4 px-6 font-mono font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                   {tx.amount < 0 ? '- ' : ''}Rs. {Math.abs(tx.amount).toLocaleString()}
                 </td>
                 <td className="py-4 px-6">
                   <span className={`font-bold ${tx.type === 'Return' ? 'text-red-500' : tx.type === 'Credit Sale' ? 'text-amber-500' : 'text-emerald-500'}`}>{tx.type}</span>
                 </td>
                 <td className="py-4 px-6">
                   <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${tx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{tx.status}</span>
                 </td>
                 <td className="py-4 px-6">
                   <div className="flex items-center gap-2">
                     <button onClick={(e) => { e.stopPropagation(); openModal(tx.id, 'view'); }} className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center hover:bg-emerald-100 transition-all" title="View"><Eye className="w-3.5 h-3.5 text-gray-500" /></button>
                     <button onClick={(e) => { e.stopPropagation(); openModal(tx.id, 'edit'); }} className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center hover:bg-blue-100 transition-all" title="Edit"><Edit2 className="w-3.5 h-3.5 text-gray-500" /></button>
                   </div>
                 </td>
               </tr>
            ))}
            </tbody>
          </table>
          <div className="p-4 px-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <span className="text-[12px] font-bold text-gray-400">
              {filteredTransactions.length === 0
                ? 'No results found'
                : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of ${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''}`
              }
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >Previous</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 rounded text-[12px] font-bold transition ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >{i + 1}</button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded text-[12px] font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >Next</button>
            </div>
          </div>
        </div>

        {/* ROW 1 CHARTS */}
        <div className="grid grid-cols-[350px_1fr] gap-6">
          {/* SVG Pie Chart — Dynamic */}
          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-black text-gray-900">Sales by Type</h3>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-1 text-[12px] font-bold text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition">
                    {chartRange} <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="bg-white min-w-[160px] p-1.5 rounded-xl shadow-xl border border-gray-100 z-50" sideOffset={6}>
                    {chartRanges.map(r => (
                      <DropdownMenu.Item key={r} onClick={() => { setChartRange(r); setHoveredSlice(null); }} className={`px-3 py-2 text-[12px] font-bold rounded-lg cursor-pointer outline-none ${chartRange === r ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}>{r}</DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
            {(() => {
              const slices = CHART_DATA[chartRange] || CHART_DATA['Last 7 Days'];
              const total = CHART_TOTALS[chartRange] || 145;
              const cx = 100; const cy = 100; const r = 75; const innerR = 46;
              let cumPct = 0;

              // Build SVG arcs
              const toRad = (deg: number) => (deg * Math.PI) / 180;
              const polarToXY = (angle: number, radius: number) => ({
                x: cx + radius * Math.cos(toRad(angle - 90)),
                y: cy + radius * Math.sin(toRad(angle - 90)),
              });
              const arcPath = (startPct: number, endPct: number, isHovered: boolean) => {
                const outerR = isHovered ? r + 6 : r;
                const startAngle = startPct * 360;
                const endAngle   = endPct   * 360;
                const large = endAngle - startAngle > 180 ? 1 : 0;
                const s = polarToXY(startAngle, outerR);
                const e = polarToXY(endAngle, outerR);
                const si = polarToXY(startAngle, innerR);
                const ei = polarToXY(endAngle, innerR);
                return `M${s.x},${s.y} A${outerR},${outerR} 0 ${large} 1 ${e.x},${e.y} L${ei.x},${ei.y} A${innerR},${innerR} 0 ${large} 0 ${si.x},${si.y} Z`;
              };

              return (
                <div className="flex flex-col items-center">
                  <div className="relative" style={{ width: 200, height: 200 }}>
                    <svg viewBox="0 0 200 200" width={200} height={200}>
                      {slices.map((s, i) => {
                        const startPct = cumPct;
                        cumPct += s.pct / 100;
                        const endPct = cumPct;
                        const isH = hoveredSlice === i;
                        // Tooltip position: midpoint of arc
                        const midAngle = (startPct + endPct) / 2 * 360;
                        const tipR = isH ? r + 28 : r + 20;
                        const tip = polarToXY(midAngle, tipR);
                        const clampedTipX = Math.max(20, Math.min(180, tip.x));
                        const clampedTipY = Math.max(12, Math.min(190, tip.y));
                        return (
                          <g key={s.label}
                            onMouseEnter={() => setHoveredSlice(i)}
                            onMouseLeave={() => setHoveredSlice(null)}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            <path
                              d={arcPath(startPct, endPct, isH)}
                              fill={s.color}
                              opacity={hoveredSlice === null || isH ? 1 : 0.6}
                              style={{ transition: 'opacity 0.2s' }}
                            />
                            {isH && (
                              <g pointerEvents="none">
                                <rect
                                  x={clampedTipX - 28} y={clampedTipY - 14}
                                  width={56} height={26} rx={5} ry={5}
                                  fill="#111827" opacity={0.92}
                                />
                                <text x={clampedTipX} y={clampedTipY - 3} textAnchor="middle" fill="white" fontSize={7.5} fontWeight="bold">{s.label}</text>
                                <text x={clampedTipX} y={clampedTipY + 7} textAnchor="middle" fill="#6ee7b7" fontSize={9} fontWeight="900">{s.pct}%</text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                      {/* Centre label */}
                      <circle cx={cx} cy={cy} r={innerR - 1} fill="white" />
                      <text x={cx} y={cy - 5} textAnchor="middle" fill="#9ca3af" fontSize={8} fontWeight="bold">TOTAL</text>
                      <text x={cx} y={cy + 9} textAnchor="middle" fill="#111827" fontSize={14} fontWeight="900">{total.toLocaleString()}</text>
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full mt-4">
                    {slices.map(s => (
                      <div key={s.label} className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 ${s.fill} rounded-sm shrink-0`}></span>
                        <span className="text-[11px] font-bold text-gray-600 truncate">{s.label}</span>
                        <span className="text-[11px] font-black text-gray-400 ml-auto">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sales Trend Line Graph — Dynamic */}
          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[14px] font-black text-gray-900">Sales Trend</h3>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-1 text-[12px] font-bold text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition">
                    {trendRange} <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content className="bg-white min-w-[160px] p-1.5 rounded-xl shadow-xl border border-gray-100 z-50" sideOffset={6}>
                    {trendRanges.map(r => (
                      <DropdownMenu.Item key={r} onClick={() => { setTrendRange(r); setHoveredPoint(null); }} className={`px-3 py-2 text-[12px] font-bold rounded-lg cursor-pointer outline-none ${trendRange === r ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}>{r}</DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
            {(() => {
              const data = TREND_DATA[trendRange] || TREND_DATA['Last 24 Hours'];
              const maxVal = Math.max(...data.map(d => d.value));
              const chartH = 180;
              const chartW = 700;
              const padX = 20;
              const points = data.map((d, i) => ({
                x: padX + (i / (data.length - 1)) * (chartW - padX * 2),
                y: chartH - (d.value / maxVal) * chartH * 0.85,
                ...d,
              }));
              const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
              const areaD = `${pathD} L${points[points.length - 1].x},${chartH} L${points[0].x},${chartH} Z`;
              const yMax = maxVal > 50000 ? Math.ceil(maxVal / 100000) * 100 : Math.ceil(maxVal / 5000) * 5;
              const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;
              return (
                <div className="flex-1 relative ml-10 min-h-[220px] select-none">
                  {/* Y Axis labels */}
                  <div className="absolute left-[-40px] top-0 bottom-8 flex flex-col justify-between text-[10px] font-bold text-gray-400 items-end">
                    {[1, 0.75, 0.5, 0.25, 0].map(f => (
                      <span key={f}>{fmt(Math.round(maxVal * f / 1000) * 1000)}</span>
                    ))}
                  </div>
                  {/* Grid lines */}
                  <div className="absolute inset-0 bottom-8 flex flex-col justify-between border-l border-gray-100 pointer-events-none">
                    {[0,1,2,3].map(i => <div key={i} className="border-t border-gray-100 w-full h-0"></div>)}
                    <div className="border-t border-gray-200 w-full h-0"></div>
                  </div>
                  {/* SVG Chart — hover anywhere to snap to nearest point */}
                  <div className="absolute inset-0 bottom-8 overflow-visible">
                    <svg
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      className="w-full h-full cursor-crosshair"
                      preserveAspectRatio="none"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const mouseX = ((e.clientX - rect.left) / rect.width) * chartW;
                        // Find nearest point by X distance
                        let closestIdx = 0;
                        let closestDist = Infinity;
                        points.forEach((p, i) => {
                          const dist = Math.abs(p.x - mouseX);
                          if (dist < closestDist) { closestDist = dist; closestIdx = i; }
                        });
                        setHoveredPoint(closestIdx);
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <defs>
                        <linearGradient id="trendGradDyn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Area fill */}
                      <path d={areaD} fill="url(#trendGradDyn)" />
                      {/* Line */}
                      <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* All data point dots — always visible */}
                      {points.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x} cy={p.y}
                          r={hoveredPoint === i ? 6 : 3.5}
                          fill={hoveredPoint === i ? '#059669' : '#10b981'}
                          stroke="white" strokeWidth="2"
                          style={{ transition: 'r 0.1s, fill 0.1s' }}
                        />
                      ))}

                      {/* Tooltip + guide for active point */}
                      {hoveredPoint !== null && (() => {
                        const p = points[hoveredPoint];
                        const tipX = p.x < chartW - 120 ? p.x + 12 : p.x - 112;
                        const tipY = p.y < 50 ? p.y + 10 : p.y - 48;
                        return (
                          <g pointerEvents="none">
                            {/* Vertical guide line */}
                            <line
                              x1={p.x} y1={0} x2={p.x} y2={chartH}
                              stroke="#10b981" strokeWidth={1} strokeDasharray="4 3" opacity={0.4}
                            />
                            {/* Horizontal guide dot ring */}
                            <circle cx={p.x} cy={p.y} r={10} fill="#10b981" opacity={0.12} />
                            {/* Tooltip box */}
                            <rect x={tipX} y={tipY} width={100} height={38} rx={7} ry={7} fill="#111827" opacity={0.93} />
                            <text x={tipX + 50} y={tipY + 14} textAnchor="middle" fill="#6ee7b7" fontSize={9} fontWeight="bold">{p.label}</text>
                            <text x={tipX + 50} y={tipY + 29} textAnchor="middle" fill="white" fontSize={10} fontWeight="900">Rs. {p.value.toLocaleString()}</text>
                          </g>
                        );
                      })()}

                      {/* Invisible full-coverage rect to ensure mouse events fire edge-to-edge */}
                      <rect x={0} y={0} width={chartW} height={chartH} fill="transparent" />
                    </svg>
                  </div>
                  {/* X Axis labels */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-bold text-gray-400 pr-2">
                    {data.map((d, i) => <span key={i}>{d.label}</span>)}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>


        {/* ROW 2: PAYMENT METHODS */}
        <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm">
          <h3 className="text-[14px] font-black text-gray-900 mb-6">Payment Methods Distribution</h3>
          <div className="flex gap-4">
            <div className="w-[100px] flex flex-col justify-between text-[12px] font-bold text-gray-600 text-right gap-8 py-1">
              <span>Credit</span><span>Mobile</span><span>Card</span><span>Cash</span>
            </div>
            <div className="flex-1 relative pb-6 border-b border-l border-gray-200 flex flex-col gap-8 justify-between pt-1">
              {[
                { w: '12%', color: 'bg-amber-400', label: 'Rs. 5,200', pct: '12%' },
                { w: '28%', color: 'bg-cyan-500', label: 'Rs. 12,100', pct: '28%' },
                { w: '32%', color: 'bg-blue-500', label: 'Rs. 13,800', pct: '32%' },
                { w: '100%', color: 'bg-emerald-600', label: 'Rs. 43,200', pct: '65%' },
              ].map((bar, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className={`h-7 ${bar.color} rounded-r shadow-sm transition-all duration-500 group-hover:brightness-110`} style={{ width: bar.w }}></div>
                  <span className="text-[11px] font-black text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{bar.label} ({bar.pct})</span>
                </div>
              ))}
              <div className="absolute bottom-[-24px] left-0 w-full flex justify-between text-[10px] font-bold text-gray-400">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: KPIs */}
        <div className="mt-2">
          <h3 className="text-[16px] font-black text-gray-800 mb-5">Performance Metrics & KPIs</h3>
          <div className="grid grid-cols-4 gap-5">
            {[
              { title: 'Conversion Rate', val: '68.5%', change: '+0.2%', inc: true, target: '70%', fill: '68%' },
              { title: 'Avg Transaction Time', val: '3m 24s', change: '-13s', inc: true, target: '3 min', fill: '60%' },
              { title: 'Customer Satisfaction', val: '4.7/5', change: '+0.2', inc: true, target: '5.0', fill: '94%' },
              { title: 'Payment Success Rate', val: '99.2%', change: '+0.3%', inc: true, target: '99.5%', fill: '99%' },
              { title: 'Return Rate', val: '1.2%', change: '-0.7%', inc: true, target: '< 2%', fill: '15%' },
              { title: 'Discount Utilization', val: '34.5%', change: '+1.2%', inc: true, target: '40%', fill: '34%' },
              { title: 'Repeat Customers', val: '42.8%', change: '+2.1%', inc: true, target: '50%', fill: '42%' },
              { title: 'Avg Order Value', val: 'Rs. 2,150', change: '+Rs.125', inc: true, target: 'Rs. 2,500', fill: '86%' },
            ].map((k) => (
              <div key={k.title} className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">{k.title}</p>
                <h3 className="text-[24px] font-black text-emerald-600 mb-0.5">{k.val}</h3>
                <p className={`text-[11px] font-black mb-3 flex items-center gap-1 ${k.inc ? 'text-emerald-500' : 'text-red-500'}`}>
                  {k.inc ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {k.change}
                </p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-1.5 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: k.fill }}></div>
                </div>
                <p className="text-[10px] font-bold text-gray-400">Target: {k.target}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ROW 4: PEAK SALES — Dynamic SVG Bar Chart */}
        <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-black text-gray-900">Peak Sales Hours</h3>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 text-[12px] font-bold text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition">
                  {peakRange} <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="bg-white min-w-[160px] p-1.5 rounded-xl shadow-xl border border-gray-100 z-50" sideOffset={6}>
                  {peakRanges.map(r => (
                    <DropdownMenu.Item key={r} onClick={() => { setPeakRange(r); setHoveredBar(null); }} className={`px-3 py-2 text-[12px] font-bold rounded-lg cursor-pointer outline-none ${peakRange === r ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'}`}>{r}</DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {(() => {
            const bars = PEAK_DATA[peakRange] || PEAK_DATA['Last 24 Hours'];
            const maxTxns = Math.max(...bars.map(b => b.txns));
            const peakBar = bars.find(b => b.txns === maxTxns);
            const svgW = 700; const svgH = 220;
            const padLeft = 50; const padRight = 20; const padTop = 24; const xAxisH = 30;
            const chartAreaH = svgH - padTop - xAxisH;
            const barW = (svgW - padLeft - padRight) / bars.length;
            const barPad = barW * 0.2;
            const yMax = Math.ceil(maxTxns / 10) * 10;
            const ySteps = 5;

            return (
              <div className="relative select-none">
                <svg
                  viewBox={`0 0 ${svgW} ${svgH}`}
                  className="w-full cursor-crosshair"
                  style={{ height: 240 }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = ((e.clientX - rect.left) / rect.width) * svgW;
                    let closest = 0; let closestDist = Infinity;
                    bars.forEach((_, i) => {
                      const cx = padLeft + i * barW + barW / 2;
                      const d = Math.abs(cx - mouseX);
                      if (d < closestDist) { closestDist = d; closest = i; }
                    });
                    setHoveredBar(closest);
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Y-axis grid lines & labels */}
                  {Array.from({ length: ySteps + 1 }, (_, idx) => {
                    const v = Math.round((yMax / ySteps) * idx);
                    const y = padTop + chartAreaH - (v / yMax) * chartAreaH;
                    return (
                      <g key={idx}>
                        <line x1={padLeft} y1={y} x2={svgW - padRight} y2={y} stroke={idx === 0 ? '#e5e7eb' : '#f3f4f6'} strokeWidth={1} />
                        <text x={padLeft - 6} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize={10} fontWeight="bold">{v}</text>
                      </g>
                    );
                  })}

                  {/* Bars */}
                  {bars.map((bar, i) => {
                    const barH = Math.max(2, (bar.txns / yMax) * chartAreaH);
                    const x = padLeft + i * barW + barPad;
                    const y = padTop + chartAreaH - barH;
                    const w = barW - barPad * 2;
                    const isPeak = bar.txns === maxTxns;
                    const isHovered = hoveredBar === i;
                    const fill = isPeak ? '#f59e0b' : isHovered ? '#059669' : '#10b981';
                    const barCx = x + w / 2;

                    return (
                      <g key={bar.time}>
                        {/* Bar body */}
                        <rect x={x} y={y} width={w} height={barH} fill={fill} rx={4} ry={4}
                          opacity={hoveredBar === null || isHovered ? 1 : 0.75}
                          style={{ transition: 'fill 0.15s, opacity 0.15s' }}
                        />
                        {/* Value above bar */}
                        {isHovered && (
                          <text x={barCx} y={Math.max(14, y - 5)} textAnchor="middle" fill={fill} fontSize={10} fontWeight="900" pointerEvents="none">{bar.txns}</text>
                        )}
                        {/* X axis label */}
                        <text x={barCx} y={svgH - 6} textAnchor="middle" fill="#9ca3af" fontSize={10} fontWeight="bold" pointerEvents="none">{bar.time}</text>
                      </g>
                    );
                  })}

                  {/* Render tooltip separately on top */}
                  {hoveredBar !== null && (() => {
                    const bar = bars[hoveredBar];
                    const barH = Math.max(2, (bar.txns / yMax) * chartAreaH);
                    const x = padLeft + hoveredBar * barW + barPad;
                    const y = padTop + chartAreaH - barH;
                    const w = barW - barPad * 2;
                    const barCx = x + w / 2;
                    
                    const rawTipX = barCx < svgW - 80 ? barCx + 5 : barCx - 95;
                    const tipX = Math.max(2, Math.min(svgW - 92, rawTipX));
                    const tipY = Math.max(2, y - 38);
                    
                    return (
                      <g pointerEvents="none">
                        <rect x={tipX} y={tipY} width={90} height={32} rx={7} ry={7} fill="#111827" opacity={0.94} />
                        <text x={tipX + 45} y={tipY + 13} textAnchor="middle" fill="#6ee7b7" fontSize={9} fontWeight="bold">{bar.time}</text>
                        <text x={tipX + 45} y={tipY + 26} textAnchor="middle" fill="white" fontSize={11} fontWeight="900">{bar.txns} txns</text>
                      </g>
                    );
                  })()}

                  {/* Full transparent overlay for edge-to-edge mouse capture */}
                  <rect x={0} y={0} width={svgW} height={svgH} fill="transparent" />
                </svg>

                <p className="text-[11px] font-bold text-gray-400 mt-1 text-center">
                  <span className="text-amber-500 font-black">Peak</span>: {peakBar?.time} | <span className="text-emerald-600 font-black">{peakBar?.txns} transactions</span> in this window
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      <TransactionDetailsModal
        isOpen={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
        invoiceId={selectedTxn || ''}
      />
    </MainLayout>
  );
}
