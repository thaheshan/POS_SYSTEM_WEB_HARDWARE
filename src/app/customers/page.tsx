'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect, useRef } from 'react';
import {
  Users,
  CreditCard,
  AlertCircle,
  PiggyBank,
  Plus,
  Search,
  LayoutGrid,
  List,
  Phone,
  Mail,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Check,
  Trash2,
  TrendingUp,
  ShoppingBag,
  FileDown,
  MoreVertical,
  Edit3,
} from 'lucide-react';
import api from '@/api/axiosInstance';
import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import SalesDatePicker from '@/components/sales/SalesDatePicker';
import AddCustomerModal from '@/components/customers/AddCustomerModal';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  customerType: string;
  totalPurchases: number;
  outstanding: number;
  transactions: number;
  isOverdue: boolean;
  lastActive: string;
  initials: string;
}


// ─── Edit Customer Modal ──────────────────────────────────────────────────────
function EditCustomerModal({ customer, onClose, onSuccess }: { customer: Customer; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email === 'N/A' ? '' : customer.email,
    address: customer.address === 'N/A' ? '' : customer.address,
    customerType: customer.customerType,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { setError('Name and phone are required.'); return; }
    setLoading(true);
    try {
      await api.patch(`/customers/${customer.id}`, { name: form.name, phone: form.phone, email: form.email || undefined, address: form.address || undefined, customerType: form.customerType });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[520px] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-[20px] font-black text-gray-900">Edit Customer</h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">Update customer details below</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[12px] font-bold px-4 py-3 rounded-xl">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Full Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Phone <span className="text-red-500">*</span></label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Address</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[12px] font-black text-gray-700">Customer Type</label>
              <select value={form.customerType} onChange={e => setForm(f => ({ ...f, customerType: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-[12px] text-[13px] font-bold outline-none focus:border-blue-500 transition-colors">
                <option value="Individual">Individual</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 py-3 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white py-3 rounded-[12px] text-[13px] font-black transition-colors shadow-sm disabled:opacity-60">
            {loading ? 'Saving...' : <><Check className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Customer Modal ────────────────────────────────────────────────────
function DeleteCustomerModal({ customer, onClose, onConfirm, loading }: { customer: Customer; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[400px] overflow-hidden">
        <div className="px-6 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-red-600" />
          </div>
          <h3 className="text-[20px] font-black text-gray-900 mb-2">Remove Customer</h3>
          <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
            Are you sure you want to remove <span className="font-black text-gray-900">{customer.name}</span>?<br />
            This will permanently delete their record and cannot be undone.
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-gray-200 py-3 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-[12px] text-[13px] font-black transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? 'Removing...' : <><Trash2 className="w-4 h-4" /> Remove Customer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Customer Modal ──────────────────────────────────────────────────────
function ViewCustomerModal({ customer, onClose, onEdit }: { customer: Customer; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[560px] overflow-hidden">
        <div className="bg-gradient-to-r from-[#1e40af] to-[#2563eb] p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-[22px] font-black border border-white/30">
              {customer.initials}
            </div>
            <div>
              <h2 className="text-[22px] font-black tracking-tight">{customer.name}</h2>
              <p className="text-blue-200 text-[13px] font-bold mt-0.5">{customer.customerType} Customer</p>
              {customer.isOverdue && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase mt-1 inline-block">Overdue</span>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone</p>
                <p className="text-[13px] font-black text-gray-900">{customer.phone}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-[13px] font-black text-gray-900 truncate">{customer.email}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <ShoppingBag className="w-5 h-5 text-blue-500 mx-auto mb-2" />
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-1">Total Purchases</p>
              <p className="text-[16px] font-black text-gray-900">Rs. {customer.totalPurchases.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-wider mb-1">Transactions</p>
              <p className="text-[16px] font-black text-gray-900">{customer.transactions}</p>
            </div>
            <div className={`${customer.outstanding > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'} border rounded-xl p-4 text-center`}>
              <CreditCard className={`w-5 h-5 mx-auto mb-2 ${customer.outstanding > 0 ? 'text-red-500' : 'text-gray-400'}`} />
              <p className={`text-[11px] font-black uppercase tracking-wider mb-1 ${customer.outstanding > 0 ? 'text-red-600' : 'text-gray-500'}`}>Outstanding</p>
              <p className={`text-[16px] font-black ${customer.outstanding > 0 ? 'text-red-600' : 'text-gray-900'}`}>Rs. {customer.outstanding.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-gray-200 py-3 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Close
            </button>
            <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white py-3 rounded-[12px] text-[13px] font-black transition-colors">
              <Edit3 className="w-4 h-4" /> Edit Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dots Menu ────────────────────────────────────────────────────────────────
function CustomerMenu({ cust, onView, onEdit, onDelete }: { cust: Customer; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-gray-300 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl p-1.5 z-20 w-44">
          <button
            onClick={() => { onView(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-gray-400" /> View Details
          </button>
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-gray-400" /> Edit Customer
          </button>
          <div className="h-px bg-gray-100 my-1 mx-2" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Customer
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterType, setFilterType] = useState('All Customers');
  const [sortBy, setSortBy] = useState('Recently Added');
  const [page, setPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()),
    to: new Date()
  });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/customers');
      // Handle deeply nested response shapes (Interceptor wraps Service wraps Prisma)
      let data: any[] = [];
      if (Array.isArray(res.data)) data = res.data;
      else if (Array.isArray(res.data?.data)) data = res.data.data;
      else if (Array.isArray(res.data?.data?.data)) data = res.data.data.data;
      const mapped: Customer[] = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || 'N/A',
        email: c.email || 'N/A',
        address: c.address || 'N/A',
        customerType: c.customerType || 'Individual',
        totalPurchases: Number(c.totalPurchases) || 0,
        outstanding: Number(c.outstandingBalance) || 0,
        transactions: Number(c.transactionsCount) || 0,
        isOverdue: Number(c.outstandingBalance) > 0,
        lastActive: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        initials: (c.name || 'NA').substring(0, 2).toUpperCase(),
      }));
      setCustomers(mapped);
      setPage(1);
    } catch (err) {
      console.error('[Customers] Fetch error:', err);
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      setDeletingId(customerToDelete.id);
      await api.delete(`/customers/${customerToDelete.id}`);
      setCustomerToDelete(null);
      await fetchCustomers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  // KPIs
  const totalCustomers = customers.length;
  const creditCustomers = customers.filter(c => c.outstanding > 0).length;
  const outstandingTotal = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const overdueAccounts = customers.filter(c => c.isOverdue).length;
  const avgLifetimeValue = totalCustomers > 0 ? customers.reduce((sum, c) => sum + c.totalPurchases, 0) / totalCustomers : 0;

  // Filter + sort
  const filtered = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.phone.includes(searchTerm) || c.email.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All Status' || (filterStatus === 'Overdue' && c.isOverdue) || (filterStatus === 'Active' && !c.isOverdue);
    const matchType = filterType === 'All Customers' || c.customerType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Highest Balance') return b.outstanding - a.outstanding;
    if (sortBy === 'Most Purchases') return b.totalPurchases - a.totalPurchases;
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <MainLayout>
      {/* Modals */}
      {showAddModal && <AddCustomerModal onClose={() => setShowAddModal(false)} onSuccess={fetchCustomers} />}
      {viewingCustomer && (
        <ViewCustomerModal
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onEdit={() => { setEditingCustomer(viewingCustomer); setViewingCustomer(null); }}
        />
      )}
      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSuccess={fetchCustomers}
        />
      )}
      {customerToDelete && (
        <DeleteCustomerModal
          customer={customerToDelete}
          onClose={() => setCustomerToDelete(null)}
          onConfirm={handleConfirmDelete}
          loading={deletingId === customerToDelete.id}
        />
      )}

      <div className="max-w-[1600px] mx-auto pb-20">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight">Customer Management</h1>
            <p className="text-[14px] font-medium text-gray-500 tracking-wide mt-1">Manage customer relationships, credit accounts, and purchase history</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-black text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {dateRange?.from ? (
                    dateRange.to ? <>{format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}</> : format(dateRange.from, 'MMM d, yyyy')
                  ) : 'Select Date Range'}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="bg-white p-6 rounded-[24px] shadow-2xl border border-gray-100 z-50 w-[360px]" sideOffset={8} align="end">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-black text-gray-900">Reporting Period</h3>
                    <button onClick={() => setDateRange(undefined)} className="text-[11px] font-bold text-blue-600 hover:underline">Reset</button>
                  </div>
                  <SalesDatePicker dateRange={dateRange} onSelect={setDateRange} />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-[13px] font-black shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all active:scale-95"
            >
              <FileDown className="w-4 h-4" /> Download Report
            </button>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-400">Total Customers</p>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-[32px] font-black tracking-tight text-gray-900 leading-none mb-2">{isLoading ? '...' : totalCustomers.toLocaleString()}</h3>
              <p className="text-[12px] font-bold text-emerald-500">↑ Active accounts</p>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-400">Credit Customers</p>
              <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <div>
              <h3 className="text-[32px] font-black tracking-tight text-gray-900 leading-none mb-2">{isLoading ? '...' : creditCustomers.toLocaleString()}</h3>
              <p className="text-[12px] font-bold text-gray-400">{isLoading ? '...' : Math.round((creditCustomers / totalCustomers) * 100 || 0)}% of total customers</p>
            </div>
          </div>
          <div className="bg-red-50 rounded-[20px] p-6 shadow-sm border border-red-200 flex flex-col justify-between h-[150px]">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-red-600/80">Outstanding Credit</p>
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-[32px] font-black tracking-tight text-red-600 leading-none mb-3">{isLoading ? '...' : `Rs. ${outstandingTotal.toLocaleString()}`}</h3>
              <span className="bg-[#dc2626] text-white px-2.5 py-1 rounded text-[11px] font-bold">{isLoading ? '...' : overdueAccounts} overdue accounts</span>
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
            <div className="flex justify-between items-start">
              <p className="text-[13px] font-bold text-gray-400">Avg Lifetime Value</p>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-[#059669]" />
              </div>
            </div>
            <div>
              <h3 className="text-[32px] font-black tracking-tight text-gray-900 leading-none mb-2">{isLoading ? '...' : `Rs. ${Math.round(avgLifetimeValue).toLocaleString()}`}</h3>
              <p className="text-[12px] font-bold text-gray-400">Based on total purchases</p>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-3 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full md:w-[320px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-medium outline-none focus:border-[#1e40af] transition-colors"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
              />
            </div>
            <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
              className="w-full md:w-[150px] px-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors bg-white">
              <option>All Customers</option>
              <option value="Individual">Individual</option>
              <option value="Business">Business</option>
            </select>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="w-full md:w-[140px] px-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors bg-white">
              <option>All Status</option>
              <option>Active</option>
              <option>Overdue</option>
            </select>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="border border-gray-200 px-4 py-2.5 rounded-[10px] text-[13px] font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors bg-white">
              <option>Recently Added</option>
              <option>Highest Balance</option>
              <option>Most Purchases</option>
            </select>
            <div className="flex items-center border border-gray-200 rounded-[10px] p-1 bg-gray-50">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
            <span className="text-[12px] font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 whitespace-nowrap">{sorted.length} Results</span>
          </div>
        </div>

        {/* ── ADD BUTTON ── */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white px-6 py-2.5 rounded-[12px] text-[13px] font-black transition-colors shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>

        {/* ── GRID VIEW ── */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              <div className="col-span-full py-16 text-center">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[13px] font-bold text-gray-400">Loading customers...</p>
              </div>
            ) : paginated.length === 0 ? (
              <div className="col-span-full py-16 text-center">
                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-[14px] font-black text-gray-400">No customers found</p>
                <p className="text-[12px] font-bold text-gray-300 mt-1">Try adjusting your filters or add a new customer</p>
              </div>
            ) : paginated.map(cust => (
              <div key={cust.id} className={`bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md ${cust.isOverdue ? 'border-2 border-red-200 bg-red-50/10' : 'border border-gray-200'}`}>
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[15px] font-black text-white shrink-0">
                        {cust.initials}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-black text-gray-900 tracking-tight leading-tight">{cust.name}</h4>
                        <p className="text-[11px] font-bold text-gray-400 font-mono mt-0.5">{cust.id.substring(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    <CustomerMenu
                      cust={cust}
                      onView={() => setViewingCustomer(cust)}
                      onEdit={() => setEditingCustomer(cust)}
                      onDelete={() => setCustomerToDelete(cust)}
                    />
                  </div>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {cust.phone}
                    </div>
                    <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-500 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {cust.email}
                    </div>
                  </div>

                  <div className={`rounded-xl p-4 space-y-2.5 ${cust.isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="font-bold text-gray-500">Total Purchases:</span>
                      <span className="font-black text-gray-900">Rs. {cust.totalPurchases.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="font-bold text-gray-500">Transactions:</span>
                      <span className="font-black text-gray-900">{cust.transactions}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px]">
                      <span className={`font-black ${cust.isOverdue ? 'text-red-500' : 'text-gray-500'}`}>Outstanding:</span>
                      <span className={`font-black ${cust.outstanding > 0 ? 'text-red-500' : 'text-[#059669]'}`}>
                        Rs. {cust.outstanding.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 p-4 mt-auto flex items-center justify-between bg-gray-50/50">
                  <span className="text-[11px] font-bold text-gray-400">Added: {cust.lastActive}</span>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wide ${cust.isOverdue ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {cust.isOverdue ? 'Overdue' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="py-3.5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="py-3.5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="py-3.5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider">Purchases</th>
                  <th className="py-3.5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider">Outstanding</th>
                  <th className="py-3.5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400 font-bold">Loading...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-gray-400 font-bold">No customers found</td></tr>
                ) : paginated.map(cust => (
                  <tr key={cust.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[12px] font-black text-white shrink-0">
                          {cust.initials}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-gray-900">{cust.name}</p>
                          <p className="text-[11px] font-bold text-gray-400 font-mono">{cust.id.substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-[12px] font-bold text-gray-700">{cust.phone}</p>
                      <p className="text-[11px] font-medium text-gray-400">{cust.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-[13px] font-black text-gray-900">Rs. {cust.totalPurchases.toLocaleString()}</p>
                      <p className="text-[11px] font-bold text-gray-400">{cust.transactions} transactions</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[13px] font-black ${cust.outstanding > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        Rs. {cust.outstanding.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {cust.isOverdue
                        ? <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Overdue</span>
                        : <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Active</span>
                      }
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end">
                        <CustomerMenu
                          cust={cust}
                          onView={() => setViewingCustomer(cust)}
                          onEdit={() => setEditingCustomer(cust)}
                          onDelete={() => setCustomerToDelete(cust)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-1 border border-gray-200 rounded-[12px] p-1.5 bg-white shadow-sm">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 flex items-center justify-center font-bold rounded-lg text-[13px] transition-colors ${page === p ? 'bg-[#1e40af] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
