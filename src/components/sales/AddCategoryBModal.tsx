'use client';

import { X, Search, User, CreditCard, Smartphone, Banknote, MoreHorizontal, Trash2, FileText, CheckCircle2, ChevronDown, Check, Phone, ArrowUpRight, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddCategoryBModal({ isOpen, onClose }: ModalProps) {
  const [saleType, setSaleType] = useState<'non-tax' | 'overflow'>('non-tax');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'other'>('cash');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[24px] w-full max-w-[680px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* MODAL HEADER (GREEN) */}
        <div className="bg-[#15803d] p-6 text-white relative">
           <button 
             onClick={onClose}
             className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
           
           <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                 <FileText className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-[20px] font-black tracking-tight">Add Non-Tax / Overflow Sale (Category B)</h2>
                 <p className="text-[13px] font-medium opacity-80">Non-taxable products or sales exceeding Rs. 200,000</p>
              </div>
           </div>

           {/* Today's Dual Status Banners */}
           <div className="mt-6 flex gap-3">
              <div className="flex-1 bg-white/10 border border-white/20 rounded-xl p-3 flex flex-col">
                 <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1 leading-tight">Overflow Amount Today:</span>
                 <span className="text-[15px] font-black tracking-tight leading-tight">Rs. 45,250</span>
              </div>
              <div className="flex-1 bg-white/10 border border-white/20 rounded-xl p-3 flex flex-col">
                 <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1 leading-tight">Non-Tax Products:</span>
                 <span className="text-[15px] font-black tracking-tight leading-tight">Rs. 23,200</span>
              </div>
           </div>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-8 space-y-8 max-h-[65vh] overflow-y-auto scrollbar-hide">
           
           {/* Category B Type */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] block mb-3">Category B Type</label>
              <div className="flex gap-3">
                 <button 
                    onClick={() => setSaleType('non-tax')}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                       saleType === 'non-tax' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                    }`}
                 >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${saleType === 'non-tax' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'}`}>
                       <Check className={`w-3.5 h-3.5 text-white ${saleType === 'non-tax' ? 'opacity-100' : 'opacity-0'}`} strokeWidth={4} />
                    </div>
                    <span className="text-[13px] font-black uppercase tracking-widest">Non-Taxable Products</span>
                 </button>
                 <button 
                    onClick={() => setSaleType('overflow')}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                       saleType === 'overflow' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                    }`}
                 >
                    <ArrowUpRight className={`w-5 h-5 transition-transform ${saleType === 'overflow' ? 'opacity-100' : 'opacity-40'}`} />
                    <span className="text-[13px] font-black uppercase tracking-widest">Overflow Sale (&gt;Rs. 2L)</span>
                 </button>
              </div>
           </div>

           {/* Filter & Product Selection */}
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Show only:</span>
                 <button className="px-5 py-1.5 bg-emerald-700 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm">All Products</button>
                 <button className="px-5 py-1.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-gray-100">Non-Taxable Only</button>
              </div>
              <div>
                 <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] block mb-3 leading-none">Product Selection</label>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 text-[14px] font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-700 transition-all"
                    />
                 </div>
              </div>
           </div>

           {/* Selected Products Table */}
           <div>
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                 <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em]">Selected Products</label>
              </div>
              <div className="overflow-hidden border border-gray-50 rounded-xl">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                       <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3 text-center">Tax Status</th>
                          <th className="px-4 py-3 text-center">Price</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3 text-center">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       <tr className="bg-white">
                          <td className="px-4 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-100">
                                   <FileText className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                   <span className="text-[13px] font-bold text-gray-900 block leading-tight">Rice Bag 25kg</span>
                                   <span className="text-[9.5px] font-black text-gray-400 uppercase">SKU: RB-25K-001</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                             <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest whitespace-nowrap">Non-Taxable</span>
                          </td>
                          <td className="px-4 py-4 text-center text-[13px] font-bold text-gray-600">Rs. 2,500</td>
                          <td className="px-4 py-4">
                             <div className="flex items-center justify-center gap-3">
                                <button className="text-gray-300 hover:text-gray-400 p-0.5"><Minus className="w-3.5 h-3.5" /></button>
                                <span className="text-[14px] font-black text-gray-900">2</span>
                                <button className="text-gray-300 hover:text-gray-400 p-0.5"><Plus className="w-3.5 h-3.5" /></button>
                             </div>
                          </td>
                          <td className="px-4 py-4 text-right text-[13px] font-black text-emerald-600">Rs. 5,000</td>
                          <td className="px-4 py-4 text-center">
                             <button className="text-red-400 hover:text-red-500 p-2 bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </td>
                       </tr>
                       <tr className="bg-white">
                          <td className="px-4 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-100">
                                   <FileText className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                   <span className="text-[13px] font-bold text-gray-900 block leading-tight">Wheat Flour 10kg</span>
                                   <span className="text-[9.5px] font-black text-gray-400 uppercase">SKU: WF-10K-002</span>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                             <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest whitespace-nowrap">Non-Taxable</span>
                          </td>
                          <td className="px-4 py-4 text-center text-[13px] font-bold text-gray-600">Rs. 1,750</td>
                          <td className="px-4 py-4">
                             <div className="flex items-center justify-center gap-3">
                                <button className="text-gray-300 hover:text-gray-400 p-0.5"><Minus className="w-3.5 h-3.5" /></button>
                                <span className="text-[14px] font-black text-gray-900">2</span>
                                <button className="text-gray-300 hover:text-gray-400 p-0.5"><Plus className="w-3.5 h-3.5" /></button>
                             </div>
                          </td>
                          <td className="px-4 py-4 text-right text-[13px] font-black text-emerald-600">Rs. 3,500</td>
                          <td className="px-4 py-4 text-center">
                             <button className="text-red-400 hover:text-red-500 p-2 bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Customer Information (Optional) */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] block mb-3">Customer Information (Optional)</label>
              <div className="grid grid-cols-2 gap-4">
                 <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Enter customer name" 
                      className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-[13px] font-bold outline-none"
                    />
                 </div>
                 <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="+92 300 1234567" 
                      className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-[13px] font-bold outline-none"
                    />
                 </div>
              </div>
           </div>

           {/* Payment Method */}
           <div>
              <label className="text-[11px] font-black text-gray-900 uppercase tracking-[0.15em] block mb-3">Payment Method</label>
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
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        paymentMethod === method.id 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                          : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <method.icon className="w-5 h-5 transition-transform duration-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">{method.label}</span>
                    </button>
                  ))}
              </div>
           </div>

           {/* Summary Bar */}
           <div className="pt-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-center text-[14px] font-black text-gray-900">
                 <span className="opacity-40 uppercase tracking-widest text-[11px]">Subtotal:</span>
                 <span className="text-[16px]">Rs. 8,500.00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                 <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">Tax Status:</span>
                 <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-sm">Non-Taxable</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                 <span className="text-[16px] font-black text-gray-900 uppercase tracking-widest opacity-80">Total Amount:</span>
                 <span className="text-[28px] font-black text-emerald-700 tracking-tighter">Rs. 8,500.00</span>
              </div>
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
              className="flex-[1.5] py-4 px-6 bg-[#15803d] hover:bg-emerald-800 text-white font-black text-[13px] rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-[0.2em]"
           >
              <CheckCircle2 className="w-5 h-5" />
              Complete Sale
           </button>
        </div>

      </div>
    </div>
  );
}
