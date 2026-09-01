"use client";

import {
  CheckCircle2,
  ArrowLeft,
  Printer,
  X,
  Clock,
  User,
  Package,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  AlertCircle,
  MessageSquare,
  Zap,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import CustomerSearch from "@/components/pos/CustomerSearch";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/api/axiosInstance";
import { shopApi } from "@/api/shop";
import { toastError, toastSuccess, toastInfo } from "@/lib/toast";
import {
  openCashDrawer,
  printThermalReceipt,
  HardwarePrintReceiptPayload,
} from "@/utils/hardwareIntegration";
import { sendCreditPurchaseSMS } from "@/utils/textlkSmsService";

type PaymentConfirmationProps = {
  onBack: () => void;
  onProcess: () => void;
  items: {
    id: string;
    name: string;
    price: number;
    qty: number;
    img: string;
    warehouseId?: string;
    branchId?: string;
    warehouseName?: string;
    discountAmount?: number;
    discountPercentage?: number;
  }[];
  selectedCustomer: any;
  onSelectCustomer: (customer: any) => void;
  onAddNewCustomer: () => void;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerType: string;
  paymentMethod: string;
  amountTendered: number;
  change: number;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  orderDiscountType?: "percentage" | "fixed";
  orderDiscountValue?: number;
};

// ── PDF Invoice Generator ─────────────────────────────────────────────────────
function downloadInvoicePDF({
  storeName,
  items,
  customerName,
  customerPhone,
  customerType,
  paymentMethod,
  amountTendered,
  change,
  subtotal,
  discount,
  total,
  notes,
}: {
  storeName?: string;
  items: PaymentConfirmationProps["items"];
  customerName?: string;
  customerPhone?: string;
  customerType: string;
  paymentMethod: string;
  amountTendered: number;
  change: number;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  orderDiscountType?: "percentage" | "fixed";
  orderDiscountValue?: number;
}) {
  const invoiceNo = `INV-${Date.now().toString().slice(-8)}`;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const grossSubtotalPdf = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemDiscountsTotalPdf = items.reduce(
    (sum, item) => sum + (item.discountAmount ?? 0) * item.qty,
    0
  );

  const itemRows = items
    .map((item, i) => {
      const itemDiscount = item.discountAmount ?? 0;
      const finalUnitPrice = item.price - itemDiscount;
      const finalLineTotal = finalUnitPrice * item.qty;

      return `
    <tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:10px 8px;color:#6b7280;font-size:12px;">${i + 1}</td>
      <td style="padding:10px 8px;">
        <div style="font-weight:700;color:#111827;font-size:13px;">${item.name}</div>
        ${
          itemDiscount > 0
            ? `<div style="font-size:11px;color:#ef4444;font-weight:500;">Discount applied: -Rs. ${itemDiscount.toLocaleString()} (${item.discountPercentage?.toFixed(0)}%)</div>`
            : ""
        }
      </td>
      <td style="padding:10px 8px;text-align:center;font-weight:700;color:#111827;font-size:13px;">${item.qty}</td>
      <td style="padding:10px 8px;text-align:right;color:#374151;font-size:13px;font-family:monospace;">
        ${
          itemDiscount > 0
            ? `<span style="text-decoration:line-through;color:#9ca3af;font-size:11px;margin-right:4px;">Rs. ${item.price.toLocaleString()}</span>`
            : ""
        }
        Rs. ${finalUnitPrice.toLocaleString()}
      </td>
      <td style="padding:10px 8px;text-align:right;font-weight:800;color:#111827;font-size:13px;font-family:monospace;">Rs. ${finalLineTotal.toLocaleString()}</td>
    </tr>
  `;
    })
    .join("");

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
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; }
    .brand-name { font-size:26px; font-weight:900; color:#059669; letter-spacing:-0.5px; }
    .brand-sub  { font-size:11px; color:#6b7280; font-weight:500; margin-top:2px; }
    .invoice-label { text-align:right; }
    .invoice-label h2 { font-size:22px; font-weight:900; color:#111827; letter-spacing:-0.5px; }
    .invoice-label p  { font-size:12px; color:#6b7280; font-weight:500; margin-top:4px; }
    .divider { border:none; border-top:2px solid #059669; margin:0 0 30px; opacity:0.25; }
    .meta { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-bottom:32px; }
    .meta-box { background:#f9fafb; border:1px solid #f0f0f0; border-radius:10px; padding:14px 16px; }
    .meta-label { font-size:9px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px; }
    .meta-value { font-size:13px; font-weight:700; color:#111827; }
    .section-title { font-size:11px; font-weight:800; color:#059669; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:12px; }
    table { width:100%; border-collapse:collapse; margin-bottom:28px; }
    thead tr { background:#f9fafb; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; }
    thead th { padding:10px 8px; text-align:left; font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; }
    thead th:last-child, thead th:nth-child(4), thead th:nth-child(3) { text-align:right; }
    thead th:nth-child(3) { text-align:center; }
    .totals { display:flex; justify-content:flex-end; margin-bottom:28px; }
    .totals-box { width:300px; }
    .total-row { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; font-weight:600; color:#374151; border-bottom:1px solid #f3f4f6; }
    .total-row:last-child { border-bottom:none; }
    .total-row.discount { color:#ef4444; }
    .grand-total { display:flex; justify-content:space-between; align-items:center; background:#059669; color:#fff; padding:14px 16px; border-radius:12px; margin-top:10px; }
    .grand-total span:first-child { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; }
    .grand-total span:last-child  { font-size:20px; font-weight:900; font-family:monospace; }
    .payment-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:32px; }
    .payment-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:14px 16px; }
    .payment-box .meta-label { color:#059669; }
    .payment-box .meta-value { color:#065f46; }
    .notes-box { background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:14px 16px; margin-bottom:32px; }
    .notes-box .meta-label { color:#d97706; margin-bottom:6px; }
    .notes-text { font-size:13px; color:#92400e; font-weight:500; }
    .footer { text-align:center; padding-top:24px; border-top:1px solid #f0f0f0; }
    .footer p { font-size:12px; color:#9ca3af; font-weight:500; }
    .footer .thank-you { font-size:15px; font-weight:800; color:#059669; margin-bottom:4px; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-name">${storeName || "Futura Hardware POS"}</div>
      <div class="brand-sub">Hardware &amp; Building Materials Management</div>
    </div>
    <div class="invoice-label">
      <h2>INVOICE</h2>
      <p>${invoiceNo}</p>
    </div>
  </div>
  <hr class="divider" />
  <div class="meta">
    <div class="meta-box">
      <div class="meta-label">Date &amp; Time</div>
      <div class="meta-value">${dateStr}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px;">${timeStr}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Customer</div>
      <div class="meta-value">${customerName || "Walk-in Customer"}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px;">${customerPhone || customerType}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Payment Method</div>
      <div class="meta-value" style="text-transform:capitalize;">${paymentMethod}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:2px;">Status: ${
        paymentMethod.toLowerCase() === "credit" ? "Credit Sale" : "Paid"
      }</div>
    </div>
  </div>

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
      ${
        itemDiscountsTotalPdf > 0
          ? `
      <div class="total-row">
        <span>Items Total (before discounts)</span>
        <span style="font-family:monospace;">Rs. ${grossSubtotalPdf.toLocaleString()}</span>
      </div>
      <div class="total-row discount">
        <span>Item Discounts</span>
        <span style="font-family:monospace;">-Rs. ${itemDiscountsTotalPdf.toLocaleString()}</span>
      </div>
      `
          : ""
      }
      <div class="total-row">
        <span>Subtotal</span>
        <span style="font-family:monospace;">Rs. ${subtotal.toLocaleString()}</span>
      </div>
      ${
        discount > 0
          ? `
      <div class="total-row discount">
        <span>Order Discount</span>
        <span style="font-family:monospace;">-Rs. ${discount.toLocaleString()}</span>
      </div>
      `
          : ""
      }
      <div class="grand-total">
        <span>Grand Total</span>
        <span>Rs. ${total.toLocaleString()}</span>
      </div>
    </div>
  </div>

  <div class="section-title">Payment Details</div>
  <div class="payment-grid">
    <div class="payment-box">
      <div class="meta-label">Amount Tendered / Paid</div>
      <div class="meta-value" style="font-family:monospace;">Rs. ${amountTendered.toLocaleString()}</div>
    </div>
    <div class="payment-box">
      <div class="meta-label">Change / Credit Leftover</div>
      <div class="meta-value" style="font-family:monospace;">Rs. ${change.toLocaleString()}</div>
    </div>
    <div class="payment-box">
      <div class="meta-label">Total Items</div>
      <div class="meta-value">${items.length} item${items.length !== 1 ? "s" : ""}</div>
    </div>
  </div>

  ${
    notes && notes !== "No special instructions provided."
      ? `
  <div class="notes-box">
    <div class="meta-label">Special Instructions</div>
    <div class="notes-text">${notes}</div>
  </div>`
      : ""
  }

  <div class="footer">
    <p class="thank-you">Thank you for shopping at ${storeName || "Futura Hardware"}!</p>
    <p>Please retain this invoice for your records &bull; futurahardware.com</p>
    <p style="margin-top:8px;font-size:10px;color:#d1d5db;">Generated on ${dateStr} at ${timeStr} &bull; ${invoiceNo}</p>
  </div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    toastError(
      new Error("Your browser blocked the invoice window. Please allow pop-ups for this site and try again.")
    );
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentConfirmation({
  onBack,
  onProcess,
  items,
  selectedCustomer,
  onSelectCustomer,
  onAddNewCustomer,
  customerId,
  customerName,
  customerPhone,
  customerType,
  paymentMethod,
  amountTendered,
  change,
  subtotal,
  discount,
  total,
  notes,
}: PaymentConfirmationProps) {
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>(paymentMethod || "cash");
  const [creditPaidInput, setCreditPaidInput] = useState<string>("0");
  const [customerAccount, setCustomerAccount] = useState<any>(null);
  const [shopProfile, setShopProfile] = useState<any>(null);

  // Live cashier & shop info from Redux auth state profile & Shop API
  const authUser = useSelector((state: RootState) => state.auth?.user as any);

  useEffect(() => {
    shopApi
      .getProfile()
      .then((data) => {
        if (data?.name) setShopProfile(data);
      })
      .catch(() => {});
  }, []);

  const cashierName =
    authUser?.name ||
    authUser?.fullName ||
    authUser?.username ||
    authUser?.email ||
    "Cashier";

  const storeName =
    shopProfile?.name ||
    authUser?.shop?.name ||
    authUser?.shopName ||
    authUser?.shop_name ||
    authUser?.tenantName ||
    "Futura Hardware & Building Materials";


  // Fetch customer account details if customerId is provided
  useEffect(() => {
    if (customerId) {
      api
        .get(`/customers/${customerId}`)
        .then((res) => {
          const data = res.data?.data || res.data;
          setCustomerAccount(data);
        })
        .catch(() => {});
    }
  }, [customerId]);

  // Stable invoice reference for this session
  const invoiceRef = useMemo(() => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `INV-${yy}${mm}${dd}-${seq}`;
  }, []);

  // Effective payment calculation
  const effectivePaidAmount = useMemo(() => {
    if (selectedMethod.toLowerCase() === "credit") {
      const parsed = parseFloat(creditPaidInput);
      return isNaN(parsed) ? 0 : Math.min(total, Math.max(0, parsed));
    }
    if (selectedMethod.toLowerCase() === "cash") {
      return amountTendered;
    }
    return total;
  }, [selectedMethod, creditPaidInput, amountTendered, total]);

  const isCreditSale = selectedMethod.toLowerCase() === "credit" || effectivePaidAmount < total;
  const creditLeftover = Math.max(0, total - effectivePaidAmount);
  const existingCreditBalance = Number(
    customerAccount?.outstandingBalance || customerAccount?.outstanding_balance || 0
  );
  const newTotalOutstanding = existingCreditBalance + creditLeftover;

  // Execute Hardware Cash Drawer Kick (ESC/POS)
  const handleDrawerKick = async () => {
    toastInfo("Sending Cash Drawer Kick signal...");
    const res = await openCashDrawer();
    if (res.success) {
      toastSuccess("Cash drawer opened!");
    }
  };

  // Execute ESC/POS Thermal Receipt Print
  const handleESCPrint = async () => {
    toastInfo("Printing receipt to thermal printer...");
    const payload: HardwarePrintReceiptPayload = {
      storeName: storeName,
      invoiceNo: invoiceRef,
      date: new Date().toLocaleString("en-GB"),
      cashier: cashierName,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "",
      customerType: customerType,
      paymentMethod: selectedMethod.toUpperCase(),
      items: items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price - (item.discountAmount ?? 0),
        lineTotal: (item.price - (item.discountAmount ?? 0)) * item.qty,
        warehouseName: item.warehouseName,
      })),
      subtotal,
      discount,
      total,
      amountTendered: effectivePaidAmount,
      change: isCreditSale ? 0 : change,
      creditLeftover,
      totalOutstandingCredit: newTotalOutstanding,
      notes,
      openDrawer: selectedMethod.toLowerCase() === "cash",
    };

    const res = await printThermalReceipt(payload);
    if (res.success) {
      toastSuccess(res.message);
    } else {
      // Fallback to browser HTML PDF invoice
      downloadInvoicePDF({
        storeName,
        items,
        customerName,
        customerPhone,
        customerType,
        paymentMethod: selectedMethod,
        amountTendered: effectivePaidAmount,
        change: isCreditSale ? 0 : change,
        creditLeftover,
        totalOutstandingCredit: newTotalOutstanding,
        subtotal,
        discount,
        total,
        notes,
      });
    }
  };

  const handleProcess = async () => {
    // Enforcement: Credit sales require a registered Customer
    if (isCreditSale && (!customerId || customerName === "Walk-in Customer")) {
      toastError(
        new Error(
          "Credit sales require selecting a registered customer account. Please select or add a customer to proceed."
        )
      );
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        invoiceNumber: invoiceRef,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.qty,
          unitPrice: item.price - (item.discountAmount ?? 0),
          warehouseId: item.warehouseId,
          branchId: item.branchId,
        })),
        subtotal,
        discount,
        total,
        paidAmount: effectivePaidAmount,
        change: isCreditSale ? 0 : change,
        paymentMethod: selectedMethod.toUpperCase(),
        notes,
        customerId,
        creditAmountAdded: creditLeftover,
        newTotalOutstanding,
      };

      console.log("[POS Checkout] Submitting transaction payload:", payload);
      await api.post("/sales/checkout", payload);

      // Trigger Cash Drawer Kick on Cash payment
      if (selectedMethod.toLowerCase() === "cash") {
        openCashDrawer();
      }

      // Trigger TEXT.LK Credit SMS Notification if Credit sale
      if (isCreditSale && customerPhone && customerPhone !== "N/A") {
        const itemsSummary = items.map((i) => `${i.qty}x ${i.name}`).join(", ");
        sendCreditPurchaseSMS({
          customerName: customerName || "Valued Customer",
          customerPhone,
          date: new Date().toLocaleDateString("en-GB"),
          itemsSummary, // NO individual product prices!
          totalOrderAmount: total,
          amountPaid: effectivePaidAmount,
          leftoverCreditAmount: creditLeftover,
          totalOutstandingCreditBalance: newTotalOutstanding,
          invoiceRef,
        });
      }

      toastSuccess(
        isCreditSale
          ? `Credit sale processed! Added Rs. ${creditLeftover.toLocaleString()} to customer's account.`
          : "Sale completed successfully."
      );

      onProcess(); // Trigger POS success modal
    } catch (err: any) {
      console.error("[POS Checkout Error]", err?.response?.data || err);
      toastError(err, "We couldn't complete the sale. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
      {/* LEFT COLUMN: Details & Options */}
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
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Confirm Payment &amp; Hardware
                </h1>
                <p className="text-[13px] font-medium text-gray-500 mt-1">
                  Review transaction, credit calculations, and hardware triggers
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-3xl sm:ml-14">
          {/* Payment Method Selector & Credit Sale Toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-black tracking-tight text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <CreditCard className="w-3.5 h-3.5" />
              </span>
              Payment Method &amp; Type
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedMethod("cash")}
                className={`py-3.5 px-4 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 border transition-all ${
                  selectedMethod === "cash"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Banknote className="w-4 h-4" /> Cash
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("card")}
                className={`py-3.5 px-4 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 border transition-all ${
                  selectedMethod === "card"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod("credit")}
                className={`py-3.5 px-4 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 border transition-all ${
                  selectedMethod === "credit"
                    ? "bg-amber-600 text-white border-amber-600 shadow-md"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Zap className="w-4 h-4" /> Credit Sale
              </button>
            </div>

            {/* Credit Down Payment Input Field */}
            {selectedMethod === "credit" && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <label className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                  Amount Paid Now (Down Payment / Deposit)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-800 font-black text-sm">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={total}
                    value={creditPaidInput}
                    onChange={(e) => setCreditPaidInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-amber-300 rounded-xl text-lg font-black text-gray-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20"
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-amber-900 pt-1">
                  <span>Leftover Added to Credit Account:</span>
                  <span className="text-sm font-black text-red-600">Rs. {creditLeftover.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-5 border-b border-gray-50 pb-4">
              <h3 className="text-[14px] font-black tracking-tight text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100">
                  <User className="w-3.5 h-3.5" />
                </span>
                Customer Account Information
              </h3>
            </div>

            <div className="mb-6 max-w-md">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                Search or Register Customer Profile
              </label>
              <CustomerSearch
                selectedCustomer={selectedCustomer}
                onSelectCustomer={onSelectCustomer}
                onAddNew={onAddNewCustomer}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-5 border-t border-gray-100">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Name / ID
                </p>
                <p className="text-[14px] font-bold text-gray-900">
                  {customerName || "Walk-in Customer"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Phone
                </p>
                <p className="text-[14px] font-bold text-gray-900">
                  {customerPhone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Existing Outstanding
                </p>
                <p className="text-[14px] font-black text-amber-600">
                  Rs. {existingCreditBalance.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Credit Warning Banner if Walk-in customer selected for Credit */}
            {isCreditSale && (!customerId || customerName === "Walk-in Customer") && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Credit Sales require selecting a registered Customer profile. Please select a customer before processing.
                </span>
              </div>
            )}
          </div>

          {/* Credit Breakdown Box */}
          {isCreditSale && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-600" /> Credit Account Summary &amp; SMS Dispatch
                </span>
                <span className="text-[11px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  TEXT.LK Active
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center bg-white p-3 rounded-xl border border-amber-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Paid Today</p>
                  <p className="text-sm font-black text-emerald-600">Rs. {effectivePaidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Leftover Credit Added</p>
                  <p className="text-sm font-black text-red-600">+Rs. {creditLeftover.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">New Total Outstanding</p>
                  <p className="text-sm font-black text-amber-900">Rs. {newTotalOutstanding.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-[11px] font-medium text-amber-700 italic">
                * SMS notification with cumulative credit balance (and hidden product prices) will be automatically sent via TEXT.LK to {customerPhone || "customer phone"}.
              </p>
            </div>
          )}

          {/* Items Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-[14px] font-black tracking-tight text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center border border-emerald-100">
                <Package className="w-3.5 h-3.5" />
              </span>
              Items Summary
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {items.map((item) => {
                const itemDiscount = item.discountAmount ?? 0;
                const finalUnitPrice = item.price - itemDiscount;
                const finalLineTotal = finalUnitPrice * item.qty;

                return (
                  <div
                    key={`${item.id}-${item.warehouseId || "no-wh"}`}
                    className="bg-gray-50/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase">
                            Unit Price: Rs. {finalUnitPrice.toLocaleString()}
                          </p>
                          {item.warehouseName && (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              {item.warehouseName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end w-full sm:w-auto">
                      <p className="text-[12px] font-bold text-gray-500">Qty: {item.qty}</p>
                      <p className="text-[14px] font-black text-gray-900">
                        Rs. {finalLineTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
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
              {discount > 0 && (
                <div className="flex justify-between text-[13px] font-bold text-red-500">
                  <span>Order Discount</span>
                  <span>-Rs. {discount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-[15px] font-black text-gray-900">Grand Total</span>
              <span className="text-[18px] font-black text-[#059669]">Rs. {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Transaction Summary Panel */}
      <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col p-6 shadow-xl relative z-10 shrink-0">
        <div className="bg-[#059669] rounded-2xl p-6 text-white shadow-md mb-4 mt-4 lg:mt-6">
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
              <span className="text-white capitalize">{selectedMethod}</span>
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

        {/* Hardware Action Buttons inside Right Sidebar */}
        <div className="space-y-2 mt-auto mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDrawerKick}
              className="py-3 px-3 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-600" /> Kick Cash Drawer
            </button>
            <button
              type="button"
              onClick={handleESCPrint}
              className="py-3 px-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" /> ESC/POS Print
            </button>
          </div>
          <button
            type="button"
            onClick={() =>
              downloadInvoicePDF({
                storeName,
                items,
                customerName,
                customerPhone,
                customerType,
                paymentMethod: selectedMethod,
                amountTendered: effectivePaidAmount,
                change: isCreditSale ? 0 : change,
                creditLeftover,
                totalOutstandingCredit: newTotalOutstanding,
                subtotal,
                discount,
                total,
                notes,
              })
            }
            className="w-full py-2.5 px-3 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-gray-500" /> Download Invoice PDF
          </button>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 h-14 px-3 border border-red-200 text-red-500 font-bold text-[12px] leading-tight rounded-xl hover:bg-red-50 transition-colors bg-white flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            <span className="text-left">
              Cancel<br />Transaction
            </span>
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={processing}
            className="flex-[1.5] h-14 bg-[#059669] hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-[14px] rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            {processing ? "Processing..." : "Process Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}