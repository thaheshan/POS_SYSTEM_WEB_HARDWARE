'use client';

import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface CategoryPrintViewProps {
  category: 'A' | 'B' | 'C' | null;
  dateRange: DateRange | undefined;
  timeFilter: string;
  data: any;
}

const MOCK_ORDERS = [
  { id: 'PROD-001', name: 'Holcim Cement 50kg', unitPrice: 1650, tax: 204,  total: 1650 },
  { id: 'PROD-002', name: 'Steel Rod 12mm',     unitPrice: 3200, tax: 396,  total: 3200 },
  { id: 'PROD-003', name: 'PVC Pipe 1"×10ft',   unitPrice: 480,  tax: 59,   total: 480  },
];

const MOCK_INVOICES = [
  { id: 'SKU: RB-25K-001', name: 'Rice Bag 25kg', taxStatus: 'Non-Taxable', total: 5000 },
  { id: 'SKU: WF-10K-002', name: 'Wheat Flour 10kg', taxStatus: 'Non-Taxable', total: 3500 },
  { id: 'SKU: OV-001', name: 'Overflow Invoice #1', taxStatus: 'Overflow', total: 12500 },
];

const MOCK_ENTRIES = [
  { labour: 'A', id: 'LAB-2453', expenseType: 'Tea',    total: 5000  },
  { labour: 'B', id: 'LAB-9752', expenseType: 'Salary', total: 3500  },
  { labour: 'C', id: 'LAB-1100', expenseType: 'Travel', total: 1200  },
];

