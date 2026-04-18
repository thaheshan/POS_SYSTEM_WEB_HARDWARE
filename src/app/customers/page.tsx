'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  AlertCircle,
  PiggyBank,
  Download, 
  Upload, 
  Plus, 
  Search,
  LayoutGrid,
  List,
  ArrowDownUp,
  Phone,
  Mail,
  Eye,
  Edit2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MOCK_CUSTOMERS } from '@/lib/customers-mock-data';

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20">
        
        {/* HEADER & TOP ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
           <div>
              <h1 className="text-[28px] md:text-[32px] font-black text-gray-900 tracking-tighter leading-tight">Customer Management</h1>
              <p className="text-[14px] font-medium text-gray-500 tracking-wide mt-1">Manage customer relationships, credit accounts, and purchase history</p>
           </div>
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
                 <Download className="w-4 h-4 rotate-180" /> Import
              </button>
              <button className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[12px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
                 <Upload className="w-4 h-4" /> Export
              </button>
              <button className="flex items-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white px-6 py-2.5 rounded-[12px] text-[13px] font-black transition-colors shadow-sm shadow-blue-200">
                 <Plus className="w-4 h-4" /> Add Customer
              </button>
           </div>
        </div>

        {/* 4 KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           
           <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[150px]">
              <div className="flex justify-between items-start">
                 <p className="text-[13px] font-bold text-gray-400">Total Customers</p>
                 <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                 </div>
              </div>
              <div>
                 <h3 className="text-[32px] font-black tracking-tight text-gray-900 leading-none mb-2">1,247</h3>
                 <p className="text-[12px] font-bold text-emerald-500">↑ 12% from last month</p>
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
                 <h3 className="text-[32px] font-black tracking-tight text-gray-900 leading-none mb-2">87</h3>
                 <p className="text-[12px] font-bold text-gray-400">7% of total customers</p>
              </div>
           </div>

           {/* Overdue Alert KPI block exactly like image 1 */}
           <div className="bg-red-50 rounded-[20px] p-6 shadow-sm border border-red-200 flex flex-col justify-between h-[150px]">
              <div className="flex justify-between items-start">
                 <p className="text-[13px] font-bold text-red-600/80">Outstanding Credit</p>
                 <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                 </div>
              </div>
              <div>
                 <h3 className="text-[32px] font-black tracking-tight text-red-600 leading-none mb-3">Rs. 487,650</h3>
                 <span className="bg-[#dc2626] text-white px-2.5 py-1 rounded text-[11px] font-bold">24 overdue accounts</span>
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
                 <h3 className="text-[32px] font-black tracking-tight text-gray-900 leading-none mb-2">Rs. 156,340</h3>
                 <p className="text-[12px] font-bold text-emerald-500">↑ 8% increase</p>
              </div>
           </div>

        </div>

        {/* TOOLBAR */}
        <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-3 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
           <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full md:w-[320px]">
                 <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                 <input 
                   type="text"
                   placeholder="Search by name, phone, or email..."
                   className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-medium outline-none focus:border-[#1e40af] transition-colors"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <select className="w-full md:w-[140px] px-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors bg-white">
                 <option>All Customers</option>
                 <option>Individual</option>
                 <option>Business</option>
              </select>
              <select className="w-full md:w-[140px] px-4 py-2.5 border border-gray-200 rounded-[10px] text-[13px] font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors bg-white">
                 <option>All Status</option>
                 <option>Active</option>
                 <option>Overdue</option>
              </select>
           </div>
           
           <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <button className="flex items-center gap-2 border border-gray-200 px-4 py-2.5 rounded-[10px] text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                 <ArrowDownUp className="w-3.5 h-3.5" /> Recently Added
              </button>
              <div className="flex items-center border border-gray-200 rounded-[10px] p-1 bg-gray-50">
                 <button className="p-1.5 bg-white text-blue-600 shadow-sm rounded-md"><LayoutGrid className="w-4 h-4" /></button>
                 <button className="p-1.5 text-gray-400 hover:text-gray-600"><List className="w-4 h-4" /></button>
              </div>
              <span className="text-[12px] font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">1,247 Results</span>
           </div>
        </div>

        {/* CUSTOMER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
           {MOCK_CUSTOMERS.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((cust) => (
              <div key={cust.id} className={`bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md ${
                 cust.isOverdue ? 'border-2 border-red-200 bg-red-50/10' : 'border border-gray-200'
              }`}>
                 
                 <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex gap-4 items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[16px] font-black shrink-0 ${cust.colorClass || 'bg-gray-100'}`}>
                             {cust.hasAvatar ? <img src={cust.image} className="w-full h-full object-cover rounded-full" alt={cust.name} /> : cust.initials}
                          </div>
                          <div>
                             <h4 className="text-[16px] font-black text-gray-900 tracking-tight leading-tight">{cust.name}</h4>
                             <p className="text-[11px] font-bold text-gray-400 font-mono mt-0.5">{cust.id}</p>
                          </div>
                       </div>
                       <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{cust.type}</span>
                    </div>

                    <div className="space-y-3 mb-6">
                       <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {cust.phone}
                       </div>
                       <div className="flex items-center gap-3 text-[12px] font-semibold text-gray-500">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {cust.email}
                       </div>
                    </div>

                    <div className={`rounded-xl p-4 space-y-3 ${cust.isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
                       <div className="flex justify-between items-center text-[12px]">
                          <span className="font-bold text-gray-500">Total Purchases:</span>
                          <span className="font-black text-gray-900">Rs. {cust.totalPurchases.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center text-[12px]">
                          <span className="font-bold text-gray-500">Transactions:</span>
                          <span className="font-black text-gray-900">{cust.transactions}</span>
                       </div>
                       <div className="flex justify-between items-center text-[12px]">
                          <span className={`font-black ${cust.isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                             Outstanding {cust.isOverdue && `(${cust.overdueDays} days):`}
                          </span>
                          <span className={`font-black ${cust.outstanding > 0 ? 'text-red-500' : 'text-[#059669]'}`}>
                             Rs. {cust.outstanding.toLocaleString()}
                          </span>
                       </div>
                    </div>
                 </div>

                 {/* Card Footer */}
                 <div className="border-t border-gray-100 p-4 mt-auto flex items-center justify-between bg-gray-50/50">
                    <span className="text-[11px] font-bold text-gray-400">Last: {cust.lastActive}</span>
                    <div className="flex gap-2">
                       <button className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors shadow-sm">
                          <Eye className="w-3.5 h-3.5" />
                       </button>
                       <button className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 text-gray-400 transition-colors shadow-sm">
                          <Edit2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center mt-4">
           <div className="flex items-center gap-1 border border-gray-200 rounded-[12px] p-1.5 bg-white shadow-sm">
              <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-9 h-9 flex items-center justify-center bg-[#1e40af] text-white font-black rounded-lg text-[13px]">1</button>
              <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold rounded-lg text-[13px]">2</button>
              <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold rounded-lg text-[13px]">3</button>
              <span className="px-2 text-gray-400">...</span>
              <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-bold rounded-lg text-[13px]">32</button>
              <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
           </div>
        </div>

      </div>
    </MainLayout>
  );
}
