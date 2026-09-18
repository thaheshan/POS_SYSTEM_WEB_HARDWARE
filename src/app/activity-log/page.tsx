'use client';

import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/api/axiosInstance';
import {
  ClipboardList, Search, RefreshCw, Calendar,
  ShoppingCart, RotateCcw, ArrowLeftRight, Package,
  Wrench, User, Filter, ChevronDown, Edit2, Trash2,
  ShieldCheck, Boxes, Tag, CreditCard, Coins, UserCheck,
  UserPlus, UserMinus, Truck, FileText, CheckCircle, Key, Users
} from 'lucide-react';

// ── Action badge metadata mapping for ALL system workflows ─────────────────────
const ACTION_META: Record<string, { label: string; color: string; Icon: any }> = {
  // Sales & Orders
  CREATE_SALE:            { label: 'Sale',              color: 'bg-emerald-100 text-emerald-800 border-emerald-200',  Icon: ShoppingCart },
  UPDATE_SALE:            { label: 'Sale Updated',      color: 'bg-teal-100 text-teal-800 border-teal-200',            Icon: Edit2 },
  DELETE_SALE:            { label: 'Invoice Deleted',   color: 'bg-red-100 text-red-800 border-red-200',               Icon: Trash2 },
  RETURN_SALE:            { label: 'Return',            color: 'bg-rose-100 text-rose-800 border-rose-200',            Icon: RotateCcw },
  EXCHANGE_SALE:          { label: 'Exchange',          color: 'bg-blue-100 text-blue-800 border-blue-200',            Icon: ArrowLeftRight },
  DISCOUNT_APPROVE:       { label: 'Discount Approved', color: 'bg-indigo-100 text-indigo-800 border-indigo-200',    Icon: ShieldCheck },

  // Inventory & Stock
  CREATE_PRODUCT:         { label: 'Product Created',   color: 'bg-emerald-100 text-emerald-800 border-emerald-200',  Icon: Package },
  UPDATE_PRODUCT:         { label: 'Product Updated',   color: 'bg-sky-100 text-sky-800 border-sky-200',               Icon: Edit2 },
  DELETE_PRODUCT:         { label: 'Product Deleted',   color: 'bg-red-100 text-red-800 border-red-200',               Icon: Trash2 },
  ADD_STOCK:              { label: 'Stock Adjust',      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',       Icon: Boxes },
  TRANSFER_STOCK:         { label: 'Stock Transfer',    color: 'bg-violet-100 text-violet-800 border-violet-200',    Icon: ArrowLeftRight },
  CREATE_CATEGORY:        { label: 'Category Added',    color: 'bg-purple-100 text-purple-800 border-purple-200',    Icon: Tag },
  CREATE_SUBCATEGORY:     { label: 'Subcat Added',      color: 'bg-purple-100 text-purple-800 border-purple-200',    Icon: Tag },
  CREATE_BRAND:           { label: 'Brand Added',       color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200', Icon: Tag },

  // Credit & Customers
  CREDIT_SALE:            { label: 'Credit Sale',       color: 'bg-amber-100 text-amber-800 border-amber-200',         Icon: CreditCard },
  CREDIT_SETTLEMENT:      { label: 'Credit Payment',    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',  Icon: Coins },
  CUSTOMER_CREDIT_UPDATE: { label: 'Credit Updated',    color: 'bg-amber-100 text-amber-800 border-amber-200',         Icon: UserCheck },
  CREATE_CUSTOMER:        { label: 'Customer Added',    color: 'bg-blue-100 text-blue-800 border-blue-200',            Icon: UserPlus },
  UPDATE_CUSTOMER:        { label: 'Customer Updated',  color: 'bg-sky-100 text-sky-800 border-sky-200',               Icon: User },
  DELETE_CUSTOMER:        { label: 'Customer Deleted',  color: 'bg-red-100 text-red-800 border-red-200',               Icon: UserMinus },

  // Suppliers & Purchasing
  CREATE_SUPPLIER:        { label: 'Supplier Added',    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',            Icon: Truck },
  UPDATE_SUPPLIER:        { label: 'Supplier Updated',  color: 'bg-cyan-100 text-cyan-800 border-cyan-200',            Icon: Truck },
  DELETE_SUPPLIER:        { label: 'Supplier Deleted',  color: 'bg-red-100 text-red-800 border-red-200',               Icon: Trash2 },
  CREATE_PURCHASE_ORDER:  { label: 'PO Created',        color: 'bg-orange-100 text-orange-800 border-orange-200',    Icon: FileText },
  RECEIVE_PURCHASE_ORDER: { label: 'PO Restocked',      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',  Icon: CheckCircle },

  // Expenses & Labour
  ADD_EXPENSE:            { label: 'Expense / Labour',  color: 'bg-amber-100 text-amber-800 border-amber-200',         Icon: Wrench },
  DELETE_EXPENSE:         { label: 'Expense Deleted',   color: 'bg-rose-100 text-rose-800 border-rose-200',            Icon: Trash2 },

  // System & Staff Audit
  USER_LOGIN:             { label: 'Staff Login',       color: 'bg-slate-100 text-slate-800 border-slate-200',         Icon: Key },
  USER_LOGOUT:            { label: 'Staff Logout',      color: 'bg-slate-100 text-slate-600 border-slate-200',         Icon: Key },
  UPDATE_STAFF:           { label: 'Staff Updated',     color: 'bg-indigo-100 text-indigo-800 border-indigo-200',       Icon: Users },
};

function ActionBadge({ action }: { action: string }) {
  const normalizedAction = (action || '').toUpperCase();
  const meta = ACTION_META[normalizedAction] ?? {
    label: action ? action.replace(/_/g, ' ') : 'Action',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    Icon: ClipboardList
  };
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

  // Auto-refresh every 2 minutes (120s) with tab visibility check
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchLogs(true);
    }, 120_000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const filteredLogs = actionFilter
    ? logs.filter(l => (l.action || '').toUpperCase() === actionFilter.toUpperCase())
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
                Real-time audit trail of all system actions — sales, returns, exchanges, inventory, credit, suppliers, customers, and HTTP API methods.
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

              {/* Action filter with optgroups */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={actionFilter}
                  onChange={e => setActionFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all appearance-none bg-white"
                >
                  <option value="">All Actions & Workflow Logs</option>
                  <optgroup label="🛒 Sales & Orders">
                    <option value="CREATE_SALE">Sales (New Checkout)</option>
                    <option value="UPDATE_SALE">Invoice Edits</option>
                    <option value="DELETE_SALE">Invoice Deletions</option>
                    <option value="RETURN_SALE">Returns / Refunds</option>
                    <option value="EXCHANGE_SALE">Product Exchanges</option>
                    <option value="DISCOUNT_APPROVE">Discount Approvals</option>
                  </optgroup>
                  <optgroup label="📦 Inventory & Stock">
                    <option value="CREATE_PRODUCT">Product Creation</option>
                    <option value="UPDATE_PRODUCT">Product Specifications</option>
                    <option value="DELETE_PRODUCT">Product Deletions</option>
                    <option value="ADD_STOCK">Stock Quantity Adjustments</option>
                    <option value="TRANSFER_STOCK">Stock Transfers</option>
                    <option value="CREATE_CATEGORY">Categories & Subcategories</option>
                    <option value="CREATE_BRAND">Brands</option>
                  </optgroup>
                  <optgroup label="💳 Credit & Customers">
                    <option value="CREDIT_SALE">Credit Sales</option>
                    <option value="CREDIT_SETTLEMENT">Credit Payments & Settlements</option>
                    <option value="CUSTOMER_CREDIT_UPDATE">Customer Credit Limit Updates</option>
                    <option value="CREATE_CUSTOMER">Customer Management</option>
                  </optgroup>
                  <optgroup label="🚚 Suppliers & Purchasing">
                    <option value="CREATE_SUPPLIER">Supplier Management</option>
                    <option value="CREATE_PURCHASE_ORDER">Purchase Orders</option>
                    <option value="RECEIVE_PURCHASE_ORDER">PO Stock Restocks</option>
                  </optgroup>
                  <optgroup label="🔧 Expenses & Labour">
                    <option value="ADD_EXPENSE">Expenses & Labour Jobs</option>
                  </optgroup>
                  <optgroup label="🔒 System & Staff Audit">
                    <option value="USER_LOGIN">Staff Logins</option>
                    <option value="UPDATE_STAFF">Staff Management & Permissions</option>
                  </optgroup>
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
                        <td className="px-5 py-4 max-w-sm">
                          <div className="flex flex-col gap-1">
                            {log.httpMethod && (
                              <span className={`inline-self-start px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider w-fit ${
                                log.httpMethod === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                                log.httpMethod === 'PATCH' || log.httpMethod === 'PUT' ? 'bg-sky-100 text-sky-800' :
                                log.httpMethod === 'DELETE' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-700'
                              }`}>
                                HTTP {log.httpMethod} {log.endpoint ? `• ${log.endpoint}` : ''}
                              </span>
                            )}
                            <p className="text-gray-600 text-[13px] leading-relaxed">{log.details}</p>
                          </div>
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
