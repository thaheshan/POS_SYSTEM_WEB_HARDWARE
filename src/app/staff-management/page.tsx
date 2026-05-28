'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  Calculator,
  Package,
  Clock,
  Shield,
  Mail,
  Plus,
  Search,
  LayoutGrid,
  List,
  Phone,
  Settings,
  MoreVertical,
  IdCard,
  Check,
  X,
  RefreshCcw,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/api/axiosInstance';

// ─── helpers ────────────────────────────────────────────────────────────────
const roleLabel: Record<string, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  CASHIER: 'Cashier',
  STORE_KEEPER: 'Store Keeper',
  ACCOUNTANT: 'Accountant',
  TECHNICIAN: 'Technician',
  SUPER_ADMIN: 'Super Admin',
};

const roleColor: Record<string, string> = {
  OWNER: 'bg-purple-50 text-purple-600',
  MANAGER: 'bg-fuchsia-50 text-fuchsia-600',
  CASHIER: 'bg-blue-50 text-blue-600',
  STORE_KEEPER: 'bg-emerald-50 text-emerald-600',
  ACCOUNTANT: 'bg-amber-50 text-amber-600',
  TECHNICIAN: 'bg-orange-50 text-orange-600',
  SUPER_ADMIN: 'bg-red-50 text-red-600',
};

const accentColor: Record<string, string> = {
  OWNER: 'bg-purple-600',
  MANAGER: 'bg-fuchsia-500',
  CASHIER: 'bg-blue-500',
  STORE_KEEPER: 'bg-emerald-500',
  ACCOUNTANT: 'bg-amber-500',
  TECHNICIAN: 'bg-orange-500',
  SUPER_ADMIN: 'bg-red-600',
};

