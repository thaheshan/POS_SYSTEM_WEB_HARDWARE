import { useState } from 'react';
import { ArrowUpDown, Edit, Trash2, CheckCircle2, AlertCircle, AlertTriangle, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
import Image from 'next/image';

interface InventoryTableProps {
  data: any[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterToggle: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export default function InventoryTable({
  data,
  onEdit,
  onDelete,
  searchTerm,
  onSearchChange,
  onFilterToggle,
  hasActiveFilters,
  onClearFilters,
  activeFilterCount
}: InventoryTableProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map(item => item.id));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]); // Clear selection on page change
  };

  // ... (getStatusBadge, getReorderIcon, getQtyBarColor remain same)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <span className="px-2 py-1 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-700">In Stock</span>;
      case 'Out of Stock':
        return <span className="px-2 py-1 rounded-lg text-[11px] font-black bg-blue-100 text-blue-700">Out of Stock</span>;
      case 'Low Stock':
        return <span className="px-2 py-1 rounded-lg text-[11px] font-black bg-amber-100 text-amber-700">Low Stock</span>;
      default:
        return <span className="text-gray-900 font-bold">{status}</span>;
    }
  };

  const getReorderIcon = (reorder: string) => {
    switch (reorder) {
      case 'good':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />;
      default:
        return null;
    }
  };

  const getQtyBarColor = (qty: number, max: number, status: string) => {
    if (status === 'Out of Stock') return 'bg-red-500';
    if (status === 'Low Stock') return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-4">
      
      {/* TABLE HEADER WITH SEARCH + FILTER - SALES STYLE */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-black text-gray-900">Inventory Products</h3>
          <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{data.length} items total</span>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                {activeFilterCount} Active Filters 
                <button onClick={onClearFilters}><X className="w-2.5 h-2.5" /></button>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-emerald-400 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { onSearchChange(e.target.value); setCurrentPage(1); }}
              placeholder="Search product, SKU..."
              className="text-[12.5px] font-medium outline-none border-none bg-transparent w-[190px] placeholder:text-gray-400"
            />
            {searchTerm && (
              <button onClick={() => { onSearchChange(''); setCurrentPage(1); }} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Filter Button */}
          {hasActiveFilters ? (
            <button onClick={onClearFilters} className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[12.5px] font-black hover:bg-red-100 transition-all">
              <X className="w-3.5 h-3.5" /> Clear Filter
            </button>
          ) : (
            <button onClick={onFilterToggle} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-[12.5px] font-black hover:bg-gray-50 transition-all">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 w-10">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                  Product <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">SKU</th>
              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Category</th>
              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Warehouse</th>
              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Qty</th>
              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Unit Cost</th>
              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Total Value</th>
              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">Status</th>
              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">Movement</th>
              <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap text-center">Reorder</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[13px]">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-emerald-50/30 transition-all cursor-pointer">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-[11px] font-bold text-gray-400">{item.skuInfo}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-emerald-600 font-bold whitespace-nowrap">{item.sku}</td>
                  <td className="px-4 py-4 text-gray-600 font-medium whitespace-nowrap">{item.category}</td>
                  <td className="px-4 py-4 text-gray-600 font-medium whitespace-nowrap">{item.warehouse}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-gray-900">{item.qty}</span>
                      <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getQtyBarColor(item.qty, item.maxLevel, item.status)}`}
                          style={{ width: `${Math.min(100, Math.max(5, (item.qty / item.maxLevel) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-gray-900 whitespace-nowrap">{item.unitCost}</td>
                  <td className="px-4 py-4 text-right font-black text-emerald-600 whitespace-nowrap">{item.totalValue}</td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-gray-400 whitespace-nowrap">{item.lastMovement}</td>
                  <td className="px-4 py-4 text-center">
                    {getReorderIcon(item.reorder)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onEdit?.(item); }} className="w-7 h-7 rounded bg-gray-50 flex items-center justify-center hover:bg-emerald-100 transition-all">
                        <Edit className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete?.(item); }} className="w-7 h-7 rounded bg-gray-50 flex items-center justify-center hover:bg-red-100 transition-all">
                        <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Search className="w-8 h-8 opacity-20" />
                    <p className="text-[13px] font-bold">No products found matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Functional */}
      <div className="p-4 px-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30 text-sm">
        <span className="text-[12px] font-bold text-gray-400">
          Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, data.length)} of {data.length} products
        </span>
        <div className="flex gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className={`px-3 py-1.5 border border-gray-200 rounded text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1.5 rounded text-[12px] font-bold transition ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
            className={`px-3 py-1.5 border border-gray-200 rounded text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition ${currentPage === totalPages || totalPages === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
