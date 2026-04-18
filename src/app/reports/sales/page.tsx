'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Download, ChevronLeft, Search, Filter, FileSpreadsheet, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const mockSales = [
  { id: 'INV-2026-001234', date: '2026-04-18', time: '10:24 AM', product: 'Holcim Cement 50kg', cashier: 'John Silva', amount: 5450, status: 'Completed' },
  { id: 'INV-2026-001233', date: '2026-04-18', time: '09:58 AM', product: 'Steel Rod 12mm', cashier: 'John Silva', amount: 3200, status: 'Completed' },
  { id: 'INV-2026-001232', date: '2026-04-17', time: '04:15 PM', product: 'PVC Pipe 1"×10ft', cashier: 'Amritha V.', amount: 12450, status: 'Completed' },
  { id: 'INV-2026-001231', date: '2026-04-17', time: '02:30 PM', product: 'Dulux Paint 4L', cashier: 'John Silva', amount: 8900, status: 'Refunded' },
  { id: 'INV-2026-001230', date: '2026-04-16', time: '11:45 AM', product: 'Wire Roll 100m', cashier: 'Amritha V.', amount: 4500, status: 'Completed' },
  { id: 'INV-2026-001229', date: '2026-04-16', time: '09:10 AM', product: 'Nails 2kg', cashier: 'John Silva', amount: 850, status: 'Completed' },
];

export default function SalesReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportCSV = () => {
    const rows = [
      ['Invoice ID', 'Date', 'Time', 'Product', 'Cashier', 'Amount', 'Status'],
      ...mockSales.map(s => [s.id, s.date, s.time, `"${s.product}"`, s.cashier, s.amount, s.status])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_report.csv';
    a.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 print:hidden">
          <div>
            <Link href="/reports" className="flex items-center gap-2 text-[13px] font-black text-blue-600 hover:text-blue-800 mb-4 transition-colors w-max">
              <ChevronLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight mb-2">
              Sales Reports
            </h1>
            <p className="text-[14px] font-medium text-gray-500 tracking-wide">
              Detailed chronological log of all sales, product performance, and cashier metrics.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 bg-[#1e40af] text-white rounded-[12px] px-6 py-2.5 shadow-sm hover:bg-blue-800 transition-colors text-[13px] font-black tracking-wide">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[180px] z-[100] animate-in fade-in zoom-in-95 print:hidden">
                  <DropdownMenu.Item onClick={handleExportPDF} className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 outline-none rounded-lg transition-colors">
                    <FileText className="w-4 h-4 text-red-500" /> Download PDF
                  </DropdownMenu.Item>
                  <DropdownMenu.Item onClick={handleExportCSV} className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-bold text-gray-700 cursor-pointer hover:bg-gray-50 outline-none rounded-lg transition-colors">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Download CSV
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
           <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Total Sales Vol</span>
              <span className="text-[28px] font-black tracking-tight">Rs. 845,900</span>
           </div>
           <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Items Sold</span>
              <span className="text-[28px] font-black tracking-tight">3,492</span>
           </div>
           <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Avg Ticket</span>
              <span className="text-[28px] font-black tracking-tight text-blue-600">Rs. 2,420</span>
           </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 print:hidden">
             <div className="relative max-w-sm w-full">
               <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search by ID, Product, or Cashier..." 
                 className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" /> Filters
             </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Invoice ID</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Primary Product</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Cashier</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <p className="text-[13.5px] font-bold text-gray-900">{sale.date}</p>
                      <p className="text-[11px] font-semibold text-gray-400">{sale.time}</p>
                    </td>
                    <td className="py-4 px-6 text-[13px] font-bold text-gray-600 font-mono tracking-tight">{sale.id}</td>
                    <td className="py-4 px-6 text-[13.5px] font-semibold text-gray-800">{sale.product} <span className="text-gray-400 font-normal">...</span></td>
                    <td className="py-4 px-6 text-[13px] font-semibold text-gray-700 flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black uppercase">
                         {sale.cashier.charAt(0)}
                       </div>
                       {sale.cashier}
                    </td>
                    <td className="py-4 px-6">
                       <span className={`inline-flex px-2.5 py-1 rounded-md text-[10.5px] font-black uppercase tracking-widest ${
                         sale.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                         {sale.status}
                       </span>
                    </td>
                    <td className="py-4 px-6 text-[14px] font-black text-gray-900 font-mono tracking-tighter text-right">
                      Rs. {sale.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 print:hidden">
             <span className="text-[12px] font-bold text-gray-500">Showing 6 of 3,842 results</span>
             <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-400 cursor-not-allowed">Prev</button>
                <button className="px-3 py-1.5 bg-[#1e40af] text-white rounded-lg text-[12px] font-bold hover:bg-blue-800">1</button>
                <button className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-[12px] font-bold hover:bg-gray-50">2</button>
                <button className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-[12px] font-bold hover:bg-gray-50">Next</button>
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
