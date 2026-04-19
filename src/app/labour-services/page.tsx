'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Calendar
} from 'lucide-react';
import AddLabourModal from '@/components/sales/AddLabourModal';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const MOCK_SERVICES = [
  { id: 'SRV-1024', type: 'Plumbing', description: 'PVC Pipe installation for bathroom', amount: 4500, date: 'Today, 2:30 PM', status: 'Completed' },
  { id: 'SRV-1023', type: 'Electrical', description: 'Main switch board repair', amount: 3200, date: 'Today, 10:15 AM', status: 'Completed' },
  { id: 'SRV-1021', type: 'Carpentry', description: 'Door hinge replacement', amount: 1500, date: 'Yesterday', status: 'Completed' },
  { id: 'SRV-1018', type: 'Masonry', description: 'Small wall plastering', amount: 8500, date: 'Oct 24, 2023', status: 'Completed' },
];

export default function LabourServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="max-w-[1200px] mx-auto pb-20">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-[28px] font-black text-gray-900 tracking-tight mb-1">
              Labour & Service Entries
            </h1>
            <p className="text-[14px] font-bold text-gray-400 opacity-80">
              Record and track your technical service contributions (Category C)
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#a16207] hover:bg-amber-800 text-white px-6 py-3 rounded-xl font-black text-[14px] transition-all shadow-lg shadow-amber-900/20 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add New Service Entry
          </button>
        </div>

        {/* PERSONAL STATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5">
             <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
             </div>
             <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Your Total Value</p>
                <h3 className="text-[22px] font-black text-gray-900 leading-none">Rs. 17,700</h3>
             </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
             </div>
             <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Jobs This Week</p>
                <h3 className="text-[22px] font-black text-gray-900 leading-none">12 Entries</h3>
             </div>
          </div>
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5">
             <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
             </div>
             <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Completion Rate</p>
                <h3 className="text-[22px] font-black text-gray-900 leading-none">100%</h3>
             </div>
          </div>
        </div>

        {/* RECENT ENTRIES TABLE */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-[16px] font-black text-gray-900">Your Recent Service Logs</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search jobs..."
                  className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-[13px] font-bold outline-none focus:ring-2 focus:ring-amber-500/20 w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-gray-600 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Service Item</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Date / Time</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right">Charge (LKR)</th>
                  <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_SERVICES.map((srv) => (
                  <tr key={srv.id} className="hover:bg-amber-50/20 transition-colors group cursor-pointer">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                          <Wrench className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-[14px] font-black text-gray-900">{srv.type}</p>
                          <p className="text-[11px] font-bold text-gray-400 font-mono tracking-tighter">{srv.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-[13px] font-bold text-gray-600 line-clamp-1">{srv.description}</p>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-[13px] font-bold text-gray-500">{srv.date}</p>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <p className="text-[15px] font-black text-gray-900">Rs. {srv.amount.toLocaleString()}</p>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex justify-center">
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                          {srv.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
            <span className="text-[12px] font-bold text-gray-400 italic">
              Entries are automatically added to Shop Category C logs
            </span>
            <button className="text-[12px] font-black text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
              View History Ledger <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <AddLabourModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </MainLayout>
  );
}
