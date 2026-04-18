'use client';

import { useState } from 'react';
import { X, Receipt, Search, ChevronDown, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_CATEGORIES = ['Tea & Short-eats', 'Travel', 'Daily Wages', 'Maintenance', 'Office Supplies', 'Logistics'];
const STAFF_MEMBERS = ['Nimal Silva', 'Kamal Perera', 'Sunil Fernando', 'Delivery Co.'];

export default function AddExpenseModal({ isOpen, onClose }: Props) {
  const [expenseType, setExpenseType] = useState('Tea & Short-eats');
  const [customType, setCustomType] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  
  const [amount, setAmount] = useState('');
  
  const [isForStaff, setIsForStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    // Save logic
    console.log({
      type: isCustom ? customType : expenseType,
      amount,
      staff: isForStaff ? selectedStaff : null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center print:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[500px] rounded-[28px] shadow-2xl p-8 flex flex-col mx-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                 <Receipt className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                 <h2 className="text-[20px] font-black text-gray-900 leading-tight">Record Expense</h2>
                 <p className="text-[12px] font-bold text-gray-400">Log internal services & cash outs</p>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* BODY */}
        <div className="space-y-6">
           {/* Expense Category */}
           <div>
              <label className="text-[12px] font-black text-gray-800 uppercase tracking-widest mb-2 block">Expense Category</label>
              {!isCustom ? (
                 <div className="flex gap-2">
                    <select 
                       value={expenseType} 
                       onChange={(e) => setExpenseType(e.target.value)}
                       className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-[14px] font-bold rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none"
                    >
                       {COMMON_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button 
                       onClick={() => setIsCustom(true)}
                       className="px-5 bg-white border border-gray-200 text-gray-600 font-bold text-[13px] rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                       Type Custom
                    </button>
                 </div>
              ) : (
                 <div className="flex gap-2">
                    <input 
                       autoFocus
                       placeholder="E.g., Plumbing Repair..."
                       value={customType}
                       onChange={(e) => setCustomType(e.target.value)}
                       className="flex-1 bg-white border border-gray-200 text-gray-900 text-[14px] font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-gray-300"
                    />
                    <button 
                       onClick={() => setIsCustom(false)}
                       className="px-5 bg-white border border-gray-200 text-gray-600 font-bold text-[13px] rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                       Cancel
                    </button>
                 </div>
              )}
           </div>

           {/* Amount */}
           <div>
              <label className="text-[12px] font-black text-gray-800 uppercase tracking-widest mb-2 block">Amount (Rs.)</label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">Rs.</span>
                 <input 
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-[18px] font-black tracking-tight rounded-xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                 />
              </div>
           </div>

           {/* Staff Assignment */}
           <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer group mb-4">
                 <div className="relative flex items-center justify-center">
                    <input 
                       type="checkbox" 
                       checked={isForStaff}
                       onChange={(e) => setIsForStaff(e.target.checked)}
                       className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-lg peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                       <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                    </div>
                 </div>
                 <span className="text-[14px] font-bold text-gray-700 group-hover:text-gray-900 transition-colors">This expense relates to a specific staff member</span>
              </label>

              {isForStaff && (
                 <div className="animate-in slide-in-from-top-2 fade-in duration-200 mt-2">
                    <label className="text-[12px] font-black text-gray-800 uppercase tracking-widest mb-2 block">Select Staff Member</label>
                    <select 
                       value={selectedStaff} 
                       onChange={(e) => setSelectedStaff(e.target.value)}
                       className="w-full bg-white border border-amber-200 text-amber-900 text-[14px] font-bold rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none shadow-sm shadow-amber-100/50"
                    >
                       <option value="" disabled>-- Select Staff --</option>
                       {STAFF_MEMBERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              )}
           </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex gap-3">
           <button onClick={onClose} className="flex-1 py-3.5 bg-white border border-gray-200 font-bold text-[14px] text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
           <button onClick={handleSave} className="flex-[2] py-3.5 bg-[#a16207] hover:bg-amber-800 font-black text-white text-[14px] rounded-xl shadow-lg shadow-amber-100 transition-all active:scale-95">Save Expense</button>
        </div>

      </div>
    </div>
  );
}
