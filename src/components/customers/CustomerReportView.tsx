'use client';

import React from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  customerType: string;
  totalPurchases: number;
  outstanding: number;
  transactions: number;
  isOverdue: boolean;
  lastActive: string;
  initials: string;
}

interface CustomerReportViewProps {
  customers: Customer[];
  dateRange?: DateRange;
  storeName?: string;
}

export default function CustomerReportView({
  customers,
  dateRange,
  storeName,
}: CustomerReportViewProps) {
  const generatedAt = format(new Date(), 'PPP p');
  const activeStoreName = storeName || 'Trinco Hardware & Electricals';

  const formatRange = (range: DateRange | undefined) => {
    if (!range?.from) return 'Full Customer Accounts Overview';
    if (!range.to || range.from.toDateString() === range.to.toDateString()) {
      return format(range.from, 'MMMM d, yyyy');
    }
    return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`;
  };

  const periodLabel = formatRange(dateRange);

  const fmtRs = (n: number) =>
    'Rs. ' + Math.round(n).toLocaleString('en-LK');

  // ── Metrics ─────────────────────────────────────────────────────────────
  const totalCustomers = customers.length;
  const creditCustomersList = customers.filter((c) => c.outstanding > 0);
  const settledCustomersList = customers.filter((c) => c.outstanding <= 0);

  const creditCount = creditCustomersList.length;
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding || 0), 0);
  const totalPurchases = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
  const totalTransactions = customers.reduce((sum, c) => sum + (c.transactions || 0), 0);
  const avgLifetimeValue = totalCustomers > 0 ? totalPurchases / totalCustomers : 0;
  const creditRatio = totalCustomers > 0 ? Math.round((creditCount / totalCustomers) * 100) : 0;

  // Sort credit customers by highest outstanding first
  const sortedCreditCustomers = [...creditCustomersList].sort((a, b) => b.outstanding - a.outstanding);
  // Sort settled customers by total purchases descending
  const sortedSettledCustomers = [...settledCustomersList].sort((a, b) => b.totalPurchases - a.totalPurchases);

  // Status badge styling helper
  const renderStatusBadge = (isOverdue: boolean, outstanding: number) => {
    const base = 'px-2 py-0.5 rounded text-[7.5pt] font-black uppercase whitespace-nowrap leading-tight inline-block';
    if (isOverdue || outstanding > 0) {
      return <span className={`${base} bg-red-50 text-red-700 border border-red-200`}>OVERDUE</span>;
    }
    return <span className={`${base} bg-emerald-50 text-emerald-700 border border-emerald-200`}>SETTLED</span>;
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm !important;
          }
          body, html {
            background-color: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden, nav, header, aside, footer {
            display: none !important;
          }
          .customer-print-root {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          table { width: 100% !important; border-collapse: collapse !important; }
          tr { page-break-inside: avoid; }
          .cust-section { page-break-inside: auto; margin-bottom: 16pt; }
          thead { display: table-header-group; }
        }
      `,
        }}
      />

      <div
        className="customer-print-root hidden print:block bg-white text-slate-900 font-sans w-full"
        style={{
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          padding: '20pt 24pt',
          width: '100%',
          maxWidth: '960px',
          margin: '0 auto',
          fontSize: '9pt',
        } as any}
      >
        {/* ══════════ EXECUTIVE HEADER ══════════ */}
        <div style={{ borderBottom: '5px solid #1e3a8a', paddingBottom: '14pt', marginBottom: '14pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Left – Store info */}
            <div>
              <div style={{ fontSize: '26pt', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px', lineHeight: 1, textTransform: 'uppercase' }}>
                {activeStoreName}
              </div>
              <div style={{ fontSize: '11pt', fontWeight: 900, color: '#1d4ed8', letterSpacing: '-0.3px', textTransform: 'uppercase', marginBottom: '6pt', marginTop: '3pt' }}>
                Customer Accounts &amp; Credit Ledger Audit Report
              </div>
              <div style={{ fontSize: '7.5pt', color: '#64748b', lineHeight: 1.4, fontWeight: 600 }}>
                <div>Commercial Hub &amp; Main Branch, Sri Lanka</div>
                <div>Accounts Receivable • Credit Exposure • Customer Lifetime Value Ledger</div>
              </div>
            </div>

            {/* Right – Report Metadata */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '3pt 8pt', fontSize: '7.5pt', fontWeight: 900, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4pt' }}>
                Customer Credit Audit
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Reporting Period
              </div>
              <div style={{ fontSize: '13pt', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px', margin: '1pt 0' }}>
                {periodLabel}
              </div>
              <div style={{ fontSize: '7pt', color: '#94a3b8', fontWeight: 600 }}>
                Generated: {generatedAt}
              </div>
              <div style={{ fontSize: '7pt', color: '#94a3b8', fontWeight: 800, marginTop: '2pt' }}>
                REF: CUST-LEDGER-{format(new Date(), 'yyyyMMdd-HHmm')}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ FINANCIAL SUMMARY CARDS (4 Cards Grid) ══════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8pt', marginBottom: '16pt' }}>
          {/* Card 1 – Total Outstanding Credit (Dark Navy) */}
          <div style={{ background: '#1e3a8a', borderRadius: '8px', padding: '10pt 12pt', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '70pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.75 }}>
              Total Outstanding Receivables
            </div>
            <div>
              <div style={{ fontSize: '18pt', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>
                {fmtRs(totalOutstanding)}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                {creditCount} Accounts with Pending Credit
              </div>
            </div>
          </div>

          {/* Card 2 – Total Customers */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '10pt 12pt', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '70pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1e3a8a', opacity: 0.75 }}>
              Total Customers
            </div>
            <div>
              <div style={{ fontSize: '20pt', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {totalCustomers}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                Registered Accounts
              </div>
            </div>
          </div>

          {/* Card 3 – Credit Exposure Ratio */}
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '8px', padding: '10pt 12pt', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '70pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#78350f', opacity: 0.75 }}>
              Credit Exposure Rate
            </div>
            <div>
              <div style={{ fontSize: '20pt', fontWeight: 900, color: '#b45309', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {creditRatio}%
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                {creditCount} of {totalCustomers} on Credit
              </div>
            </div>
          </div>

          {/* Card 4 – Lifetime Revenue */}
          <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '8px', padding: '10pt 12pt', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '70pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#14532d', opacity: 0.75 }}>
              Total Purchases Volume
            </div>
            <div>
              <div style={{ fontSize: '16pt', fontWeight: 900, color: '#15803d', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {fmtRs(totalPurchases)}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                Avg LTV: {fmtRs(avgLifetimeValue)}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ SECTION 1: OUTSTANDING CREDIT ACCOUNTS ══════════ */}
        {sortedCreditCustomers.length > 0 && (
          <section className="cust-section" style={{ marginBottom: '18pt' }}>
            {/* Section Banner */}
            <div
              style={{
                background: '#b91c1c',
                color: '#ffffff',
                padding: '6pt 10pt',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6pt',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6pt' }}>
                <span style={{ fontSize: '10pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  🚨 OUTSTANDING CREDIT &amp; OVERDUE ACCOUNTS
                </span>
                <span style={{ fontSize: '7.5pt', background: 'rgba(255,255,255,0.2)', padding: '1pt 6pt', borderRadius: '4px', fontWeight: 700 }}>
                  {sortedCreditCustomers.length} Customers
                </span>
              </div>
              <div style={{ fontSize: '8.5pt', fontWeight: 900, textAlign: 'right' }}>
                Total Credit Due: {fmtRs(sortedCreditCustomers.reduce((s, c) => s + c.outstanding, 0))}
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: '27%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '9%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1' }}>
                  <th style={{ padding: '4pt 5pt', textAlign: 'center', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>#</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'left', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Customer Name &amp; ID</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'left', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Phone Number</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'left', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Account Type</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'right', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Total Purchases</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'center', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Orders</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'right', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#b91c1c' }}>Outstanding (Due)</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'center', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedCreditCustomers.map((cust, idx) => {
                  const code = cust.id ? cust.id.slice(0, 8).toUpperCase() : 'N/A';
                  return (
                    <tr
                      key={cust.id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fef2f2',
                      }}
                    >
                      <td style={{ padding: '4pt 5pt', textAlign: 'center', fontSize: '7.5pt', color: '#64748b' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '4pt 5pt' }}>
                        <div style={{ fontWeight: 800, fontSize: '8pt', color: '#0f172a' }}>{cust.name}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '6.5pt', color: '#0369a1', marginTop: '0.5pt' }}>
                          ID: {code} &nbsp;|&nbsp; Added: {cust.lastActive}
                        </div>
                      </td>
                      <td style={{ padding: '4pt 5pt', fontFamily: 'monospace', fontSize: '7.5pt', fontWeight: 700, color: '#334155' }}>
                        {cust.phone}
                      </td>
                      <td style={{ padding: '4pt 5pt', color: '#64748b', fontSize: '7.5pt', fontWeight: 600 }}>
                        {cust.customerType || 'Individual'}
                      </td>
                      <td style={{ padding: '4pt 5pt', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                        {fmtRs(cust.totalPurchases)}
                      </td>
                      <td style={{ padding: '4pt 5pt', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                        {cust.transactions}
                      </td>
                      <td style={{ padding: '4pt 5pt', textAlign: 'right', fontWeight: 900, color: '#b91c1c', fontSize: '8.5pt' }}>
                        {fmtRs(cust.outstanding)}
                      </td>
                      <td style={{ padding: '4pt 5pt', textAlign: 'center' }}>
                        {renderStatusBadge(cust.isOverdue, cust.outstanding)}
                      </td>
                    </tr>
                  );
                })}

                {/* Subtotal for Credit Accounts */}
                <tr style={{ background: '#fee2e2', borderTop: '1.5px solid #fca5a5' }}>
                  <td colSpan={4} style={{ padding: '4pt 6pt', fontSize: '7.5pt', fontWeight: 900, color: '#991b1b', textTransform: 'uppercase' }}>
                    Credit Accounts Subtotal ({sortedCreditCustomers.length} Customers)
                  </td>
                  <td style={{ padding: '4pt 5pt', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                    {fmtRs(sortedCreditCustomers.reduce((s, c) => s + c.totalPurchases, 0))}
                  </td>
                  <td style={{ padding: '4pt 5pt', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                    {sortedCreditCustomers.reduce((s, c) => s + c.transactions, 0)}
                  </td>
                  <td style={{ padding: '4pt 5pt', textAlign: 'right', fontWeight: 900, color: '#991b1b', fontSize: '8.5pt' }}>
                    {fmtRs(sortedCreditCustomers.reduce((s, c) => s + c.outstanding, 0))}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* ══════════ SECTION 2: SETTLED & STANDARD ACCOUNTS ══════════ */}
        {sortedSettledCustomers.length > 0 && (
          <section className="cust-section" style={{ marginBottom: '18pt' }}>
            {/* Section Banner */}
            <div
              style={{
                background: '#047857',
                color: '#ffffff',
                padding: '6pt 10pt',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6pt',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6pt' }}>
                <span style={{ fontSize: '10pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  ✅ SETTLED &amp; STANDARD ACCOUNTS (ZERO OUTSTANDING)
                </span>
                <span style={{ fontSize: '7.5pt', background: 'rgba(255,255,255,0.2)', padding: '1pt 6pt', borderRadius: '4px', fontWeight: 700 }}>
                  {sortedSettledCustomers.length} Customers
                </span>
              </div>
              <div style={{ fontSize: '8.5pt', fontWeight: 900, textAlign: 'right' }}>
                Total Purchases: {fmtRs(sortedSettledCustomers.reduce((s, c) => s + c.totalPurchases, 0))}
              </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: '27%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '9%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #cbd5e1' }}>
                  <th style={{ padding: '4pt 5pt', textAlign: 'center', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>#</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'left', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Customer Name &amp; ID</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'left', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Phone Number</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'left', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Account Type</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'right', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Total Purchases</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'center', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Orders</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'right', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#047857' }}>Outstanding</th>
                  <th style={{ padding: '4pt 5pt', textAlign: 'center', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedSettledCustomers.map((cust, idx) => {
                  const code = cust.id ? cust.id.slice(0, 8).toUpperCase() : 'N/A';
                  return (
                    <tr
                      key={cust.id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#f0fdf4',
                      }}
                    >
                      <td style={{ padding: '4pt 5pt', textAlign: 'center', fontSize: '7.5pt', color: '#64748b' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '4pt 5pt' }}>
                        <div style={{ fontWeight: 800, fontSize: '8pt', color: '#0f172a' }}>{cust.name}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '6.5pt', color: '#0369a1', marginTop: '0.5pt' }}>
                          ID: {code} &nbsp;|&nbsp; Added: {cust.lastActive}
                        </div>
                      </td>
                      <td style={{ padding: '4pt 5pt', fontFamily: 'monospace', fontSize: '7.5pt', fontWeight: 700, color: '#334155' }}>
                        {cust.phone}
                      </td>
                      <td style={{ padding: '4pt 5pt', color: '#64748b', fontSize: '7.5pt', fontWeight: 600 }}>
                        {cust.customerType || 'Individual'}
                      </td>
                      <td style={{ padding: '4pt 5pt', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                        {fmtRs(cust.totalPurchases)}
                      </td>
                      <td style={{ padding: '4pt 5pt', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                        {cust.transactions}
                      </td>
                      <td style={{ padding: '4pt 5pt', textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                        Rs. 0.00
                      </td>
                      <td style={{ padding: '4pt 5pt', textAlign: 'center' }}>
                        <span className="px-2 py-0.5 rounded text-[7.5pt] font-black uppercase whitespace-nowrap leading-tight inline-block bg-emerald-50 text-emerald-700 border border-emerald-200">
                          SETTLED
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Subtotal for Settled Accounts */}
                <tr style={{ background: '#dcfce7', borderTop: '1.5px solid #86efac' }}>
                  <td colSpan={4} style={{ padding: '4pt 6pt', fontSize: '7.5pt', fontWeight: 900, color: '#14532d', textTransform: 'uppercase' }}>
                    Settled Accounts Subtotal ({sortedSettledCustomers.length} Customers)
                  </td>
                  <td style={{ padding: '4pt 5pt', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                    {fmtRs(sortedSettledCustomers.reduce((s, c) => s + c.totalPurchases, 0))}
                  </td>
                  <td style={{ padding: '4pt 5pt', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                    {sortedSettledCustomers.reduce((s, c) => s + c.transactions, 0)}
                  </td>
                  <td style={{ padding: '4pt 5pt', textAlign: 'right', fontWeight: 900, color: '#14532d' }}>
                    Rs. 0.00
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* ══════════ GRAND TOTAL BANNER ══════════ */}
        <div
          style={{
            background: '#1e3a8a',
            borderRadius: '8px',
            padding: '10pt 14pt',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10pt',
            marginBottom: '18pt',
            color: 'white',
          }}
        >
          <div>
            <div style={{ fontSize: '9pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              GRAND TOTAL • ALL CUSTOMER ACCOUNTS
            </div>
            <div style={{ fontSize: '7.5pt', opacity: 0.8, marginTop: '2pt' }}>
              {totalCustomers} Registered Customers • {totalTransactions} Total Transactions • Lifetime Revenue: {fmtRs(totalPurchases)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '7pt', textTransform: 'uppercase', opacity: 0.75, letterSpacing: '0.5px' }}>
              Total Outstanding Balance Due
            </div>
            <div style={{ fontSize: '16pt', fontWeight: 900, letterSpacing: '-0.3px' }}>
              {fmtRs(totalOutstanding)}
            </div>
          </div>
        </div>

        {/* ══════════ VERIFICATION STATEMENT & SIGNATURES FOOTER ══════════ */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14pt', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24pt', pageBreakInside: 'avoid' }}>
          {/* Left – Statement */}
          <div>
            <div style={{ fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3pt' }}>
              Credit Verification &amp; Audit Statement
            </div>
            <div style={{ fontSize: '7pt', color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic', borderLeft: '3px solid #bfdbfe', paddingLeft: '6pt' }}>
              This customer credit ledger was synchronized with the verified invoice billing engine. Figures represent real-time accounts receivable balances as of the generation timestamp. All overdue settlements are subject to store credit management policies.
            </div>
          </div>

          {/* Right – Signatures & Copyright */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '24pt' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '100px', borderBottom: '1px solid #cbd5e1', marginBottom: '3pt' }} />
                <div style={{ fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>Credit Auditor</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '100px', borderBottom: '1px solid #cbd5e1', marginBottom: '3pt' }} />
                <div style={{ fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>Accounts Manager</div>
              </div>
            </div>
            <div style={{ fontSize: '7pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '8pt' }}>
              {activeStoreName} © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
