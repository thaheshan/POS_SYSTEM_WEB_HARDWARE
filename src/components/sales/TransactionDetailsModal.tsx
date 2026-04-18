import { useState } from 'react';
import { X, Printer, Mail, MoreVertical, Edit2, Clock, CheckCircle, Info, Plus, Trash2, Eye, FileText, AlertCircle, User, ShoppingBag } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface Props {
   isOpen: boolean;
   onClose: () => void;
   invoiceId: string;
}

export default function TransactionDetailsModal({ isOpen, onClose, invoiceId }: Props) {
   const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'history' | 'receipt'>('view');
   const [isSaving, setIsSaving] = useState(false);

   const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => {
         setIsSaving(false);
         setActiveTab('view');
      }, 800);
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
         <div className="bg-gray-50 w-full max-w-[1000px] h-[90vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* GREEN HEADER */}
            <div className={`px-8 py-5 flex items-center justify-between text-white transition-colors duration-300 ${activeTab === 'edit' ? 'bg-[#10b981]' : 'bg-[#10b981]'}`}>
               <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                     <h2 className="text-[20px] font-black tracking-tight">Invoice: {invoiceId}</h2>
                     {activeTab === 'edit' && <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Editing Mode</span>}
                  </div>
                  <p className="text-[11px] font-bold text-white/80 mt-0.5">TXN-20260118-001245 | Created: 18/01/2026 at 14:45</p>
               </div>
               
               <div className="flex items-center gap-6">
                  {activeTab === 'view' && (
                     <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        <span className="text-[12px] font-black uppercase tracking-wide">Completed</span>
                     </div>
                  )}
                  <div className="flex flex-col text-right">
                     <span className="text-[10px] font-bold text-white/80 uppercase">Total Amount</span>
                     <span className="text-[22px] font-black leading-none">Rs. 4,646.07</span>
                  </div>
                  <div className="h-10 border-l border-white/20 mx-2"></div>
                  <div className="flex items-center gap-2">
                     {activeTab === 'view' && (
                        <>
                           <button onClick={() => setActiveTab('edit')} className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white"><Edit2 className="w-4 h-4" /></button>
                           <button className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white"><Printer className="w-4 h-4" /></button>
                        </>
                     )}
                     <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all text-white"><X className="w-6 h-6" /></button>
                  </div>
               </div>
            </div>

            {/* WHITE META SUB-HEADER */}
            <div className="bg-white px-8 py-4 border-b border-gray-100 flex items-start justify-between">
               <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Customer</span>
                  <span className="text-[13px] font-bold text-gray-900">John Silva (CUST-001)</span>
               </div>
               <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Cashier</span>
                  <span className="text-[13px] font-bold text-gray-900">Nimal Fernando</span>
               </div>
               <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Transaction Time</span>
                  <span className="text-[13px] font-bold text-gray-900">14:42:06 - 14:45:30 (3m 24s)</span>
               </div>
               <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Till</span>
                  <span className="text-[13px] font-bold text-gray-900">Till #1</span>
               </div>
               <div className="text-right">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Branch</span>
                  <span className="text-[13px] font-bold text-gray-900">Main Store</span>
               </div>
            </div>

            {/* TAB BAR */}
            <div className="bg-white px-8 flex items-center gap-8 border-b border-gray-100 relative">
               <button onClick={() => setActiveTab('view')} className={`py-4 flex items-center gap-2 text-[13px] font-bold transition-all relative ${activeTab === 'view' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Eye className="w-4 h-4" /> View Details
                  {activeTab === 'view' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-600 rounded-t-full"></div>}
               </button>
               <button onClick={() => setActiveTab('edit')} className={`py-4 flex items-center gap-2 text-[13px] font-bold transition-all relative ${activeTab === 'edit' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Edit2 className="w-4 h-4" /> Edit Transaction
                  {activeTab === 'edit' && <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded-sm uppercase ml-1">Active</span>}
                  {activeTab === 'edit' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-600 rounded-t-full"></div>}
               </button>
               <button onClick={() => setActiveTab('history')} className={`py-4 flex items-center gap-2 text-[13px] font-bold transition-all relative ${activeTab === 'history' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Clock className="w-4 h-4" /> Activity History
                  {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-600 rounded-t-full"></div>}
               </button>
               <button onClick={() => setActiveTab('receipt')} className={`py-4 flex items-center gap-2 text-[13px] font-bold transition-all relative ${activeTab === 'receipt' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <FileText className="w-4 h-4" /> Receipt
                  {activeTab === 'receipt' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-600 rounded-t-full"></div>}
               </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto w-full p-8 no-scrollbar bg-gray-50/50">
               
               {activeTab === 'view' && (
                  <div className="max-w-[850px] mx-auto space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-[14px] font-black text-gray-900 mb-6">Transaction Information</h4>
                        <div className="grid grid-cols-4 gap-4">
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Invoice Number</p>
                              <p className="text-[13px] font-medium text-gray-900">{invoiceId}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transaction ID</p>
                              <p className="text-[13px] font-medium text-gray-900">TXN-20260118-001245</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                              <p className="text-[13px] font-medium text-gray-900">18/01/2026</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer Type</p>
                              <p className="text-[13px] font-medium text-gray-900">Regular</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-[14px] font-black text-gray-900 mb-6">Items Purchased</h4>
                        <table className="w-full text-left">
                           <thead>
                              <tr className="border-b border-gray-100">
                                 <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">No.</th>
                                 <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Name</th>
                                 <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU</th>
                                 <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                                 <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unit Price</th>
                                 <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total</th>
                              </tr>
                           </thead>
                           <tbody className="text-[13px]">
                              <tr className="border-b border-gray-50 last:border-0">
                                 <td className="py-4 text-gray-500">1</td>
                                 <td className="py-4 font-bold text-gray-900">Holcim Cement 50kg</td>
                                 <td className="py-4 text-gray-500 font-mono text-[11px]">HCM-50-001</td>
                                 <td className="py-4 font-bold text-gray-900">1</td>
                                 <td className="py-4">Rs. 1,650.00</td>
                                 <td className="py-4 font-bold text-gray-900 font-mono text-right">Rs. 1,650.00</td>
                              </tr>
                              <tr className="border-b border-gray-50 last:border-0">
                                 <td className="py-4 text-gray-500">2</td>
                                 <td className="py-4 font-bold text-gray-900">Steel Bars 12mm</td>
                                 <td className="py-4 text-gray-500 font-mono text-[11px]">STL-BAR-12</td>
                                 <td className="py-4 font-bold text-gray-900">1</td>
                                 <td className="py-4">Rs. 2,500.00</td>
                                 <td className="py-4 font-bold text-gray-900 font-mono text-right">Rs. 2,500.00</td>
                              </tr>
                              <tr className="border-b border-gray-50 last:border-0">
                                 <td className="py-4 text-gray-500">3</td>
                                 <td className="py-4 font-bold text-gray-900">2" Nails 1kg</td>
                                 <td className="py-4 text-gray-500 font-mono text-[11px]">NAIL-02-001</td>
                                 <td className="py-4 font-bold text-gray-900">1</td>
                                 <td className="py-4">Rs. 450.00</td>
                                 <td className="py-4 font-bold text-gray-900 font-mono text-right">Rs. 450.00</td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     <div className="flex justify-end pr-6 pb-20">
                        <div className="w-[380px] bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
                           <div className="flex justify-between items-center text-[12px] font-bold text-gray-500">
                              <span className="uppercase tracking-widest text-[9px]">Subtotal</span>
                              <span className="text-gray-900 font-mono text-[14px]">Rs. 4,600.00</span>
                           </div>
                           <div className="flex justify-between items-center text-[12px] font-bold text-red-500">
                              <span className="uppercase tracking-widest text-[9px]">Discount</span>
                              <span className="font-mono text-[14px]">-Rs. 230.00</span>
                           </div>
                           <div className="flex justify-between items-center text-[12px] font-bold text-emerald-500">
                              <span className="uppercase tracking-widest text-[9px]">Tax (15%)</span>
                              <span className="font-mono text-[14px]">+Rs. 276.07</span>
                           </div>
                           <div className="border-t border-gray-100 my-2"></div>
                           <div className="flex justify-between items-center">
                              <span className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Total Amount</span>
                              <span className="text-[20px] font-black text-emerald-600 font-mono">Rs. 4,646.07</span>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'edit' && (
                  <div className="max-w-[850px] mx-auto space-y-6 pb-24 animate-in slide-in-from-bottom-2 duration-300">
                     <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                           <h5 className="text-[13px] font-black text-amber-900 mb-1">Editing Active Transaction</h5>
                           <p className="text-[12px] text-amber-800 font-medium leading-relaxed">Changes made here will update the invoice record and inventory levels immediately upon saving. A revision history log will be created.</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-[1fr_300px] gap-6 items-start">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
                           <h4 className="text-[14px] font-black text-gray-900 flex items-center gap-2"><User className="w-4 h-4"/> Customer Details</h4>
                           <div className="grid grid-cols-2 gap-5">
                              <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex gap-1 mb-2">Customer Name <span className="text-red-500">*</span></label>
                                 <input type="text" className="w-full text-[13.5px] border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 transition-all font-bold text-gray-900" defaultValue="John Silva" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex gap-1 mb-2">Customer Type</label>
                                 <select className="w-full text-[13.5px] border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 transition-all font-bold text-gray-900 appearance-none bg-white">
                                    <option>Regular Customer</option>
                                    <option>VIP</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex gap-1 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                 <input type="text" className="w-full text-[13.5px] border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 transition-all font-bold text-gray-900" defaultValue="+94 77 123 4567" />
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex gap-1 mb-2">Email Address</label>
                                 <input type="email" className="w-full text-[13.5px] border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 transition-all font-bold text-gray-900" defaultValue="john@example.com" />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                              <h4 className="text-[14px] font-black text-gray-900 flex items-center gap-2">% Discount & Adjustments</h4>
                              <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Discount Type</label>
                                 <div className="flex items-center gap-4 text-[12px] font-bold text-gray-700">
                                    <label className="flex items-center gap-2"><input type="radio" name="d" defaultChecked className="accent-emerald-500"/> Percentage (%)</label>
                                    <label className="flex items-center gap-2"><input type="radio" name="d" className="accent-emerald-500"/> Fixed Amount</label>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Value</label>
                                    <input type="text" className="w-full text-[13.5px] border border-gray-200 rounded-lg px-3 py-2 text-center outline-none focus:border-emerald-500 transition-all font-bold text-gray-900 font-mono" defaultValue="5" />
                                 </div>
                                 <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Reason</label>
                                    <input type="text" className="w-full text-[13.5px] border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-all font-bold text-gray-900" defaultValue="Staff Discount" />
                                 </div>
                              </div>
                           </div>
                           
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                              <h4 className="text-[14px] font-black text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4"/> Notes</h4>
                              <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Internal Notes</label>
                                 <textarea className="w-full h-16 text-[12.5px] border border-gray-200 rounded-lg px-3 py-2 outline-none resize-none focus:border-emerald-500 transition-all font-medium text-gray-900" defaultValue="Special customer - VIP status"></textarea>
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Customer Notes</label>
                                 <textarea className="w-full h-10 text-[12.5px] border border-gray-200 rounded-lg px-3 py-2 outline-none resize-none focus:border-emerald-500 transition-all font-medium text-gray-900" placeholder="Add notes visible on receipt..."></textarea>
                              </div>
                           </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-2">
                           <div className="flex items-center justify-between mb-4">
                              <h4 className="text-[14px] font-black text-gray-900 flex items-center gap-2"><ShoppingBag className="w-4 h-4"/> Items Purchased</h4>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 text-[11px] font-bold text-emerald-600 rounded bg-emerald-50 hover:bg-emerald-100 transition">
                                 <Plus className="w-3 h-3" /> Add Item
                              </button>
                           </div>
                           <table className="w-full text-left">
                              <thead>
                                 <tr className="border-b border-gray-100">
                                    <th className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-[40px]">#</th>
                                    <th className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                    <th className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-[80px]">Qty</th>
                                    <th className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right w-[150px]">Unit Price</th>
                                    <th className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right w-[150px]">Total</th>
                                    <th className="py-2 w-[50px]"></th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {/* Item 1 */}
                                 <tr className="border-b border-gray-50">
                                    <td className="py-3 text-[12px] text-gray-400">1</td>
                                    <td className="py-3">
                                       <span className="text-[13px] font-bold text-gray-900 block">Holcim Cement 50kg</span>
                                       <span className="text-[10px] text-gray-400 font-mono">SKU: HCM-50-001</span>
                                    </td>
                                    <td className="py-3 text-center">
                                       <input type="text" className="w-[50px] text-center text-[13px] border border-gray-200 font-black rounded-lg py-1.5 outline-none focus:border-emerald-500" defaultValue="1" />
                                    </td>
                                    <td className="py-3 text-right">
                                       <div className="flex items-center justify-end font-mono text-[13px] font-bold"><span className="text-[10px] text-gray-400 mr-2 bg-gray-100 px-1 rounded">Rs.</span> <input type="text" className="w-[80px] border-b border-dashed border-gray-300 px-1 focus:border-emerald-500 outline-none text-right" defaultValue="1650.00" /></div>
                                    </td>
                                    <td className="py-3 text-right">
                                       <span className="font-mono text-[13px] font-black">Rs. 1,650.00</span>
                                    </td>
                                    <td className="py-3 text-right pr-2">
                                       <button className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                 </tr>
                                 {/* Item 2 */}
                                 <tr className="border-b border-gray-50">
                                    <td className="py-3 text-[12px] text-gray-400">2</td>
                                    <td className="py-3">
                                       <span className="text-[13px] font-bold text-gray-900 block">Steel Bars 12mm</span>
                                       <span className="text-[10px] text-gray-400 font-mono">SKU: STL-BAR-12-001</span>
                                    </td>
                                    <td className="py-3 text-center">
                                       <input type="text" className="w-[50px] text-center text-[13px] border border-gray-200 font-black rounded-lg py-1.5 outline-none focus:border-emerald-500" defaultValue="1" />
                                    </td>
                                    <td className="py-3 text-right">
                                       <div className="flex items-center justify-end font-mono text-[13px] font-bold"><span className="text-[10px] text-gray-400 mr-2 bg-gray-100 px-1 rounded">Rs.</span> <input type="text" className="w-[80px] border-b border-dashed border-gray-300 px-1 focus:border-emerald-500 outline-none text-right" defaultValue="2500.00" /></div>
                                    </td>
                                    <td className="py-3 text-right">
                                       <span className="font-mono text-[13px] font-black">Rs. 2,500.00</span>
                                    </td>
                                    <td className="py-3 text-right pr-2">
                                       <button className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                 </tr>
                                 {/* Item 3 */}
                                 <tr className="border-b border-gray-50">
                                    <td className="py-3 text-[12px] text-gray-400">3</td>
                                    <td className="py-3">
                                       <span className="text-[13px] font-bold text-gray-900 block">2" Nails 1kg</span>
                                       <span className="text-[10px] text-gray-400 font-mono">SKU: NAIL-02-001</span>
                                    </td>
                                    <td className="py-3 text-center">
                                       <input type="text" className="w-[50px] text-center text-[13px] border border-gray-200 font-black rounded-lg py-1.5 outline-none focus:border-emerald-500" defaultValue="1" />
                                    </td>
                                    <td className="py-3 text-right">
                                       <div className="flex items-center justify-end font-mono text-[13px] font-bold"><span className="text-[10px] text-gray-400 mr-2 bg-gray-100 px-1 rounded">Rs.</span> <input type="text" className="w-[80px] border-b border-dashed border-gray-300 px-1 focus:border-emerald-500 outline-none text-right" defaultValue="450.00" /></div>
                                    </td>
                                    <td className="py-3 text-right">
                                       <span className="font-mono text-[13px] font-black">Rs. 450.00</span>
                                    </td>
                                    <td className="py-3 text-right pr-2">
                                       <button className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                           <div className="pt-2 text-[10px] font-bold text-gray-400 flex items-center justify-between">
                              <span>Showing 3 items</span>
                              <span>Total Items: 3</span>
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* LOWER FIXED FOOTER ONLY FOR VIEW MODE */}
            {activeTab === 'view' && (
               <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-5 px-8 flex items-center justify-end gap-4 animate-in slide-in-from-bottom-2 duration-300">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-emerald-600 hover:bg-emerald-50 transition"><Printer className="w-4 h-4" /> Print Receipt</button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-emerald-600 hover:bg-emerald-50 transition"><Mail className="w-4 h-4" /> Email</button>
                  <button className="flex items-center justify-center w-[42px] h-[42px] border border-gray-200 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"><MoreVertical className="w-4 h-4" /></button>
                  <button onClick={onClose} className="px-6 py-2 ml-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] font-bold shadow-sm transition">Close</button>
               </div>
            )}

            {/* LOWER FIXED FOOTER ONLY FOR EDIT MODE */}
            {activeTab === 'edit' && (
               <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-5 px-8 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                     <Clock className="w-3.5 h-3.5" /> Last edited by Nimal F. at 14:45
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => setActiveTab('view')} className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm"><X className="w-4 h-4"/> Discard Changes</button>
                     <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 rounded-lg text-[13px] font-bold text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20 disabled:opacity-70 disabled:cursor-wait">
                        {isSaving ? (
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                           <CheckCircle className="w-4 h-4"/>
                        )}
                        {isSaving ? 'Saving Updates...' : 'Save Changes'}
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
