'use client';

import { useState } from 'react';
import { X, Download, Trash2, Wrench, Search, FileText, FileSpreadsheet, ChevronDown, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddExpenseModal from './AddExpenseModal';

interface Props { isOpen: boolean; onClose: () => void; onPrintPDF: (timeFilter: string) => void; data: any; }

const TIME_OPTIONS = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Last 365 Days'];

const MOCK_ENTRIES = [
  { labour: 'A', id: 'LAB-2453', expenseType: 'Tea',      total: 5000 },
  { labour: 'B', id: 'LAB-9752', expenseType: 'Salary',   total: 3500 },
  { labour: 'C', id: 'LAB-1100', expenseType: 'Travel',   total: 1200 },
];

const EXPENSE_COLORS: Record<string, string> = {
  Tea:      'bg-amber-50 text-amber-700',
  Salary:   'bg-emerald-50 text-emerald-700',
  Overtime: 'bg-blue-50 text-blue-700',
  Material: 'bg-purple-50 text-purple-700',
  Travel:   'bg-orange-50 text-orange-700',
};

export default function CategoryCReportModal({ isOpen, onClose, onPrintPDF, data }: Props) {
  const router = useRouter();
  const [timeFilter, setTimeFilter]             = useState('Last 24 Hours');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu]     = useState(false);
  const [showAddExpense, setShowAddExpense]     = useState(false);
  const [entries, setEntries]                   = useState(MOCK_ENTRIES);
  const [search, setSearch]                     = useState('');

  if (!isOpen) return null;

  const filtered = entries.filter(e =>
    e.labour.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.expenseType.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = filtered.reduce((s, e) => s + e.total, 0);

  const handleCSV = () => {
    const rows = [
      ['Labour', 'ID', 'Expense Type', 'Total (Rs)'],
      ...filtered.map(e => [e.labour, e.id, e.expenseType, e.total]),
      ['', '', 'Subtotal', subtotal],
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'category_c_report.csv';
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

        {/* AMBER GRADIENT HEADER */}
        <div className="bg-gradient-to-br from-[#a16207] to-[#92400e] p-8 pb-7 text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-[22px] font-black tracking-tight mb-1">All Entries (Category C)</h2>
          <p className="text-[13px] font-bold text-amber-200">Labour charges, installation fees &amp; other expenses</p>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Labour',       value: `Rs. ${data.catC.labour.toLocaleString()}`  },
              { label: 'Installation', value: `Rs. ${data.catC.install.toLocaleString()}` },
              { label: 'Misc',         value: `Rs. ${data.catC.misc.toLocaleString()}`    },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-2xl p-3 text-center">
                <p className="text-[9px] font-black text-amber-200 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-[13px] font-black text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-7">

          {/* Overview bar */}
          <div className="flex items-center justify-between mb-5">
            <button 
              onClick={() => setShowAddExpense(true)}
              className="flex items-center gap-2 bg-[#a16207] hover:bg-amber-800 text-white px-4 py-2 rounded-xl text-[12.5px] font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Create Expense
            </button>
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
                        className="w-full text-left px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-all">
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
                  className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center hover:bg-amber-100 transition-all active:scale-90"
                >
                  <Download className="w-4 h-4 text-amber-700" />
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
                      <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                      Download as CSV
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search labours..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-[13px] font-bold text-gray-700 outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-300 transition-all" />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          </div>

          {/* Entries table */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Labour</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expense Type</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 px-4">
                      <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center mb-1">
                        <span className="text-[12px] font-black text-amber-700">{e.labour}</span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400">{e.id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-black ${EXPENSE_COLORS[e.expenseType] ?? 'bg-gray-100 text-gray-600'}`}>
                        {e.expenseType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-[13px] font-black text-amber-600 font-mono">
                      Rs. {e.total.toLocaleString()}
                    </td>
                    <td className="py-4 px-3">
                      <button onClick={() => setEntries(entries.filter((_, j) => j !== i))}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-[13px] font-bold text-gray-300">No entries found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-gray-100 pt-5">
            <div className="flex justify-between text-[13px] font-bold text-gray-500">
              <span>Subtotal</span>
              <span className="font-mono">Rs. {subtotal.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-[17px] font-black text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Amount</span>
              <span className="text-amber-600 font-mono">Rs. {subtotal.toLocaleString()}.00</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl text-[14px] font-black text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={() => { onClose(); router.push('/sales/category-c'); }} className="flex-1 py-3.5 bg-[#a16207] hover:bg-amber-800 rounded-2xl text-[14px] font-black text-white shadow-lg shadow-amber-100 transition-all active:scale-95">
            View All
          </button>
        </div>
      </div>

      <AddExpenseModal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} />
    </div>
  );
}
