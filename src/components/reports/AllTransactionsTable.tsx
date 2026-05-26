'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useSalesData } from '@/hooks/useSales';
import { DateRange } from 'react-day-picker';
import TransactionDetailsModal from '@/components/sales/TransactionDetailsModal';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  MoreVertical,
  Trash2,
  RefreshCw,
  Receipt,
  Edit2,
  AlertCircle
} from 'lucide-react';
import api from '@/api/axiosInstance';

interface SaleRow {
  id: string;
  rawId: string;
  time: string;
  amount: string;
  rawAmount: number;
  mode: string;
  type: 'Taxable' | 'Overflow' | 'Labour';
}

function buildRows(data: any): SaleRow[] {
  const catA: SaleRow[] = (data?.catA?.allTxns ?? []).map((t: any) => ({ ...t, type: 'Taxable' as const }));
  const catB: SaleRow[] = (data?.catB?.allTxns ?? []).map((t: any) => ({ ...t, type: 'Overflow' as const }));
  const seen = new Set<string>();
  const merged: SaleRow[] = [];
  for (const r of [...catA, ...catB]) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      merged.push(r);
    }
  }
  return merged;
}

const TYPE_STYLE: Record<string, string> = {
  Taxable:  'bg-blue-50  text-blue-700  border-blue-200',
  Overflow: 'bg-green-50 text-green-700 border-green-200',
  Labour:   'bg-amber-50 text-amber-700 border-amber-200',
};

const MODE_COLOR: Record<string, string> = {
  Cash:   'text-emerald-600',
  Card:   'text-blue-600',
  Credit: 'text-amber-600',
};

interface Props {
  dateRange: DateRange | undefined;
}

export default function AllTransactionsTable({ dateRange }: Props) {
  const { data, loading, refresh } = useSalesData(dateRange);

  const [searchTerm, setSearchTerm]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInvoiceId, setModalInvoiceId] = useState('');
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const [txnToDelete, setTxnToDelete] = useState<SaleRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const rows = useMemo(() => buildRows(data).filter(r => !removed.has(r.id)), [data, removed]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const q = searchTerm.toLowerCase();
    return rows.filter(r =>
      r.id.toLowerCase().includes(q) ||
      (r.mode ?? '').toLowerCase().includes(q) ||
      (r.type ?? '').toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const confirmDelete = async () => {
    if (!txnToDelete) return;
    setIsDeleting(true);
    try {
      const id = txnToDelete.rawId || txnToDelete.id;
      await api.delete(`/sales/${id}`);
      setRemoved(prev => new Set([...prev, txnToDelete.id]));
      setTxnToDelete(null);
      refresh();
    } catch (err: any) {
      console.error('[Transactions] Delete failed:', err);
      alert(err?.response?.data?.message || 'Failed to delete invoice. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="bg-white rounded-[24px] border border-gray-100 shadow-sm flex flex-col overflow-hidden"
      onClick={() => setActiveDropdownId(null)}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Receipt className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black text-gray-900 tracking-tight">All Transactions Ledger</h2>
            <p className="text-[13px] text-gray-500 font-medium">
              {loading ? 'Loading…' : `${filtered.length} transaction${filtered.length !== 1 ? 's' : ''} in selected period`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoice, type, mode…"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-[13px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button
            onClick={refresh}
            className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 hover:text-blue-600"
            title="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Invoice #', 'Time', 'Mode', 'Category', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] font-black text-gray-400 tracking-widest uppercase last:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt className="h-10 w-10 text-gray-200" />
                      <p className="text-[14px] font-semibold text-gray-400">No transactions for this period.</p>
                      <p className="text-[12px] text-gray-400">Try adjusting the date range above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Invoice # */}
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-black text-blue-600 font-mono">{inv.id}</span>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-bold text-gray-500">{inv.time}</span>
                    </td>

                    {/* Mode */}
                    <td className="px-6 py-4">
                      <span className={cn('text-[13px] font-black', MODE_COLOR[inv.mode] ?? 'text-gray-600')}>
                        {inv.mode}
                      </span>
                    </td>

                    {/* Category / Type */}
                    <td className="px-6 py-4">
                      <span className={cn(
                        'text-[11px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider',
                        TYPE_STYLE[inv.type] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                      )}>
                        {inv.type === 'Taxable' ? 'Cat A' : inv.type === 'Overflow' ? 'Cat B' : 'Cat C'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-black text-gray-900">
                        Rs. {inv.amount}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setModalInvoiceId(inv.id); setModalMode('view'); setModalOpen(true); }}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === inv.id ? null : inv.id);
                            }}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {activeDropdownId === inv.id && (
                            <div className="absolute top-10 right-0 w-44 bg-white rounded-xl border border-gray-100 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
                              <button
                                onClick={() => { setActiveDropdownId(null); setModalInvoiceId(inv.id); setModalMode('edit'); setModalOpen(true); }}
                                className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-gray-400" /> Edit Invoice
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              <button
                                onClick={() => { setActiveDropdownId(null); setModalInvoiceId(inv.id); setModalMode('receipt' as any); setModalOpen(true); }}
                                className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold text-gray-700 hover:bg-gray-50"
                              >
                                <Download className="h-3.5 w-3.5 text-gray-400" /> Download PDF
                              </button>
                              <div className="h-px bg-gray-100 my-1" />
                              <button
                                onClick={() => { setActiveDropdownId(null); setTxnToDelete(inv); }}
                                className="w-full text-left flex items-center justify-between gap-2 px-4 py-2.5 text-[12px] font-bold text-red-500 hover:bg-red-50"
                              >
                                Void Record <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-[12px] font-bold text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                p = currentPage - 2 + i;
                if (p > totalPages) p = totalPages - (4 - i);
              }
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={cn(
                    'h-8 w-8 flex items-center justify-center rounded-lg text-[13px] font-bold transition-colors',
                    currentPage === p ? 'bg-[#2563eb] text-white' : 'hover:bg-gray-200 text-gray-500'
                  )}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────────────── */}
      {txnToDelete && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); if (!isDeleting) setTxnToDelete(null); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: 'fadeInScale 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-[16px]">Delete Invoice</h3>
                <p className="text-red-100 text-[11px] font-medium mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-gray-700 text-[14px] leading-relaxed">
                You are about to permanently delete invoice{' '}
                <span className="font-black text-gray-900">{txnToDelete.id}</span>.
              </p>
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-[12px] leading-relaxed">
                  All invoice items, payment records, and associated data will be{' '}
                  <strong>permanently removed</strong> from the database. This cannot be recovered.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setTxnToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[13px] font-black transition shadow-sm disabled:opacity-70 disabled:cursor-wait"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.92); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────── */}
      <TransactionDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        invoiceId={modalInvoiceId}
        initialMode={modalMode}
      />
    </div>
  );
}
