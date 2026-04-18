'use client';

import { useState } from 'react';
import { X, Building2, UserCircle2, CreditCard, Paperclip, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: Building2 },
  { id: 'contact', label: 'Contact Persons', icon: UserCircle2 },
  { id: 'payment', label: 'Payment & Bank', icon: CreditCard },
  { id: 'docs', label: 'Documents', icon: Paperclip },
];

export default function AddSupplierModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState('basic');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center print:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#f8fafc] w-full max-w-[800px] rounded-[32px] shadow-2xl overflow-hidden mx-4 pb-0 flex flex-col min-h-[600px]">
        
        {/* GREEN HEADER */}
        <div className="bg-[#059669] p-7 md:p-8 flex justify-between items-start text-white shrink-0 shadow-sm relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
               <Building2 className="w-6 h-6 text-white" />
             </div>
             <div>
               <h2 className="text-[22px] font-black tracking-tight leading-tight">Add New Supplier</h2>
               <p className="text-[13px] font-medium text-emerald-100 mt-0.5">Register a new supplier with full contact and payment details</p>
             </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WHITE CONTENT WRAPPER */}
        <div className="bg-white flex flex-col flex-1 rounded-t-[32px] -mt-6 relative z-20">
          {/* TABS */}
          <div className="flex items-center gap-6 px-8 border-b border-gray-100 pt-6">
            {TABS.map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 pb-4 px-1 border-b-4 transition-all text-[13px] font-bold",
                    isActive ? "border-[#059669] text-[#059669]" : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* FORM AREA */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'basic' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Section Title */}
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-5 bg-[#059669] rounded-full" />
                   <h3 className="text-[15px] font-black text-gray-900">Supplier Identity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-gray-700">Supplier / Company Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <Building2 className="w-4 h-4 text-gray-400" />
                      </div>
                      <input type="text" placeholder="e.g. Silva Hardware Distributors" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-gray-700">Supplier Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <span className="text-gray-400 font-bold">#</span>
                      </div>
                      <input type="text" value="SUP-1024" readOnly className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 text-gray-400 rounded-xl text-[13px] font-mono outline-none" />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">Auto-generated. You may edit this.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-gray-700">Supplier Category <span className="text-red-500">*</span></label>
                    <div className="relative">
                       <select className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-[13px] font-medium appearance-none outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all bg-white text-gray-600">
                         <option>Select category...</option>
                         <option>Tools & Machinery</option>
                         <option>Paints & Chemicals</option>
                         <option>Electrical</option>
                         <option>Plumbing</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-gray-700">Status</label>
                    <div className="flex items-center gap-3 mt-1">
                       <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#059669] bg-[#ecfdf5] text-[#059669] text-[13px] font-black transition-all">
                          <div className="w-2 h-2 rounded-full bg-[#059669]" /> Active
                       </button>
                       <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 text-[13px] font-bold hover:bg-gray-50 transition-all">
                          <div className="w-2 h-2 rounded-full bg-gray-300" /> Inactive
                       </button>
                    </div>
                  </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                   <div className="w-1.5 h-5 bg-[#059669] rounded-full" />
                   <h3 className="text-[15px] font-black text-gray-900">Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-gray-700">Primary Phone <span className="text-red-500">*</span></label>
                    <div className="flex">
                       <div className="relative border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 px-3 flex items-center justify-center shrink-0 min-w-[70px]">
                         <span className="text-[13px] font-bold text-gray-600">+94</span>
                       </div>
                       <input type="text" placeholder="077 123 4567" className="w-full px-4 py-3 border border-gray-200 rounded-r-xl text-[13px] font-medium outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black text-gray-700">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <span className="text-gray-400 font-bold text-[13px]">@</span>
                      </div>
                      <input type="email" placeholder="supplier@company.com" className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-[13px] font-medium outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all" />
                    </div>
                  </div>
                </div>

              </div>
            )}
            
            {activeTab !== 'basic' && (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                 {(() => {
                   const ActiveIcon = TABS.find(t=>t.id===activeTab)?.icon;
                   return ActiveIcon ? <ActiveIcon className="w-12 h-12 text-gray-300 mb-4" /> : null;
                 })()}
                 <p className="text-[14px] font-bold text-gray-500">Configure {TABS.find(t=>t.id===activeTab)?.label}</p>
                 <p className="text-[12px] text-gray-400 mt-1">This section is available for configuration.</p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="border-t border-gray-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 rounded-b-[32px]">
             <span className="text-[11px] font-medium text-gray-400">* Required fields must be filled before saving</span>
             <div className="flex items-center gap-3 w-full md:w-auto">
               <button onClick={onClose} className="flex-1 md:flex-none px-6 py-3 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-white transition-all bg-transparent">
                 Cancel
               </button>
               <button onClick={onClose} className="flex-1 md:flex-none px-6 py-3 border border-[#059669] text-[#059669] rounded-xl text-[13px] font-bold hover:bg-[#ecfdf5] transition-all">
                 Save as Draft
               </button>
               <button onClick={onClose} className="flex-1 md:flex-none px-8 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-[13px] font-black shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Save Supplier
               </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
