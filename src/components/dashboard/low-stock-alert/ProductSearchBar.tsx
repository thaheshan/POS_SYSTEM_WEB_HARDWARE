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
    <div className="border-b border-slate-200 bg-[#f8fafc] px-4 py-2.5 sm:px-6">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-xs transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 sm:max-w-md sm:flex-1">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Search products, SKU, category..."
            className="w-full bg-transparent text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <BulkActionsDropdown
            value={bulkAction}
            onChange={onBulkActionChange}
          />

          <div className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-100 px-3 text-xs font-bold text-blue-800 shrink-0">
            {itemsCount} Items
          </div>
        </div>
      </div>
    </div>
  );
}