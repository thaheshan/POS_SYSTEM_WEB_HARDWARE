"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Receipt, CheckCircle, Package, Printer, AlertCircle } from "lucide-react";
import { format } from "date-fns";

// For receipt page: use NEXT_PUBLIC_API_URL (should be your backend's public URL set in Vercel env vars)
// e.g. https://your-backend.railway.app/api/v1
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export default function PublicReceiptPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;

    // Use plain fetch — no auth headers — against the public backend endpoint
    fetch(`${API_BASE}/public/sales/receipt/${id}`, {
      headers: { "Content-Type": "application/json" }
    })
      .then(async res => {
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        setInvoice(json.data);
      })
      .catch(() => {
        setError("Receipt not found or the link may have expired.");
      })
      .finally(() => setLoading(false));
  }, [params?.id]);

  /* ───────── Loading ───────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-700"></div>
          <p className="text-slate-500 font-semibold text-sm">Loading receipt…</p>
        </div>
      </div>
    );
  }

  /* ───────── Error ───────── */
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Receipt Not Found</h2>
          <p className="text-slate-400 font-medium text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  const shopName = invoice.shop?.name || "Futura Hardware";
  const shopAddress = [invoice.shop?.address, invoice.shop?.city].filter(Boolean).join(", ");
  const shopPhone = invoice.shop?.phone;

  const isReturn = invoice.invoiceNumber?.startsWith("RET-");
  const isExchange = invoice.invoiceNumber?.startsWith("EXC-");

  const accentColor = isReturn ? "#dc2626" : isExchange ? "#d97706" : "#1e40af";
  const badgeText = isReturn ? "RETURN RECEIPT" : isExchange ? "EXCHANGE RECEIPT" : "SALES RECEIPT";

  /* ───────── Main Receipt ───────── */
  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center print:bg-white print:py-0">

      {/* Card */}
      <div className="max-w-[420px] w-full bg-white rounded-[28px] shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-full">

        {/* ── Header Band ── */}
        <div className="relative px-8 py-10 text-center text-white overflow-hidden" style={{ backgroundColor: accentColor }}>
          {/* Dot grid decoration */}
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

          <div className="relative z-10">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>

            {/* Shop Name */}
            <h1 className="text-2xl font-black tracking-tight leading-tight mb-1">{shopName}</h1>
            {shopAddress && <p className="text-sm font-medium opacity-75 mb-0.5">{shopAddress}</p>}
            {shopPhone && <p className="text-sm font-medium opacity-75">{shopPhone}</p>}

            {/* Badge */}
            <span className="inline-block mt-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-white/20 border border-white/30">
              {badgeText}
            </span>

            {/* Total */}
            <div className="mt-6">
              <p className="text-xs font-bold opacity-60 uppercase tracking-[0.2em] mb-1">
                {isReturn ? "Total Refunded" : "Total Paid"}
              </p>
              <p className="text-4xl font-black">
                Rs.{" "}
                {Math.abs(Number(invoice.totalAmount)).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Invoice Meta ── */}
        <div className="px-8 pt-7 pb-5 border-b border-dashed border-slate-200">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Invoice #</p>
              <p className="text-[13px] font-bold text-slate-900 font-mono">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date & Time</p>
              <p className="text-[13px] font-bold text-slate-900">
                {format(new Date(invoice.createdAt), "MMM d, yyyy")}
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                {format(new Date(invoice.createdAt), "h:mm a")}
              </p>
            </div>
          </div>

          {/* Customer */}
          {invoice.customer && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 text-xs font-black">
                  {invoice.customer.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Billed To</p>
                <p className="text-[13px] font-bold text-slate-900">{invoice.customer.name}</p>
                {invoice.customer.phone && (
                  <p className="text-[11px] font-medium text-slate-400">{invoice.customer.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Items ── */}
        <div className="px-8 py-6">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-5">
            Items ({invoice.items?.length || 0})
          </p>
          <div className="space-y-4">
            {(invoice.items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-start justify-between gap-4">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 leading-tight">
                      {item.product?.name || "Item"}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      {Number(item.quantity)} × Rs.{" "}
                      {Number(item.unitPrice).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <p className="text-[14px] font-black text-slate-900 font-mono whitespace-nowrap">
                  Rs. {Number(item.lineTotal).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Totals ── */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100">
          <div className="space-y-2.5 mb-4">
            <div className="flex justify-between text-sm font-medium text-slate-500">
              <span>Subtotal</span>
              <span>Rs. {Math.abs(Number(invoice.subtotal)).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
            </div>
            {Number(invoice.discountAmount) > 0 && (
              <div className="flex justify-between text-sm font-semibold text-emerald-600">
                <span>Discount</span>
                <span>− Rs. {Number(invoice.discountAmount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {Number(invoice.taxAmount) > 0 && (
              <div className="flex justify-between text-sm font-medium text-slate-500">
                <span>Tax (VAT)</span>
                <span>Rs. {Number(invoice.taxAmount).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <span className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
              {isReturn ? "Total Refunded" : "Total"}
            </span>
            <span className="text-xl font-black font-mono" style={{ color: accentColor }}>
              Rs. {Math.abs(Number(invoice.totalAmount)).toLocaleString("en-LK", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-8 py-8 text-center border-t border-slate-100">
          <div className="flex items-center gap-3 justify-center mb-3">
            <div className="h-px flex-1 bg-slate-100" />
            <Receipt className="w-4 h-4 text-slate-300" />
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <p className="text-sm font-bold text-slate-700 mb-1">Thank you for your business!</p>
          <p className="text-xs text-slate-400 font-medium">
            Keep this digital receipt for your records.
          </p>
          <p className="text-[10px] text-slate-300 font-medium mt-3">
            Powered by Futura POS · IRD Compliant
          </p>
        </div>
      </div>

      {/* ── Print Button (hidden on print) ── */}
      <div className="mt-8 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-all border border-slate-200 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Print Receipt
        </button>
      </div>

    </div>
  );
}
