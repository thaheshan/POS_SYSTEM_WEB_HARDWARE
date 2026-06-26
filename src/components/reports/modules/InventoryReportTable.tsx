import React from 'react';
import { InventoryReportRow } from '@/types/report';

interface InventoryReportTableProps {
  data: InventoryReportRow[];
}

export default function InventoryReportTable({ data }: InventoryReportTableProps) {
  // Calculate total valuation for the footer row
  const totalValuation = data.reduce((sum, item) => sum + item.inventoryValuation, 0);

  return (
    <div className="w-full mt-4 flex-grow">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-800 text-slate-800 uppercase tracking-wider text-[11px]">
            <th className="py-2 px-3 font-bold">SKU</th>
            <th className="py-2 px-3 font-bold">Product Name</th>
            <th className="py-2 px-3 font-bold">Category</th>
            <th className="py-2 px-3 font-bold text-right">Stock</th>
            <th className="py-2 px-3 font-bold text-right">Reorder</th>
            <th className="py-2 px-3 font-bold text-center">Status</th>
            <th className="py-2 px-3 font-bold text-right">Valuation (LKR)</th>
          </tr>
        </thead>
        <tbody className="text-slate-700 text-xs">
          {data.map((item, index) => (
            <tr 
              key={item.sku} 
              // Alternating row colors for readability, avoiding page breaks mid-row
              className={`border-b border-slate-200 break-inside-avoid ${
                index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
              }`}
            >
              <td className="py-2 px-3 font-medium text-slate-900">{item.sku}</td>
              <td className="py-2 px-3">{item.productName}</td>
              <td className="py-2 px-3">{item.category}</td>
              
              {/* Highlight stock if it falls below reorder level */}
              <td className={`py-2 px-3 text-right font-medium ${
                item.currentStock <= item.reorderLevel ? 'text-red-600' : ''
              }`}>
                {item.currentStock}
              </td>
              <td className="py-2 px-3 text-right text-slate-500">{item.reorderLevel}</td>
              
              <td className="py-2 px-3 text-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider print:border ${
                  item.stockStatus === 'In Stock' ? 'bg-green-100 text-green-800 print:border-green-800' :
                  item.stockStatus === 'Low Stock' ? 'bg-amber-100 text-amber-800 print:border-amber-800' :
                  'bg-red-100 text-red-800 print:border-red-800'
                }`}>
                  {item.stockStatus}
                </span>
              </td>
              <td className="py-2 px-3 text-right font-medium">
                {item.inventoryValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-800 font-bold text-slate-900 break-inside-avoid">
            <td colSpan={6} className="py-3 px-3 text-right uppercase text-[11px] tracking-wider">
              Total Inventory Valuation:
            </td>
            <td className="py-3 px-3 text-right">
              {totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
