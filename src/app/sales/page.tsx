'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Download, 
  Info, 
  ArrowUpRight, 
  Clock, 
  ChevronRight, 
  FileText,
  Briefcase,
  Wrench,
  Search,
  User,
  Phone
} from 'lucide-react';
import AddCategoryAModal from '@/components/sales/AddCategoryAModal';
import AddCategoryBModal from '@/components/sales/AddCategoryBModal';
import AddLabourModal from '@/components/sales/AddLabourModal';

export default function SalesDashboardPage() {
  const [activeModal, setActiveModal] = useState<null | 'A' | 'B' | 'Labour'>(null);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-black text-gray-900 tracking-tight mb-1">
              Sales Dashboard – Tax Category View
            </h1>
            <p className="text-[14px] font-bold text-gray-400 opacity-80">
              Sri Lanka IRD Compliant – Daily Tax Threshold: Rs. 200,000
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-[#1e40af] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold text-[13.5px] transition-all shadow-sm">
              Sales Dashboard
            </button>
          </div>
        </div>

        {/* TOP ACTION BAR */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
             <Calendar className="w-4 h-4 text-gray-400" />
             <span className="text-[13.5px] font-bold text-gray-600">Today - Jan 20, 2026</span>
          </div>
          <button className="bg-[#1e40af] hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-bold text-[13.5px] flex items-center gap-2 shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Add Sale
          </button>
          <button className="w-11 h-11 border border-gray-200 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 shadow-sm transition-all">
            <Download className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* TAXABLE STATUS BANNER (BLUE INFO BOX) */}
        <div className="bg-[#eff6ff] border border-blue-100 rounded-[18px] p-6 mb-10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100/50 rounded-xl flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-[15px] font-black text-blue-900 mb-0.5">
                Today's Taxable Sales (Category A): Rs. 145,650 / Rs. 200,000
              </h4>
              <p className="text-[12.5px] font-bold text-blue-600 opacity-80">Remaining before non-tax threshold: Rs. 54,350</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[16px] font-black text-blue-900">72.8%</span>
             <div className="w-[120px] h-2.5 bg-blue-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[72.8%]"></div>
             </div>
          </div>
        </div>

        {/* THREE CATEGORY COLUMNS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
          
          {/* CATEGORY A: TAXABLE SALES (BLUE) */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[850px]">
             {/* Header Section (BLUE GRADIENT) */}
             <div className="p-6 pb-8 bg-gradient-to-br from-[#1e40af] to-[#1e3a8a] text-white">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-white/20 px-3 py-1 rounded-md">Category A</span>
                <h3 className="text-[20px] font-black mt-4 mb-1">Taxable Sales</h3>
                <p className="text-[12px] font-medium opacity-80 mb-6 leading-tight">First Rs. 2,00,000 daily sales</p>
                <div className="flex items-baseline gap-2 mb-2">
                   <span className="text-[32px] font-black tracking-tighter text-white">Rs. 145,650</span>
                </div>
                <p className="text-[13px] font-bold text-blue-200 mb-0">42 Transactions</p>
             </div>

             {/* VAT Breakdown Bar */}
             <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-tight">VAT (18%)</span>
                   <span className="text-[14px] font-black text-gray-900">Rs. 22,290</span>
                </div>
             </div>

             {/* Statistics Breakdown Section */}
             <div className="p-6 space-y-6 bg-white flex-1">
                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-50">
                   <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase leading-tight mb-2 block">Average Bill</span>
                      <span className="text-[16px] font-black text-gray-900">Rs. 3,468</span>
                   </div>
                   <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase leading-tight mb-2 block">Items Sold</span>
                      <span className="text-[16px] font-black text-gray-900">158 Units</span>
                   </div>
                </div>

                {/* Recent Items List */}
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <h5 className="text-[13px] font-black uppercase tracking-widest text-gray-900">Recent Transactions</h5>
                      <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All</button>
                   </div>
                   <div className="space-y-4">
                      {[
                        { id: 'INV-2026-001234', time: '10:24 AM', amount: '5,450', mode: 'Cash' },
                        { id: 'INV-2026-001233', time: '9:58 AM', amount: '3,200', mode: 'Card' },
                        { id: 'INV-2026-001232', time: '9:15 AM', amount: '12,450', mode: 'Credit' }
                      ].map((txn) => (
                        <div key={txn.id} className="flex flex-col gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                           <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                 <span className="text-[12.5px] font-bold text-gray-900">{txn.id}</span>
                                 <span className="text-[11px] font-bold text-gray-400">{txn.time}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="text-[13px] font-black text-blue-600">Rs. {txn.amount}</span>
                                 <span className={`text-[10px] font-black uppercase tracking-wider ${txn.mode === 'Cash' ? 'text-emerald-500' : txn.mode === 'Card' ? 'text-blue-500' : 'text-amber-500'}`}>{txn.mode}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Bottom Link Section */}
             <div className="p-6 border-t border-gray-50 mt-auto bg-gray-50/20">
                <button className="w-full flex items-center justify-center gap-2 text-[13px] font-black text-blue-600 group">
                   View Detailed Report
                   <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
             </div>
          </div>

          {/* CATEGORY B: NON-TAX & OVERFLOW (GREEN) */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[850px]">
             {/* Header Section (GREEN GRADIENT) */}
             <div className="p-6 pb-8 bg-gradient-to-br from-[#15803d] to-[#166534] text-white">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-white/20 px-3 py-1 rounded-md">Category B</span>
                <h3 className="text-[20px] font-black mt-4 mb-1">Non-Tax & Overflow</h3>
                <p className="text-[12px] font-medium opacity-80 mb-6 leading-tight">Sales &gt; Rs. 2,00,000 + Non-taxable items</p>
                <div className="flex items-baseline gap-2 mb-2">
                   <span className="text-[32px] font-black tracking-tighter text-white">Rs. 68,450</span>
                </div>
                <p className="text-[13px] font-bold text-emerald-200 mb-0">18 Transactions</p>
             </div>

             {/* Overflow Breakdown Bar */}
             <div className="px-6 py-4 border-b border-gray-50 space-y-2 bg-gray-50/30">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Overflow (&gt; Rs. 2L)</span>
                    <span className="text-gray-900">Rs. 45,250</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Non-taxable Products</span>
                    <span className="text-gray-900">Rs. 23,200</span>
                </div>
             </div>

             {/* Statistics Section */}
             <div className="p-6 space-y-6 flex-1 bg-white">
                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-50">
                   <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase leading-tight mb-2 block">Average Bill</span>
                      <span className="text-[16px] font-black text-gray-900">Rs. 3,803</span>
                   </div>
                   <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase leading-tight mb-2 block">Items Sold</span>
                      <span className="text-[16px] font-black text-gray-900">62 Units</span>
                   </div>
                </div>

                {/* Top Non-Taxable Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                     <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Top Non-Taxable Products</h5>
                     <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
                  </div>
                  <div className="space-y-4 mb-8">
                     {[
                       { name: 'Educational Books', sold: '12 units sold', amount: '8,450' },
                       { name: 'Medical Supplies', sold: '8 units sold', amount: '6,750' },
                       { name: 'Agricultural Tools', sold: '5 units sold', amount: '8,000' }
                     ].map((item) => (
                       <div key={item.name} className="flex justify-between items-center">
                          <div className="flex flex-col">
                             <span className="text-[12.5px] font-bold text-gray-900 leading-tight">{item.name}</span>
                             <span className="text-[10px] font-bold text-gray-400">{item.sold}</span>
                          </div>
                          <span className="text-[13px] font-black text-gray-900">Rs. {item.amount}</span>
                       </div>
                     ))}
                  </div>

                  <div className="flex items-center justify-between mb-4 mt-8">
                     <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Recent Transactions</h5>
                  </div>
                  <div className="space-y-4">
                      {[
                        { id: 'INV-2026-001240', time: '2:15 PM', amount: '8,200', type: 'Non-Tax' },
                        { id: 'INV-2026-001239', time: '1:48 PM', amount: '15,250', type: 'Overflow' }
                      ].map((txn) => (
                        <div key={txn.id} className="flex flex-col gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                           <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                 <span className="text-[12.5px] font-bold text-gray-900">{txn.id}</span>
                                 <span className="text-[11px] font-bold text-gray-400">{txn.time}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="text-[13px] font-black text-emerald-600">Rs. {txn.amount}</span>
                                 <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">{txn.type}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                  </div>
                </div>
             </div>

             {/* Bottom Link Section */}
             <div className="p-6 border-t border-gray-50 mt-auto bg-gray-50/20">
                <button className="w-full flex items-center justify-center gap-2 text-[13px] font-black text-emerald-600 group">
                   View Detailed Report
                   <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
             </div>
          </div>

          {/* CATEGORY C: LABOUR & MISC (AMBER) */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[850px]">
             {/* Header Section (AMBER GRADIENT) */}
             <div className="p-6 pb-8 bg-gradient-to-br from-[#a16207] to-[#92400e] text-white">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] bg-white/20 px-3 py-1 rounded-md">Category C</span>
                <h3 className="text-[20px] font-black mt-4 mb-1">Labour & Miscellaneous</h3>
                <p className="text-[12px] font-medium opacity-80 mb-6 leading-tight">Labour charges, expenses, & other costs</p>
                <div className="flex items-baseline gap-2 mb-2">
                   <span className="text-[32px] font-black tracking-tighter text-white">Rs. 35,800</span>
                </div>
                <p className="text-[13px] font-bold text-amber-200 mb-0">14 Entries</p>
             </div>

             {/* Charges Breakdown Bar */}
             <div className="px-6 py-4 border-b border-gray-50 space-y-2 bg-gray-50/30">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Labour Charges</span>
                    <span className="text-gray-900">Rs. 22,500</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Installation Fees</span>
                    <span className="text-gray-900">Rs. 8,500</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Other Expenses</span>
                    <span className="text-gray-900">Rs. 4,800</span>
                </div>
             </div>

             {/* Statistics Section */}
             <div className="p-6 space-y-6 flex-1 bg-white">
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Labour Type Breakdown</h5>
                      <button className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">View All</button>
                   </div>
                   <div className="space-y-4 mb-10">
                      {[
                        { name: 'Plumbing Installation', jobs: '5 jobs completed', amount: '12,500' },
                        { name: 'Electrical Work', jobs: '3 jobs completed', amount: '8,500' },
                        { name: 'Carpentry Services', jobs: '2 jobs completed', amount: '6,000' }
                      ].map((item) => (
                        <div key={item.name} className="flex justify-between items-center">
                           <div className="flex flex-col">
                              <span className="text-[12.5px] font-bold text-gray-900 leading-tight">{item.name}</span>
                              <span className="text-[10px] font-bold text-gray-400">{item.jobs}</span>
                           </div>
                           <span className="text-[13px] font-black text-gray-900">Rs. {item.amount}</span>
                        </div>
                      ))}
                   </div>

                   <div className="flex items-center justify-between mb-4 mt-8">
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-900">Recent Entries</h5>
                   </div>
                   <div className="space-y-5">
                      {[
                        { id: 'LAB-2026-0034', date: '3:45 PM', amount: '4,500', desc: 'Pipe installation - Mr. Perera', type: 'Labour' }
                      ].map((txn) => (
                        <div key={txn.id} className="flex flex-col gap-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                           <div className="flex justify-between items-start mb-1">
                              <div className="flex flex-col">
                                 <span className="text-[12.5px] font-bold text-gray-900">{txn.id}</span>
                                 <span className="text-[11px] font-bold text-gray-400">{txn.date}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="text-[13px] font-black text-amber-600">Rs. {txn.amount}</span>
                                 <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">{txn.type}</span>
                              </div>
                           </div>
                           <p className="text-[11.5px] font-bold text-gray-500 tracking-tight leading-relaxed">{txn.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             {/* Bottom Link Section */}
             <div className="p-6 border-t border-gray-50 mt-auto bg-gray-50/20">
                <button className="w-full flex items-center justify-center gap-2 text-[13px] font-black text-amber-600 group">
                   View All Entries
                   <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
             </div>
          </div>
        </div>

        {/* NATURAL BOTTOM ACTION BAR (SCROLLS WITH CARDS) */}
        <div className="mt-8 mb-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <button 
              onClick={() => setActiveModal('A')}
              className="bg-[#1e40af] hover:bg-blue-800 text-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
              </div>
              <span className="text-[15px] font-black tracking-tight">Add Category A Transaction</span>
            </button>
            
            <button 
              onClick={() => setActiveModal('B')}
              className="bg-[#15803d] hover:bg-emerald-800 text-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
              </div>
              <span className="text-[15px] font-black tracking-tight">Add Category B Transaction</span>
            </button>

            <button 
              onClick={() => setActiveModal('Labour')}
              className="bg-[#a16207] hover:bg-amber-800 text-white rounded-2xl p-4 flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
              </div>
              <span className="text-[15px] font-black tracking-tight uppercase leading-tight text-center">Add Labour/Misc Entry</span>
            </button>
        </div>

      </div>

      {/* MODALS */}
      <AddCategoryAModal 
         isOpen={activeModal === 'A'} 
         onClose={() => setActiveModal(null)} 
      />
      <AddCategoryBModal 
         isOpen={activeModal === 'B'} 
         onClose={() => setActiveModal(null)} 
      />
      <AddLabourModal 
         isOpen={activeModal === 'Labour'} 
         onClose={() => setActiveModal(null)} 
      />
    </MainLayout>
  );
}
