'use client';

import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/api/axiosInstance';
import {
  ClipboardList, Search, RefreshCw, Calendar,
  ShoppingCart, RotateCcw, ArrowLeftRight, Package,
  Wrench, User, Filter, ChevronDown,
} from 'lucide-react';

// ── Action badge helpers ─────────────────────────────────────────────────────
const ACTION_META: Record<string, { label: string; color: string; Icon: any }> = {
  CREATE_SALE:    { label: 'Sale',      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',  Icon: ShoppingCart },
  RETURN_SALE:    { label: 'Return',    color: 'bg-rose-100 text-rose-800 border-rose-200',            Icon: RotateCcw },
  EXCHANGE_SALE:  { label: 'Exchange',  color: 'bg-blue-100 text-blue-800 border-blue-200',            Icon: ArrowLeftRight },
  ADD_EXPENSE:    { label: 'Expense',   color: 'bg-amber-100 text-amber-800 border-amber-200',         Icon: Wrench },
  ADD_STOCK:      { label: 'Stock',     color: 'bg-indigo-100 text-indigo-800 border-indigo-200',       Icon: Package },
};

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_META[action] ?? { label: action, color: 'bg-gray-100 text-gray-700 border-gray-200', Icon: ClipboardList };
  const { label, color, Icon } = meta;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin:   'bg-purple-100 text-purple-700',
    owner:   'bg-indigo-100 text-indigo-700',
    manager: 'bg-blue-100 text-blue-700',
    cashier: 'bg-teal-100 text-teal-700',
    staff:   'bg-orange-100 text-orange-700',
  };
  const c = colors[role?.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${c}`}>
      {role || 'Member'}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.searchUser = search;
      const res = await api.get('/activity-logs', { params });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, search]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => fetchLogs(true), 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filteredLogs = actionFilter
    ? logs.filter(l => l.action === actionFilter)
    : logs;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'owner']}>
      <MainLayout>
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                Activity Log
              </h1>
              <p className="text-gray-500 mt-1 text-sm font-medium">
                Real-time audit trail of all system actions — sales, returns, exchanges, expenses and stock updates.
              </p>
            </div>
            <button
              onClick={() => fetchLogs(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Search by user */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by staff name…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchLogs()}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {/* Start Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  max={today}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {/* End Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  max={today}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {/* Action filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={actionFilter}
                  onChange={e => setActionFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none bg-white"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE_SALE">Sales</option>
                  <option value="RETURN_SALE">Returns</option>
                  <option value="EXCHANGE_SALE">Exchanges</option>
                  <option value="ADD_EXPENSE">Expenses / Labour</option>
                  <option value="ADD_STOCK">Stock Updates</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => fetchLogs()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setSearch(''); setActionFilter(''); }}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Clear
              </button>
              <span className="ml-auto text-sm text-gray-400 font-medium">
                {filteredLogs.length} record{filteredLogs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="font-medium text-sm">Loading activity logs…</span>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                <ClipboardList className="w-14 h-14 opacity-30" />
                <p className="font-semibold text-lg">No activity found</p>
                <p className="text-sm">Actions like sales, returns, expenses will appear here in real-time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Staff Member</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-black text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-black text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredLogs.map((log, idx) => (
                      <tr
                        key={log.id ?? idx}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        {/* Date & Time */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-bold text-gray-900 text-[13px]">{formatDate(log.createdAt)}</p>
                          <p className="text-gray-400 text-[11px] font-medium mt-0.5">{formatTime(log.createdAt)}</p>
                        </td>

                        {/* Staff */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-black shrink-0">
                              {(log.userName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-[13px] leading-tight">{log.userName || '—'}</p>
                              <RoleBadge role={log.userRole} />
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4">
                          <ActionBadge action={log.action} />
                        </td>

                        {/* Details */}
                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-gray-600 text-[13px] leading-relaxed">{log.details}</p>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {log.amount != null ? (
                            <span className={`font-black text-[14px] ${log.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              Rs. {Math.abs(Number(log.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live — auto-refreshes every 30 seconds
          </div>

        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
