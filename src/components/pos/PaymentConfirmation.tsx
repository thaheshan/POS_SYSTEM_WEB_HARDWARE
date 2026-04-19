'use client';

import { CheckCircle2, ArrowLeft, Printer, X } from 'lucide-react';

type PaymentConfirmationProps = {
  onBack: () => void;
  onProcess: () => void;
  items: { id: string, name: string, price: number, qty: number, img: string }[];
  customerType: string;
  paymentMethod: string;
  amountTendered: number;
  change: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
};

export default function PaymentConfirmation({ 
  onBack, 
  onProcess, 
  items,
  customerType,
  paymentMethod,
  amountTendered,
  change,
  subtotal, 
  discount,
  tax, 
  total,
  notes
}: PaymentConfirmationProps) {
  return (
    <div className="flex-1 bg-white flex h-full">
      {/* LEFT COLUMN: Details */}
      <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30">
        
        {/* Header */}
        <div className="flex items-start gap-6 mb-10">
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-[13px] hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#059669] flex items-center justify-center text-white shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Confirm Payment</h1>
                <p className="text-[13px] font-medium text-gray-500 mt-1">Review and confirm payment details</p>
              </div>
            </div>
            <p className="text-[12px] font-medium text-gray-400 mt-4 flex items-center gap-1.5 ml-14">
               🕒 Estimated time: 2-3 min
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-3xl ml-14">
          
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative">
            <h3 className="text-[14px] font-black tracking-tight text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100 text-[11px]">👤</span>
              Customer Information
            </h3>
            <button className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                <Printer className="w-3.5 h-3.5" /> Print Receipt
            </button>
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Name / ID</p>
                <p className="text-[14px] font-bold text-gray-900">Walk-in Customer / {customerType}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-[14px] font-bold text-gray-900">Verified</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Type</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                  {customerType}
                </span>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-black tracking-tight text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100 text-[11px]">📦</span>
              Items Summary
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50/50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase">Unit Price: Rs. {item.price.toLocaleString()}</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-[12px] font-bold text-gray-500">Qty: {item.qty}</p>
                      <p className="text-[14px] font-black text-gray-900">Rs. {(item.price * item.qty).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4 text-[13px] font-semibold text-gray-500">
               Total Items: <span className="font-bold text-gray-900">{items.length}</span>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-black tracking-tight text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100 text-[11px]">🧾</span>
              Billing Summary
            </h3>
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-[13px] font-bold text-gray-600">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-gray-600">
                <span>Tax (15%)</span>
                <span>Rs. {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-red-500">
                <span>Discount</span>
                <span>-Rs. {discount.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
               <span className="text-[15px] font-black text-gray-900">Grand Total</span>
               <span className="text-[18px] font-black text-[#059669]">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-black tracking-tight text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100 text-[11px]">💳</span>
              Payment Details
            </h3>
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-[13px] font-bold text-gray-600">
                <span>Payment Method</span>
                <span className="flex items-center gap-1.5 text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 capitalize">
                   {paymentMethod === 'cash' ? '💵' : paymentMethod === 'card' ? '💳' : '📱'} {paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-[13px] font-bold text-gray-600">
                <span>Amount Tendered</span>
                <span>Rs. {amountTendered.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
               <span className="text-[15px] font-black text-gray-900">Change</span>
               <span className="text-[16px] font-black text-[#059669]">Rs. {change.toLocaleString()}</span>
            </div>
          </div>

          {/* Ready to Process Status */}
          <div className="bg-[#059669] rounded-2xl p-5 flex items-center gap-4 text-white shadow-md">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
               <CheckCircle2 className="w-6 h-6 text-[#059669]" />
             </div>
             <div>
                <h4 className="text-[15px] font-black tracking-tight">Ready to Process Payment</h4>
                <p className="text-[13px] font-medium text-white/80 mt-0.5">All details verified and ready for processing</p>
             </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
             <h3 className="text-[13px] font-black tracking-tight text-gray-900 mb-3 flex items-center gap-2">
               📝 Special Instructions <span className="text-[11px] font-normal text-gray-400 ml-1">(Optional)</span>
             </h3>
             <textarea 
               rows={2} 
               value={notes || "No special instructions provided."} 
               className="w-full text-[13px] text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-4 outline-none resize-none bg-transparent"
               readOnly
            />
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: Transaction Summary Panel */}
      <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col p-6 shadow-xl relative z-10">
        
        <div className="bg-[#059669] rounded-2xl p-6 text-white shadow-md mb-auto mt-6">
           <h3 className="text-[15px] font-black tracking-tight mb-6">Transaction Summary</h3>
           <div className="space-y-4 mb-6 text-[12px] font-bold text-emerald-100">
             <div className="flex justify-between">
                <span>Transaction ID</span>
                <span className="text-white">TXN-20268-001234</span>
             </div>
             <div className="flex justify-between">
                <span>Cashier</span>
                <span className="text-white">Nimal Fernando</span>
             </div>
             <div className="flex justify-between">
                <span>Till Number</span>
                <span className="text-white">Till #1</span>
             </div>
           </div>
           
           <div className="pt-4 border-t border-emerald-500 flex items-center justify-between">
              <span className="text-[14px] font-black">Amount Due</span>
              <span className="text-[20px] font-black">Rs. {total.toLocaleString()}</span>
           </div>
        </div>

        {/* Action Footer */}
        <div className="pt-6 mt-6 border-t border-gray-100 flex items-center gap-3">
           <button 
             onClick={onBack}
             className="flex-1 py-4 border border-red-200 text-red-500 font-bold text-[14px] rounded-xl hover:bg-red-50 transition-colors bg-white flex items-center justify-center gap-2"
           >
             <X className="w-4 h-4" strokeWidth={3} /> Cancel Transaction
           </button>
           <button 
             onClick={onProcess}
             className="flex-[1.5] py-4 bg-[#059669] hover:bg-emerald-700 text-white font-bold text-[14px] rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
           >
             <CheckCircle2 className="w-5 h-5" /> Process Payment
           </button>
        </div>

      </div>
    </div>
  );
}