const avatarBg: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-fuchsia-100 text-fuchsia-700',
  CASHIER: 'bg-blue-100 text-blue-700',
  STORE_KEEPER: 'bg-emerald-100 text-emerald-700',
  ACCOUNTANT: 'bg-amber-100 text-amber-700',
  TECHNICIAN: 'bg-orange-100 text-orange-700',
  SUPER_ADMIN: 'bg-red-100 text-red-700',
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ─── component ───────────────────────────────────────────────────────────────
export default function StaffManagementPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Staff');
  const [staff, setStaff] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [staffRes, pendingRes] = await Promise.all([
        api.get('/staff'),
        api.get('/staff/pending'),
      ]);
      const staffData = staffRes.data?.data ?? staffRes.data ?? [];
      const pendingData = pendingRes.data?.data ?? pendingRes.data ?? [];
      setStaff(Array.isArray(staffData) ? staffData : []);
      setPending(Array.isArray(pendingData) ? pendingData : []);
    } catch (err) {
      console.error('Failed to fetch staff data', err);
      setStaff([]);
      setPending([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleApprove = async (staffId: string, action: 'approve' | 'reject') => {
    try {
      setApprovingId(staffId);
      await api.post('/staff/approve', { staff_id: staffId, action });
      await fetchAll(); // refresh data
    } catch (err) {
      console.error(`Failed to ${action} staff`, err);
    } finally {
      setApprovingId(null);
    }
  };

  // ─── KPI counts ──────────────────────────────────────────────────────────
  const totalStaff = staff.length;
  const activeCount = staff.filter((s) => s.status === 'Active').length;
  const adminCount = staff.filter((s) => s.role === 'OWNER' || s.role === 'SUPER_ADMIN').length;
  const cashierCount = staff.filter((s) => s.role === 'CASHIER').length;
  const keeperCount = staff.filter((s) => s.role === 'STORE_KEEPER').length;
  const pendingCount = pending.length;

  // ─── filtered staff list ─────────────────────────────────────────────────
  const tabRoleMap: Record<string, string[]> = {
    'All Staff': [],
    Admin: ['OWNER', 'SUPER_ADMIN'],
    Manager: ['MANAGER'],
    Cashier: ['CASHIER'],
  };

  const filteredStaff = staff.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'Pending') return false;
    if (activeTab === 'All Staff') return matchSearch;
    return matchSearch && (tabRoleMap[activeTab] || []).includes(s.role);
  });

  const tabCounts: Record<string, number> = {
    'All Staff': totalStaff,
    Admin: adminCount,
    Manager: staff.filter((s) => s.role === 'MANAGER').length,
    Cashier: cashierCount,
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight">Staff Management</h1>
            <p className="text-[14px] font-medium text-gray-500 tracking-wide mt-1">Manage roles, permissions, attendance, and staff accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white shadow-sm"
            >
              <RefreshCcw className="w-4 h-4 text-gray-400" /> Refresh
            </button>
            {isAdmin && (
              <>
                <button className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                  <Shield className="w-4 h-4 text-gray-400" /> Manage Roles
                </button>
                <button className="flex items-center gap-2 border border-[#059669] text-[#059669] px-5 py-2.5 rounded-[12px] text-[13px] font-black hover:bg-[#ecfdf5] transition-colors bg-white shadow-sm">
                  <Mail className="w-4 h-4" /> Invite Staff
                </button>
                <button className="flex items-center gap-2 bg-[#4f46e5] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-[12px] text-[13px] font-black transition-colors shadow-sm shadow-indigo-200">
                  <Plus className="w-4 h-4" /> Add Staff
                </button>
              </>
            )}
          </div>
        </div>

        {/* 5 KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <p className="text-[12px] font-bold text-gray-500">Total Staff</p>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-[28px] font-black tracking-tight text-gray-900 leading-none mb-2">
                {isLoading ? '...' : totalStaff}
              </h3>
              <p className="text-[11px] font-black text-emerald-500 bg-emerald-50 inline-block px-2 py-0.5 rounded uppercase tracking-wider">
                {isLoading ? '...' : `${activeCount} Active`}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <p className="text-[12px] font-bold text-gray-500">Admins</p>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-[28px] font-black tracking-tight text-purple-600 leading-none mb-1">
                {isLoading ? '...' : adminCount}
              </h3>
              <p className="text-[11px] font-bold text-gray-400">Full access</p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <p className="text-[12px] font-bold text-gray-500">Cashiers</p>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calculator className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-[28px] font-black tracking-tight text-blue-600 leading-none mb-1">
                {isLoading ? '...' : cashierCount}
              </h3>
              <p className="text-[11px] font-bold text-gray-400">POS access only</p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <p className="text-[12px] font-bold text-gray-500">Store Keepers</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-[28px] font-black tracking-tight text-emerald-600 leading-none mb-1">
                {isLoading ? '...' : keeperCount}
              </h3>
              <p className="text-[11px] font-bold text-gray-400">Inventory access</p>
            </div>
          </div>

          <div className="bg-amber-50/50 rounded-[20px] p-5 shadow-sm border border-amber-200 flex flex-col justify-between h-[130px]">
            <div className="flex justify-between items-start">
              <p className="text-[12px] font-bold text-amber-700">Pending Requests</p>
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div>
              <h3 className="text-[28px] font-black tracking-tight text-amber-600 leading-none mb-1">
                {isLoading ? '...' : pendingCount}
              </h3>
              <button
                onClick={() => setActiveTab('Pending')}
                className="text-[11px] font-black text-amber-600 hover:text-amber-800 transition-colors uppercase tracking-widest flex items-center gap-1"
              >
                Review Now →
              </button>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-px overflow-x-auto">
          {['All Staff', 'Admin', 'Manager', 'Cashier', 'Pending'].map((tab) => {
            const isActive = activeTab === tab;
            const isPending = tab === 'Pending';
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[13px] font-black transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-xl'
                }`}
              >
                {tab} {!isPending && tabCounts[tab] !== undefined && `(${tabCounts[tab]})`}
                {isPending && (
                  <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-1">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TOOLBAR */}
        {activeTab !== 'Pending' && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full md:w-[280px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-medium outline-none focus:border-blue-500 transition-colors bg-white shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
              <span className="text-[12px] font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                {isLoading ? '...' : `Showing ${filteredStaff.length} Members`}
              </span>
              <div className="flex items-center border border-gray-200 rounded-[10px] p-1 bg-gray-50">
                <button className="p-1.5 bg-white text-blue-600 shadow-sm rounded-md"><LayoutGrid className="w-4 h-4" /></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600"><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}

        {/* STAFF GRID */}
        {activeTab !== 'Pending' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {isLoading ? (
              <div className="col-span-full py-16 text-center text-gray-400 font-bold">Loading staff...</div>
            ) : filteredStaff.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-400 font-bold">No staff members found.</div>
            ) : (
              filteredStaff.map((s) => (
                <div key={s.id} className="bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md border border-gray-200 relative">
                  <div className={`h-1.5 w-full ${accentColor[s.role] ?? 'bg-gray-300'}`} />
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-black shrink-0 ${avatarBg[s.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {initials(s.name || s.email)}
                        </div>
                        <div>
                          <h4 className="text-[16px] font-black text-gray-900 tracking-tight leading-tight">{s.name || 'Unknown'}</h4>
                          <p className="text-[11px] font-bold text-gray-400 font-mono mt-0.5">{s.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                      <button className="text-gray-300 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${roleColor[s.role] ?? 'bg-gray-50 text-gray-600'}`}>
                        {s.role === 'CASHIER' && <Calculator className="w-3 h-3" />}
                        {s.role === 'STORE_KEEPER' && <Package className="w-3 h-3" />}
                        {s.role === 'MANAGER' && <Users className="w-3 h-3" />}
                        {(s.role === 'OWNER' || s.role === 'SUPER_ADMIN') && <Shield className="w-3 h-3" />}
                        {roleLabel[s.role] ?? s.role}
                      </span>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase border ${
                        s.status === 'Active' ? 'border-emerald-200 text-emerald-600 bg-emerald-50/30' : 'border-gray-200 text-gray-500 bg-gray-50'
                      }`}>
                        {s.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {s.phone}
                      </div>
                      <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {s.email}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 mt-auto flex items-center justify-between border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400">Joined: {formatDate(s.createdAt)}</span>
                    <div className="flex justify-end gap-2 text-gray-300">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:text-gray-600 transition-colors border border-gray-200">
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PENDING SECTION */}
        <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-4">
          <h2 className="text-[18px] md:text-[22px] font-black text-gray-900 tracking-tight">Pending Staff Registration Requests</h2>
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
            {isLoading ? '...' : pendingCount} Awaiting Approval
          </span>
        </div>

        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="py-4 px-6 text-[12px] font-black text-gray-500 tracking-wider w-[60px]">Staff</th>
                <th className="py-4 px-4 text-[12px] font-black text-gray-500 tracking-wider">Details</th>
                <th className="py-4 px-4 text-[12px] font-black text-gray-500 tracking-wider">Role</th>
                <th className="py-4 px-4 text-[12px] font-black text-gray-500 tracking-wider">Shop Info</th>
                <th className="py-4 px-4 text-[12px] font-black text-gray-500 tracking-wider">Submitted</th>
                <th className="py-4 px-6 text-[12px] font-black text-gray-500 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-bold">Loading pending requests...</td>
                </tr>
              ) : pending.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-bold">No pending registration requests.</td>
                </tr>
              ) : (
                pending.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-6">
                      <div className="w-10 h-10 bg-amber-100 text-amber-700 font-black rounded-lg flex items-center justify-center shrink-0 text-[14px]">
                        {initials(req.name || req.email)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[14px] font-black text-gray-900">{req.name || '—'}</p>
                      <p className="text-[12px] font-semibold text-gray-500">{req.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-[11px] font-bold text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">
                        {roleLabel[req.role] ?? req.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[12px] font-bold text-gray-700 font-mono mb-0.5">{req.shopId?.slice(0, 12) ?? 'N/A'}</p>
                      <p className="text-[11.5px] font-semibold text-gray-500">{req.shopName}</p>
                    </td>
                    <td className="py-4 px-4 text-[12px] font-bold text-gray-400">
                      {formatDateTime(req.submittedAt)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-colors">
                          <IdCard className="w-3.5 h-3.5" /> View ID
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleApprove(req.id, 'approve')}
                              disabled={approvingId === req.id}
                              className="flex items-center gap-1 bg-[#059669] hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-[11px] font-black transition-colors shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              {approvingId === req.id ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleApprove(req.id, 'reject')}
                              disabled={approvingId === req.id}
                              className="flex items-center gap-1 bg-[#ef4444] hover:bg-red-600 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-[11px] font-black transition-colors shadow-sm"
                            >
                              <X className="w-3.5 h-3.5" />
                              {approvingId === req.id ? '...' : 'Reject'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </MainLayout>
  );
}