export default function CategoryPrintView({ category, dateRange, timeFilter, data }: CategoryPrintViewProps) {
  if (!category) return null;

  // Calculate explicit date range from timeFilter
  const { subDays } = require('date-fns');
  let startDate = new Date();
  const endDate = new Date();
  if (timeFilter === 'Last 7 Days') startDate = subDays(endDate, 7);
  else if (timeFilter === 'Last 30 Days') startDate = subDays(endDate, 30);
  else if (timeFilter === 'Last 365 Days') startDate = subDays(endDate, 365);
  else startDate = subDays(endDate, 1); // Last 24 Hours
  
  const explicitPeriodRange = `${format(startDate, 'MMM dd, yyyy')} — ${format(endDate, 'MMM dd, yyyy')}`;

  const generatedAt  = format(new Date(), 'PPP p');
  const refId        = `SHR-${format(new Date(), 'yyyyMMdd')}-${category}`;

  const CATEGORY_META = {
    A: { label: 'Category A', title: 'Taxable Sales Activity',          accent: '#1e40af', tag: 'TAX-APPLICABLE' },
    B: { label: 'Category B', title: 'Non-Tax & Overflow Activity',     accent: '#15803d', tag: 'NON-TAXABLE / OVERFLOW' },
    C: { label: 'Category C', title: 'Services & Internal Entries',     accent: '#a16207', tag: 'LABOUR & MISC' },
  };
  const meta = CATEGORY_META[category];

  return (
    <div
      className="hidden print:block p-14 bg-white text-slate-900 font-sans w-full"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}
    >
      {/* ── HEADER ── */}
      <div className="flex justify-between items-end pb-10 mb-10" style={{ borderBottom: `6px solid ${meta.accent}` }}>
        <div>
          <h1 className="text-[44px] font-black tracking-tighter leading-none mb-2" style={{ color: meta.accent }}>
            Futura Hardware
          </h1>
          <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.25em] mb-6">
            Detailed Financial Report
          </p>
          <div className="text-[12px] font-bold text-slate-400 space-y-1">
            <p>123 Hardware Lane, Colombo 10, Sri Lanka</p>
            <p>TIN: 12345678-0000 &nbsp;|&nbsp; VAT REG: 22334455</p>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block text-white px-6 py-2.5 mb-5 rounded-lg"
            style={{ backgroundColor: meta.accent }}>
            <span className="text-[13px] font-black uppercase tracking-[0.25em]">
              {meta.label} Itemized Report
            </span>
          </div>
          <p className="text-[14px] font-black tracking-tight text-slate-800 mb-1">REF: {refId}</p>
          <p className="text-[11px] font-bold text-slate-400">Generated: {generatedAt}</p>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="grid grid-cols-3 gap-5 mb-14">
        {/* Period */}
        <div className="rounded-2xl p-7 flex flex-col justify-between" style={{ backgroundColor: `${meta.accent}12`, border: `1.5px solid ${meta.accent}30` }}>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: meta.accent }}>Reporting Period</span>
          <div>
            <p className="text-[17px] font-black text-slate-900 leading-tight tracking-tight">{timeFilter}</p>
            <p className="text-[11px] font-bold text-slate-500 mt-2 uppercase tracking-widest">{explicitPeriodRange}</p>
          </div>
        </div>

        {/* Category A specifics */}
        {category === 'A' && <>
          <div className="bg-white rounded-2xl p-7 flex flex-col justify-between" style={{ border: `1.5px solid ${meta.accent}30` }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: meta.accent }}>Total Transactions</span>
            <div>
              <p className="text-[34px] font-black leading-none" style={{ color: meta.accent }}>{data.catA.txns}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Taxable Entries</p>
            </div>
          </div>
          <div className="rounded-2xl p-7 flex flex-col justify-between text-white" style={{ backgroundColor: meta.accent }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70 text-right block">Gross Taxable Sales</span>
            <div className="text-right">
              <p className="text-[30px] font-black leading-none">Rs. {data.catA.core.toLocaleString()}</p>
              <p className="text-[10px] font-bold mt-2 uppercase tracking-widest opacity-60">Audited Value</p>
            </div>
          </div>
        </>}

        {category === 'B' && <>
          <div className="bg-white rounded-2xl p-7 flex flex-col justify-between" style={{ border: `1.5px solid ${meta.accent}30` }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: meta.accent }}>Total Invoices</span>
            <div>
              <p className="text-[34px] font-black leading-none" style={{ color: meta.accent }}>{data.catB.txns}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Non-Tax / Overflow</p>
            </div>
          </div>
          <div className="rounded-2xl p-7 flex flex-col justify-between text-white" style={{ backgroundColor: meta.accent }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70 text-right block">Category B Total</span>
            <div className="text-right">
              <p className="text-[30px] font-black leading-none">Rs. {data.catB.core.toLocaleString()}</p>
              <p className="text-[10px] font-bold mt-2 uppercase tracking-widest opacity-60">Audited Value</p>
            </div>
          </div>
        </>}

        {category === 'C' && <>
          <div className="bg-white rounded-2xl p-7 flex flex-col justify-between" style={{ border: `1.5px solid ${meta.accent}30` }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: meta.accent }}>Total Entries</span>
            <div>
              <p className="text-[34px] font-black leading-none" style={{ color: meta.accent }}>{data.catC.entries}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Labour & Misc</p>
            </div>
          </div>
          <div className="rounded-2xl p-7 flex flex-col justify-between text-white" style={{ backgroundColor: meta.accent }}>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70 text-right block">Services Total</span>
            <div className="text-right">
              <p className="text-[30px] font-black leading-none">Rs. {data.catC.core.toLocaleString()}</p>
              <p className="text-[10px] font-bold mt-2 uppercase tracking-widest opacity-60">Audited Value</p>
            </div>
          </div>
        </>}
      </div>

      {/* ── OVERVIEW SECTION ── */}
      <div className="mb-14">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: meta.accent }}></div>
          <h3 className="text-[18px] font-black uppercase tracking-tight" style={{ color: meta.accent }}>
            Overview & Analyziz
          </h3>
          <div className="flex-1 h-[1px] bg-slate-100"></div>
          <span className="text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest"
            style={{ backgroundColor: `${meta.accent}12`, color: meta.accent }}>
            {meta.tag}
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: `2px solid ${meta.accent}` }}>
              <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Classification / Description</th>
              <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Volume</th>
              <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Amount (LKR)</th>
            </tr>
          </thead>
          <tbody className="text-[13px] font-semibold">
            {category === 'A' && <>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="py-5 px-3 text-slate-700">Core Taxable Sales (Under Rs. 200,000 Daily Limit)</td>
                <td className="py-5 px-3 text-right font-black text-slate-900">{data.catA.txns} txns</td>
                <td className="py-5 px-3 text-right font-black font-mono text-slate-900">Rs. {data.catA.core.toLocaleString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#eff6ff40' }}>
                <td className="py-5 px-3 font-bold" style={{ color: meta.accent }}>VAT Liability Applied (18% of Core Sales)</td>
                <td className="py-5 px-3 text-right text-slate-400">—</td>
                <td className="py-5 px-3 text-right font-black font-mono" style={{ color: meta.accent }}>Rs. {data.catA.vat.toLocaleString()}</td>
              </tr>
              <tr style={{ backgroundColor: `${meta.accent}08` }}>
                <td colSpan={2} className="py-4 px-3 font-black uppercase text-[11px]" style={{ color: meta.accent }}>Total Taxable Gross (incl. VAT)</td>
                <td className="py-4 px-3 text-right font-black text-[17px] font-mono" style={{ color: meta.accent }}>
                  Rs. {(data.catA.core + data.catA.vat).toLocaleString()}
                </td>
              </tr>
            </>}

            {category === 'B' && <>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="py-5 px-3 text-slate-700">Daily Threshold Overflow (Combined Value &gt; Rs. 200,000)</td>
                <td className="py-5 px-3 text-right font-black text-slate-900">{data.catB.txns} txns</td>
                <td className="py-5 px-3 text-right font-black font-mono text-slate-900">Rs. {data.catB.overflow.toLocaleString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f0fdf440' }}>
                <td className="py-5 px-3 text-slate-700">Legally Exempt Items (Books, Medical, Agri Products)</td>
                <td className="py-5 px-3 text-right font-black text-slate-900">{data.catB.items} units</td>
                <td className="py-5 px-3 text-right font-black font-mono text-slate-900">Rs. {data.catB.baseNonTax.toLocaleString()}</td>
              </tr>
              <tr style={{ backgroundColor: `${meta.accent}08` }}>
                <td colSpan={2} className="py-4 px-3 font-black uppercase text-[11px]" style={{ color: meta.accent }}>Category B Total (Non-Taxable)</td>
                <td className="py-4 px-3 text-right font-black text-[17px] font-mono" style={{ color: meta.accent }}>
                  Rs. {data.catB.core.toLocaleString()}
                </td>
              </tr>
            </>}

            {category === 'C' && <>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="py-5 px-3 text-slate-700">Skilled Labour & Technical Man-Hours</td>
                <td className="py-5 px-3 text-right font-black text-slate-900">{data.catC.entries} entries</td>
                <td className="py-5 px-3 text-right font-black font-mono text-slate-900">Rs. {data.catC.labour.toLocaleString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fffbeb40' }}>
                <td className="py-5 px-3 text-slate-700">Installation & Setup Internal Fees</td>
                <td className="py-5 px-3 text-right text-slate-400">—</td>
                <td className="py-5 px-3 text-right font-black font-mono text-slate-900">Rs. {data.catC.install.toLocaleString()}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="py-5 px-3 text-slate-700">Miscellaneous Hardware Costs & Expenses</td>
                <td className="py-5 px-3 text-right text-slate-400">—</td>
                <td className="py-5 px-3 text-right font-black font-mono text-slate-900">Rs. {data.catC.misc.toLocaleString()}</td>
              </tr>
              <tr style={{ backgroundColor: `${meta.accent}08` }}>
                <td colSpan={2} className="py-4 px-3 font-black uppercase text-[11px]" style={{ color: meta.accent }}>Total Category C (Services)</td>
                <td className="py-4 px-3 text-right font-black text-[17px] font-mono" style={{ color: meta.accent }}>
                  Rs. {data.catC.core.toLocaleString()}
                </td>
              </tr>
            </>}
          </tbody>
        </table>
      </div>

      {/* ── ITEMIZED BREAKDOWN ── */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: meta.accent }}></div>
          <h3 className="text-[18px] font-black uppercase tracking-tight" style={{ color: meta.accent }}>
            Itemized Transaction Details
          </h3>
          <div className="flex-1 h-[1px] bg-slate-100"></div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: `2px solid ${meta.accent}` }}>
              {category === 'A' && <>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Description</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Unit Price</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Tax (VAT)</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Total Amount</th>
              </>}
              {category === 'B' && <>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Invoice ID</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Description</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Tax Status</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Total Amount</th>
              </>}
              {category === 'C' && <>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Reference ID</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Assignee/Labour</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Expense Type</th>
                <th className="py-4 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Total Amount</th>
              </>}
            </tr>
          </thead>
          <tbody className="text-[12.5px] font-medium">
            {category === 'A' && MOCK_ORDERS.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="py-4 px-3 font-mono font-bold text-slate-600">{item.id}</td>
                <td className="py-4 px-3 text-slate-800 font-bold">{item.name}</td>
                <td className="py-4 px-3 text-right text-slate-600 font-mono">Rs. {item.unitPrice.toLocaleString()}</td>
                <td className="py-4 px-3 text-right text-slate-500 font-mono">Rs. {item.tax.toLocaleString()}</td>
                <td className="py-4 px-3 text-right font-black text-slate-900 font-mono">Rs. {item.total.toLocaleString()}</td>
              </tr>
            ))}
            {category === 'B' && MOCK_INVOICES.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="py-4 px-3 font-mono font-bold text-slate-600">{item.id}</td>
                <td className="py-4 px-3 text-slate-800 font-bold">{item.name}</td>
                <td className="py-4 px-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded" style={{ backgroundColor: '#f1f5f9', color: meta.accent }}>
                    {item.taxStatus}
                  </span>
                </td>
                <td className="py-4 px-3 text-right font-black text-slate-900 font-mono">Rs. {item.total.toLocaleString()}</td>
              </tr>
            ))}
            {category === 'C' && MOCK_ENTRIES.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="py-4 px-3 font-mono font-bold text-slate-600">{item.id}</td>
                <td className="py-4 px-3 text-slate-800 font-bold">Labour {item.labour}</td>
                <td className="py-4 px-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-black px-2 py-1 rounded" style={{ backgroundColor: '#f1f5f9', color: meta.accent }}>
                    {item.expenseType}
                  </span>
                </td>
                <td className="py-4 px-3 text-right font-black text-slate-900 font-mono">Rs. {item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER ── */}
      <div className="pt-10 flex justify-between items-end break-inside-avoid" style={{ borderTop: '1px solid #e2e8f0' }}>
        <div className="max-w-[380px]">
          <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-slate-400">Internal Certification</p>
          <p className="text-[11px] font-bold text-slate-300 leading-relaxed pl-3" style={{ borderLeft: `3px solid ${meta.accent}30` }}>
            Computer-generated output of Futura Hardware Management System. Reflects closed accounts for the stated period. Valid for internal audit and IRD Tier-2 declaration.
          </p>
        </div>
        <div className="flex gap-16 items-end">
          {['Auditor Signature', 'Finance Approval'].map(label => (
            <div key={label} className="text-center">
              <div className="w-[140px] border-b-2 border-slate-200 mb-2"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
