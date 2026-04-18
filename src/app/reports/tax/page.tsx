'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Download, ChevronLeft, ShieldCheck, FileSpreadsheet, FileText } from 'lucide-react';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const mockTaxData = [
  { id: 'TX-0418-A', type: 'Category A', amount: 165000, vat: 29700, date: '2026-04-18' },
  { id: 'TX-0418-B', type: 'Category B', amount: 85000, vat: 0, date: '2026-04-18' },
  { id: 'TX-0418-C', type: 'Category C', amount: 12000, vat: 0, date: '2026-04-18' },
  { id: 'TX-0417-A', type: 'Category A', amount: 180000, vat: 32400, date: '2026-04-17' },
  { id: 'TX-0417-B', type: 'Category B', amount: 45000, vat: 0, date: '2026-04-17' },
];

export default function TaxReportsPage() {
  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Log ID', 'Category', 'Base Amount', 'VAT Amount', 'Total Amount'],
      ...mockTaxData.map(t => [t.date, t.id, t.type, t.amount, t.vat, t.amount + t.vat])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tax_compliance_ledger.csv';
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
            <div className="flex items-center gap-4 mb-2">
               <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight">
                 Tax & Compliance Ledger
               </h1>
               <div className="bg-[#ecfdf5] border border-green-100 rounded-lg px-3 py-1.5 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-[#059669]" />
                 <span className="text-[11px] font-black text-[#059669] uppercase tracking-widest">IRD Compliant Format</span>
               </div>
            </div>
            <p className="text-[14px] font-medium text-gray-500 tracking-wide">
              Daily compilation of Master Category A (Taxable), Category B (Non-Tax), and Category C (Labour).
            </p>
          </div>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 bg-[#8b5cf6] text-white rounded-[12px] px-6 py-2.5 shadow-sm hover:bg-purple-600 transition-colors text-[13px] font-black tracking-wide">
                <Download className="w-4 h-4" />
                Export Ledger
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

        {/* METRICS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 print:hidden">
           <div className="bg-white border-t-4 border-[#2563eb] rounded-[16px] p-6 shadow-sm">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">YTD Taxable (Cat A)</span>
              <span className="text-[24px] font-black tracking-tight text-[#2563eb]">Rs. 2,839,824</span>
           </div>
           <div className="bg-white border-t-4 border-[#9333ea] rounded-[16px] p-6 shadow-sm">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">YTD VAT Collected</span>
              <span className="text-[24px] font-black tracking-tight text-[#9333ea]">Rs. 511,168</span>
           </div>
           <div className="bg-white border-t-4 border-[#059669] rounded-[16px] p-6 shadow-sm">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">YTD Non-Tax (Cat B)</span>
              <span className="text-[24px] font-black tracking-tight text-[#059669]">Rs. 1,335,012</span>
           </div>
           <div className="bg-white border-t-4 border-[#dc2626] rounded-[16px] p-6 shadow-sm">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">YTD Labour (Cat C)</span>
              <span className="text-[24px] font-black tracking-tight text-[#dc2626]">Rs. 697,614</span>
           </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Log ID</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Base Amount</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">VAT Amount</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Gross Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockTaxData.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6 text-[13.5px] font-bold text-gray-900">{log.date}</td>
                    <td className="py-4 px-6 text-[13px] font-bold text-gray-500 font-mono tracking-tight">{log.id}</td>
                    <td className="py-4 px-6">
                       <span className={`inline-flex px-2.5 py-1 rounded-md text-[10.5px] font-black uppercase tracking-widest ${
                         log.type === 'Category A' ? 'bg-blue-100 text-blue-700' : 
                         log.type === 'Category B' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {log.type}
                       </span>
                    </td>
                    <td className="py-4 px-6 text-[14px] font-semibold text-gray-700 font-mono tracking-tighter text-right">
                      Rs. {log.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-[14px] font-semibold text-gray-500 font-mono tracking-tighter text-right">
                      {log.vat > 0 ? `Rs. ${log.vat.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-4 px-6 text-[14px] font-black text-gray-900 font-mono tracking-tighter text-right">
                      Rs. {(log.amount + log.vat).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 print:hidden">
             <span className="text-[12px] font-bold text-gray-500">Showing Compliance Logs for April 2026</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
