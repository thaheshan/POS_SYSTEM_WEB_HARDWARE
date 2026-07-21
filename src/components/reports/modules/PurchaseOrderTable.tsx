import React from 'react';
import { PurchaseOrderDetails } from '@/types/report';

interface PurchaseOrderTableProps {
  data: PurchaseOrderDetails;
}

export default function PurchaseOrderTable({ data }: PurchaseOrderTableProps) {
  // Calculate the grand total
  const grandTotal = data.items.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className="w-full mt-2 flex-grow">
      
      {/* 1. Sub-Header: Supplier Details */}
      <div className="flex justify-between items-start mb-6 border border-slate-200 p-4 rounded bg-slate-50 print:bg-white print:border-slate-300">
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier Information</h3>
          <p className="text-sm font-bold text-slate-900">{data.supplierName}</p>
          <p className="text-xs text-slate-600 mt-0.5">{data.supplierContact}</p>
          <p className="text-xs text-slate-600">{data.supplierEmail}</p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Purchase Order</h3>
          <p className="text-lg font-bold text-indigo-900">{data.poNumber}</p>
          <div className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider print:border print:border-slate-800 bg-slate-200 text-slate-800">
            Status: {data.status}
          </div>
        </div>
      </div>

      {/* 2. Items Table */}
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-800 text-slate-800 uppercase tracking-wider text-[11px]">
            <th className="py-2 px-3 font-bold w-1/3">Product Name</th>
            <th className="py-2 px-3 font-bold">SKU</th>
            <th className="py-2 px-3 font-bold text-right">Qty</th>
            <th className="py-2 px-3 font-bold text-right">Unit Cost</th>
            <th className="py-2 px-3 font-bold text-right">Total Cost</th>
          </tr>
        </thead>
        <tbody className="text-slate-700 text-xs">
          {data.items.map((item, index) => (
            <tr 
              key={`${item.sku}-${index}`} 
              className={`border-b border-slate-200 break-inside-avoid ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              <td className="py-2 px-3 font-medium text-slate-900">{item.productName}</td>
              <td className="py-2 px-3 font-mono text-[10px]">{item.sku}</td>
              <td className="py-2 px-3 text-right">{item.orderedQuantity}</td>
              <td className="py-2 px-3 text-right text-slate-500">
                {item.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-3 text-right font-medium text-slate-900">
                {item.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-800 font-bold text-slate-900 break-inside-avoid">
            <td colSpan={4} className="py-3 px-3 text-right uppercase text-[11px] tracking-wider">
              Grand Total:
            </td>
            <td className="py-3 px-3 text-right text-sm">
              {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
