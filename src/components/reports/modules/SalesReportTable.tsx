import React from 'react';
import { SalesReportData } from '@/types/report';

interface SalesReportTableProps {
  data: SalesReportData;
}

export default function SalesReportTable({ data }: SalesReportTableProps) {
  return (
    <div className="w-full mt-2 flex-grow">
      
      {/* 1. Sub-Header: Sales Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6 print:mb-4">
        <div className="border border-slate-200 p-3 rounded bg-slate-50 print:bg-white print:border-slate-300">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Transactions</h3>
          <p className="text-lg font-bold text-slate-900">{data.summary.totalTransactions}</p>
        </div>
        <div className="border border-slate-200 p-3 rounded bg-slate-50 print:bg-white print:border-slate-300">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</h3>
          <p className="text-lg font-bold text-indigo-900">
            {data.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="border border-slate-200 p-3 rounded bg-slate-50 print:bg-white print:border-slate-300">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cash Sales</h3>
          <p className="text-lg font-bold text-emerald-700">
            {data.summary.cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="border border-slate-200 p-3 rounded bg-slate-50 print:bg-white print:border-slate-300">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card / Transfer</h3>
          <p className="text-lg font-bold text-sky-700">
            {data.summary.cardTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* 2. Transactions Table */}
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-800 text-slate-800 uppercase tracking-wider text-[11px]">
            <th className="py-2 px-3 font-bold">Invoice #</th>
            <th className="py-2 px-3 font-bold">Date & Time</th>
            <th className="py-2 px-3 font-bold">Customer</th>
            <th className="py-2 px-3 font-bold">Cashier</th>
            <th className="py-2 px-3 font-bold text-center">Payment</th>
            <th className="py-2 px-3 font-bold text-right">Amount (LKR)</th>
          </tr>
        </thead>
        <tbody className="text-slate-700 text-xs">
          {data.items.map((item, index) => (
            <tr 
              key={item.invoiceNumber} 
              className={`border-b border-slate-200 break-inside-avoid ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              <td className="py-2 px-3 font-bold text-slate-900">{item.invoiceNumber}</td>
              <td className="py-2 px-3 text-[11px]">{item.date}</td>
              <td className="py-2 px-3">{item.customerName}</td>
              <td className="py-2 px-3">{item.cashierName}</td>
              <td className="py-2 px-3 text-center">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider print:border ${
                  item.paymentMethod === 'Cash' ? 'bg-emerald-100 text-emerald-800 print:border-emerald-800' :
                  item.paymentMethod === 'Card' ? 'bg-sky-100 text-sky-800 print:border-sky-800' :
                  'bg-slate-200 text-slate-800 print:border-slate-800'
                }`}>
                  {item.paymentMethod}
                </span>
              </td>
              <td className="py-2 px-3 text-right font-medium text-slate-900">
                {item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-800 font-bold text-slate-900 break-inside-avoid">
            <td colSpan={5} className="py-3 px-3 text-right uppercase text-[11px] tracking-wider">
              Total Validated Revenue:
            </td>
            <td className="py-3 px-3 text-right text-sm">
              {data.summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
