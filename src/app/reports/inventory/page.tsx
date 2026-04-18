'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Download, ChevronLeft, Boxes, FileSpreadsheet, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const mockInventoryData = [
  { id: 'PRD-101', name: 'Holcim Cement 50kg', sku: 'CEM-H50', stock: 145, threshold: 50, value: 239250, status: 'Healthy' },
  { id: 'PRD-102', name: 'Steel Rod 12mm', sku: 'STL-R12', stock: 12, threshold: 100, value: 38400, status: 'Critical' },
  { id: 'PRD-103', name: 'PVC Pipe 1"×10ft', sku: 'PVC-110', stock: 45, threshold: 50, value: 21600, status: 'Low Stock' },
  { id: 'PRD-104', name: 'Dulux Paint 4L', sku: 'PNT-D4', stock: 85, threshold: 20, value: 756500, status: 'Healthy' },
  { id: 'PRD-105', name: 'Wire Roll 100m', sku: 'WIR-100', stock: 5, threshold: 15, value: 22500, status: 'Critical' },
];

export default function InventoryReportsPage() {
  const handleExportCSV = () => {
    const rows = [
      ['Product Name', 'SKU', 'Current Stock', 'Stock Threshold', 'Total Value (Rs)', 'Status'],
      ...mockInventoryData.map(i => [`"${i.name}"`, i.sku, i.stock, i.threshold, i.value, i.status])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_valuation_report.csv';
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
                 Inventory Valuation & Alerts
               </h1>
            </div>
            <p className="text-[14px] font-medium text-gray-500 tracking-wide">
              Complete stock levels, movement history, and automated low stock warnings.
            </p>
          </div>
          
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 bg-[#059669] text-white rounded-[12px] px-6 py-2.5 shadow-sm hover:bg-green-700 transition-colors text-[13px] font-black tracking-wide">
                <Download className="w-4 h-4" />
                Export Valuation
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
           <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm flex items-start justify-between">
              <div>
                 <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Total Inventory Value</span>
                 <span className="text-[28px] font-black tracking-tight text-[#059669]">Rs. 1,078,250</span>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                 <Boxes className="w-6 h-6 text-[#059669]" />
              </div>
           </div>
           <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm flex items-start justify-between">
              <div>
                 <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Total Items in Stock</span>
                 <span className="text-[28px] font-black tracking-tight">1,248</span>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                 <Boxes className="w-6 h-6 text-gray-500" />
              </div>
           </div>
           <div className="bg-[#fef2f2] border border-red-200 rounded-[20px] p-6 shadow-sm flex items-start justify-between">
              <div>
                 <span className="text-[12px] font-bold text-red-400 uppercase tracking-widest mb-1 block">Critical Stock Alerts</span>
                 <span className="text-[28px] font-black tracking-tight text-red-600">12 Products</span>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                 <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
           </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">SKU</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">In Stock</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockInventoryData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <p className="text-[13.5px] font-bold text-gray-900">{item.name}</p>
                    </td>
                    <td className="py-4 px-6 text-[13px] font-bold text-gray-500 font-mono tracking-tight">{item.sku}</td>
                    <td className="py-4 px-6">
                       <span className={`inline-flex px-2.5 py-1 rounded-md text-[10.5px] font-black uppercase tracking-widest ${
                         item.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : 
                         item.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                       }`}>
                         {item.status}
                       </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                       <span className={`text-[14px] font-semibold font-mono tracking-tighter ${
                          item.stock < item.threshold ? 'text-red-600 font-black' : 'text-gray-700'
                       }`}>
                         {item.stock}
                       </span>
                       <span className="text-[10px] font-bold text-gray-400 block mt-0.5">Min: {item.threshold}</span>
                    </td>
                    <td className="py-4 px-6 text-[14px] font-black text-gray-900 font-mono tracking-tighter text-right">
                      Rs. {item.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
