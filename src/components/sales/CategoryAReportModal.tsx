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

const MOCK_ORDERS = [
  { id: 'PROD-001', name: 'Holcim Cement 50kg', unitPrice: 1650, tax: 204,  total: 1650 },
  { id: 'PROD-002', name: 'Steel Rod 12mm',     unitPrice: 3200, tax: 396,  total: 3200 },
  { id: 'PROD-003', name: 'PVC Pipe 1"×10ft',   unitPrice: 480,  tax: 59,   total: 480  },
];

export default function CategoryAReportModal({ isOpen, onClose, onPrintPDF, data }: Props) {
  const router = useRouter();
  const [timeFilter, setTimeFilter]             = useState('Last 24 Hours');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showExportMenu, setShowExportMenu]     = useState(false);
  const [orders, setOrders]                     = useState(MOCK_ORDERS);

  if (!isOpen) return null;

  const subtotal = orders.reduce((s, o) => s + o.total, 0);
  const vat      = Math.round(subtotal * 0.18 * 100) / 100;
  const total    = subtotal + vat;

  const handleCSV = () => {
    const rows = [
      ['Product', 'ID', 'Unit Price (Rs)', 'Tax (Rs)', 'Total (Rs)'],
      ...orders.map(o => [o.name, o.id, o.unitPrice, o.tax, o.total]),
      ['', '', '', 'Subtotal', subtotal],
      ['', '', '', 'VAT (18%)', vat.toFixed(2)],
      ['', '', '', 'Total', total.toFixed(2)],
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'category_a_report.csv';
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

        {/* BLUE GRADIENT HEADER */}
        <div className="bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] p-8 pb-7 text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-[22px] font-black tracking-tight mb-1">View Detailed Report (Category A)</h2>
          <p className="text-[13px] font-bold text-blue-200">Taxable sales under Rs. 200,000 daily threshold</p>

          <div className="mt-5 bg-white/15 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-1">Today's Category A Total</p>
              <p className="text-[16px] font-black text-white">Rs. {data.catA.core.toLocaleString()} / Rs. 200,000</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black text-blue-200 uppercase tracking-widest mb-1">Remaining</p>
              <p className="text-[14px] font-black text-yellow-300">Rs. {Math.max(0, 200000 - data.catA.core).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-7">

          {/* Overview bar */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[13px] font-black text-gray-700">Tax Category Sales Overview</span>
            <div className="flex items-center gap-2">

              {/* Time filter */}
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
                        className="w-full text-left px-4 py-2.5 text-[12.5px] font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all">
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
                  className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center hover:bg-blue-100 transition-all active:scale-90"
                >
                  <Download className="w-4 h-4 text-blue-700" />
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
                      <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                      Download as CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sales table */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[13px] font-black text-gray-900">Sales Transactions</h4>
            <button onClick={() => setOrders([])} className="text-[11px] font-black text-red-400 hover:text-red-600 transition-colors">Clear All</button>
          </div>

          <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Price</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tax Amt</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 px-4">
                      <p className="text-[13px] font-bold text-gray-900">{o.name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{o.id}</p>
                    </td>
                    <td className="py-4 px-4 text-right text-[13px] font-bold text-gray-700 font-mono">Rs. {o.unitPrice.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right text-[13px] font-bold text-gray-400 font-mono">Rs. {o.tax}</td>
                    <td className="py-4 px-4 text-right text-[13px] font-black text-blue-600 font-mono">Rs. {o.total.toLocaleString()}</td>
                    <td className="py-4 px-3">
                      <button onClick={() => setOrders(orders.filter((_, j) => j !== i))}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-[13px] font-bold text-gray-300">No transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-gray-100 pt-5">
            <div className="flex justify-between text-[13px] font-bold text-gray-500">
              <span>Subtotal</span><span className="font-mono">Rs. {subtotal.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between text-[13px] font-bold text-gray-500">
              <span>VAT (18%)</span><span className="font-mono">Rs. {vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[17px] font-black text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Amount</span>
              <span className="text-blue-600 font-mono">Rs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 p-6 pt-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3.5 border-2 border-gray-200 rounded-2xl text-[14px] font-black text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={() => { onClose(); router.push('/sales/category-a'); }} className="flex-1 py-3.5 bg-[#1e40af] hover:bg-blue-800 rounded-2xl text-[14px] font-black text-white shadow-lg shadow-blue-100 transition-all active:scale-95">
            View All
          </button>
        </div>
      </div>
    </div>
  );
}
