import React from 'react';
import { TransactionInvoiceData } from '@/types/report';

interface TransactionInvoiceTableProps {
  data: TransactionInvoiceData;
}

export default function TransactionInvoiceTable({ data }: TransactionInvoiceTableProps) {
  return (
    <div className="w-full mt-2 flex-grow">
      
      {/* 1. Sub-Header: Billing Details & Invoice Meta */}
      <div className="flex justify-between items-start mb-8 print:mb-6">
        {/* Bill To Section */}
        <div className="border-l-4 border-indigo-600 pl-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            {data.transactionType === 'Purchase Order' ? 'Vendor / Supplier' : 'Bill To / Customer'}
          </h3>
          <p className="text-sm font-bold text-slate-900">{data.partyName}</p>
          <p className="text-xs text-slate-600 mt-0.5">{data.partyContact}</p>
          {data.partyAddress && <p className="text-xs text-slate-600">{data.partyAddress}</p>}
        </div>

        {/* Transaction Details Box */}
        <div className="text-right border border-slate-200 p-3 rounded bg-slate-50 print:bg-white print:border-slate-300 min-w-[200px]">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Transaction Type</h3>
          <p className={`text-sm font-bold uppercase tracking-wider ${
            data.transactionType === 'Return' ? 'text-rose-600' : 'text-indigo-900'
          }`}>
            {data.transactionType}
          </p>
          <div className="w-full h-px bg-slate-200 my-2"></div>
          <p className="text-xs text-slate-500 mb-0.5">Number: <span className="font-bold text-slate-900">{data.transactionNumber}</span></p>
          <p className="text-xs text-slate-500">Date: <span className="font-bold text-slate-900">{data.date}</span></p>
        </div>
      </div>

      {/* 2. Invoice Items Table */}
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-800 text-slate-800 uppercase tracking-wider text-[11px]">
            <th className="py-2 px-3 font-bold w-1/2">Item Description</th>
            <th className="py-2 px-3 font-bold">SKU</th>
            <th className="py-2 px-3 font-bold text-center">Qty</th>
            <th className="py-2 px-3 font-bold text-right">Unit Price</th>
            <th className="py-2 px-3 font-bold text-right">Total</th>
          </tr>
        </thead>
        <tbody className="text-slate-700 text-xs">
          {data.items.map((item, index) => (
            <tr 
              key={`${item.sku}-${index}`} 
              className="border-b border-slate-200 break-inside-avoid bg-white"
            >
              <td className="py-3 px-3 font-medium text-slate-900">{item.itemName}</td>
              <td className="py-3 px-3 font-mono text-[10px] text-slate-500">{item.sku}</td>
              <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
              <td className="py-3 px-3 text-right text-slate-500">
                {item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="py-3 px-3 text-right font-bold text-slate-900">
                {item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
        
        {/* 3. Invoice Totals */}
        <tfoot className="break-inside-avoid">
          {/* Spacer row to push totals down slightly */}
          <tr><td colSpan={5} className="py-2 border-t-2 border-slate-800"></td></tr>
          
          <tr className="text-slate-600 text-xs">
            <td colSpan={3} className="border-none"></td>
            <td className="py-1.5 px-3 text-right uppercase tracking-wider text-[10px] font-bold">Subtotal:</td>
            <td className="py-1.5 px-3 text-right font-medium">
              {data.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
          
          {data.discount > 0 && (
            <tr className="text-rose-600 text-xs">
              <td colSpan={3} className="border-none"></td>
              <td className="py-1.5 px-3 text-right uppercase tracking-wider text-[10px] font-bold">Discount:</td>
              <td className="py-1.5 px-3 text-right font-medium">
                -{data.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          )}
          
          <tr className="text-slate-600 text-xs">
            <td colSpan={3} className="border-none"></td>
            <td className="py-1.5 px-3 text-right uppercase tracking-wider text-[10px] font-bold">Tax (VAT):</td>
            <td className="py-1.5 px-3 text-right font-medium">
              {data.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
          
          <tr className="text-slate-900 text-sm border-t border-slate-200">
            <td colSpan={3} className="border-none"></td>
            <td className="py-3 px-3 text-right uppercase tracking-wider text-[11px] font-extrabold">Grand Total:</td>
            <td className="py-3 px-3 text-right font-extrabold text-indigo-900 text-base">
              {data.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
