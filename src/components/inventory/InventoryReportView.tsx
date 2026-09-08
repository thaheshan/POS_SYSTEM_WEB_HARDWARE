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
    return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`;
  };

  const periodLabel = formatRange(dateRange);

  /* ── Summary calculations ───────────────────────────── */
  const totalSKUs = data.length;

  const totalValue = data.reduce((acc, item) => {
    let val = 0;
    if (typeof item.totalValue === 'number') {
      val = item.totalValue;
    } else if (typeof item.totalValue === 'string') {
      val = parseFloat(item.totalValue.replace(/[^0-9.]/g, '')) || 0;
    } else {
      const unit =
        parseFloat(
          String(item.unitCost ?? item.sellingPrice ?? item.price ?? 0).replace(/[^0-9.]/g, '')
        ) || 0;
      val = unit * (Number(item.qty) || 0);
    }
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const fmtRs = (n: number) =>
    'Rs. ' + Math.round(n).toLocaleString('en-LK');

  const lowStockCount   = data.filter(i => i.status === 'Low Stock').length;
  const outOfStockCount = data.filter(i => i.status === 'Out of Stock').length;
  const expiredCount    = data.filter(i => i.status === 'Expired').length;

  /* ── Group by category (case-insensitive) ───────────── */
  const categoriesMap = new Map<string, { displayName: string; items: any[] }>();
  data.forEach((item) => {
    const raw = item.category || 'Uncategorized';
    const key = raw.toLowerCase().trim();
    if (!categoriesMap.has(key)) {
      categoriesMap.set(key, { displayName: raw, items: [] });
    }
    categoriesMap.get(key)!.items.push(item);
  });

  /* ── Status badge helper ─────────────────────────────── */
  const statusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    const base = 'px-2 py-0.5 rounded text-[8px] font-black uppercase whitespace-nowrap leading-tight inline-block';
    if (s.includes('out'))  return `${base} bg-red-50 text-red-700 border border-red-200`;
    if (s.includes('low'))  return `${base} bg-amber-50 text-amber-700 border border-amber-200`;
    if (s.includes('exp'))  return `${base} bg-purple-50 text-purple-700 border border-purple-200`;
    return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`;
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm !important;
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
          .inventory-print-root {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          table { width: 100% !important; border-collapse: collapse !important; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
        }
      `,
        }}
      />

      <div
        className="inventory-print-root hidden print:block bg-white text-slate-900 font-sans w-full"
        style={{
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          padding: '24pt 28pt',
          width: '100%',
          maxWidth: '960px',
          margin: '0 auto',
          fontSize: '9.5pt',
        } as any}
      >
        {/* ══════════ HEADER ══════════ */}
        <div style={{ borderBottom: '6px solid #1e3a8a', paddingBottom: '16pt', marginBottom: '16pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Left – brand */}
            <div>
              <div style={{ fontSize: '34pt', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-1px', lineHeight: 0.9, textTransform: 'uppercase' }}>
                Futura
              </div>
              <div style={{ fontSize: '13pt', fontWeight: 900, color: '#1d4ed8', letterSpacing: '-0.5px', textTransform: 'uppercase', marginBottom: '8pt', marginTop: '2pt' }}>
                Hardware &amp; Solutions
              </div>
              <div style={{ fontSize: '8pt', color: '#64748b', lineHeight: 1.5, fontWeight: 600 }}>
                <div>123 Hardware Lane, Colombo 10, Sri Lanka</div>
                <div>TIN: 12345678-0000 &nbsp;|&nbsp; VAT REG: 22334455</div>
              </div>
            </div>

            {/* Right – report meta */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '3pt 10pt', fontSize: '7.5pt', fontWeight: 900, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6pt' }}>
                Inventory Audit Report
              </div>
              <div style={{ fontSize: '7.5pt', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Audit Period
              </div>
              <div style={{ fontSize: '15pt', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', margin: '2pt 0' }}>
                {periodLabel}
              </div>
              <div style={{ fontSize: '7.5pt', color: '#94a3b8', fontWeight: 600 }}>
                Generated: {generatedAt}
              </div>
              <div style={{ fontSize: '7pt', color: '#94a3b8', fontWeight: 800, marginTop: '2pt' }}>
                REF: INV-{format(new Date(), 'yyyyMMdd')}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ KPI SUMMARY CARDS (4 in a row) ══════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8pt', marginBottom: '18pt' }}>

          {/* Card 1 – Total Value (dark) */}
          <div style={{ background: '#1e3a8a', borderRadius: '10px', padding: '12pt 14pt', color: 'white', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '80pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.65 }}>
              Total Inventory Asset Value
            </div>
            <div>
              <div style={{ fontSize: '20pt', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>
                {fmtRs(totalValue)}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                Audited Market Value
              </div>
            </div>
          </div>

          {/* Card 2 – SKUs */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12pt 14pt', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '80pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1e3a8a', opacity: 0.65 }}>
              Total Active SKUs
            </div>
            <div>
              <div style={{ fontSize: '24pt', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {totalSKUs}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                Unique Product Lines
              </div>
            </div>
          </div>

          {/* Card 3 – Low / OOS */}
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '12pt 14pt', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '80pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#78350f', opacity: 0.65 }}>
              Supply Chain Risk
            </div>
            <div>
              <div style={{ fontSize: '24pt', fontWeight: 900, color: '#b45309', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {lowStockCount + outOfStockCount}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                Low / Out of Stock
              </div>
            </div>
          </div>

          {/* Card 4 – Expired */}
          <div style={{ background: '#fdf4ff', border: '1.5px solid #e9d5ff', borderRadius: '10px', padding: '12pt 14pt', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '80pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#581c87', opacity: 0.65 }}>
              Expired Products
            </div>
            <div>
              <div style={{ fontSize: '24pt', fontWeight: 900, color: '#7c3aed', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {expiredCount}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                Requires Action
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ PRODUCT TABLES BY CATEGORY ══════════ */}
        {Array.from(categoriesMap.entries()).map(([key, { displayName, items }], catIdx) => (
          <section key={key} style={{ marginBottom: '18pt', pageBreakInside: 'avoid' }}>
            {/* Category heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', borderBottom: '2px solid #1e3a8a', paddingBottom: '4pt', marginBottom: '8pt' }}>
              <span style={{ width: '9px', height: '9px', background: '#1e3a8a', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '10.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
                {displayName}
              </span>
              <span style={{ fontSize: '8pt', fontWeight: 700, color: '#94a3b8', marginLeft: '4pt' }}>
                — {items.length} product{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
              <colgroup>
                <col style={{ width: '24%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '7%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1' }}>
                  {['Product & SKU', 'Barcode', 'Subcategory', 'Brand', 'Qty', 'Unit Cost', 'Total Value', 'Status'].map((h, i) => (
                    <th key={i} style={{
                      padding: '5pt 6pt',
                      fontSize: '7pt',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#64748b',
                      textAlign: i >= 4 && i <= 6 ? 'right' : i === 7 ? 'center' : 'left',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  /* compute item total if missing */
                  let itemTotal: number | null = null;
                  if (typeof item.totalValue === 'number') itemTotal = item.totalValue;
                  else if (typeof item.totalValue === 'string') {
                    const p = parseFloat(item.totalValue.replace(/[^0-9.]/g, ''));
                    if (!isNaN(p)) itemTotal = p;
                  }
                  if (itemTotal === null) {
                    const u = parseFloat(String(item.unitCost ?? item.sellingPrice ?? 0).replace(/[^0-9.]/g, '')) || 0;
                    itemTotal = u * (Number(item.qty) || 0);
                  }

                  const unitCostNum = typeof item.unitCost === 'number'
                    ? item.unitCost
                    : parseFloat(String(item.unitCost ?? '').replace(/[^0-9.]/g, '')) || null;

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '5pt 6pt' }}>
                        <div style={{ fontWeight: 700, fontSize: '8.5pt', color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '7pt', color: '#94a3b8', marginTop: '1pt' }}>{item.sku}</div>
                      </td>
                      <td style={{ padding: '5pt 6pt', fontFamily: 'monospace', fontSize: '7pt', color: '#059669', fontWeight: 700 }}>
                        {item.barcode || item.sku || '—'}
                      </td>
                      <td style={{ padding: '5pt 6pt', color: '#475569', fontWeight: 500 }}>
                        {item.subCategory || item.subcategory || '—'}
                      </td>
                      <td style={{ padding: '5pt 6pt', color: '#475569', fontWeight: 500 }}>
                        {item.brand || '—'}
                      </td>
                      <td style={{ padding: '5pt 6pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '5pt 6pt', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                        {unitCostNum !== null ? fmtRs(unitCostNum) : (item.unitCost || '—')}
                      </td>
                      <td style={{ padding: '5pt 6pt', textAlign: 'right', fontWeight: 900, color: '#1e3a8a' }}>
                        {fmtRs(itemTotal)}
                      </td>
                      <td style={{ padding: '5pt 6pt', textAlign: 'center' }}>
                        <span className={statusBadge(item.status || '')}>
                          {(item.status || '—').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Category subtotal row */}
                <tr style={{ borderTop: '1.5px solid #cbd5e1', background: '#f1f5f9' }}>
                  <td colSpan={4} style={{ padding: '5pt 6pt', fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {displayName} Subtotal
                  </td>
                  <td style={{ padding: '5pt 6pt', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                    {items.reduce((s, i) => s + (Number(i.qty) || 0), 0)}
                  </td>
                  <td style={{ padding: '5pt 6pt' }} />
                  <td style={{ padding: '5pt 6pt', textAlign: 'right', fontWeight: 900, color: '#1e3a8a' }}>
                    {fmtRs(items.reduce((s, i) => {
                      let v = typeof i.totalValue === 'number' ? i.totalValue
                        : parseFloat(String(i.totalValue ?? '').replace(/[^0-9.]/g, '')) || 0;
                      if (!v) {
                        const u = parseFloat(String(i.unitCost ?? i.sellingPrice ?? 0).replace(/[^0-9.]/g, '')) || 0;
                        v = u * (Number(i.qty) || 0);
                      }
                      return s + (isNaN(v) ? 0 : v);
                    }, 0))}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </section>
        ))}

        {/* ══════════ GRAND TOTAL BANNER ══════════ */}
        <div style={{ background: '#1e3a8a', borderRadius: '10px', padding: '10pt 16pt', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6pt', marginBottom: '20pt', color: 'white' }}>
          <div style={{ fontSize: '9.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Inventory Asset Value
          </div>
          <div style={{ fontSize: '16pt', fontWeight: 900, letterSpacing: '-0.5px' }}>
            {fmtRs(totalValue)}
          </div>
        </div>

        {/* ══════════ FOOTER ══════════ */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16pt', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30pt', pageBreakInside: 'avoid' }}>
          {/* Left – statement */}
          <div>
            <div style={{ fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4pt' }}>
              Stock Verification Statement
            </div>
            <div style={{ fontSize: '7.5pt', color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid #bfdbfe', paddingLeft: '8pt' }}>
              This automated inventory audit is synchronized with the Futura Central Warehouse Engine. Figures reflect on-hand physical quantities as of the generation timestamp. Discrepancies must be reported to the Floor Manager.
            </div>
          </div>

          {/* Right – signatures + copyright */}
          <div style={{ display: 'flex', flexDirection: 'column', justify: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '28pt' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '110px', borderBottom: '1px solid #cbd5e1', marginBottom: '4pt' }} />
                <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#cbd5e1' }}>Auditor Signature</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '110px', borderBottom: '1px solid #cbd5e1', marginBottom: '4pt' }} />
                <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#cbd5e1' }}>Stock Manager Approval</div>
              </div>
            </div>
            <div style={{ fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '10pt' }}>
              Futura Hardware Solutions © {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
