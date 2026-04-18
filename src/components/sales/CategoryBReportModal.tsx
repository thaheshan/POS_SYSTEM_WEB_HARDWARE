'use client';

import { useState } from 'react';
import { X, Download, Trash2, FileText, ChevronDown, FileSpreadsheet } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPrintPDF: (timeFilter: string) => void;
  data: any;
}

const TIME_OPTIONS = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Last 365 Days'];

const MOCK_INVOICES = [
  { id: 'SKU: RB-25K-001', name: 'Rice Bag 25kg',    taxStatus: 'Non-Taxable', total: 5000  },
  { id: 'SKU: WF-10K-002', name: 'Wheat Flour 10kg', taxStatus: 'Non-Taxable', total: 3500  },
  { id: 'SKU: OV-001',     name: 'Overflow Invoice #1', taxStatus: 'Overflow', total: 12500 },
];

export default function CategoryBReportModal({ isOpen, onClose, onPrintPDF, data }: Props) {
  const router = useRouter();
  const [timeFilter, setTimeFilter]         = useState('Last 24 Hours');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filter, setFilter]                 = useState<'all' | 'nontax'>('all');
  const [invoices, setInvoices]             = useState(MOCK_INVOICES);
  const [search, setSearch]                 = useState('');

  if (!isOpen) return null;

  const filtered = invoices.filter(inv => {
    const matchFilter = filter === 'all' || inv.taxStatus === 'Non-Taxable';
    const matchSearch  = inv.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const subtotal = filtered.reduce((s, i) => s + i.total, 0);

  const handleCSV = () => {
    const rows = [
      ['Invoice', 'SKU', 'Tax Status', 'Total (Rs)'],
      ...filtered.map(i => [i.name, i.id, i.taxStatus, i.total]),
      ['', '', 'Subtotal', subtotal],
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'category_b_report.csv';
    a.click();
    setShowExportMenu(false);
  };

  const handlePDF = () => {
    setShowExportMenu(false);
    onPrintPDF(timeFilter);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center print:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[560px] rounded-[28px] shadow-2xl overflow-hidden mx-4 max-h-[90vh] flex flex-col">

        {/* GREEN GRADIENT HEADER */}
        <div className="bg-gradient-to-br from-[#15803d] to-[#166534] p-8 pb-7 text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-[22px] font-black tracking-tight mb-1">View Detailed Report (Category B)</h2>
          <p className="text-[13px] font-bold text-emerald-200">Non-taxable items &amp; overflow above Rs. 200,000</p>

          <div className="mt-5 bg-white/15 rounded-2xl p-4">
            <p className="text-[11px] font-black text-emerald-200 uppercase tracking-widest mb-1">Overflow Amount Today</p>
            <p className="text-[20px] font-black text-white">Rs. {data.catB.overflow.toLocaleString()}</p>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-7">

          {/* Overview bar */}
          <div className="flex items-center justify-between mb-5">
            <span className="text-[13px] font-black text-gray-700">Tax Category Sales Overview</span>
            <div className="flex items-center gap-2">

              {/* Time filter dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowTimeDropdown(!showTimeDropdown); setShowExportMenu(false); }}
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  {timeFilter} <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showTimeDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 w-[155px]">
                    {TIME_OPTIONS.map(t => (
                      <button key={t} onClick={() => { setTimeFilter(t); setShowTimeDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Export dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowExportMenu(!showExportMenu); setShowTimeDropdown(false); }}
                  className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-all active:scale-90"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                </button>
                {showExportMenu && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 w-[185px]">
                    <button
                      onClick={handlePDF}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <FileText className="w-4 h-4 text-red-500" />
                      Download as PDF
                    </button>
                    <button
                      onClick={handleCSV}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      Download as CSV
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Category B Type Filter */}
          <div className="mb-5">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Category B Type</p>
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')}
                className={`px-5 py-2 rounded-xl text-[12.5px] font-black transition-all ${filter === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                All Products
              </button>
              <button onClick={() => setFilter('nontax')}
                className={`px-5 py-2 rounded-xl text-[12.5px] font-black transition-all ${filter === 'nontax' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Non-Taxable Only
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-[13px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300 transition-all" />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          {/* Invoice Table */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tax Status</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 px-4">
                      <p className="text-[13px] font-bold text-gray-900">{inv.name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{inv.id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inv.taxStatus === 'Non-Taxable' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {inv.taxStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-[13px] font-black text-emerald-600 font-mono">Rs. {inv.total.toLocaleString()}</td>
                    <td className="py-4 px-3">
                      <button onClick={() => setInvoices(invoices.filter((_, j) => j !== i))}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-[13px] font-bold text-gray-300">No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-3 border-t border-gray-100 pt-5">
            <div className="flex justify-between text-[13px] font-bold text-gray-500">
              <span>Subtotal</span><span className="font-mono">Rs. {subtotal.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold text-gray-500">Tax Status</span>
              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-black rounded-full uppercase tracking-wider">Non-Taxable</span>
            </div>
            <div className="flex justify-between text-[17px] font-black text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Amount</span>
              <span className="text-emerald-600 font-mono">Rs. {subtotal.toLocaleString()}.00</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl text-[14px] font-black text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={() => { onClose(); router.push('/sales/category-b'); }} className="flex-1 py-3.5 bg-[#15803d] hover:bg-emerald-800 rounded-2xl text-[14px] font-black text-white shadow-lg shadow-emerald-100 transition-all active:scale-95">
            View All
          </button>
        </div>
      </div>
    </div>
  );
}
