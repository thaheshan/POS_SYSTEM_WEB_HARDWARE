'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Download, ChevronLeft, Search, Filter, FileSpreadsheet, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import api from '@/api/axiosInstance';
import { format } from 'date-fns';

export interface InvoiceItem {
  productName?: string;
  itemName?: string;
  product?: {
    name?: string;
  };
}

export interface RawInvoicePayload {
  id?: string;
  invoiceNumber?: string;
  createdAt?: string | Date;
  customer?: { name?: string };
  customerName?: string;
  user?: { name?: string };
  cashierName?: string;
  staffName?: string;
  totalAmount?: number | string;
  amount?: number | string;
  status?: string;
  items?: InvoiceItem[];
}

export interface FormattedSale {
  id: string;
  date: string;
  time: string;
  customer: string;
  product: string;
  cashier: string;
  amount: number;
  status: string;
}

export default function SalesReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sales, setSales] = useState<FormattedSale[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    api.get('/sales', { params: { limit: 2000 } })
      .then(res => {
        let items: RawInvoicePayload[] = [];
        const raw = res.data;
        if (Array.isArray(raw?.data?.data?.items)) {
          items = raw.data.data.items;
        } else if (Array.isArray(raw?.data?.items)) {
          items = raw.data.items;
        } else if (Array.isArray(raw?.items)) {
          items = raw.items;
        } else if (Array.isArray(raw?.data)) {
          items = raw.data;
        } else if (Array.isArray(raw)) {
          items = raw;
        }

        const formatted: FormattedSale[] = items.map((inv) => {
          const id = inv.invoiceNumber || inv.id || 'N/A';
          const dt = new Date(inv.createdAt || new Date());
          const date = format(dt, 'yyyy-MM-dd');
          const time = format(dt, 'hh:mm a');
          const customer = inv.customer?.name || inv.customerName || 'Walk-in Customer';
          const cashier = inv.user?.name || inv.cashierName || inv.staffName || 'System';
          const amount = Number(inv.totalAmount || inv.amount || 0);
          const status = inv.status ? (inv.status.charAt(0).toUpperCase() + inv.status.slice(1).toLowerCase()) : 'Completed';
          
          let product = 'Various Items';
          if (Array.isArray(inv.items) && inv.items.length > 0) {
            const firstItem = inv.items[0];
            const firstProduct = firstItem?.productName || firstItem?.product?.name || firstItem?.itemName || 'Unknown Item';
            if (inv.items.length === 1) {
              product = firstProduct;
            } else {
              product = `${firstProduct} + ${inv.items.length - 1} more`;
            }
          }

          return { id, date, time, customer, product, cashier, amount, status };
        });

        // Sort newest first
        formatted.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

        setSales(formatted);
      })
      .catch((err: unknown) => console.error('Failed to fetch sales', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cashier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const currentSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const safeCsvCell = (value: string | number): string => {
    const strValue = String(value);
    if (strValue.includes(',') || strValue.includes('"')) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  };

  const handleExportCSV = () => {
    const rows = [
      ['Transaction ID', 'Customer Name', 'Transaction Date', 'Product', 'Cashier', 'Amount', 'Status'],
      ...sales.map(s => [
        safeCsvCell(s.id),
        safeCsvCell(s.customer),
        safeCsvCell(`${s.date} ${s.time}`),
        safeCsvCell(s.product),
        safeCsvCell(s.cashier),
        safeCsvCell(s.amount),
        safeCsvCell(s.status)
      ])
    ].map(row => row.join(',')).join('\n');
    
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

  const totalSalesVolume = sales.reduce((sum, s) => sum + s.amount, 0);
  const itemsSold = sales.length; // Approximate, as each transaction can have multiple items
  const avgTicket = itemsSold > 0 ? totalSalesVolume / itemsSold : 0;

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
              <span className="text-[28px] font-black tracking-tight">
                Rs. {totalSalesVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
           </div>
           <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Invoices</span>
              <span className="text-[28px] font-black tracking-tight">{itemsSold.toLocaleString()}</span>
           </div>
           <div className="bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
              <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Avg Ticket</span>
              <span className="text-[28px] font-black tracking-tight text-blue-600">
                Rs. {avgTicket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
           </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 print:hidden">
             <div className="relative max-w-sm w-full">
               <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
               <input 
                 type="text" 
                 placeholder="Search by ID, Product, Customer, or Cashier..." 
                 className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                 value={searchTerm}
                 onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setCurrentPage(1);
                 }}
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
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer Name</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Transaction Date</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Cashier</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[13px] font-bold text-gray-500">
                      Loading sales data...
                    </td>
                  </tr>
                ) : currentSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[13px] font-bold text-gray-500">
                      No sales found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  currentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6 text-[13px] font-bold text-gray-600 font-mono tracking-tight">{sale.id}</td>
                      <td className="py-4 px-6 text-[13.5px] font-semibold text-gray-800">{sale.customer}</td>
                      <td className="py-4 px-6">
                        <p className="text-[13.5px] font-bold text-gray-900">{sale.date}</p>
                        <p className="text-[11px] font-semibold text-gray-400">{sale.time}</p>
                      </td>
                      <td className="py-4 px-6 text-[13.5px] font-semibold text-gray-800 truncate max-w-[200px]" title={sale.product}>
                        {sale.product}
                      </td>
                      <td className="py-4 px-6 text-[13px] font-semibold text-gray-700">
                        {sale.cashier}
                      </td>
                      <td className="py-4 px-6 text-[14px] font-black text-gray-900 font-mono tracking-tighter">
                        Rs. {sale.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                         <span className={`inline-flex px-2.5 py-1 rounded-md text-[10.5px] font-black uppercase tracking-widest ${
                           sale.status === 'Completed' || sale.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                         }`}>
                           {sale.status}
                         </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 print:hidden">
             <span className="text-[12px] font-bold text-gray-500">
               Showing {filteredSales.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length} results
             </span>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-600 disabled:text-gray-400 hover:bg-gray-50 disabled:hover:bg-transparent"
                >
                  Prev
                </button>
                <span className="text-[12px] font-bold text-gray-600 px-2">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-bold text-gray-600 disabled:text-gray-400 hover:bg-gray-50 disabled:hover:bg-transparent"
                >
                  Next
                </button>
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
