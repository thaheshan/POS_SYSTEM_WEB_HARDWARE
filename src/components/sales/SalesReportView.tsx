'use client';

import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface SalesReportViewProps {
  dateRange: DateRange | undefined;
  data: any;
  suppressPrint?: boolean;
}

export default function SalesReportView({ dateRange, data, suppressPrint = false }: SalesReportViewProps) {
  const fromDate = dateRange?.from ? format(dateRange.from, 'PPP') : 'N/A';
  const toDate = dateRange?.to ? format(dateRange.to, 'PPP') : 'N/A';
  const generatedAt = format(new Date(), 'PPP p');

  const formatRange = (range: DateRange | undefined) => {
    if (!range?.from) return 'Select Period';
    if (!range.to || range.from.toDateString() === range.to.toDateString()) {
       return format(range.from, 'MMMM d, yyyy');
    }
    return `${format(range.from, 'MMM d')} - ${format(range.to, 'MMM d, yyyy')}`;
  };

  const periodLabel = formatRange(dateRange);
  const totalSales = data.catA.core + data.catB.core + data.catC.core;
  const totalVAT = data.catA.vat;
  const totalEntries = data.catA.txns + data.catB.txns + data.catC.entries;

  return (
    <div 
      className={`${suppressPrint ? '!hidden' : 'hidden print:block'} p-16 bg-white text-slate-900 font-sans w-full max-w-[1024px] mx-auto`}
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}
    >
      {/* PROFESSIONAL BLUE HEADER */}
      <div className="flex justify-between items-end border-b-8 border-blue-900 pb-12 mb-12">
        <div>
          <h1 className="text-[48px] font-black tracking-tighter text-blue-900 uppercase leading-[0.8] mb-3">Futura</h1>
          <h2 className="text-[24px] font-black tracking-tight text-blue-700 uppercase leading-none mb-6">Hardware & Solutions</h2>
          <div className="text-[12px] font-bold text-slate-500 space-y-1">
            <p>123 Hardware Lane, Colombo 10, Sri Lanka</p>
            <p>TIN: 12345678-0000 | VAT REG: 22334455</p>
            <div className="pt-4 flex items-center gap-4">
               <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 uppercase tracking-widest text-[10px] font-black">Official Audit Report</div>
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ID: SHR-{format(new Date(), 'yyyyMMdd')}-X</span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="text-blue-900 font-black text-[14px] uppercase tracking-widest mb-2">Reporting Period</div>
          <div className="text-[28px] font-black text-slate-900 tracking-tighter mb-4 leading-none">{periodLabel}</div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Generated: {generatedAt}</p>
        </div>
      </div>

      {/* BLUE THEMED FINANCIAL SUMMARY */}
      <div className="grid grid-cols-3 gap-6 mb-16">
        <div className="bg-blue-900 p-8 rounded-[24px] text-white shadow-xl flex flex-col justify-between h-[180px]">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Gross Revenue</span>
           <div>
              <p className="text-[36px] font-black tracking-tighter leading-none mb-1">Rs. {totalSales.toLocaleString()}</p>
              <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Audited Combined Total</p>
           </div>
        </div>
        <div className="bg-white border-2 border-blue-100 p-8 rounded-[24px] flex flex-col justify-between h-[180px]">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/40">VAT Liability</span>
           <div>
              <p className="text-[36px] font-black tracking-tighter text-blue-900 leading-none mb-1">Rs. {totalVAT.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-blue-600/60 uppercase tracking-widest">Category A (18%)</p>
           </div>
        </div>
        <div className="bg-blue-50 p-8 rounded-[24px] flex flex-col justify-between h-[180px]">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-900/40">Capture Count</span>
           <div>
              <p className="text-[36px] font-black tracking-tighter text-blue-900 leading-none mb-1">{totalEntries}</p>
              <p className="text-[11px] font-bold text-blue-600/60 uppercase tracking-widest">Total Active Entries</p>
           </div>
        </div>
      </div>

      {/* WELL STRUCTURED TABLES: CATEGORY A */}
      <section className="mb-14">
         <div className="flex items-center gap-4 mb-6">
            <h3 className="text-[18px] font-black text-blue-900 uppercase tracking-tight">01. Taxable Sales Overview</h3>
            <div className="flex-1 h-[2px] bg-blue-50"></div>
         </div>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b-2 border-blue-900">
                  <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-blue-900/50">Classification</th>
                  <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-blue-900/50 text-right">Transactions</th>
                  <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-blue-900/50 text-right">Amount (LKR)</th>
               </tr>
            </thead>
            <tbody className="text-[13px]">
               <tr className="border-b border-blue-50">
                  <td className="py-5 px-2 font-bold text-slate-700">Core Taxable Sales (Daily Limit Applied)</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">{data.catA.txns}</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">Rs. {data.catA.core.toLocaleString()}</td>
               </tr>
               <tr className="bg-blue-50/20">
                  <td className="py-5 px-2 font-bold text-blue-700">Value Added Tax (VAT 18%)</td>
                  <td className="py-5 px-2 text-right font-black text-blue-700">—</td>
                  <td className="py-5 px-2 text-right font-black text-blue-700 font-mono tracking-tighter">Rs. {data.catA.vat.toLocaleString()}</td>
               </tr>
            </tbody>
         </table>
      </section>

      {/* CATEGORY B: NON-TAX & OVERFLOW */}
      <section className="mb-14">
         <div className="flex items-center gap-4 mb-6">
            <h3 className="text-[18px] font-black text-blue-900 uppercase tracking-tight">02. Non-Tax & Overflow Activity</h3>
            <div className="flex-1 h-[2px] bg-blue-50"></div>
         </div>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b-2 border-blue-900">
                  <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-blue-900/50">Classification</th>
                  <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-blue-900/50 text-right">Volume</th>
                  <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-blue-900/50 text-right">Amount (LKR)</th>
               </tr>
            </thead>
            <tbody className="text-[13px]">
               <tr className="border-b border-blue-50">
                  <td className="py-5 px-2 font-bold text-slate-700">Daily Threshold Overflow (Sales &gt; Rs. 2L)</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">{data.catB.txns} txns</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">Rs. {data.catB.overflow.toLocaleString()}</td>
               </tr>
               <tr className="border-b border-blue-50">
                  <td className="py-5 px-2 font-bold text-slate-700">Legal Duty Exemption Products</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">{data.catB.items} units</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">Rs. {data.catB.baseNonTax.toLocaleString()}</td>
               </tr>
               <tr className="bg-blue-50/20 border-t-2 border-blue-900/10">
                  <td className="py-5 px-2 font-black text-blue-900 uppercase tracking-widest text-[11px]">Subtotal Category B</td>
                  <td className="py-5 px-2 text-right">—</td>
                  <td className="py-5 px-2 text-right font-black text-[16px] text-blue-900 font-mono tracking-tighter">Rs. {data.catB.core.toLocaleString()}</td>
               </tr>
            </tbody>
         </table>
      </section>

      {/* CATEGORY C: SERVICES */}
      <section className="mb-20">
         <div className="flex items-center gap-4 mb-6">
            <h3 className="text-[18px] font-black text-blue-900 uppercase tracking-tight">03. Services & Miscellaneous</h3>
            <div className="flex-1 h-[2px] bg-blue-50"></div>
         </div>
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b-2 border-blue-900">
                  <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-blue-900/50">Service Type</th>
                  <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-blue-900/50 text-right">Count</th>
                  <th className="py-4 px-2 text-[11px] font-black uppercase tracking-widest text-blue-900/50 text-right">Amount (LKR)</th>
               </tr>
            </thead>
            <tbody className="text-[13px]">
               <tr className="border-b border-blue-50">
                  <td className="py-5 px-2 font-bold text-slate-700">Labour & Technical Man-Hours</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">{data.catC.entries}</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">Rs. {data.catC.labour.toLocaleString()}</td>
               </tr>
               <tr className="border-b border-blue-50">
                  <td className="py-5 px-2 font-bold text-slate-700">Installation & Setup Internal Entries</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">—</td>
                  <td className="py-5 px-2 text-right font-black text-slate-900">Rs. {data.catC.install.toLocaleString()}</td>
               </tr>
               <tr className="bg-blue-50/20 border-t-2 border-blue-900/10">
                  <td className="py-5 px-2 font-black text-blue-900 uppercase tracking-widest text-[11px]">Subtotal Category C</td>
                  <td className="py-5 px-2 text-right">—</td>
                  <td className="py-5 px-2 text-right font-black text-[16px] text-blue-900 font-mono tracking-tighter">Rs. {data.catC.core.toLocaleString()}</td>
               </tr>
            </tbody>
         </table>
      </section>

      {/* PROFESSIONAL FOOTER */}
      <div className="mt-auto pt-12 border-t border-blue-100 grid grid-cols-2 gap-20">
         <div>
            <p className="text-[10px] font-black text-blue-900 uppercase tracking-[0.2em] mb-4">Internal Accountability</p>
            <p className="text-[12px] font-bold text-slate-400 leading-relaxed italic border-l-4 border-blue-100 pl-4">
               This automated fiscal output is generated by the Futura Hardware Core Management Engine. Figures reflect closed accounts for the specified period. Approved for Internal Audit and IRD Tier-2 Declaration.
            </p>
         </div>
         <div className="flex flex-col justify-end items-end gap-12">
            <div className="flex gap-20">
               <div className="text-center">
                  <div className="w-[140px] border-b-2 border-slate-200 mb-2"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Auditor Signature</span>
               </div>
               <div className="text-center">
                  <div className="w-[140px] border-b-2 border-slate-200 mb-2"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Finance Approval</span>
               </div>
            </div>
            <div className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
               Futura Hardware Solutions &copy; {new Date().getFullYear()}
            </div>
         </div>
      </div>
    </div>
  );
}
