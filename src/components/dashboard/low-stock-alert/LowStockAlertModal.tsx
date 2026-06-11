"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StockAlertHeader from "./StockAlertHeader";
import AlertSummaryCards from "./AlertSummaryCards";
import ProductSearchBar from "./ProductSearchBar";
import LowStockProductsTable from "./LowStockProductsTable";
import CreatePurchaseOrderAction from "./CreatePurchaseOrderAction";
import {
  getInventoryValueAtRisk,
  getStockSeverity,
  type LowStockProduct,
} from "./data";
import api from "@/api/axiosInstance";

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

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedIds([]);
      setBulkAction("");
      return;
    }

    const fetchLowStock = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/stock?low_stock=true&out_of_stock=true');
        const items = res.data?.data || res.data || [];
        const mapped: LowStockProduct[] = items.map(
          (item: any, index: number) => ({
            id: item.product_id || item.id || `ls-${index}`,
            name: item.product_name || item.product?.name || "Unknown",
            sku: item.sku || item.product?.sku || "N/A",
            category:
              item.category_name ||
              item.product?.category?.name ||
              "Uncategorized",
            currentStock: item.available_quantity ?? 0,
            reorderLevel: item.minimum_stock_level ?? 20,
            reorderQty: Math.max(
              0,
              (item.minimum_stock_level ?? 20) - (item.available_quantity ?? 0),
            ),
            lastSale: "Recently",
            unitsSold: 0,
            unitCost: item.selling_price ?? item.product?.sellingPrice ?? 0,
            warehouseId: item.warehouse_id,
            warehouseName: item.warehouse_name,
          }),
        );
        setLiveProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch low stock data", err);
        setLiveProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLowStock();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
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

  const handleDownload = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-2 sm:px-6 sm:py-6">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="stock-modal-enter relative z-10 flex h-[98vh] w-full max-w-[940px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_40px_120px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/70 sm:h-[95vh] sm:rounded-[30px]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2f83] via-[#123b9e] to-[#1b48b6]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15)_0%,transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08)_0%,transparent_50%)]" />

          <StockAlertHeader
            onClose={onClose}
            onDownload={handleDownload}
            onPrint={handlePrint}
          />

          <AlertSummaryCards
            criticalCount={criticalCount}
            veryLowCount={veryLowCount}
            totalValueAtRisk={totalValueAtRisk}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-[#f3f4f6]">
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