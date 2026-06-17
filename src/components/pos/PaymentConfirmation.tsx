'use client';

import { CheckCircle2, ArrowLeft, Printer, X, Clock, User, Package, Receipt, CreditCard, Banknote, Smartphone, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import api from '@/api/axiosInstance';
import { toast } from 'sonner';

type PaymentConfirmationProps = {
  onBack: () => void;
  onProcess: () => void;
  items: { id: string, name: string, price: number, qty: number, img: string, warehouseId?: string, branchId?: string }[];
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
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

// ── PDF Invoice Generator ─────────────────────────────────────────────────────
function downloadInvoicePDF({
  items, customerName, customerPhone, customerType, paymentMethod, amountTendered, change,
  subtotal, discount, tax, total, notes,
}: Omit<PaymentConfirmationProps, 'onBack' | 'onProcess'>) {
  const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const itemRows = items.map((item, i) => `
    <tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:10px 8px;color:#6b7280;font-size:12px;">${i + 1}</td>
      <td style="padding:10px 8px;">
        <div style="font-weight:700;color:#111827;font-size:13px;">${item.name}</div>
      </td>
      <td style="padding:10px 8px;text-align:center;font-weight:700;color:#111827;font-size:13px;">${item.qty}</td>
      <td style="padding:10px 8px;text-align:right;color:#374151;font-size:13px;font-family:monospace;">Rs. ${item.price.toLocaleString()}</td>
      <td style="padding:10px 8px;text-align:right;font-weight:800;color:#111827;font-size:13px;font-family:monospace;">Rs. ${(item.price * item.qty).toLocaleString()}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoiceNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#f9fafb; color:#111827; }
    .page { max-width:780px; margin:0 auto; background:#fff; padding:48px; }

    /* Header */
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; }
    .brand-name { font-size:26px; font-weight:900; color:#059669; letter-spacing:-0.5px; }
    .brand-sub  { font-size:11px; color:#6b7280; font-weight:500; margin-top:2px; }
    .invoice-label { text-align:right; }
    .invoice-label h2 { font-size:22px; font-weight:900; color:#111827; letter-spacing:-0.5px; }
    .invoice-label p  { font-size:12px; color:#6b7280; font-weight:500; margin-top:4px; }

    /* Divider */
    .divider { border:none; border-top:2px solid #059669; margin:0 0 30px; opacity:0.25; }

    /* Meta row */
    .meta { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-bottom:32px; }
    .meta-box { background:#f9fafb; border:1px solid #f0f0f0; border-radius:10px; padding:14px 16px; }
    .meta-label { font-size:9px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px; }
    .meta-value { font-size:13px; font-weight:700; color:#111827; }

    /* Items table */
    .section-title { font-size:11px; font-weight:800; color:#059669; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:12px; }
    table { width:100%; border-collapse:collapse; margin-bottom:28px; }
    thead tr { background:#f9fafb; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; }
    thead th { padding:10px 8px; text-align:left; font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; }
    thead th:last-child, thead th:nth-child(4), thead th:nth-child(3) { text-align:right; }
    thead th:nth-child(3) { text-align:center; }

    /* Totals */
    .totals { display:flex; justify-content:flex-end; margin-bottom:28px; }
    .totals-box { width:300px; }
    .total-row { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; font-weight:600; color:#374151; border-bottom:1px solid #f3f4f6; }
    .total-row:last-child { border-bottom:none; }
    .total-row.discount { color:#ef4444; }
    .total-row.tax { color:#059669; }
    .grand-total { display:flex; justify-content:space-between; align-items:center; background:#059669; color:#fff; padding:14px 16px; border-radius:12px; margin-top:10px; }
    .grand-total span:first-child { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; }
    .grand-total span:last-child  { font-size:20px; font-weight:900; font-family:monospace; }

    /* Payment */
    .payment-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:32px; }
    .payment-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:14px 16px; }
    .payment-box .meta-label { color:#059669; }
    .payment-box .meta-value { color:#065f46; }

    /* Notes */
    .notes-box { background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:14px 16px; margin-bottom:32px; }
    .notes-box .meta-label { color:#d97706; margin-bottom:6px; }
    .notes-text { font-size:13px; color:#92400e; font-weight:500; }

    /* Footer */
    .footer { text-align:center; padding-top:24px; border-top:1px solid #f0f0f0; }
    .footer p { font-size:12px; color:#9ca3af; font-weight:500; }
    .footer .thank-you { font-size:15px; font-weight:800; color:#059669; margin-bottom:4px; }

    @media print {
      body { background:#fff; }
      .page { padding:32px; max-width:100%; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand-name">Hardware POS</div>
      <div class="brand-sub">Hardware & Building Materials</div>
    </div>
    <div class="invoice-label">
      <h2>INVOICE</h2>
      <p>${invoiceNo}</p>
    </div>
  </div>
  <hr class="divider" />

  <!-- Meta -->
  <div class="meta">
    <div class="meta-box">
      <div class="meta-label">Date &amp; Time</div>
      <div class="meta-value">${dateStr}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px;">${timeStr}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Customer</div>
      <div class="meta-value">${customerName || 'Walk-in Customer'}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px;">${customerPhone || customerType}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Payment Method</div>
      <div class="meta-value" style="text-transform:capitalize;">${paymentMethod}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px;">Status: Paid</div>
    </div>
  </div>

  <!-- Items -->
  <div class="section-title">Items Purchased</div>
  <table>
    <thead>
      <tr>
        <th style="width:36px;">#</th>
        <th>Product</th>
        <th style="width:60px;text-align:center;">Qty</th>
        <th style="width:120px;text-align:right;">Unit Price</th>
        <th style="width:120px;text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

      <div class="totals">
    <div class="totals-box">
      <div class="total-row">
        <span>Subtotal</span>
        <span style="font-family:monospace;">Rs. ${subtotal.toLocaleString()}</span>
      </div>
      ${discount > 0 ? `<div class="total-row discount"><span>Discount</span><span style="font-family:monospace;">-Rs. ${discount.toLocaleString()}</span></div>` : ''}
      <div class="grand-total">
        <span>Grand Total</span>
        <span>Rs. ${total.toLocaleString()}</span>
      </div>
    </div>
  </div>

  <!-- Payment Details -->
  <div class="section-title">Payment Details</div>
  <div class="payment-grid">
    <div class="payment-box">
      <div class="meta-label">Amount Tendered</div>
      <div class="meta-value" style="font-family:monospace;">Rs. ${amountTendered.toLocaleString()}</div>
    </div>
    <div class="payment-box">
      <div class="meta-label">Change Returned</div>
      <div class="meta-value" style="font-family:monospace;">Rs. ${change.toLocaleString()}</div>
    </div>
    <div class="payment-box">
      <div class="meta-label">Total Items</div>
      <div class="meta-value">${items.length} item${items.length !== 1 ? 's' : ''}</div>
    </div>
  </div>

  ${notes && notes !== 'No special instructions provided.' ? `
  <div class="notes-box">
    <div class="meta-label">Special Instructions</div>
    <div class="notes-text">${notes}</div>
  </div>` : ''}

  <!-- Footer -->
  <div class="footer">
    <p class="thank-you">Thank you for your purchase!</p>
    <p>Please retain this invoice for your records &bull; Returns accepted within 7 days with receipt</p>
    <p style="margin-top:8px;font-size:10px;color:#d1d5db;">Generated on ${dateStr} at ${timeStr} &bull; ${invoiceNo}</p>
  </div>

</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (!win) {
    toast.error('Popup blocked. Please allow popups for this site to download the invoice.');
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentConfirmation({ 
  onBack, 
  onProcess, 
  items,
  customerId,
  customerName,
  customerPhone,
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
  const [processing, setProcessing] = useState(false);

  // Live cashier info from Redux auth state
  const authUser = useSelector((state: RootState) => state.auth?.user as any);
  const cashierName = authUser?.name || authUser?.fullName || authUser?.username || authUser?.email || 'Cashier';
  const tillNumber  = authUser?.tillNumber || authUser?.till || 'Till #1';

  // Stable invoice reference for this session (regenerates only on mount)
  const invoiceRef = useMemo(() => {
    const now = new Date();
    const yy  = now.getFullYear().toString().slice(-2);
    const mm  = String(now.getMonth() + 1).padStart(2, '0');
    const dd  = String(now.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `INV-${yy}${mm}${dd}-${seq}`;
  }, []);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.qty,
          unitPrice: item.price,
          warehouseId: item.warehouseId,
          branchId: item.branchId,
        })),
        subtotal,
        discount,
        tax,
        total,
        paidAmount: amountTendered,
        change,
        paymentMethod: paymentMethod.toUpperCase(),
        notes,
        customerId,
      };
      console.log('[POS Checkout] Sending payload:', payload);
      await api.post('/sales/checkout', payload);
      onProcess(); // triggers success modal
    } catch (err: any) {
      console.error('[POS Checkout Error]', err?.response?.data || err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Checkout failed. Please try again. Check console for details.';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
      {/* LEFT COLUMN: Details */}
      <div className="flex-1 lg:overflow-y-auto p-4 sm:p-6 lg:p-10 bg-gray-50/30">
        
        {/* Header */}
        <div className="flex items-start gap-4 sm:gap-6 mb-8 lg:mb-10">
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-[13px] hover:bg-gray-50 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#059669] flex items-center justify-center text-white shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Confirm Payment</h1>
                <p className="text-[13px] font-medium text-gray-500 mt-1">Review and confirm payment details</p>
              </div>
            </div>
            <p className="text-[12px] font-medium text-gray-400 mt-4 flex items-center gap-1.5 sm:ml-14">
               <Clock className="w-3.5 h-3.5" /> Estimated time: 2-3 min
            </p>
          </div>
        </div>

        <div className="space-y-6 max-w-3xl sm:ml-14">
          
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-gray-50 pb-4">
              <h3 className="text-[14px] font-black tracking-tight text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100">
                  <User className="w-3.5 h-3.5" />
                </span>
                Customer Information
              </h3>
              <button 
                onClick={() => downloadInvoicePDF({ items, customerName, customerPhone, customerType, paymentMethod, amountTendered, change, subtotal, discount, tax, total, notes })}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#059669] text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm self-start sm:self-auto"
              >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Name / ID</p>
                <p className="text-[14px] font-bold text-gray-900">{customerName || 'Walk-in Customer'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                <p className="text-[14px] font-bold text-gray-900">{customerPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Type</p>
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                    {customerType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-black tracking-tight text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100">
                <Package className="w-3.5 h-3.5" />
              </span>
              Items Summary
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] font-semibold text-gray-500 uppercase">Unit Price: Rs. {item.price.toLocaleString()}</p>
                      </div>
                  </div>
                  <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end w-full sm:w-auto">
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
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100">
                <Receipt className="w-3.5 h-3.5" />
              </span>
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
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100">
                <CreditCard className="w-3.5 h-3.5" />
              </span>
              Payment Details
            </h3>
            <div className="space-y-3 pb-4 border-b border-gray-100">
              <div className="flex justify-between text-[13px] font-bold text-gray-600">
                <span>Payment Method</span>
                <span className="flex items-center gap-1.5 text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 capitalize">
                   {paymentMethod === 'cash' ? <Banknote className="w-3.5 h-3.5" /> : paymentMethod === 'card' ? <CreditCard className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />} {paymentMethod}
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
               <FileText className="w-4 h-4 text-[#059669]" /> Special Instructions <span className="text-[11px] font-normal text-gray-400 ml-1">(Optional)</span>
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
      <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col p-6 shadow-xl relative z-10 shrink-0">
        
        <div className="bg-[#059669] rounded-2xl p-6 text-white shadow-md mb-6 mt-4 lg:mb-auto lg:mt-6">
           <h3 className="text-[15px] font-black tracking-tight mb-6">Transaction Summary</h3>
           <div className="space-y-4 mb-6 text-[12px] font-bold text-emerald-100">
             <div className="flex justify-between">
                <span>Invoice Ref.</span>
                <span className="text-white font-mono text-[11px]">{invoiceRef}</span>
             </div>
             <div className="flex justify-between">
                <span>Cashier</span>
                <span className="text-white">{cashierName}</span>
             </div>
             <div className="flex justify-between">
                <span>Payment Method</span>
                <span className="text-white capitalize">{paymentMethod}</span>
             </div>
             <div className="flex justify-between">
                <span>Total Items</span>
                <span className="text-white">{items.length}</span>
             </div>
           </div>
           
           <div className="pt-4 border-t border-emerald-500 flex items-center justify-between">
              <span className="text-[14px] font-black">Amount Due</span>
              <span className="text-[20px] font-black">Rs. {total.toLocaleString()}</span>
           </div>
        </div>

        {/* Download Invoice */}
        <button
          onClick={() => downloadInvoicePDF({ items, customerName, customerPhone, customerType, paymentMethod, amountTendered, change, subtotal, discount, tax, total, notes })}
          className="mt-4 w-full h-11 border border-[#059669] text-[#059669] font-bold text-[13px] rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" /> Download Invoice PDF
        </button>

        {/* Action Footer */}
        <div className="pt-4 mt-4 border-t border-gray-100 flex items-center gap-3">
           <button 
             onClick={onBack}
             className="flex-1 h-14 px-3 border border-red-200 text-red-500 font-bold text-[12px] leading-tight rounded-xl hover:bg-red-50 transition-colors bg-white flex items-center justify-center gap-2"
           >
             <X className="w-5 h-5 shrink-0" strokeWidth={2.5} />
             <span className="text-left">Cancel<br/>Transaction</span>
           </button>
           <button 
             onClick={handleProcess}
             disabled={processing}
             className="flex-[1.5] h-14 bg-[#059669] hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
           >
             <CheckCircle2 className="w-5 h-5" /> {processing ? 'Processing...' : 'Process Payment'}
           </button>
        </div>

      </div>
    </div>
  );
}
