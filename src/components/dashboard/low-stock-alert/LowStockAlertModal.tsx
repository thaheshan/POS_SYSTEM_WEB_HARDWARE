"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StockAlertHeader from "./StockAlertHeader";
import AlertSummaryCards from "./AlertSummaryCards";
import ProductSearchBar from "./ProductSearchBar";
import LowStockProductsTable from "./LowStockProductsTable";
import CreatePurchaseOrderAction from "./CreatePurchaseOrderAction";
import { getInventoryValueAtRisk, getStockSeverity, type LowStockProduct } from "./data";
import api from "@/api/axiosInstance";
import { shopApi } from "@/api/shop";
import { format } from "date-fns";

interface LowStockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LowStockAlertModal({
  isOpen,
  onClose,
}: LowStockAlertModalProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [liveProducts, setLiveProducts] = useState<LowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shopProfile, setShopProfile] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedIds([]);
      setBulkAction("");
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await shopApi.getProfile();
        setShopProfile(profile);
      } catch (e) {
        console.error("Failed to fetch shop profile", e);
      }
    };
    fetchProfile();

    const fetchLowStock = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/stock?low_stock=true&out_of_stock=true');

        // Handle NestJS ResponseInterceptor double-wrapping
        const payload = res.data?.data;
        const items: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(res.data)
          ? res.data
          : [];

        const mapped: LowStockProduct[] = items.map((item: any, index: number) => ({
          id: item.product_id || item.id || `ls-${index}`,
          name: item.product_name || item.product?.name || item.name || "Unknown",
          sku: item.sku || item.product?.sku || "N/A",
          category: item.category_name || item.product?.category?.name || item.category || "Uncategorized",
          currentStock: Number(item.available_quantity ?? item.quantity ?? 0),
          reorderLevel: Number(item.minimum_stock_level ?? 20),
          reorderQty: Math.max(0, Number(item.minimum_stock_level ?? 20) - Number(item.available_quantity ?? 0)),
          lastSale: "Recently",
          unitsSold: 0,
          unitCost: Number(item.selling_price ?? item.product?.sellingPrice ?? 0),
          warehouseId: item.warehouse_id,
          warehouseName: item.warehouse_name,
        }));

        setLiveProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch low stock data", err);
        setLiveProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLowStock();

    const timer = setTimeout(() => {
      const modalScrollables = Array.from(
        document.querySelectorAll<HTMLElement>('.stock-modal-enter .overflow-y-auto')
      );
      const visibleScroll = modalScrollables.find(
        (el) => el.offsetParent !== null && el.clientHeight > 0
      );
      if (visibleScroll) {
        visibleScroll.focus({ preventScroll: true });
      }
    }, 150);

    const handleModalKey = (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable);

      if (event.key === "Escape" || (event.key === "Backspace" && !isInput)) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleModalKey);
    return () => window.removeEventListener("keydown", handleModalKey);
  }, [isOpen, onClose]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return liveProducts;
    return liveProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term),
    );
  }, [searchTerm, liveProducts]);

  const criticalCount = liveProducts.filter(
    (product) => product.currentStock === 0,
  ).length;
  const veryLowCount = liveProducts.filter(
    (product) => getStockSeverity(product) === "Very Low",
  ).length;
  const totalValueAtRisk = formatCurrency(
    liveProducts.reduce(
      (total, product) => total + getInventoryValueAtRisk(product),
      0,
    ),
  );

  const selectedProducts = liveProducts.filter((product) =>
    selectedIds.includes(product.id),
  );
  const selectedVisibleCount = filteredProducts.filter((product) =>
    selectedIds.includes(product.id),
  ).length;

  const updateSelection = (productId: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked
        ? [...current, productId]
        : current.filter((currentId) => currentId !== productId),
    );
  };

  const selectAllVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredProducts.forEach((product) => next.add(product.id));
      return Array.from(next);
    });
  };

  const clearSelection = () => setSelectedIds([]);

  const openPurchaseOrders = (products: LowStockProduct[]) => {
    const ids = products.map((product) => product.id).join(",");
    router.push(`/suppliers/requests?items=${encodeURIComponent(ids)}`);
    onClose();
  };

  const handleBulkActionChange = (value: string) => {
    setBulkAction(value);

    if (value === "select-all") {
      selectAllVisible();
    }

    if (value === "clear-selection") {
      clearSelection();
    }

    if (value === "create-po" && selectedProducts.length > 0) {
      openPurchaseOrders(selectedProducts);
    }

    setBulkAction("");
  };

  const handleCreatePurchaseOrders = () => {
    if (selectedProducts.length === 0) {
      return;
    }

    openPurchaseOrders(selectedProducts);
  };

  const handleReorder = (product: LowStockProduct) => {
    openPurchaseOrders([product]);
  };

  const handleExportPdf = async () => {
    let currentProfile = shopProfile;
    if (!currentProfile) {
      try {
        currentProfile = await shopApi.getProfile();
        setShopProfile(currentProfile);
      } catch (e) {
        console.error("Could not fetch shop profile", e);
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

    const productsToExport = filteredProducts;
    const generatedTimeStr = format(new Date(), 'MMM d, yyyy — h:mm a');

    const rowsHtml = productsToExport.length === 0 ? `
      <tr>
        <td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">No low stock products found.</td>
      </tr>
    ` : productsToExport.map((p, i) => {
      const valueAtRisk = getInventoryValueAtRisk(p);
      const isCritical = p.currentStock === 0;
      
      return `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td><strong>${p.sku}</strong></td>
        <td style="font-weight:700;color:#0f172a;">${p.name}</td>
        <td>${p.category}</td>
        <td style="text-align:center;">
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:800;font-size:10px;background:${isCritical ? '#fef2f2' : '#fffbe6'};color:${isCritical ? '#dc2626' : '#d97706'};border:1px solid ${isCritical ? '#fca5a5' : '#fde68a'};">
            ${p.currentStock} units ${isCritical ? '(CRITICAL)' : ''}
          </span>
        </td>
        <td style="text-align:center;font-weight:700;">+${p.reorderQty}</td>
        <td style="text-align:right;">LKR ${p.unitCost.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:right;font-weight:700;color:#1e40af;">LKR ${valueAtRisk.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
      </tr>`;
    }).join('');

    const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${shopName} — Low Stock & Reorder Alert Report</title>
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
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px;}
  .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;}
  .kpi-label{font-size:9.5px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;}
  .kpi-value{font-size:16px;font-weight:900;color:#1e40af;}
  .kpi-sub{font-size:9.5px;color:#64748b;margin-top:3px;font-weight:500;}
  .kpi.red .kpi-value{color:#dc2626;}
  .kpi.amber .kpi-value{color:#b45309;}
  .kpi.blue .kpi-value{color:#2563eb;}
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
  .badge{display:inline-block;background:#fef2f2;color:#dc2626;border:1px solid #fca5a5;border-radius:4px;padding:2px 8px;font-size:9.5px;font-weight:800;}
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
    <div class="report-title">Low Stock &amp; Reorder Alert Report</div>
    <div><strong>Generated:</strong> ${generatedTimeStr}</div>
    <div><strong>Alert Items:</strong> ${productsToExport.length} products</div>
    <div style="margin-top:4px;"><strong>Status:</strong> <span class="badge">Immediate Attention Required</span></div>
  </div>
</div>

<div class="section-title">Stock Alert Summary</div>
<div class="kpi-grid">
  <div class="kpi red">
    <div class="kpi-label">Critical (Out of Stock)</div>
    <div class="kpi-value">${criticalCount}</div>
    <div class="kpi-sub">0 units available</div>
  </div>
  <div class="kpi amber">
    <div class="kpi-label">Very Low Stock</div>
    <div class="kpi-value">${veryLowCount}</div>
    <div class="kpi-sub">Below minimum threshold</div>
  </div>
  <div class="kpi blue">
    <div class="kpi-label">Total Low Stock Items</div>
    <div class="kpi-value">${productsToExport.length}</div>
    <div class="kpi-sub">Requiring reordering</div>
  </div>
  <div class="kpi red">
    <div class="kpi-label">Inventory Value at Risk</div>
    <div class="kpi-value">${totalValueAtRisk}</div>
    <div class="kpi-sub">Potential lost sales</div>
  </div>
</div>

<div class="section-title">Low Stock &amp; Reorder Schedule (${productsToExport.length} Items)</div>
<table>
  <thead><tr>
    <th>SKU</th>
    <th>Product Name</th>
    <th>Category</th>
    <th class="center">Current Stock</th>
    <th class="center">Reorder Qty</th>
    <th class="right">Unit Price</th>
    <th class="right">Value at Risk</th>
  </tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>

<div class="footer">
  <div class="footer-left">
    <strong>${shopName}</strong> &bull; ${shopAddress} ${phone ? ` &bull; ${phone}` : ''}
  </div>
  <div>
    Generated: ${generatedTimeStr} &bull; Official Inventory Alert Statement
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
    const headers = ['SKU', 'Product Name', 'Category', 'Current Stock', 'Reorder Level', 'Reorder Qty', 'Unit Price (LKR)', 'Value at Risk (LKR)'];
    const csvRows = [
      headers.join(','),
      ...filteredProducts.map(p => [
        `"${p.sku}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        p.currentStock,
        p.reorderLevel,
        p.reorderQty,
        p.unitCost,
        getInventoryValueAtRisk(p),
      ].join(',')),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low-stock-alert-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="stock-modal-enter relative z-10 flex w-full flex-col bg-white shadow-[0_40px_120px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/70
        rounded-t-3xl h-[92vh]
        sm:rounded-[30px] sm:h-[95vh] sm:max-w-[940px] sm:mx-4">
        <div className="relative z-30 rounded-t-3xl sm:rounded-t-[30px] bg-gradient-to-br from-[#0f2f83] via-[#123b9e] to-[#1b48b6]">
          <div className="pointer-events-none absolute inset-0 rounded-t-3xl sm:rounded-t-[30px] overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0%,transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08)_0%,transparent_50%)]" />

          <StockAlertHeader
            onClose={onClose}
            onExportPdf={handleExportPdf}
            onExportCsv={handleExportCsv}
            onPrint={handleExportPdf}
            criticalCount={criticalCount}
            veryLowCount={veryLowCount}
            totalValueAtRisk={totalValueAtRisk}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-[#f3f4f6] rounded-b-3xl sm:rounded-b-[30px] overflow-hidden">
          <ProductSearchBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            bulkAction={bulkAction}
            onBulkActionChange={handleBulkActionChange}
            itemsCount={filteredProducts.length}
          />

          <div className="flex min-h-0 flex-1 flex-col bg-white">
            {isLoading ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                  <p className="text-sm font-semibold text-slate-400">
                    Loading live stock data...
                  </p>
                </div>
              </div>
            ) : liveProducts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <svg
                    className="h-8 w-8 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-[15px] font-bold text-slate-700">
                  All stock levels are healthy!
                </p>
                <p className="text-sm text-slate-400">
                  No products are below their minimum stock level.
                </p>
              </div>
            ) : (
              <LowStockProductsTable
                products={filteredProducts}
                selectedIds={selectedIds}
                onToggleSelected={updateSelection}
                onToggleAll={selectAllVisible}
                onReorder={handleReorder}
                onClearSelection={clearSelection}
                selectedVisibleCount={selectedVisibleCount}
              />
            )}

            <CreatePurchaseOrderAction
              selectedCount={selectedProducts.length}
              onCreatePurchaseOrders={handleCreatePurchaseOrders}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}