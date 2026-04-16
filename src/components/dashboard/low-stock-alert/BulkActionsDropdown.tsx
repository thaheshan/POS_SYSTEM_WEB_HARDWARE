"use client";

interface BulkActionsDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BulkActionsDropdown({
  value,
  onChange,
}: BulkActionsDropdownProps) {
  return (
    <label className="relative inline-flex w-full items-center sm:w-auto">
      <span className="sr-only">Bulk actions</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 pr-10 text-[13px] font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 sm:min-w-[170px]"
      >
        <option value="">Bulk Actions</option>
        <option value="select-all">Select all visible</option>
        <option value="clear-selection">Clear selection</option>
        <option value="create-po">Create purchase order</option>
      </select>
    </label>
  );
}
