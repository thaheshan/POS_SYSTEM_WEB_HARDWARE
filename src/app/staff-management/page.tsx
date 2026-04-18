'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
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
  X
} from 'lucide-react';
import { MOCK_STAFF, MOCK_PENDING_REGISTRATIONS } from '@/lib/staff-mock-data';

export default function StaffManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Staff');

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20">
        
        {/* HEADER & TOP ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
           <div>
              <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight">Staff Management</h1>
              <p className="text-[14px] font-medium text-gray-500 tracking-wide mt-1">Manage roles, permissions, attendance, and staff accounts</p>
           </div>
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                 <Shield className="w-4 h-4 text-gray-400" /> Manage Roles
              </button>
              <button className="flex items-center gap-2 border border-[#059669] text-[#059669] px-5 py-2.5 rounded-[12px] text-[13px] font-black hover:bg-[#ecfdf5] transition-colors bg-white shadow-sm">
                 <Mail className="w-4 h-4" /> Invite Staff
              </button>
              <button className="flex items-center gap-2 bg-[#4f46e5] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-[12px] text-[13px] font-black transition-colors shadow-sm shadow-indigo-200">
                 <Plus className="w-4 h-4" /> Add Staff
              </button>
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
                 <h3 className="text-[28px] font-black tracking-tight text-gray-900 leading-none mb-2">24</h3>
                 <p className="text-[11px] font-black text-emerald-500 bg-emerald-50 inline-block px-2 py-0.5 rounded uppercase tracking-wider">22 Active</p>
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
                 <h3 className="text-[28px] font-black tracking-tight text-purple-600 leading-none mb-1">3</h3>
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
                 <h3 className="text-[28px] font-black tracking-tight text-blue-600 leading-none mb-1">8</h3>
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
                 <h3 className="text-[28px] font-black tracking-tight text-emerald-600 leading-none mb-1">6</h3>
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
                 <h3 className="text-[28px] font-black tracking-tight text-amber-600 leading-none mb-1">5</h3>
                 <button className="text-[11px] font-black text-amber-600 hover:text-amber-800 transition-colors uppercase tracking-widest flex items-center gap-1">Review Now →</button>
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
                    {tab} {tab === 'All Staff' && '(24)'} {tab === 'Admin' && '(3)'} {tab === 'Manager' && '(4)'} {tab === 'Cashier' && '(8)'}
                    {isPending && <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center ml-1">5</span>}
                 </button>
              );
           })}
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
           <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full md:w-[280px]">
                 <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text"
                   placeholder="Search by name, ID..."
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-medium outline-none focus:border-blue-500 transition-colors bg-white shadow-sm"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <select className="w-full md:w-[140px] px-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors bg-white shadow-sm">
                 <option>All Status</option>
                 <option>Active</option>
                 <option>On Leave</option>
              </select>
              <select className="w-full md:w-[150px] px-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors bg-white shadow-sm">
                 <option>All Branches</option>
                 <option>Main Branch</option>
              </select>
           </div>
           
           <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
              <span className="text-[12px] font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">Showing 24 Members</span>
              <div className="flex items-center border border-gray-200 rounded-[10px] p-1 bg-gray-50">
                 <button className="p-1.5 bg-white text-blue-600 shadow-sm rounded-md"><LayoutGrid className="w-4 h-4" /></button>
                 <button className="p-1.5 text-gray-400 hover:text-gray-600"><List className="w-4 h-4" /></button>
              </div>
           </div>
        </div>

        {/* STAFF GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
           {MOCK_STAFF.filter(s => activeTab === 'All Staff' || (activeTab !== 'Pending' && s.role.includes(activeTab))).map((staff) => (
              <div key={staff.id} className="bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md border border-gray-200 relative">
                 {/* Top Colored Accent line */}
                 <div className={`h-1.5 w-full ${staff.role === 'Admin' ? 'bg-blue-600' : staff.role === 'Manager' ? 'bg-[#d946ef]' : staff.role === 'Cashier' ? 'bg-[#3b82f6]' : 'bg-[#10b981]'}`} />
                 
                 <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex gap-4 items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-black shrink-0 ${staff.colorClass || 'bg-gray-100'}`}>
                             {staff.image ? <img src={staff.image} className="w-full h-full object-cover rounded-full" alt={staff.name} /> : staff.initials}
                          </div>
                          <div>
                             <h4 className="text-[16px] font-black text-gray-900 tracking-tight leading-tight">{staff.name}</h4>
                             <p className="text-[11px] font-bold text-gray-400 font-mono mt-0.5">{staff.id}</p>
                          </div>
                       </div>
                       <button className="text-gray-300 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                       <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${
                          staff.role === 'Admin' ? 'bg-blue-50 text-blue-600' : 
                          staff.role === 'Manager' ? 'bg-fuchsia-50 text-fuchsia-600' : 
                          staff.role === 'Cashier' ? 'bg-blue-50 text-blue-600' : 
                          'bg-emerald-50 text-emerald-600'
                       }`}>
                          {staff.role === 'Cashier' && <Calculator className="w-3 h-3" />}
                          {staff.role === 'Store Keeper' && <Package className="w-3 h-3" />}
                          {staff.role === 'Manager' && <Users className="w-3 h-3" />}
                          {staff.role === 'Admin' && <Shield className="w-3 h-3" />}
                          {staff.role}
                       </span>
                       <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase border ${
                          staff.status === 'Active' ? 'border-emerald-200 text-emerald-600 bg-emerald-50/30' : 'border-gray-200 text-gray-500 bg-gray-50'
                       }`}>
                          {staff.status}
                       </span>
                    </div>

                    <div className="space-y-3 mb-6">
                       <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {staff.phone}
                       </div>
                       <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {staff.email}
                       </div>
                    </div>

                    {Object.keys(staff.metrics).length > 0 && (
                       <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                          {staff.metrics.sales !== undefined && (
                             <>
                                <div className="flex justify-between items-center text-[12px]">
                                   <span className="font-bold text-gray-500">Today's Sales:</span>
                                   <span className="font-black text-gray-900">Rs. {staff.metrics.sales.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px]">
                                   <span className="font-bold text-gray-500">Transactions:</span>
                                   <span className="font-black text-gray-900">{staff.metrics.transactions}</span>
                                </div>
                             </>
                          )}
                          {staff.metrics.branch !== undefined && (
                             <>
                                <div className="flex justify-between items-center text-[12px]">
                                   <span className="font-bold text-gray-500">Branch:</span>
                                   <span className="font-black text-blue-600">{staff.metrics.branch}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px]">
                                   <span className="font-bold text-gray-500">Staff Managed:</span>
                                   <span className="font-black text-gray-900">{staff.metrics.staffManaged}</span>
                                </div>
                             </>
                          )}
                       </div>
                    )}
                 </div>

                 {/* Card Footer */}
                 <div className="p-4 mt-auto flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-400">Joined: {staff.joined}</span>
                    <div className="flex justify-end gap-2 text-gray-300">
                       <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:text-gray-600 transition-colors border border-gray-200">
                          <Settings className="w-3.5 h-3.5" />
                       </button>
                       <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                          <ShieldCheck className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {/* PENDING LEDGER SECTION */}
        <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-4">
           <h2 className="text-[18px] md:text-[22px] font-black text-gray-900 tracking-tight">Pending Staff Registration Requests</h2>
           <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded text-[11px] font-black uppercase tracking-widest whitespace-nowrap">5 Awaiting Approval</span>
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
                 {MOCK_PENDING_REGISTRATIONS.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50/50">
                       <td className="py-4 px-6">
                          <div className="w-10 h-10 bg-amber-100 text-amber-700 font-black rounded-lg flex items-center justify-center shrink-0">
                             {req.initials}
                          </div>
                       </td>
                       <td className="py-4 px-4">
                          <p className="text-[14px] font-black text-gray-900">{req.name}</p>
                          <p className="text-[12px] font-semibold text-gray-500">{req.email}</p>
                       </td>
                       <td className="py-4 px-4">
                          <span className="text-[11px] font-bold text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded">{req.role}</span>
                       </td>
                       <td className="py-4 px-4">
                          <p className="text-[12px] font-bold text-gray-700 font-mono mb-0.5">{req.id}</p>
                          <p className="text-[11.5px] font-semibold text-gray-500">{req.info}</p>
                       </td>
                       <td className="py-4 px-4 text-[12px] font-bold text-gray-400">
                          {req.submitted}
                       </td>
                       <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                             <button className="flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg text-[11px] font-black text-gray-600 hover:bg-gray-50 transition-colors">
                                <IdCard className="w-3.5 h-3.5" /> View ID
                             </button>
                             <button className="flex items-center gap-1 bg-[#059669] hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-[11px] font-black transition-colors shadow-sm">
                                <Check className="w-3.5 h-3.5" /> Approve
                             </button>
                             <button className="flex items-center gap-1 bg-[#ef4444] hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-[11px] font-black transition-colors shadow-sm">
                                <X className="w-3.5 h-3.5" /> Reject
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

      </div>
    </MainLayout>
  );
}
