'use client';

import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface InventoryReportViewProps {
  dateRange: DateRange | undefined;
  data: any[];
}

export default function InventoryReportView({ dateRange, data }: InventoryReportViewProps) {
  const generatedAt = format(new Date(), 'PPP p');

  const formatRange = (range: DateRange | undefined) => {
    if (!range?.from) return 'Full Inventory Overview';
    if (!range.to || range.from.toDateString() === range.to.toDateString()) {
       return format(range.from, 'MMMM d, yyyy');
    }
    return `${format(range.from, 'MMM d')} - ${format(range.to, 'MMM d, yyyy')}`;
  };

  const periodLabel = formatRange(dateRange);
  
  // Calculate Summaries
  const totalSKUs = data.length;
  const totalValue = data.reduce((acc, item) => {
    const val = parseFloat(item.totalValue.replace('Rs. ', '').replace(/,/g, ''));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
  const lowStockCount = data.filter(item => item.status === 'Low Stock').length;
  const outOfStockCount = data.filter(item => item.status === 'Out of Stock').length;

  return (
    <div 
      className="hidden print:block p-12 bg-white text-slate-900 font-sans w-full max-w-[1024px] mx-auto"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}
    >
      {/* PROFESSIONAL BLUE HEADER */}
      <div className="flex justify-between items-end border-b-8 border-blue-900 pb-10 mb-10">
        <div>
          <h1 className="text-[42px] font-black tracking-tighter text-blue-900 uppercase leading-[0.8] mb-3">Futura</h1>
          <h2 className="text-[20px] font-black tracking-tight text-blue-700 uppercase leading-none mb-6">Hardware & Solutions</h2>
          <div className="text-[11px] font-bold text-slate-500 space-y-1">
            <p>123 Hardware Lane, Colombo 10, Sri Lanka</p>
            <p>TIN: 12345678-0000 | VAT REG: 22334455</p>
            <div className="pt-4 flex items-center gap-4">
               <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 uppercase tracking-widest text-[9px] font-black">Inventory Audit Report</div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REF: INV-{format(new Date(), 'yyyyMMdd')}-X</span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-blue-900 font-black text-[12px] uppercase tracking-widest mb-2">Audit Period</div>
          <div className="text-[24px] font-black text-slate-900 tracking-tighter mb-3 leading-none">{periodLabel}</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Generated: {generatedAt}</p>
        </div>
      </div>

      {/* FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-900 p-6 rounded-[20px] text-white shadow-lg flex flex-col justify-between h-[150px]">
           <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Total Inventory Asset Value</span>
           <div>
              <p className="text-[32px] font-black tracking-tighter leading-none mb-1">Rs. {totalValue.toLocaleString()}</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Audited Market Value</p>
           </div>
        </div>
        <div className="bg-white border-2 border-blue-100 p-6 rounded-[20px] flex flex-col justify-between h-[150px]">
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-900/40">Total Active SKUs</span>
           <div>
              <p className="text-[32px] font-black tracking-tighter text-blue-900 leading-none mb-1">{totalSKUs}</p>
              <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest">Unique Product Lines</p>
           </div>
        </div>
        <div className="bg-amber-50 p-6 rounded-[20px] flex flex-col justify-between h-[150px] border border-amber-100">
           <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-900/40">Supply Chain Risk</span>
           <div>
              <p className="text-[32px] font-black tracking-tighter text-amber-700 leading-none mb-1">{lowStockCount + outOfStockCount}</p>
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Low/Out of Stock Items</p>
           </div>
        </div>
      </div>

      {/* PRODUCT LISTING TABLE BY CATEGORY */}
      {(() => {
        // Group by category
        const categoriesMap = new Map<string, any[]>();
        data.forEach((item) => {
          const cat = item.category || 'Uncategorized';
          if (!categoriesMap.has(cat)) categoriesMap.set(cat, []);
          categoriesMap.get(cat)!.push(item);
        });

        return Array.from(categoriesMap.entries()).map(([catName, items], catIdx) => (
          <section key={catName} className={`mb-10 ${catIdx > 0 ? 'print:break-before-page pt-6' : ''}`}>
            <div className="flex items-center gap-4 mb-4 pb-2 border-b-2 border-blue-900">
              <h3 className="text-[16px] font-black text-blue-900 uppercase tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-900 rounded-full inline-block"></span>
                {catName} ({items.length} Products)
              </h3>
              <div className="flex-1 h-[2px] bg-blue-100"></div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Product & SKU</th>
                  <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Barcode</th>
                  <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Subcategory</th>
                  <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Brand</th>
                  <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Qty</th>
                  <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Unit Cost</th>
                  <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Total Value</th>
                  <th className="py-2.5 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 font-bold text-slate-900">
                      <p className="text-[12px]">{item.name}</p>
                      <p className="text-[9px] font-mono text-slate-400">{item.sku}</p>
                    </td>
                    <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700 text-[10px]">
                      {item.barcode || item.sku || '—'}
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-600">{item.subCategory || item.subcategory || '—'}</td>
                    <td className="py-3 px-2 font-medium text-slate-600">{item.brand || '—'}</td>
                    <td className="py-3 px-2 text-right font-black text-slate-900">{item.qty}</td>
                    <td className="py-3 px-2 text-right font-bold text-slate-600">{item.unitCost}</td>
                    <td className="py-3 px-2 text-right font-black text-blue-900">{item.totalValue}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                        item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ));
      })()}

      {/* PROFESSIONAL FOOTER */}
      <div className="mt-20 pt-10 border-t border-blue-100 grid grid-cols-2 gap-20">
         <div>
            <p className="text-[9px] font-black text-blue-900 uppercase tracking-[0.2em] mb-4">Stock Verification Statement</p>
            <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic border-l-4 border-blue-100 pl-4">
               This automated inventory audit is synchronized with the Futura Central Warehouse Engine. Figures reflect on-hand physical quantities as of the generation timestamp. Discrepancies must be reported to the Floor Manager.
            </p>
         </div>
         <div className="flex flex-col justify-end items-end gap-10">
            <div className="flex gap-16">
               <div className="text-center">
                  <div className="w-[120px] border-b border-slate-200 mb-2"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Auditor Signature</span>
               </div>
               <div className="text-center">
                  <div className="w-[120px] border-b border-slate-200 mb-2"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Stock Manager Approval</span>
               </div>
            </div>
            <div className="text-[9px] font-black text-blue-900 uppercase tracking-widest">
               Futura Hardware Solutions &copy; {new Date().getFullYear()}
            </div>
         </div>
      </div>
    </div>
  );
}
