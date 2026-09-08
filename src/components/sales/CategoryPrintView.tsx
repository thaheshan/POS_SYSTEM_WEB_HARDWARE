'use client';

import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface CategoryPrintViewProps {
  category: 'A' | 'B' | 'C' | null;
  dateRange: DateRange | undefined;
  timeFilter: string;
  data: any;
  isAdmin?: boolean;
}

export default function CategoryPrintView({
  category,
  dateRange,
  timeFilter,
  data,
  isAdmin = true,
}: CategoryPrintViewProps) {
  if (!category) return null;
  if (!isAdmin && (category === 'A' || category === 'B')) return null;

  const { subDays } = require('date-fns');
  let startDate = new Date();
  const endDate = new Date();
  if (timeFilter === 'Last 7 Days') startDate = subDays(endDate, 7);
  else if (timeFilter === 'Last 30 Days') startDate = subDays(endDate, 30);
  else if (timeFilter === 'Last 365 Days') startDate = subDays(endDate, 365);
  else startDate = subDays(endDate, 1);

  const explicitPeriodRange = `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`;
  const generatedAt = format(new Date(), 'PPP p');
  const refId = `SHR-${format(new Date(), 'yyyyMMdd')}-${category}`;

  const CATEGORY_META = {
    A: { label: 'Category A', title: 'Taxable Sales Activity', accent: '#1e3a8a', tag: 'TAX-APPLICABLE (18% VAT)' },
    B: { label: 'Category B', title: 'Non-Tax & Overflow Activity', accent: '#059669', tag: 'NON-TAXABLE / OVERFLOW' },
    C: { label: 'Category C', title: 'Services & Internal Entries', accent: '#7c3aed', tag: 'LABOUR & MISC' },
  };

  const meta = CATEGORY_META[category];

  const fmtRs = (n: number) =>
    'Rs. ' + Math.round(n).toLocaleString('en-LK');

  const catATxns = data?.catA?.allTxns || [];
  const catBTxns = data?.catB?.allTxns || [];

  return (
    <div
      className="hidden print:block bg-white text-slate-900 font-sans"
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        padding: '36pt 40pt',
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        fontSize: '10pt',
      } as any}
    >
      {/* ══════════ HEADER ══════════ */}
      <div style={{ borderBottom: `6px solid ${meta.accent}`, paddingBottom: '20pt', marginBottom: '18pt' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '36pt', fontWeight: 900, color: meta.accent, letterSpacing: '-1px', lineHeight: 1, textTransform: 'uppercase' }}>
              Futura
            </div>
            <div style={{ fontSize: '14pt', fontWeight: 900, color: '#1d4ed8', letterSpacing: '-0.5px', textTransform: 'uppercase', marginBottom: '10pt' }}>
              Hardware &amp; Solutions
            </div>
            <div style={{ fontSize: '8pt', color: '#64748b', lineHeight: 1.6 }}>
              <div>123 Hardware Lane, Colombo 10, Sri Lanka</div>
              <div>TIN: 12345678-0000 &nbsp;|&nbsp; VAT REG: 22334455</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', background: '#eff6ff', border: `1px solid ${meta.accent}40`, borderRadius: '6px', padding: '3pt 10pt', fontSize: '8pt', fontWeight: 900, color: meta.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8pt' }}>
              {meta.label} Itemized Report
            </div>
            <div style={{ fontSize: '8pt', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Reporting Period
            </div>
            <div style={{ fontSize: '14pt', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', margin: '4pt 0' }}>
              {explicitPeriodRange}
            </div>
            <div style={{ fontSize: '8pt', color: '#94a3b8' }}>
              Generated: {generatedAt}
            </div>
            <div style={{ fontSize: '7pt', color: '#94a3b8', marginTop: '2pt' }}>
              REF: {refId}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ SUMMARY CARDS ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '10pt', marginBottom: '22pt' }}>
        {/* Period Card */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14pt 16pt', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '90pt' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: meta.accent }}>
            Filter Selection
          </div>
          <div>
            <div style={{ fontSize: '16pt', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
              {timeFilter}
            </div>
            <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3pt' }}>
              Audited Timeframe
            </div>
          </div>
        </div>

        {/* Category specific card 1 */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14pt 16pt', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '90pt' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: meta.accent }}>
            {category === 'A' ? 'Transactions' : category === 'B' ? 'Invoices' : 'Entries'}
          </div>
          <div>
            <div style={{ fontSize: '28pt', fontWeight: 900, color: meta.accent, letterSpacing: '-1px', lineHeight: 1 }}>
              {category === 'A' ? (data?.catA?.txns || 0) : category === 'B' ? (data?.catB?.txns || 0) : (data?.catC?.entries || 0)}
            </div>
            <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3pt' }}>
              Volume Count
            </div>
          </div>
        </div>

        {/* Category total card */}
        <div style={{ background: meta.accent, borderRadius: '12px', padding: '14pt 16pt', color: 'white', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '90pt' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.65 }}>
            {meta.label} Audited Total
          </div>
          <div>
            <div style={{ fontSize: '22pt', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
              {fmtRs(category === 'A' ? (data?.catA?.core || 0) : category === 'B' ? (data?.catB?.core || 0) : (data?.catC?.core || 0))}
            </div>
            <div style={{ fontSize: '7.5pt', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3pt' }}>
              Financial Value
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ OVERVIEW TABLE ══════════ */}
      <section style={{ marginBottom: '20pt' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', borderBottom: `2px solid ${meta.accent}`, paddingBottom: '5pt', marginBottom: '8pt' }}>
          <span style={{ width: '10px', height: '10px', background: meta.accent, borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ fontSize: '11pt', fontWeight: 900, color: meta.accent, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
            Overview &amp; Classification Analysis
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
          <colgroup>
            <col style={{ width: '55%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '25%' }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1' }}>
              <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'left' }}>
                Classification / Description
              </th>
              <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'right' }}>
                Volume
              </th>
              <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'right' }}>
                Amount (LKR)
              </th>
            </tr>
          </thead>
          <tbody>
            {category === 'A' && (
              <>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>Core Taxable Sales (Under Daily Threshold)</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{data?.catA?.txns || 0} txns</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{fmtRs(data?.catA?.core || 0)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#eff6ff' }}>
                  <td style={{ padding: '6pt 8pt', fontWeight: 700, color: meta.accent }}>Value Added Tax (VAT 18%)</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: meta.accent, fontFamily: 'monospace' }}>{fmtRs(data?.catA?.vat || 0)}</td>
                </tr>
              </>
            )}

            {category === 'B' && (
              <>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>Daily Threshold Overflow (Sales &gt; Rs. 200,000)</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{data?.catB?.txns || 0} txns</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{fmtRs(data?.catB?.overflow || 0)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>Legally Exempt Items</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{data?.catB?.items || 0} units</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{fmtRs(data?.catB?.baseNonTax || 0)}</td>
                </tr>
              </>
            )}

            {category === 'C' && (
              <>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>Skilled Labour &amp; Technical Man-Hours</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{data?.catC?.entries || 0} entries</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{fmtRs(data?.catC?.labour || 0)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>Installation &amp; Setup Internal Fees</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', color: '#94a3b8' }}>—</td>
                  <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>{fmtRs(data?.catC?.install || 0)}</td>
                </tr>
              </>
            )}

            <tr style={{ background: '#f1f5f9', borderTop: '1.5px solid #cbd5e1' }}>
              <td style={{ padding: '6pt 8pt', fontSize: '7.5pt', fontWeight: 900, color: meta.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {meta.label} Total Subtotal
              </td>
              <td style={{ padding: '6pt 8pt', textAlign: 'right' }}>—</td>
              <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: meta.accent }}>
                {fmtRs(category === 'A' ? (data?.catA?.core || 0) : category === 'B' ? (data?.catB?.core || 0) : (data?.catC?.core || 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ══════════ ITEMIZED DETAILS ══════════ */}
      {(catATxns.length > 0 || catBTxns.length > 0) && (
        <section style={{ marginBottom: '20pt' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', borderBottom: `2px solid ${meta.accent}`, paddingBottom: '5pt', marginBottom: '8pt' }}>
            <span style={{ width: '10px', height: '10px', background: meta.accent, borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontSize: '11pt', fontWeight: 900, color: meta.accent, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
              Itemized Transaction Records
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
            <colgroup>
              <col style={{ width: '22%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1' }}>
                <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'left' }}>Invoice #</th>
                <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'left' }}>Mode</th>
                <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(category === 'A' ? catATxns : catBTxns).map((item: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '5pt 8pt', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{item.id}</td>
                  <td style={{ padding: '5pt 8pt', color: '#64748b' }}>{item.time || '—'}</td>
                  <td style={{ padding: '5pt 8pt' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '1pt 5pt', fontSize: '7pt', fontWeight: 800, textTransform: 'uppercase' }}>
                      {item.mode || 'CASH'}
                    </span>
                  </td>
                  <td style={{ padding: '5pt 8pt', fontWeight: 600, color: '#334155' }}>{category === 'A' ? 'Cat A (Taxable)' : 'Cat B (Non-Tax)'}</td>
                  <td style={{ padding: '5pt 8pt', textAlign: 'right', fontWeight: 900, color: meta.accent, fontFamily: 'monospace' }}>
                    {fmtRs(Number(item.rawAmount || item.amount || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ══════════ GRAND TOTAL BANNER ══════════ */}
      <div style={{ background: meta.accent, borderRadius: '10px', padding: '12pt 18pt', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6pt', marginBottom: '24pt' }}>
        <div style={{ color: 'white', fontSize: '10pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {meta.label} Total Audited Value
        </div>
        <div style={{ color: 'white', fontSize: '18pt', fontWeight: 900, letterSpacing: '-0.5px' }}>
          {fmtRs(category === 'A' ? (data?.catA?.core || 0) : category === 'B' ? (data?.catB?.core || 0) : (data?.catC?.core || 0))}
        </div>
      </div>

      {/* ══════════ FOOTER ══════════ */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18pt', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30pt' }}>
        <div>
          <div style={{ fontSize: '7.5pt', fontWeight: 900, color: meta.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6pt' }}>
            Internal Certification Statement
          </div>
          <div style={{ fontSize: '8pt', color: '#94a3b8', lineHeight: 1.7, fontStyle: 'italic', borderLeft: `3px solid ${meta.accent}40`, paddingLeft: '8pt' }}>
            Computer-generated output of Futura Hardware Management System. Reflects closed accounts for the stated period. Valid for internal audit and IRD Tier-2 declaration.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '32pt' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '110px', borderBottom: '1px solid #cbd5e1', marginBottom: '4pt' }} />
              <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#cbd5e1' }}>Auditor Signature</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '110px', borderBottom: '1px solid #cbd5e1', marginBottom: '4pt' }} />
              <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#cbd5e1' }}>Finance Approval</div>
            </div>
          </div>
          <div style={{ fontSize: '7.5pt', fontWeight: 900, color: meta.accent, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '10pt' }}>
            Futura Hardware Solutions © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
