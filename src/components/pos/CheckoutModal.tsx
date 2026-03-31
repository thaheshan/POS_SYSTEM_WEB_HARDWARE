'use client';

import { X, SearchIcon, Banknote, CreditCard, Smartphone, ChevronDown, Info, Gift, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  onComplete: () => void;
};

export default function CheckoutModal({ isOpen, onClose, subtotal, onComplete }: CheckoutModalProps) {
  const [customerMode, setCustomerMode] = useState<'walkin' | 'new'>('walkin');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('25000');
  const [isDiscountOpen, setIsDiscountOpen] = useState(true);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  if (!isOpen) return null;

  const change = Math.max(0, Number(amountPaid) - subtotal);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[24px] w-full max-w-[500px] shadow-2xl relative my-8 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>

        <div className="p-6 pb-0 overflow-y-auto flex-1 scrollbar-hide space-y-6">
          
          {/* Select Customer */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-black tracking-tight text-gray-900">Select Customer</h3>
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#059669]" />
              <input 
                type="text" 
                placeholder="Type customer name or phone" 
                className="w-full border border-emerald-100 bg-emerald-50/30 rounded-xl py-3 pl-11 pr-4 text-[13px] outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setCustomerMode('walkin')}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-colors ${
                  customerMode === 'walkin' 
                    ? 'border-[#059669] text-[#059669] bg-emerald-50/50' 
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Walk-In Customer
              </button>
              <button 
                onClick={() => setCustomerMode('new')}
                className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border transition-colors ${
                  customerMode === 'new' 
                    ? 'border-[#d97706] text-[#d97706] bg-amber-50/50' 
                    : 'border-gray-200 text-[#d97706] hover:bg-amber-50'
                }`}
              >
                + New
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-2">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-bold transition-all ${
                  paymentMethod === 'cash' 
                    ? 'bg-[#059669] border-[#059669] text-white shadow-md' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Banknote className="w-4 h-4" /> Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-bold transition-all ${
                  paymentMethod === 'card' 
                    ? 'bg-[#059669] border-[#059669] text-white shadow-md' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button 
                onClick={() => setPaymentMethod('mobile')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-[13px] font-bold transition-all ${
                  paymentMethod === 'mobile' 
                    ? 'bg-[#059669] border-[#059669] text-white shadow-md' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Mobile
              </button>
            </div>
          </div>

          {/* Amount Paid */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[13px] font-black tracking-tight text-gray-900">Amount Paid</h3>
            <input 
              type="number" 
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl py-3 px-4 text-[15px] font-bold text-gray-900 outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all"
            />
            
            <div className="w-full bg-emerald-100/60 border border-emerald-200/60 rounded-xl py-3.5 px-4 flex items-center justify-between">
               <span className="text-[14px] font-medium text-emerald-800 tracking-tight">Change</span>
               <span className="text-[16px] font-bold text-[#059669]">Rs. {change.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3 pt-2">
            <h3 className="text-[13px] font-black tracking-tight text-gray-900">Notes</h3>
            <textarea 
              rows={2}
              placeholder="Add order notes..."
              className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl py-3 px-4 text-[13px] text-gray-700 outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] transition-all resize-none"
            />
          </div>

          {/* Apply Discount Accordion */}
          <div className="pt-2">
            <button 
              onClick={() => setIsDiscountOpen(!isDiscountOpen)}
              className="w-full flex items-center justify-between py-2 group"
            >
              <h3 className="text-[13px] font-black tracking-tight text-gray-900">Apply Discount</h3>
              <div className="flex items-center gap-2">
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDiscountOpen ? 'rotate-180' : ''}`} />
                <div className="w-[18px] h-[18px] rounded-full bg-gray-200 flex items-center justify-center text-white">
                  <Info className="w-3 h-3 text-white fill-gray-400" />
                </div>
              </div>
            </button>
            
            {isDiscountOpen && (
              <div className="pt-4 pb-2 space-y-4">
                
                {/* Discount Type */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-wider uppercase text-gray-900">Discount Type</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDiscountType('percentage')}
                      className={`flex-1 py-2.5 rounded-lg text-[12px] font-bold border transition-colors ${
                        discountType === 'percentage' 
                          ? 'bg-[#059669] border-[#059669] text-white shadow-sm' 
                          : 'bg-white border-emerald-200 text-[#059669] hover:bg-emerald-50'
                      }`}
                    >
                      % Percentage %
                    </button>
                    <button 
                      onClick={() => setDiscountType('fixed')}
                      className={`flex-1 py-2.5 rounded-lg text-[12px] font-bold border transition-colors ${
                        discountType === 'fixed' 
                          ? 'bg-[#059669] border-[#059669] text-white shadow-sm' 
                          : 'bg-white border-emerald-200 text-[#059669] hover:bg-emerald-50'
                      }`}
                    >
                      $ Fixed Amount
                    </button>
                  </div>
                </div>

                {/* Discount Value */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-wider uppercase text-gray-900">Discount Value</h4>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="number" 
                        placeholder="" 
                        className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-[13px] font-semibold text-gray-900 outline-none focus:border-[#059669] transition-all text-right pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-[13px]">{discountType === 'percentage' ? '%' : 'Rs.'}</span>
                    </div>
                    <button className="bg-[#d97706] hover:bg-amber-600 text-white font-bold text-[13px] px-6 rounded-lg shadow-sm transition-colors cursor-pointer">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Quick Discount */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black tracking-wider uppercase text-gray-900">Quick Discount</h4>
                  <div className="grid grid-cols-2 gap-2">
                     <button className="border border-gray-200 hover:border-gray-300 rounded-lg py-2 flex flex-col items-center justify-center transition-colors">
                        <span className="text-[11px] font-bold text-gray-700">Staff</span>
                        <span className="text-[10px] font-bold text-gray-400">10%</span>
                     </button>
                     <button className="border border-gray-200 hover:border-gray-300 rounded-lg py-2 flex flex-col items-center justify-center transition-colors">
                        <span className="text-[11px] font-bold text-gray-700">Seasonal</span>
                        <span className="text-[10px] font-bold text-gray-400">5%</span>
                     </button>
                     <button className="border border-gray-200 hover:border-gray-300 rounded-lg py-2 flex flex-col items-center justify-center transition-colors">
                        <span className="text-[11px] font-bold text-gray-700">Loyalty</span>
                        <span className="text-[10px] font-bold text-gray-400">Rs. 500</span>
                     </button>
                     <button className="border border-gray-200 hover:border-gray-300 rounded-lg py-2 flex flex-col items-center justify-center transition-colors">
                        <span className="text-[11px] font-bold text-gray-700">Clearance</span>
                        <span className="text-[10px] font-bold text-gray-400">15%</span>
                     </button>
                  </div>
                </div>

              </div>
            )}
          </div>
          
          {/* Rules / No discounts */}
          <div className="pt-2 pb-6">
             <div className="flex flex-col items-center justify-center py-6">
               <Gift className="w-10 h-10 text-gray-200 mb-2" />
               <p className="text-[12px] font-bold text-gray-400">No discounts applied yet</p>
             </div>
             
             <div className="space-y-3 mt-2">
               <h4 className="text-[11px] font-black tracking-wider uppercase text-gray-900">Discount Rules</h4>
               <ul className="space-y-3">
                 <li className="flex gap-2 items-start">
                   <Info className="w-4 h-4 text-[#d97706] fill-amber-100 shrink-0 mt-0.5" />
                   <span className="text-[12px] text-gray-600 font-medium">Maximum discount limit: 50% of total bill</span>
                 </li>
                 <li className="flex gap-2 items-start">
                   <Info className="w-4 h-4 text-[#d97706] fill-amber-100 shrink-0 mt-0.5" />
                   <span className="text-[12px] text-gray-600 font-medium">Multiple discounts can be applied together</span>
                 </li>
                 <li className="flex gap-2 items-start">
                   <Info className="w-4 h-4 text-[#d97706] fill-amber-100 shrink-0 mt-0.5" />
                   <span className="text-[12px] text-gray-600 font-medium">Staff discount requires authorization</span>
                 </li>
                 <li className="flex gap-2 items-start">
                   <Info className="w-4 h-4 text-[#d97706] fill-amber-100 shrink-0 mt-0.5" />
                   <span className="text-[12px] text-gray-600 font-medium">No discount on already discounted items</span>
                 </li>
               </ul>
             </div>
          </div>
        </div>

        {/* Modal Footer / Totals */}
        <div className="p-6 pt-5 bg-white border-t-4 border-[#059669] rounded-b-[24px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[13px] font-bold text-gray-500">Subtotal</span>
            <span className="text-[13px] font-bold text-gray-900">Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-bold text-[#059669]">Total Discount</span>
            <span className="text-[13px] font-bold text-[#059669]">-Rs. 0.00</span>
          </div>
          <div className="flex justify-between items-center mb-6 pt-3 border-t border-dashed border-gray-200">
            <span className="text-[15px] font-black uppercase tracking-widest text-[#059669]">FINAL TOTAL</span>
            <span className="text-[16px] font-black text-[#059669]">Rs. {subtotal.toLocaleString()}</span>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onComplete}
              className="w-full bg-[#059669] hover:bg-emerald-700 text-white font-bold text-[15px] py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Complete
            </button>
            <div className="flex gap-3">
               <button className="flex-1 border-none bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-[13px] py-3 rounded-xl transition-colors shrink-0">
                  || Hold
               </button>
               <button className="flex-1 border-none bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-[13px] py-3 rounded-xl transition-colors shrink-0">
                  🖨 Print
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
