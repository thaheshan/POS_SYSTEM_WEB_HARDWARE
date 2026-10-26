'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  PauseCircle,
  Play,
  Trash2,
  Clock,
  User,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Search,
  PackageOpen,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { CustomerMin } from '@/components/pos/CustomerSearch';

export interface HeldSaleItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  img?: string;
  measurementUnit?: string;
  sellType?: 'fixed' | 'loose';
  discountAmount?: number;
  [key: string]: any;
}

export interface HeldSale {
  id: string;
  backendId?: string;
  reference: string;
  createdAt: string;
  timeFormatted: string;
  dateFormatted: string;
  customer?: CustomerMin | null;
  items: HeldSaleItem[];
  itemCount: number;
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  total: number;
  notes?: string;
}

interface HeldSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldSales: HeldSale[];
  onLoadSale: (sale: HeldSale) => void;
  onDeleteSale: (sale: HeldSale) => void;
}

export default function HeldSalesModal({
  isOpen,
  onClose,
  heldSales,
  onLoadSale,
  onDeleteSale,
}: HeldSalesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const filteredSales = useMemo(() => {
    if (!searchQuery.trim()) return heldSales;
    const q = searchQuery.toLowerCase().trim();
    return heldSales.filter((sale) => {
      const matchRef = sale.reference.toLowerCase().includes(q);
      const matchCustomer =
        sale.customer?.name?.toLowerCase().includes(q) ||
        sale.customer?.phone?.includes(q);
      const matchItem = sale.items.some((it) =>
        it.name.toLowerCase().includes(q)
      );
      return matchRef || matchCustomer || matchItem;
    });
  }, [heldSales, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <PauseCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  Held Sales Queue
                </h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-200">
                  {heldSales.length} {heldSales.length === 1 ? 'sale' : 'sales'}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Select a held cart to resume checkout or manage pending sales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar (if more than 1 held sale) */}
        {heldSales.length > 0 && (
          <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by reference, customer name, phone, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body: List of Held Sales */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y-0">
          {filteredSales.length === 0 ? (
            <div className="py-12 sm:py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-3 text-amber-500 shadow-sm">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-1">
                {searchQuery ? 'No matching held sales' : 'No Sales on Hold'}
              </h4>
              <p className="text-xs text-gray-400 max-w-sm px-4">
                {searchQuery
                  ? `No held cart matches "${searchQuery}". Try a different keyword.`
                  : 'Click the "Hold" button in the right cart sidebar during checkout to suspend a sale here.'}
              </p>
            </div>
          ) : (
            filteredSales.map((sale) => {
              const isExpanded = expandedSaleId === sale.id;
              return (
                <div
                  key={sale.id}
                  className="bg-white border border-gray-200 hover:border-amber-400/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-3 group"
                >
                  {/* Top Bar: Reference + Time + Total */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm sm:text-base text-gray-900 line-clamp-1">
                          {sale.reference}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {sale.timeFormatted}
                        </span>
                        {sale.dateFormatted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {sale.dateFormatted}
                          </span>
                        )}
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-2 mt-1">
                        {sale.customer ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                            <User className="w-3 h-3 text-[#059669]" />
                            {sale.customer.name}
                            {sale.customer.phone && (
                              <span className="text-gray-400 font-normal">
                                ({sale.customer.phone})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-400">
                            Walk-In Customer
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-gray-500">
                          • {sale.items.length}{' '}
                          {sale.items.length === 1 ? 'item' : 'items'} (
                          {sale.itemCount ||
                            sale.items.reduce(
                              (sum, it) => sum + (it.qty || 1),
                              0
                            )}{' '}
                          units)
                        </span>
                      </div>
                    </div>

                    {/* Total Amount Badge */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Amount
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#059669] tracking-tight">
                        Rs. {Number(sale.total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Notes Preview if available */}
                  {sale.notes && (
                    <div className="text-xs text-amber-800 bg-amber-50/60 border border-amber-200/50 rounded-xl px-3 py-1.5 font-medium italic">
                      Note: {sale.notes}
                    </div>
                  )}

                  {/* Expand / Collapse Items Preview */}
                  {sale.items && sale.items.length > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSaleId(isExpanded ? null : sale.id)
                        }
                        className="text-[11px] font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide items preview
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            View {sale.items.length}{' '}
                            {sale.items.length === 1 ? 'item' : 'items'} in cart
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 bg-gray-50/80 rounded-xl p-2.5 space-y-1.5 border border-gray-100 text-xs animate-in fade-in duration-150">
                          {sale.items.map((item, idx) => (
                            <div
                              key={`${item.id}-${idx}`}
                              className="flex items-center justify-between text-gray-700 py-1 px-1.5 hover:bg-white rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                                  {item.qty}x
                                </span>
                                <span className="font-semibold text-gray-900 truncate">
                                  {item.name}
                                </span>
                                {item.measurementUnit && (
                                  <span className="text-[10px] text-gray-400">
                                    ({item.measurementUnit})
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-bold text-gray-800 shrink-0 ml-2">
                                Rs.{' '}
                                {(
                                  Number(item.price || 0) *
                                  Number(item.qty || 1)
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions: Load to Cart + Delete */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => onDeleteSale(sale)}
                      className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-colors flex items-center gap-1.5"
                      title="Discard this held sale"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={() => onLoadSale(sale)}
                      className="px-4 py-2 bg-[#059669] hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Load to Cart
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500 font-semibold">
            {heldSales.length} {heldSales.length === 1 ? 'sale' : 'sales'} stored
            locally
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
