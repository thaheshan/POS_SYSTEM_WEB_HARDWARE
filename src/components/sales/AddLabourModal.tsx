'use client';

import { X, User, Phone, Briefcase, Wrench, Settings, ChevronDown, CheckCircle, Save } from 'lucide-react';
import { useState } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddLabourModal({ isOpen, onClose }: ModalProps) {
  const [entryType, setEntryType] = useState<'labour' | 'installation'>('labour');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[500px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* MODAL HEADER (AMBER) */}
        <div className="bg-[#a16207] p-6 text-white relative">
           <button 
             onClick={onClose}
             className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
           
           <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                 <Briefcase className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-[20px] font-black tracking-tight">Add Labour / Miscellaneous Entry</h2>
                 <p className="text-[13px] font-medium opacity-80">Record labour charges, installation fees, or other expenses</p>
              </div>
           </div>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
           
           {/* Entry Type */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] block mb-3">Entry Type</label>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                    onClick={() => setEntryType('labour')}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                       entryType === 'labour' ? 'bg-red-50 border-red-500 shadow-sm' : 'bg-white border-gray-100 opacity-60'
                    }`}
                 >
                    <div className={`p-2 rounded-lg ${entryType === 'labour' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                       <Wrench className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col mt-1">
                       <span className={`text-[13px] font-black uppercase tracking-tight ${entryType === 'labour' ? 'text-red-900' : 'text-gray-400'}`}>Labour Charges</span>
                       <span className="text-[10px] font-bold text-gray-400">Plumbing, electrical, etc.</span>
                    </div>
                 </button>
                 <button 
                    onClick={() => setEntryType('installation')}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                       entryType === 'installation' ? 'bg-amber-50 border-amber-500 shadow-sm' : 'bg-white border-gray-100 opacity-60'
                    }`}
                 >
                    <div className={`p-2 rounded-lg ${entryType === 'installation' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                       <Settings className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col mt-1">
                       <span className={`text-[13px] font-black uppercase tracking-tight ${entryType === 'installation' ? 'text-amber-900' : 'text-gray-400'}`}>Installation</span>
                       <span className="text-[10px] font-bold text-gray-400">Setup & installation fees</span>
                    </div>
                 </button>
              </div>
           </div>

           {/* Labour Type Selector */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] block mb-2">Labour Type</label>
              <div className="relative group">
                 <select className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 text-[13.5px] font-bold text-gray-600 appearance-none cursor-pointer focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none">
                    <option>Select labour type</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Carpentry</option>
                    <option>Masonry</option>
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
           </div>

           {/* Description */}
           <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Description</label>
                 <span className="text-[10px] font-bold text-gray-300">0/200</span>
              </div>
              <textarea 
                placeholder="E.g., PVC pipe installation for Mr. Perera's bathroom renovation"
                className="w-full bg-white border border-gray-100 rounded-xl p-4 text-[13.5px] font-bold text-gray-600 h-28 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none resize-none placeholder:opacity-50"
              />
           </div>

           {/* Labour Details (Optional) */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] block mb-3">Labour Details (Optional)</label>
              <div className="flex gap-4">
                 <div className="flex-1 relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Labourer name" 
                      className="w-full bg-white border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-[13px] font-bold outline-none"
                    />
                 </div>
                 <div className="flex-1 relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="+94 77 123 4567" 
                      className="w-full bg-white border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-[13px] font-bold outline-none"
                    />
                 </div>
              </div>
           </div>

           {/* Total Amount Footer */}
           <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[15px] font-black text-gray-900 uppercase tracking-tight opacity-80">Total Amount:</span>
              <span className="text-[32px] font-black text-amber-700 tracking-tighter">Rs. 0.00</span>
           </div>
        </div>

        {/* ACTIONS */}
        <div className="p-8 pt-0 flex gap-4">
           <button 
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-gray-200 text-gray-500 font-black text-[13px] rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-[0.2em]"
           >
              Cancel
           </button>
           <button 
              className="flex-[1.5] py-4 px-6 bg-[#a16207] hover:bg-amber-800 text-white font-black text-[14px] rounded-2xl shadow-xl shadow-amber-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
           >
              <Save className="w-5 h-5" />
              Save Entry
           </button>
        </div>

      </div>
    </div>
  );
}
