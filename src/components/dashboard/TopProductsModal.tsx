'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Search, 
  Award, 
  TrendingUp, 
  Package, 
  ArrowUpDown, 
  RefreshCw, 
  BarChart2, 
  Download, 
  ChevronDown, 
  FileText, 
  FileSpreadsheet, 
  Printer 
} from 'lucide-react';
import api from '@/api/axiosInstance';
import { shopApi } from '@/api/shop';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TopProduct } from '@/hooks/useDashboard';

interface TopProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TopProductsModal({ isOpen, onClose }: TopProductsModalProps) {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'qty_desc' | 'qty_asc' | 'rev_desc' | 'rev_asc'>('qty_desc');
  const [shopProfile, setShopProfile] = useState<any>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAllTopProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/top-products', { params: { limit: 500 } });
      const raw = res.data;
      const items: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.items)
        ? raw.items
        : [];

      const mapped: TopProduct[] = items.map((p: any, idx: number) => ({
        id: p.id || p.product_id || `tp-${idx}`,
        name: p.name || p.product_name || 'Unknown Product',
        sku: p.sku || p.product?.sku || 'N/A',
        category: p.category || p.category_name || p.product?.category?.name || 'General',
        totalQty: Number(p.totalQty ?? p.quantity ?? p.qty ?? p.unitsSold ?? 0),
        totalRevenue: Number(p.totalRevenue ?? p.revenue ?? p.amount ?? 0),
      }));

      setProducts(mapped);
    } catch (err) {
      console.error('Failed to fetch top products in modal', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchAllTopProducts();

    const fetchProfile = async () => {
      try {
        const profile = await shopApi.getProfile();
        setShopProfile(profile);
      } catch (err) {
        console.error('Failed to fetch shop profile', err);
      }
    };
    fetchProfile();

    document.body.style.overflow = 'hidden';

    const handleModalKey = (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      if (event.key === 'Escape' || (event.key === 'Backspace' && !isInput)) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDownloadOpen(false);
      }
    };

    window.addEventListener('keydown', handleModalKey);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleModalKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.sku && p.sku.toLowerCase().includes(term)) ||
          (p.category && p.category.toLowerCase().includes(term))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'qty_desc') return b.totalQty - a.totalQty;
      if (sortBy === 'qty_asc') return a.totalQty - b.totalQty;
      if (sortBy === 'rev_desc') return b.totalRevenue - a.totalRevenue;
      if (sortBy === 'rev_asc') return a.totalRevenue - b.totalRevenue;
      return 0;
    });

    return result;
  }, [products, searchTerm, sortBy]);

  const totalUnitsSold = useMemo(
    () => products.reduce((acc, p) => acc + p.totalQty, 0),
    [products]
  );
  const totalRevenue = useMemo(
    () => products.reduce((acc, p) => acc + p.totalRevenue, 0),
    [products]
  );

  const handleExportPdf = async () => {
    let currentProfile = shopProfile;
    if (!currentProfile) {
      try {
        currentProfile = await shopApi.getProfile();
        setShopProfile(currentProfile);
      } catch (e) {
        console.error('Could not fetch shop profile', e);
      }
    }

    const shopName = currentProfile?.name || 'Futura Hardware POS';
    const addressParts = [
      currentProfile?.address,
      currentProfile?.city,
      currentProfile?.district,
      currentProfile?.province
    ].filter(Boolean);
    const shopAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Sri Lanka';
    const phone = currentProfile?.phone ? `Tel: ${currentProfile.phone}` : '';
    const email = currentProfile?.email ? `Email: ${currentProfile.email}` : '';
    const regNum = currentProfile?.businessRegistration ? `Reg/TRN: ${currentProfile.businessRegistration}` : '';
    const contactLine = [phone, email, regNum].filter(Boolean).join(' | ');

    const productsToExport = filteredAndSortedProducts;
    const generatedTimeStr = format(new Date(), 'MMM d, yyyy — h:mm a');

    const rowsHtml = productsToExport.length === 0 ? `
      <tr>
        <td colspan="6" style="text-align:center;padding:20px;color:#94a3b8;">No top products found for the selected view.</td>
      </tr>
    ` : productsToExport.map((p, i) => {
      const rank = i + 1;
      const rankBadge = rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`;
      const rankBg = rank === 1 ? '#fef3c7' : rank === 2 ? '#f1f5f9' : rank === 3 ? '#fef3c7' : '#f8fafc';
      const rankColor = rank === 1 ? '#92400e' : rank === 2 ? '#334155' : rank === 3 ? '#78350f' : '#475569';

      return `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td style="text-align:center;">
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:800;font-size:10px;background:${rankBg};color:${rankColor};border:1px solid #cbd5e1;">
            ${rankBadge}
          </span>
        </td>
        <td style="font-weight:700;color:#0f172a;">${p.name}</td>
        <td style="font-family:monospace;font-size:10px;color:#64748b;">${p.sku || 'N/A'}</td>
        <td>${p.category || 'General'}</td>
        <td style="text-align:right;font-weight:800;color:#0f172a;">${p.totalQty.toLocaleString()} units</td>
        <td style="text-align:right;font-weight:800;color:#1e40af;">LKR ${p.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
      </tr>`;
    }).join('');

    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${shopName} — Top Selling Products Analytics Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  @page {
    size: A4 portrait;
    margin: 12mm 15mm;
  }
  body{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Arial,sans-serif;font-size:11px;color:#1e293b;background:#fff;padding:24px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1e40af;padding-bottom:16px;margin-bottom:20px;}
  .brand-logo{max-height:50px;width:auto;margin-bottom:8px;}
  .brand{font-size:22px;font-weight:900;color:#1e40af;letter-spacing:-0.5px;line-height:1.1;}  
  .brand-address{font-size:11px;color:#475569;font-weight:500;margin-top:3px;}
  .brand-contact{font-size:10px;color:#64748b;margin-top:2px;}
  .meta{text-align:right;font-size:11px;color:#64748b;line-height:1.6;}
  .meta strong{color:#0f172a;}
  .report-title{font-size:14px;font-weight:900;color:#1e40af;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;}
  .section-title{font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#475569;margin:20px 0 8px;border-left:3px solid #1e40af;padding-left:8px;}
  .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:10px;}
  .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;}
  .kpi-label{font-size:9.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;}
  .kpi-value{font-size:16px;font-weight:900;color:#1e40af;}
  .kpi-sub{font-size:9.5px;color:#64748b;margin-top:3px;font-weight:500;}
  .kpi.green .kpi-value{color:#059669;}
  .kpi.purple .kpi-value{color:#7c3aed;}
  table{width:100%;border-collapse:collapse;margin-top:6px;page-break-inside:auto;}
  thead{display:table-header-group;}
  tr{page-break-inside:avoid;page-break-after:auto;}
  thead tr{background:#1e40af;color:#fff;}
  thead th{padding:8px 12px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;text-align:left;}
  thead th.center{text-align:center;}
  thead th.right{text-align:right;}
  tbody tr.even{background:#f8fafc;}
  tbody tr.odd{background:#fff;}
  tbody td{padding:7.5px 12px;font-size:11px;border-bottom:1px solid #e2e8f0;color:#334155;}
  tbody tr:last-child td{border-bottom:2px solid #cbd5e1;}
  .footer{margin-top:32px;padding-top:12px;border-top:1.5px solid #cbd5e1;display:flex;justify-content:space-between;align-items:center;font-size:9.5px;color:#64748b;}
  .footer-left strong{color:#0f172a;}
  .badge{display:inline-block;background:#ecfdf5;color:#059669;border:1px solid #6ee7b7;border-radius:4px;padding:2px 8px;font-size:9.5px;font-weight:800;}
  @media print{
    body{padding:0;}
    .no-print{display:none !important;}
  }
</style></head><body>
<div class="header">
  <div>
    ${currentProfile?.logo_url ? `<img src="${currentProfile.logo_url}" alt="Logo" class="brand-logo" />` : ''}
    <div class="brand">${shopName}</div>
    <div class="brand-address">${shopAddress}</div>
    ${contactLine ? `<div class="brand-contact">${contactLine}</div>` : ''}
  </div>
  <div class="meta">
    <div class="report-title">Top Selling Products Analytics Report</div>
    <div><strong>Generated:</strong> ${generatedTimeStr}</div>
    <div><strong>Ranked Items:</strong> ${productsToExport.length} products</div>
    <div style="margin-top:4px;"><strong>Status:</strong> <span class="badge">Official Financial Statement</span></div>
  </div>
</div>

<div class="section-title">Sales Performance Overview</div>
<div class="kpi-grid">
  <div class="kpi">
    <div class="kpi-label">Ranked Products Tracked</div>
    <div class="kpi-value">${productsToExport.length} Items</div>
    <div class="kpi-sub">Ordered by sales volume</div>
  </div>
  <div class="kpi green">
    <div class="kpi-label">Total Units Sold</div>
    <div class="kpi-value">${totalUnitsSold.toLocaleString()} Units</div>
    <div class="kpi-sub">Across top catalog items</div>
  </div>
  <div class="kpi purple">
    <div class="kpi-label">Total Product Revenue</div>
    <div class="kpi-value">LKR ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
    <div class="kpi-sub">Combined sales turnover</div>
  </div>
</div>

<div class="section-title">Product Sales Performance Ranking (${productsToExport.length} Records)</div>
<table>
  <thead><tr>
    <th class="center" style="width:60px;">Rank</th>
    <th>Product Name</th>
    <th>SKU</th>
    <th>Category</th>
    <th class="right">Units Sold</th>
    <th class="right">Total Revenue (LKR)</th>
  </tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>

<div class="footer">
  <div class="footer-left">
    <strong>${shopName}</strong> &bull; ${shopAddress} ${phone ? ` &bull; ${phone}` : ''}
  </div>
  <div>
    Generated: ${generatedTimeStr} &bull; Official Product Sales Statement
  </div>
</div>
</body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 400);
  };

  const handleExportCsv = () => {
    const headers = ['Rank', 'Product Name', 'SKU', 'Category', 'Units Sold', 'Total Revenue (LKR)'];
    const csvRows = [
      headers.join(','),
      ...filteredAndSortedProducts.map((p, idx) => [
        idx + 1,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.sku || 'N/A'}"`,
        `"${p.category || 'General'}"`,
        p.totalQty,
        p.totalRevenue,
      ].join(',')),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-selling-products-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: '🥇 #1', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (rank === 2) return { label: '🥈 #2', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    if (rank === 3) return { label: '🥉 #3', bg: 'bg-amber-800/10 text-amber-900 border-amber-800/20' };
    return { label: `#${rank}`, bg: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-300" />
              </div>
              <h2 className="text-xl font-black tracking-tight">Top Selling Products</h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              Live sales performance ranking ordered from top to least sold items
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDownloadOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-xl transition-colors border border-white/20"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {downloadOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white p-1.5 text-slate-800 shadow-2xl ring-1 ring-black/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setDownloadOpen(false);
                      handleExportPdf();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-red-500" />
                    <span>Download as PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDownloadOpen(false);
                      handleExportCsv();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span>Download as CSV</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={fetchAllTopProducts}
              title="Refresh Sales Data"
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metric Summary Bar */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border-b border-gray-200/80 shrink-0">
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ranked Products</span>
              <p className="text-lg font-black text-gray-900">{products.length} Items</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Units Sold</span>
              <p className="text-lg font-black text-gray-900">{totalUnitsSold.toLocaleString()} Units</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Product Revenue</span>
              <p className="text-lg font-black text-gray-900">LKR {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-gray-100 bg-white shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="qty_desc">Top Sales (Highest to Lowest Qty)</option>
              <option value="qty_asc">Least Sales (Lowest to Highest Qty)</option>
              <option value="rev_desc">Highest Revenue (LKR)</option>
              <option value="rev_asc">Lowest Revenue (LKR)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-bold text-gray-500">Fetching live top product analytics...</p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="py-20 text-center text-gray-500 font-bold text-sm">
              No product sales matching "{searchTerm}" found.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-gray-200 text-[11px] font-black text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4 w-16 text-center">Rank</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Units Sold</th>
                    <th className="py-3 px-4 text-right">Total Revenue (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredAndSortedProducts.map((product, idx) => {
                    const badge = getRankBadge(idx + 1);
                    return (
                      <tr key={product.id || idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <span className={cn('inline-block px-2.5 py-1 rounded-lg text-[11px] font-extrabold border', badge.bg)}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">SKU: {product.sku || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-600">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-[11px] font-bold">
                            {product.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-gray-900 text-sm">
                          {product.totalQty.toLocaleString()} <span className="text-xs font-medium text-gray-500">sold</span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-blue-700 text-sm">
                          LKR {product.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
          <span className="text-xs font-semibold text-gray-500">
            Showing <strong className="text-gray-900">{filteredAndSortedProducts.length}</strong> of <strong className="text-gray-900">{products.length}</strong> products
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
