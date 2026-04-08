"use client";

import { Search } from "lucide-react";
import BulkActionsDropdown from "./BulkActionsDropdown";

interface ProductSearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  bulkAction: string;
  onBulkActionChange: (value: string) => void;
  itemsCount: number;
}

export default function ProductSearchBar({
  searchTerm,
  onSearchTermChange,
  bulkAction,
  onBulkActionChange,
  itemsCount,
}: ProductSearchBarProps) {
  return (
    <div className="stock-fade-up stock-delay-2 border-b border-slate-200 bg-[#f3f4f6] px-4 py-3 sm:px-8 sm:py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100 lg:max-w-xl lg:flex-1">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search products by name or SKU"
            className="w-full bg-transparent text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
          <BulkActionsDropdown
            value={bulkAction}
            onChange={onBulkActionChange}
          />

          <div className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-blue-100 px-4 text-[13px] font-bold text-blue-700 shadow-sm sm:w-auto">
            {itemsCount} items
          </div>
        </div>
      </div>
    </div>
  );
}
