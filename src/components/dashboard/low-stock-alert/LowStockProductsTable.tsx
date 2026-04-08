"use client";

import {
  Bolt,
  Hammer,
  Lightbulb,
  Package,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getStockSeverity,
  type LowStockProduct,
  type StockSeverity,
} from "./data";

interface LowStockProductsTableProps {
  products: LowStockProduct[];
  selectedIds: string[];
  onToggleSelected: (productId: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onReorder: (product: LowStockProduct) => void;
  onClearSelection: () => void;
  selectedVisibleCount: number;
}

const severityStyles: Record<StockSeverity, string> = {
  Critical: "bg-red-600 text-white border-red-600",
  "Very Low": "bg-amber-500 text-white border-amber-500",
  Low: "bg-amber-500 text-white border-amber-500",
};

const categoryStyles: Record<string, string> = {
  "PVC Items": "bg-sky-100 text-sky-700 border-sky-200",
  "Bulbs & Lighting": "bg-amber-100 text-amber-700 border-amber-200",
  "Nuts & Bolts": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Electrical Items": "bg-violet-100 text-violet-700 border-violet-200",
  "Tools & Equipment": "bg-orange-100 text-orange-700 border-orange-200",
  Paint: "bg-rose-100 text-rose-700 border-rose-200",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ProductGlyph({ category }: { category: string }) {
  const iconClassName = "h-4 w-4 text-slate-500";

  switch (category) {
    case "Bulbs & Lighting":
      return <Lightbulb className={iconClassName} />;
    case "Nuts & Bolts":
      return <Wrench className={iconClassName} />;
    case "Electrical Items":
      return <Bolt className={iconClassName} />;
    case "Tools & Equipment":
      return <Hammer className={iconClassName} />;
    case "PVC Items":
      return <Package className={iconClassName} />;
    default:
      return <Package className={iconClassName} />;
  }
}

export default function LowStockProductsTable({
  products,
  selectedIds,
  onToggleSelected,
  onToggleAll,
  onReorder,
  onClearSelection,
  selectedVisibleCount,
}: LowStockProductsTableProps) {
  return (
    <div className="stock-fade-up stock-delay-3 relative flex-1 overflow-hidden bg-white">
      {/* On phones we show cards so details stay readable without horizontal scrolling. */}
      <div className="h-full overflow-y-auto overscroll-contain [scrollbar-gutter:stable] md:hidden">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={
                  products.length > 0 &&
                  selectedVisibleCount === products.length
                }
                onChange={(event) =>
                  event.target.checked ? onToggleAll(true) : onClearSelection()
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Select visible
            </label>
            <span className="text-[12px] font-semibold text-slate-500">
              {selectedVisibleCount}/{products.length}
            </span>
          </div>
        </div>

        <div className="space-y-3 p-4 pb-5">
          {products.map((product) => {
            const severity = getStockSeverity(product);
            const isSelected = selectedIds.includes(product.id);

            return (
              <div
                key={product.id}
                className={cn(
                  "rounded-xl border p-3 shadow-sm",
                  severity === "Critical" && "border-red-100 bg-red-50/70",
                  severity !== "Critical" && "border-amber-100 bg-amber-50/70",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) =>
                        onToggleSelected(product.id, event.target.checked)
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200">
                      <ProductGlyph category={product.category} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-slate-900">
                        {product.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {product.sku}
                        </span>
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                            categoryStyles[product.category] ??
                              "bg-slate-100 text-slate-700 border-slate-200",
                          )}
                        >
                          {product.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em]",
                      severityStyles[severity],
                    )}
                  >
                    {severity}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/80 p-2 text-center">
                    <p className="text-[10px] font-semibold text-slate-500">
                      Stock
                    </p>
                    <p
                      className={cn(
                        "text-[20px] font-black leading-none",
                        severity === "Critical"
                          ? "text-red-600"
                          : "text-amber-500",
                      )}
                    >
                      {product.currentStock}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/80 p-2 text-center">
                    <p className="text-[10px] font-semibold text-slate-500">
                      Reorder
                    </p>
                    <p className="text-[20px] font-black leading-none text-emerald-600">
                      {product.reorderQty}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/80 p-2 text-center">
                    <p className="text-[10px] font-semibold text-slate-500">
                      Unit Cost
                    </p>
                    <p className="text-[12px] font-bold leading-none text-slate-900">
                      {formatCurrency(product.unitCost)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Last sale
                    </p>
                    <p className="text-[12px] font-bold text-slate-800">
                      {product.lastSale}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onReorder(product)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Reorder
                  </button>
                </div>
              </div>
            );
          })}

          {products.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-base font-bold text-slate-900">
                No products match your search
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Try a different product name or SKU to narrow the alert list.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* From md and up we keep the original dense table layout. */}
      <div className="relative hidden h-full md:block">
        <div className="h-full overflow-y-auto overscroll-contain [scrollbar-gutter:stable] pb-14 pt-1">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[6%]" />
                <col className="w-[36%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[16%]" />
              </colgroup>
              <tbody>
                {products.map((product) => {
                  const severity = getStockSeverity(product);
                  const isSelected = selectedIds.includes(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={cn(
                        "border-b border-slate-100 transition hover:bg-slate-50/70",
                        severity === "Critical" && "bg-red-50/65",
                        severity === "Very Low" && "bg-amber-50/75",
                        severity === "Low" && "bg-amber-50/75",
                      )}
                    >
                      <td className="px-6 py-4 align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(event) =>
                            onToggleSelected(product.id, event.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-slate-100 ring-1 ring-slate-200">
                            <ProductGlyph category={product.category} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[14px] font-bold tracking-tight text-slate-900">
                              {product.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[12px] font-semibold tracking-tight text-slate-500">
                                {product.sku}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span
                                className={cn(
                                  "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                                  categoryStyles[product.category] ??
                                    "bg-slate-100 text-slate-700 border-slate-200",
                                )}
                              >
                                {product.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle text-center">
                        <div className="space-y-1">
                          <p
                            className={cn(
                              "text-[38px] font-black leading-none tracking-tight",
                              severity === "Critical"
                                ? "text-red-600"
                                : "text-amber-500",
                            )}
                          >
                            {product.currentStock}
                            <span className="ml-1.5 text-[16px] font-medium text-slate-400">
                              units
                            </span>
                          </p>
                          <div className="flex justify-center">
                            <span
                              className={cn(
                                "rounded-md border px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em]",
                                severityStyles[severity],
                              )}
                            >
                              {severity}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle text-center">
                        <div>
                          <p className="text-[31px] font-black leading-none tracking-tight text-emerald-600">
                            {product.reorderQty}
                          </p>
                          <p className="text-[12px] font-medium text-slate-500">
                            {formatCurrency(product.unitCost)}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle text-center">
                        <div>
                          <p className="text-[14px] font-bold tracking-tight text-slate-900">
                            {product.lastSale}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-500">
                            {product.unitsSold} units sold
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle text-right">
                        <button
                          type="button"
                          onClick={() => onReorder(product)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Reorder
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <p className="text-lg font-bold text-slate-900">
                        No products match your search
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Try a different product name or SKU to narrow the alert
                        list.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 overflow-x-auto border-t border-slate-200 bg-slate-50/95 backdrop-blur-sm">
          <div className="grid min-w-[860px] grid-cols-[6%_36%_14%_14%_14%_16%] items-center text-[11px] font-bold text-slate-600">
            <div className="px-6 py-3">
              <input
                type="checkbox"
                checked={
                  products.length > 0 &&
                  selectedVisibleCount === products.length
                }
                onChange={(event) =>
                  event.target.checked ? onToggleAll(true) : onClearSelection()
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="px-6 py-3">Product</div>
            <div className="px-6 py-3 text-center">Current Stock</div>
            <div className="px-6 py-3 text-center">Reorder Qty</div>
            <div className="px-6 py-3 text-center">Last Sale</div>
            <div className="px-6 py-3 text-right">Actions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
