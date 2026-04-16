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
  lowStockProducts,
  type LowStockProduct,
} from "./data";

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

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedIds([]);
      setBulkAction("");
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return lowStockProducts;
    }

    return lowStockProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term)
      );
    });
  }, [searchTerm]);

  const criticalCount = lowStockProducts.filter(
    (product) => product.currentStock === 0,
  ).length;
  const veryLowCount = lowStockProducts.filter(
    (product) => getStockSeverity(product) === "Very Low",
  ).length;
  const totalValueAtRisk = formatCurrency(
    filteredProducts.reduce(
      (total, product) => total + getInventoryValueAtRisk(product),
      0,
    ),
  );

  const selectedProducts = lowStockProducts.filter((product) =>
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
    router.push(`/purchase-orders?items=${encodeURIComponent(ids)}`);
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
            <LowStockProductsTable
              products={filteredProducts}
              selectedIds={selectedIds}
              onToggleSelected={updateSelection}
              onToggleAll={selectAllVisible}
              onReorder={handleReorder}
              onClearSelection={clearSelection}
              selectedVisibleCount={selectedVisibleCount}
            />

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
