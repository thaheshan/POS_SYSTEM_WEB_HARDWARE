'use client';

import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface SalesReportViewProps {
  dateRange: DateRange | undefined;
  data: any;
  suppressPrint?: boolean;
  isAdmin?: boolean;
}

export default function SalesReportView({
  dateRange,
  data,
  suppressPrint = false,
  isAdmin = true,
}: SalesReportViewProps) {
  const generatedAt = format(new Date(), 'PPP p');

  const formatRange = (range: DateRange | undefined) => {
    if (!range?.from) return 'Full Period Overview';
    if (!range.to || range.from.toDateString() === range.to.toDateString()) {
      return format(range.from, 'MMMM d, yyyy');
    }
    return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`;
  };

  const periodLabel = formatRange(dateRange);

  const catACore = data?.catA?.core || 0;
  const catBCore = data?.catB?.core || 0;
  const catCCore = data?.catC?.core || 0;

  const totalSales = catACore + catBCore + catCCore;
  const totalVAT   = data?.catA?.vat || 0;
  const totalEntries = (data?.catA?.txns || 0) + (data?.catB?.txns || 0) + (data?.catC?.entries || 0);

  const fmtRs = (n: number) =>
    'Rs. ' + Math.round(n).toLocaleString('en-LK');

  return (
    <div
      className={`${suppressPrint ? '!hidden' : 'hidden print:block'} bg-white text-slate-900 font-sans`}
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
      <div style={{ borderBottom: '6px solid #1e3a8a', paddingBottom: '20pt', marginBottom: '18pt' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/* Left – Brand */}
          <div>
            <div style={{ fontSize: '36pt', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-1px', lineHeight: 1, textTransform: 'uppercase' }}>
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

          {/* Right – Metadata */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '3pt 10pt', fontSize: '8pt', fontWeight: 900, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8pt' }}>
              {isAdmin ? 'Official Audit Report' : 'Operations Audit Report'}
            </div>
            <div style={{ fontSize: '8pt', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Reporting Period
            </div>
            <div style={{ fontSize: '16pt', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', margin: '4pt 0' }}>
              {periodLabel}
            </div>
            <div style={{ fontSize: '8pt', color: '#94a3b8' }}>
              Generated: {generatedAt}
            </div>
            <div style={{ fontSize: '7pt', color: '#94a3b8', marginTop: '2pt' }}>
              REF: {isAdmin ? 'SHR' : 'OPS'}-{format(new Date(), 'yyyyMMdd')}-X
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ FINANCIAL SUMMARY CARDS ══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10pt', marginBottom: '22pt' }}>

        {/* Card 1 – Total Gross Revenue (dark) */}
        <div style={{ background: '#1e3a8a', borderRadius: '12px', padding: '14pt 16pt', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '90pt' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.6 }}>
            {isAdmin ? 'Total Gross Revenue' : 'Category C Total'}
          </div>
          <div>
            <div style={{ fontSize: '22pt', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>
              {fmtRs(isAdmin ? totalSales : catCCore)}
            </div>
            <div style={{ fontSize: '7.5pt', fontWeight: 700, opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3pt' }}>
              {isAdmin ? 'Audited Combined Total' : 'Labour & Miscellaneous'}
            </div>
          </div>
        </div>

        {/* Card 2 – VAT Liability or Labour Charges */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14pt 16pt', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '90pt' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1e3a8a', opacity: 0.55 }}>
            {isAdmin ? 'VAT Liability (18%)' : 'Labour Charges'}
          </div>
          <div>
            <div style={{ fontSize: '22pt', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-1px', lineHeight: 1 }}>
              {fmtRs(isAdmin ? totalVAT : (data?.catC?.labour || 0))}
            </div>
            <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3pt' }}>
              {isAdmin ? 'Category A Remittable' : 'Service Revenue'}
            </div>
          </div>
        </div>

        {/* Card 3 – Active Volume / Entries */}
        <div style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '14pt 16pt', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '90pt' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1d4ed8', opacity: 0.65 }}>
            {isAdmin ? 'Total Active Volume' : 'Entry Volume'}
          </div>
          <div>
            <div style={{ fontSize: '22pt', fontWeight: 900, color: '#1d4ed8', letterSpacing: '-1px', lineHeight: 1 }}>
              {isAdmin ? totalEntries : (data?.catC?.entries || 0)}
            </div>
            <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3pt' }}>
              {isAdmin ? 'Total Transactions' : 'Category C Entries'}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ CATEGORY A: TAXABLE SALES ══════════ */}
      {isAdmin && (
        <section style={{ marginBottom: '20pt' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', borderBottom: '2px solid #1e3a8a', paddingBottom: '5pt', marginBottom: '8pt' }}>
            <span style={{ width: '10px', height: '10px', background: '#1e3a8a', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontSize: '11pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
              01. Taxable Sales Overview (Category A)
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
                  Classification
                </th>
                <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'right' }}>
                  Transactions
                </th>
                <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'right' }}>
                  Amount (LKR)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>
                  Core Taxable Sales (Daily Limit Applied)
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                  {data?.catA?.txns || 0}
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                  {fmtRs(catACore)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#eff6ff' }}>
                <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#1d4ed8' }}>
                  Value Added Tax (VAT 18%)
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', color: '#94a3b8' }}>—</td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#1d4ed8', fontFamily: 'monospace' }}>
                  {fmtRs(totalVAT)}
                </td>
              </tr>
              <tr style={{ background: '#f1f5f9', borderTop: '1.5px solid #cbd5e1' }}>
                <td style={{ padding: '6pt 8pt', fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Taxable Sales Subtotal
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                  {data?.catA?.txns || 0}
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#1e3a8a' }}>
                  {fmtRs(catACore + totalVAT)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* ══════════ CATEGORY B: NON-TAX & OVERFLOW ══════════ */}
      {isAdmin && (
        <section style={{ marginBottom: '20pt' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', borderBottom: '2px solid #1e3a8a', paddingBottom: '5pt', marginBottom: '8pt' }}>
            <span style={{ width: '10px', height: '10px', background: '#1e3a8a', borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontSize: '11pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
              02. Non-Taxable &amp; Overflow Activity (Category B)
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
                  Classification
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
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>
                  Daily Threshold Overflow (Sales &gt; Rs. 200,000)
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                  {data?.catB?.txns || 0} txns
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                  {fmtRs(data?.catB?.overflow || 0)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>
                  Legal Duty Exemption Products
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                  {data?.catB?.items || 0} units
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                  {fmtRs(data?.catB?.baseNonTax || 0)}
                </td>
              </tr>
              <tr style={{ background: '#f1f5f9', borderTop: '1.5px solid #cbd5e1' }}>
                <td style={{ padding: '6pt 8pt', fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Category B Subtotal
                </td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right' }}>—</td>
                <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#1e3a8a' }}>
                  {fmtRs(catBCore)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* ══════════ CATEGORY C: SERVICES ══════════ */}
      <section style={{ marginBottom: '20pt' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', borderBottom: '2px solid #1e3a8a', paddingBottom: '5pt', marginBottom: '8pt' }}>
          <span style={{ width: '10px', height: '10px', background: '#1e3a8a', borderRadius: '50%', display: 'inline-block' }} />
          <span style={{ fontSize: '11pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
            03. Services &amp; Miscellaneous (Category C)
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
                Service Type
              </th>
              <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'right' }}>
                Count
              </th>
              <th style={{ padding: '5pt 8pt', fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', textAlign: 'right' }}>
                Amount (LKR)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>
                Labour &amp; Technical Man-Hours
              </td>
              <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                {data?.catC?.entries || 0}
              </td>
              <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                {fmtRs(data?.catC?.labour || 0)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '6pt 8pt', fontWeight: 700, color: '#334155' }}>
                Installation &amp; Setup Internal Fees
              </td>
              <td style={{ padding: '6pt 8pt', textAlign: 'right', color: '#94a3b8' }}>—</td>
              <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                {fmtRs(data?.catC?.install || 0)}
              </td>
            </tr>
            <tr style={{ background: '#f1f5f9', borderTop: '1.5px solid #cbd5e1' }}>
              <td style={{ padding: '6pt 8pt', fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Category C Subtotal
              </td>
              <td style={{ padding: '6pt 8pt', textAlign: 'right' }}>—</td>
              <td style={{ padding: '6pt 8pt', textAlign: 'right', fontWeight: 900, color: '#1e3a8a' }}>
                {fmtRs(catCCore)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ══════════ GRAND TOTAL BANNER ══════════ */}
      <div style={{ background: '#1e3a8a', borderRadius: '10px', padding: '12pt 18pt', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6pt', marginBottom: '24pt' }}>
        <div style={{ color: 'white', fontSize: '10pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Total Audited Period Revenue
        </div>
        <div style={{ color: 'white', fontSize: '18pt', fontWeight: 900, letterSpacing: '-0.5px' }}>
          {fmtRs(totalSales)}
        </div>
      </div>

      {/* ══════════ FOOTER ══════════ */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18pt', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30pt' }}>
        {/* Left – Statement */}
        <div>
          <div style={{ fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6pt' }}>
            Internal Accountability Statement
          </div>
          <div style={{ fontSize: '8pt', color: '#94a3b8', lineHeight: 1.7, fontStyle: 'italic', borderLeft: '3px solid #bfdbfe', paddingLeft: '8pt' }}>
            This automated fiscal output is generated by the Futura Hardware Core Management Engine. Figures reflect closed accounts for the specified period. Approved for Internal Audit and IRD Tier-2 Declaration.
          </div>
        </div>

        {/* Right – Signatures & Copyright */}
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
          <div style={{ fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '10pt' }}>
            Futura Hardware Solutions © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
