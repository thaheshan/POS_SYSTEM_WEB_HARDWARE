'use client';

import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface InventoryReportViewProps {
  dateRange: DateRange | undefined;
  data: any[];
  storeName?: string;
}

export default function InventoryReportView({ dateRange, data, storeName }: InventoryReportViewProps) {
  const generatedAt = format(new Date(), 'PPP p');
  const activeStoreName = storeName || 'Trinco Hardware & Electricals';

  const formatRange = (range: DateRange | undefined) => {
    if (!range?.from) return 'Full Inventory Overview';
    if (!range.to || range.from.toDateString() === range.to.toDateString()) {
      return format(range.from, 'MMMM d, yyyy');
    }
    return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`;
  };

  const periodLabel = formatRange(dateRange);

  /* ── Helper cost & valuation calculation ─────────────── */
  const getItemCost = (item: any): number => {
    const pCost = parseFloat(String(item.purchasePrice ?? item.cost ?? item.unitCost ?? 0).replace(/[^0-9.]/g, '')) || 0;
    const sPrice = parseFloat(String(item.sellingPrice ?? item.price ?? 0).replace(/[^0-9.]/g, '')) || 0;
    return pCost > 1 ? pCost : (sPrice > 0 ? sPrice : pCost);
  };

  const getItemSelling = (item: any): number => {
    return parseFloat(String(item.sellingPrice ?? item.price ?? 0).replace(/[^0-9.]/g, '')) || 0;
  };

  const getItemValuation = (item: any): number => {
    if (typeof item.totalValue === 'number' && item.totalValue > 0) return item.totalValue;
    if (typeof item.totalValue === 'string') {
      const parsed = parseFloat(item.totalValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const qty = Number(item.qty ?? item.quantity ?? 0);
    return getItemCost(item) * qty;
  };

  const fmtRs = (n: number) =>
    'Rs. ' + Math.round(n).toLocaleString('en-LK');

  /* ── Summary totals ─────────────────────────────────── */
  const totalSKUs = data.length;
  let totalUnits = 0;
  let totalValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiredCount = 0;

  data.forEach((item) => {
    const qty = Number(item.qty ?? item.quantity ?? 0);
    totalUnits += qty;
    totalValue += getItemValuation(item);
    if (item.status === 'Low Stock') lowStockCount++;
    else if (item.status === 'Out of Stock') outOfStockCount++;
    else if (item.status === 'Expired') expiredCount++;
  });

  /* ── 1. Sort hierarchically: Category -> Subcategory -> Brand -> Name ── */
  const sortedItems = [...data].sort((a, b) => {
    const catA = String(a.category || 'Uncategorized').trim().toLowerCase();
    const catB = String(b.category || 'Uncategorized').trim().toLowerCase();
    if (catA !== catB) return catA.localeCompare(catB);

    const subA = String(a.subCategory || a.subcategory || 'General').trim().toLowerCase();
    const subB = String(b.subCategory || b.subcategory || 'General').trim().toLowerCase();
    if (subA !== subB) return subA.localeCompare(subB);

    const brandA = String(a.brand || 'Unbranded').trim().toLowerCase();
    const brandB = String(b.brand || 'Unbranded').trim().toLowerCase();
    if (brandA !== brandB) return brandA.localeCompare(brandB);

    const nameA = String(a.name || a.product_name || '').trim().toLowerCase();
    const nameB = String(b.name || b.product_name || '').trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });

  /* ── 2. Build Nested Hierarchy Tree ──────────────────── */
  interface BrandNode {
    brandName: string;
    items: any[];
    totalQty: number;
    totalValuation: number;
  }

  interface SubcategoryNode {
    subcategoryName: string;
    brands: Map<string, BrandNode>;
    totalQty: number;
    totalValuation: number;
    totalItems: number;
  }

  interface CategoryNode {
    categoryName: string;
    subcategories: Map<string, SubcategoryNode>;
    totalQty: number;
    totalValuation: number;
    totalItems: number;
  }

  const hierarchy = new Map<string, CategoryNode>();

  sortedItems.forEach((item) => {
    const catRaw = (item.category || 'Uncategorized').trim();
    const catKey = catRaw.toLowerCase();

    const subRaw = (item.subCategory || item.subcategory || 'General').trim();
    const subKey = subRaw.toLowerCase();

    const brandRaw = (item.brand || 'Unbranded').trim();
    const brandKey = brandRaw.toLowerCase();

    const qty = Number(item.qty ?? item.quantity ?? 0);
    const val = getItemValuation(item);

    if (!hierarchy.has(catKey)) {
      hierarchy.set(catKey, {
        categoryName: catRaw,
        subcategories: new Map(),
        totalQty: 0,
        totalValuation: 0,
        totalItems: 0,
      });
    }
    const catNode = hierarchy.get(catKey)!;
    catNode.totalQty += qty;
    catNode.totalValuation += val;
    catNode.totalItems += 1;

    if (!catNode.subcategories.has(subKey)) {
      catNode.subcategories.set(subKey, {
        subcategoryName: subRaw,
        brands: new Map(),
        totalQty: 0,
        totalValuation: 0,
        totalItems: 0,
      });
    }
    const subNode = catNode.subcategories.get(subKey)!;
    subNode.totalQty += qty;
    subNode.totalValuation += val;
    subNode.totalItems += 1;

    if (!subNode.brands.has(brandKey)) {
      subNode.brands.set(brandKey, {
        brandName: brandRaw,
        items: [],
        totalQty: 0,
        totalValuation: 0,
      });
    }
    const brandNode = subNode.brands.get(brandKey)!;
    brandNode.items.push(item);
    brandNode.totalQty += qty;
    brandNode.totalValuation += val;
  });

  /* ── Status badge helper ─────────────────────────────── */
  const statusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    const base = 'px-2 py-0.5 rounded text-[7.5pt] font-black uppercase whitespace-nowrap leading-tight inline-block';
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
          .inventory-print-root {
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
          .cat-section { page-break-inside: auto; margin-bottom: 16pt; }
          .subcat-block { page-break-inside: avoid; margin-bottom: 12pt; }
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
          padding: '20pt 24pt',
          width: '100%',
          maxWidth: '960px',
          margin: '0 auto',
          fontSize: '9pt',
        } as any}
      >
        {/* ══════════ HEADER ══════════ */}
        <div style={{ borderBottom: '5px solid #1e3a8a', paddingBottom: '14pt', marginBottom: '14pt' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {/* Left – brand */}
            <div>
              <div style={{ fontSize: '26pt', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px', lineHeight: 1, textTransform: 'uppercase' }}>
                {activeStoreName}
              </div>
              <div style={{ fontSize: '11pt', fontWeight: 900, color: '#1d4ed8', letterSpacing: '-0.3px', textTransform: 'uppercase', marginBottom: '6pt', marginTop: '3pt' }}>
                Inventory Management &amp; Valuation System
              </div>
              <div style={{ fontSize: '7.5pt', color: '#64748b', lineHeight: 1.4, fontWeight: 600 }}>
                <div>Main Commercial Hub, Sri Lanka</div>
                <div>Classified Inventory Audit Report • Split by Category &gt; Subcategory &gt; Brand</div>
              </div>
            </div>

            {/* Right – report meta */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '3pt 8pt', fontSize: '7.5pt', fontWeight: 900, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4pt' }}>
                Inventory Audit Report
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Audit Period
              </div>
              <div style={{ fontSize: '13pt', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px', margin: '1pt 0' }}>
                {periodLabel}
              </div>
              <div style={{ fontSize: '7pt', color: '#94a3b8', fontWeight: 600 }}>
                Generated: {generatedAt}
              </div>
              <div style={{ fontSize: '7pt', color: '#94a3b8', fontWeight: 800, marginTop: '2pt' }}>
                REF: INV-AUDIT-{format(new Date(), 'yyyyMMdd-HHmm')}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ KPI SUMMARY CARDS ══════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8pt', marginBottom: '16pt' }}>
          {/* Card 1 – Total Value (dark navy) */}
          <div style={{ background: '#1e3a8a', borderRadius: '8px', padding: '10pt 12pt', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '70pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.75 }}>
              Total Inventory Valuation
            </div>
            <div>
              <div style={{ fontSize: '18pt', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>
                {fmtRs(totalValue)}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                {totalUnits.toLocaleString('en-LK')} Total Units on Hand
              </div>
            </div>
          </div>

          {/* Card 2 – SKUs */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '10pt 12pt', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '70pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1e3a8a', opacity: 0.75 }}>
              Total Active SKUs
            </div>
            <div>
              <div style={{ fontSize: '20pt', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {totalSKUs}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                {hierarchy.size} Categories
              </div>
            </div>
          </div>

          {/* Card 3 – Low / OOS */}
          <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '8px', padding: '10pt 12pt', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '70pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#78350f', opacity: 0.75 }}>
              Stock Alerts
            </div>
            <div>
              <div style={{ fontSize: '20pt', fontWeight: 900, color: '#b45309', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {lowStockCount + outOfStockCount}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                {outOfStockCount} Out • {lowStockCount} Low
              </div>
            </div>
          </div>

          {/* Card 4 – Expired */}
          <div style={{ background: '#fdf4ff', border: '1.5px solid #e9d5ff', borderRadius: '8px', padding: '10pt 12pt', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '70pt' }}>
            <div style={{ fontSize: '7pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#581c87', opacity: 0.75 }}>
              Critical / Expired
            </div>
            <div>
              <div style={{ fontSize: '20pt', fontWeight: 900, color: '#7c3aed', letterSpacing: '-0.5px', lineHeight: 1 }}>
                {expiredCount}
              </div>
              <div style={{ fontSize: '7pt', fontWeight: 700, color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '3pt' }}>
                Requires Action
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ INVENTORY GROUPED BY CATEGORY > SUBCATEGORY > BRAND ══════════ */}
        {Array.from(hierarchy.entries()).map(([catKey, catNode]) => (
          <section key={catKey} className="cat-section" style={{ marginBottom: '18pt' }}>
            {/* Category Main Banner */}
            <div
              style={{
                background: '#1e3a8a',
                color: '#ffffff',
                padding: '6pt 10pt',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8pt',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6pt' }}>
                <span style={{ fontSize: '11pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  📁 CATEGORY: {catNode.categoryName}
                </span>
                <span style={{ fontSize: '8pt', background: 'rgba(255,255,255,0.2)', padding: '1pt 6pt', borderRadius: '4px', fontWeight: 700 }}>
                  {catNode.totalItems} SKUs
                </span>
              </div>
              <div style={{ fontSize: '9pt', fontWeight: 900, textAlign: 'right' }}>
                {catNode.totalQty.toLocaleString('en-LK')} Units &nbsp;|&nbsp; Subtotal: {fmtRs(catNode.totalValuation)}
              </div>
            </div>

            {/* Loop through Subcategories within Category */}
            {Array.from(catNode.subcategories.entries()).map(([subKey, subNode]) => (
              <div key={subKey} className="subcat-block" style={{ marginBottom: '12pt', marginLeft: '6pt' }}>
                {/* Subcategory Banner */}
                <div
                  style={{
                    background: '#eff6ff',
                    borderLeft: '4px solid #2563eb',
                    borderTop: '1px solid #bfdbfe',
                    borderRight: '1px solid #bfdbfe',
                    borderBottom: '1px solid #bfdbfe',
                    padding: '4pt 8pt',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4pt',
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6pt' }}>
                    <span style={{ fontSize: '8.5pt', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                      ↳ Subcategory: {subNode.subcategoryName}
                    </span>
                    <span style={{ fontSize: '7pt', color: '#64748b', fontWeight: 700 }}>
                      ({subNode.totalItems} product{subNode.totalItems !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div style={{ fontSize: '8pt', fontWeight: 800, color: '#1e40af' }}>
                    {subNode.totalQty} Units • {fmtRs(subNode.totalValuation)}
                  </div>
                </div>

                {/* Loop through Brands within Subcategory */}
                {Array.from(subNode.brands.entries()).map(([brandKey, brandNode]) => (
                  <div key={brandKey} style={{ marginBottom: '8pt', marginLeft: '8pt' }}>
                    {/* Brand Pill / Mini Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6pt', margin: '4pt 0 3pt 0' }}>
                      <span style={{ display: 'inline-block', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '1.5pt 6pt', borderRadius: '4px', fontSize: '7.5pt', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                        🏷️ Brand: {brandNode.brandName}
                      </span>
                      <span style={{ fontSize: '7pt', color: '#94a3b8', fontWeight: 600 }}>
                        {brandNode.items.length} item{brandNode.items.length !== 1 ? 's' : ''} • {brandNode.totalQty} units • {fmtRs(brandNode.totalValuation)}
                      </span>
                    </div>

                    {/* Products Table for this Brand */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt' }}>
                      <colgroup>
                        <col style={{ width: '28%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '13%' }} />
                        <col style={{ width: '13%' }} />
                        <col style={{ width: '16%' }} />
                      </colgroup>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '3.5pt 5pt', textAlign: 'left', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Product &amp; SKU</th>
                          <th style={{ padding: '3.5pt 5pt', textAlign: 'left', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Barcode</th>
                          <th style={{ padding: '3.5pt 5pt', textAlign: 'center', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Unit</th>
                          <th style={{ padding: '3.5pt 5pt', textAlign: 'right', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Qty</th>
                          <th style={{ padding: '3.5pt 5pt', textAlign: 'right', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Unit Cost</th>
                          <th style={{ padding: '3.5pt 5pt', textAlign: 'right', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Selling Price</th>
                          <th style={{ padding: '3.5pt 5pt', textAlign: 'right', fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}>Total Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brandNode.items.map((item, idx) => {
                          const cost = getItemCost(item);
                          const selling = getItemSelling(item);
                          const val = getItemValuation(item);
                          const qty = Number(item.qty ?? item.quantity ?? 0);
                          const skuText = item.sku || item.skuInfo || '—';
                          const barcodeText = item.barcode || skuText;
                          const unitText = item.unit || item.measurementUnit || 'pcs';

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                              <td style={{ padding: '3.5pt 5pt' }}>
                                <div style={{ fontWeight: 700, fontSize: '8pt', color: '#0f172a' }}>{item.name}</div>
                                <div style={{ fontFamily: 'monospace', fontSize: '6.5pt', color: '#64748b', marginTop: '0.5pt' }}>
                                  SKU: {skuText}
                                </div>
                              </td>
                              <td style={{ padding: '3.5pt 5pt', fontFamily: 'monospace', fontSize: '6.5pt', color: '#0369a1', fontWeight: 600 }}>
                                {barcodeText}
                              </td>
                              <td style={{ padding: '3.5pt 5pt', textAlign: 'center', color: '#64748b', fontSize: '7pt' }}>
                                {unitText}
                              </td>
                              <td style={{ padding: '3.5pt 5pt', textAlign: 'right', fontWeight: 900, color: qty <= 0 ? '#b91c1c' : '#0f172a' }}>
                                {qty}
                              </td>
                              <td style={{ padding: '3.5pt 5pt', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                                {cost > 0 ? fmtRs(cost) : '—'}
                              </td>
                              <td style={{ padding: '3.5pt 5pt', textAlign: 'right', fontWeight: 600, color: '#475569' }}>
                                {selling > 0 ? fmtRs(selling) : '—'}
                              </td>
                              <td style={{ padding: '3.5pt 5pt', textAlign: 'right', fontWeight: 900, color: '#1e3a8a' }}>
                                {fmtRs(val)}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Brand Subtotal (if 2 or more products in this brand) */}
                        {brandNode.items.length > 1 && (
                          <tr style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                            <td colSpan={3} style={{ padding: '3pt 5pt', fontSize: '7pt', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                              {brandNode.brandName} Subtotal
                            </td>
                            <td style={{ padding: '3pt 5pt', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '7.5pt' }}>
                              {brandNode.totalQty}
                            </td>
                            <td colSpan={2} />
                            <td style={{ padding: '3pt 5pt', textAlign: 'right', fontWeight: 900, color: '#1e3a8a', fontSize: '7.5pt' }}>
                              {fmtRs(brandNode.totalValuation)}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ))}

            {/* Category Total Footer Row */}
            <div
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '4pt 10pt',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '6pt 0 14pt 0',
                fontSize: '8pt',
                fontWeight: 800,
                color: '#1e3a8a',
              }}
            >
              <div>TOTAL FOR {catNode.categoryName.toUpperCase()} ({catNode.totalItems} SKUs)</div>
              <div>{catNode.totalQty} Units &nbsp;•&nbsp; {fmtRs(catNode.totalValuation)}</div>
            </div>
          </section>
        ))}

        {/* ══════════ GRAND TOTAL BANNER ══════════ */}
        <div style={{ background: '#1e3a8a', borderRadius: '8px', padding: '10pt 14pt', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10pt', marginBottom: '18pt', color: 'white' }}>
          <div>
            <div style={{ fontSize: '9pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              GRAND TOTAL INVENTORY ASSET VALUATION
            </div>
            <div style={{ fontSize: '7.5pt', opacity: 0.8, marginTop: '2pt' }}>
              {totalSKUs} SKUs across {hierarchy.size} Categories • {totalUnits.toLocaleString('en-LK')} Total Units in Stock
            </div>
          </div>
          <div style={{ fontSize: '16pt', fontWeight: 900, letterSpacing: '-0.3px' }}>
            {fmtRs(totalValue)}
          </div>
        </div>

        {/* ══════════ FOOTER ══════════ */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14pt', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24pt', pageBreakInside: 'avoid' }}>
          {/* Left – statement */}
          <div>
            <div style={{ fontSize: '7.5pt', fontWeight: 900, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3pt' }}>
              Stock Verification Statement
            </div>
            <div style={{ fontSize: '7pt', color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic', borderLeft: '3px solid #bfdbfe', paddingLeft: '6pt' }}>
              This inventory valuation report was automatically compiled by the Central POS &amp; Inventory Management System. It classifies physical stock by Category, Subcategory, and Brand. All stock values represent verified audit figures as of the timestamp.
            </div>
          </div>

          {/* Right – signatures + copyright */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '24pt' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '100px', borderBottom: '1px solid #cbd5e1', marginBottom: '3pt' }} />
                <div style={{ fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>Auditor Signature</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '100px', borderBottom: '1px solid #cbd5e1', marginBottom: '3pt' }} />
                <div style={{ fontSize: '6.5pt', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>Manager Approval</div>
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
