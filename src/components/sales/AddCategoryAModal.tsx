'use client';

import { X, Search, User, CreditCard, Smartphone, Banknote, MoreHorizontal, Trash2, LayoutGrid, CheckCircle2, Info, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddCategoryAModal({ isOpen, onClose }: ModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'other'>('cash');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[1100px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* MODAL HEADER - SLIMMER */}
        <div className="bg-[#1e40af] p-5 text-white relative">
           <button 
             onClick={onClose}
             className="absolute top-5 right-6 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
           
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                 <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                 <h2 className="text-[18px] font-black tracking-tight">Add Category A Transaction</h2>
                 <p className="text-[12px] font-medium opacity-80">Process standard taxable sale under Rs. 200,000 threshold</p>
              </div>
           </div>
           
           {/* Today's Threshold Tracker inside Header Area */}
           <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2 text-[12px] font-bold">
                 <span>Today's Category A Total:</span>
                 <span className="text-[14px] font-black">Rs. 145,650 / Rs. 200,000</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-white w-[72.8%]"></div>
              </div>
              <p className="text-[11px] font-bold mt-2 opacity-60 italic">Remaining: Rs. 54,350</p>
           </div>
        </div>

        {/* MODAL CONTENT - SCROLLABLE (TIIGHTER) */}
        <div className="p-6 space-y-5 max-h-[58vh] overflow-y-auto scrollbar-hide">
           
           {/* Product Selection */}
           <div>
              <label className="text-[13px] font-black text-gray-900 uppercase tracking-widest block mb-3">Product Selection</label>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search product by name or scan barcode..." 
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-12 text-[14px] font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                 />
                 <LayoutGrid className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 cursor-pointer" />
              </div>
           </div>

           {/* Selected Products Table */}
           <div>
              <div className="flex items-center justify-between mb-3">
                 <label className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Selected Products</label>
                 <button className="text-[11px] font-black text-red-500 uppercase tracking-widest hover:underline">Clear All</button>
              </div>
              <div className="border border-gray-50 rounded-xl overflow-hidden bg-gray-50/30">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                       <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3 text-center">Unit Price</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       <tr className="bg-white">
                          <td className="px-4 py-4">
                             <span className="text-[13px] font-bold text-gray-900 block">Holcim Cement 50kg</span>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PROD-001</span>
                          </td>
                          <td className="px-4 py-4 text-center text-[13px] font-bold text-gray-600">Rs. 1,650</td>
                          <td className="px-4 py-4">
                             <div className="flex items-center justify-center gap-3">
                                <button className="text-gray-300 hover:text-gray-600"><Minus className="w-3.5 h-3.5" /></button>
                                <span className="text-[14px] font-black text-gray-900">1</span>
                                <button className="text-gray-300 hover:text-gray-600"><Plus className="w-3.5 h-3.5" /></button>
                             </div>
                          </td>
                          <td className="px-4 py-4 text-right text-[13px] font-black text-blue-600">Rs. 1,650</td>
                          <td className="px-4 py-4 text-center">
                             <button className="text-red-400 hover:text-red-500 p-1.5 bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Customer Selection */}
           <div>
              <label className="text-[13px] font-black text-gray-900 uppercase tracking-widest block mb-3">Customer (Optional)</label>
              <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search customer or leave as walk-in" 
                   className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-[14px] font-medium outline-none"
                 />
              </div>
           </div>

           {/* Payment Method */}
           <div>
              <label className="text-[13px] font-black text-gray-900 uppercase tracking-widest block mb-3">Payment Method</label>
              <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 'cash', icon: Banknote, label: 'Cash' },
                    { id: 'card', icon: CreditCard, label: 'Card' },
                    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
                    { id: 'other', icon: MoreHorizontal, label: 'Other' }
                  ].map((method) => (
                    <button 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        paymentMethod === method.id 
                          ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' 
                          : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="text-[11px] font-black uppercase tracking-widest">{method.label}</span>
                    </button>
                  ))}
              </div>
           </div>

           {/* Summary Section */}
           <div className="pt-4 border-t border-gray-50 space-y-3">
              <div className="flex justify-between items-center text-[13.5px] font-bold text-gray-500">
                 <span>Subtotal:</span>
                 <span className="text-gray-900">Rs. 1,650.00</span>
              </div>
              <div className="flex justify-between items-center text-[13.5px] font-bold text-gray-500">
                 <span>VAT (18%):</span>
                 <span className="text-gray-900">Rs. 251.69</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                 <span className="text-[16px] font-black text-gray-900 uppercase tracking-tight">Total Amount:</span>
                 <span className="text-[26px] font-black text-blue-700 tracking-tighter">Rs. 1,901.69</span>
              </div>
           </div>
        </div>

        {/* ACTIONS */}
        <div className="p-8 pt-0 flex gap-4">
           <button 
              onClick={onClose}
              className="flex-1 py-4 px-6 border border-gray-200 text-gray-600 font-black text-[14px] rounded-2xl hover:bg-gray-50 transition-all uppercase tracking-widest"
           >
              Cancel
           </button>
           <button 
              className="flex-[1.5] py-4 px-6 bg-[#1e40af] hover:bg-blue-800 text-white font-black text-[14px] rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest"
           >
              Complete Sale
           </button>
        </div>

      </div>
    </div>
  );
}
