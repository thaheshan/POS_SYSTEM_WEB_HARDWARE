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
  Trash2,
  Edit3,
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

  const [mounted, setMounted] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Staff');
  const [staff, setStaff] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [staffRes, pendingRes, rolesRes] = await Promise.all([
        api.get('/staff'),
        api.get('/staff/pending'),
        api.get('/roles'),
      ]);
      
      // The backend returns a double-wrapped response for these endpoints:
      // staffRes.data = { success: true, data: { success: true, data: [...] } }
      const unpack = (res: any) => {
        if (Array.isArray(res.data?.data?.data)) return res.data.data.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        if (Array.isArray(res.data)) return res.data;
        return [];
      };

      setStaff(unpack(staffRes));
      setPending(unpack(pendingRes));
      setRoles(unpack(rolesRes));
    } catch (err: any) {
      console.error('[StaffPage] Failed to fetch:', err?.response?.data ?? err?.message ?? err);
      setStaff([]);
      setPending([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) fetchAll();
  }, [mounted, fetchAll]);

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

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    
    try {
      setDeletingStaffId(staffToDelete.id);
      await api.delete(`/staff/${staffToDelete.id}`);
      setStaffToDelete(null);
      await fetchAll();
    } catch (err: any) {
      console.error('Failed to delete staff:', err?.response?.data ?? err?.message);
      alert(err?.response?.data?.message || 'Failed to delete staff member');
    } finally {
      setDeletingStaffId(null);
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

  if (!mounted) {
    return (
      <MainLayout>
        <div className="max-w-[1600px] mx-auto pb-20 animate-pulse">
          <div className="h-10 w-64 bg-gray-200 rounded-xl mb-4" />
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-[20px]" />)}
          </div>
          <div className="h-64 bg-gray-100 rounded-[20px]" />
        </div>
      </MainLayout>
    );
  }


  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight">Staff Management</h1>
            <p className="text-[14px] font-medium text-gray-500 tracking-wide mt-1">Manage roles, permissions, attendance, and staff accounts</p>
          </div>

          {/* Button group — 2-col grid on mobile, single row on md+ */}
          <div className="grid grid-cols-2 md:flex md:flex-row items-center gap-2 md:gap-3">
            <button
              onClick={fetchAll}
              className="flex items-center justify-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white shadow-sm"
            >
              <RefreshCcw className="w-4 h-4 text-gray-400" />
              <span>Refresh</span>
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsManageRolesOpen(true)}
                  className="flex items-center justify-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                >
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>Manage Roles</span>
                </button>
                <button className="flex items-center justify-center gap-2 border border-[#059669] text-[#059669] px-4 py-2.5 rounded-[12px] text-[13px] font-black hover:bg-[#ecfdf5] transition-colors bg-white shadow-sm">
                  <Mail className="w-4 h-4" />
                  <span>Invite Staff</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-[#4f46e5] hover:bg-indigo-700 text-white px-4 py-2.5 rounded-[12px] text-[13px] font-black transition-colors shadow-sm shadow-indigo-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff</span>
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
                      {isAdmin && (
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === s.id ? null : s.id)}
                            className="text-gray-300 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === s.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 shadow-xl rounded-xl p-1.5 z-10 w-40 animate-in fade-in zoom-in duration-200 origin-top-right">
                              <button 
                                onClick={() => { setEditingStaff(s); setOpenMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2.5 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-gray-400" /> Edit Staff
                              </button>
                              <div className="h-px bg-gray-100 my-1 mx-2" />
                              <button 
                                onClick={() => { setStaffToDelete(s); setOpenMenuId(null); }}
                                disabled={deletingStaffId === s.id}
                                className="w-full text-left px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> 
                                {deletingStaffId === s.id ? 'Deleting...' : 'Delete Staff'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
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
      <AddStaffModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchAll} 
        roles={roles}
      />
      <EditStaffModal
        isOpen={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        staff={editingStaff}
        roles={roles}
        onSuccess={fetchAll}
      />
      <DeleteStaffModal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        staff={staffToDelete}
        onConfirm={confirmDeleteStaff}
        loading={deletingStaffId === (staffToDelete?.id)}
      />
      <ManageRolesModal
        isOpen={isManageRolesOpen}
        onClose={() => setIsManageRolesOpen(false)}
        roles={roles}
        onSuccess={fetchAll}
      />
    </MainLayout>
  );
}

// ─── Add Staff Modal ────────────────────────────────────────────────────────
function AddStaffModal({ isOpen, onClose, onSuccess, roles }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; roles: any[] }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
  });

  // Set default role when roles are loaded
  useEffect(() => {
    if (roles?.length > 0 && !formData.role) {
      setFormData(prev => ({ ...prev, role: roles[0].id }));
    }
  }, [roles, formData.role]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';
      
      // Try to get tenantId from Redux user, or parse from localStorage as fallback
      let shopId = (user as any)?.tenantId || (user as any)?.tenant_id || '';
      if (!shopId) {
        try {
          const localUser = JSON.parse(localStorage.getItem('user') || '{}');
          shopId = localUser.tenantId || localUser.tenant_id || '';
        } catch (e) {}
      }

      if (!shopId) {
        setError('Shop ID (tenantId) is missing from your session. Please log out and log back in.');
        setLoading(false);
        return;
      }

      const shopVerificationCode = shopId.substring(0, 8);

      await api.post('/auth/register/staff', {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        shopId,
        shopVerificationCode,
        directCreate: true, 
      });
      await onSuccess();
      setFormData({
        name: '',
        email: '',
        password: '',
        role: roles?.length > 0 ? roles[0].id : '',
        phone: '',
      });
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else {
        setError(msg || err.message || 'Failed to add staff');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Add New Staff</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg">{error}</div>}
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="John Doe"
            />
          </div>
          

          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <input 
              required
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="staff@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input 
              required
              type="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Role</label>
              <select 
                required
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="" disabled>Select a role</option>
                {roles.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Phone</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Staff Modal ──────────────────────────────────────────────────────────
function EditStaffModal({ isOpen, onClose, staff, roles, onSuccess }: { isOpen: boolean; onClose: () => void; staff: any; roles: any[]; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    first_name: staff?.name?.split(' ')[0] || '',
    last_name: staff?.name?.split(' ').slice(1).join(' ') || '',
    email: staff?.email || '',
    phone: staff?.phone !== 'N/A' ? staff?.phone : '',
    role_id: roles.find(r => r.name === staff?.role)?.id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      setFormData({
        first_name: staff.name?.split(' ')[0] || '',
        last_name: staff.name?.split(' ').slice(1).join(' ') || '',
        email: staff.email || '',
        phone: staff.phone !== 'N/A' ? staff.phone : '',
        role_id: roles.find(r => r.name === staff.role)?.id || '',
      });
    }
  }, [staff, roles]);

  if (!isOpen || !staff) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put(`/staff/${staff.id}`, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to update staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Edit Staff</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">First Name</label>
              <input 
                required
                type="text" 
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Last Name</label>
              <input 
                required
                type="text" 
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <input 
              required
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Role</label>
              <select 
                required
                value={formData.role_id}
                onChange={e => setFormData({...formData, role_id: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="" disabled>Select a role</option>
                {roles.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Phone</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Staff Modal ────────────────────────────────────────────────────────
function DeleteStaffModal({ isOpen, onClose, staff, onConfirm, loading }: { isOpen: boolean; onClose: () => void; staff: any; onConfirm: () => void; loading: boolean }) {
  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Staff Member</h3>
          <p className="text-sm text-gray-500 font-medium">
            Are you sure you want to remove <span className="font-bold text-gray-900">{staff.name || 'this staff member'}</span>? 
            This action cannot be undone.
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? 'Removing...' : 'Remove Staff'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Manage Roles Modal ────────────────────────────────────────────────────────
function ManageRolesModal({ isOpen, onClose, roles, onSuccess }: { isOpen: boolean; onClose: () => void; roles: any[]; onSuccess: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newRoleName, setNewRoleName] = useState('');

  if (!isOpen) return null;

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/roles', {
        name: newRoleName.trim().toUpperCase(),
        permissions: {},
      });
      setNewRoleName('');
      await onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    setLoading(true);
    setError('');
    try {
      await api.delete(`/roles/${id}`);
      await onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Manage Roles</h3>
            <p className="text-sm text-gray-500">Create or remove custom roles</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg">{error}</div>}
          
          <form onSubmit={handleCreateRole} className="mb-8 flex gap-3">
            <input 
              type="text" 
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g. SENIOR_CASHIER"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              Add Role
            </button>
          </form>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Role Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Users Assigned</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500 text-sm">No roles found.</td>
                  </tr>
                ) : (
                  roles.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{r.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.userCount || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => handleDeleteRole(r.id)}
                          disabled={loading || r.name === 'OWNER'}
                          className={`text-sm font-semibold transition-colors ${r.name === 'OWNER' ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
