'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Printer, Edit2, Clock, CheckCircle, Plus, Trash2,
  Eye, FileText, AlertCircle, User, ShoppingBag, Download,
} from 'lucide-react';
import api from '@/api/axiosInstance';
import { format } from 'date-fns';

// ── PDF Invoice Generator ──────────────────────────────────────────────────────
function downloadInvoicePDF({
  invoiceNo, dateStr, timeStr, customer, phone, cashier, txnType,
  items, subtotal, discount, tax, totalAmount,
}: {
  invoiceNo: string;
  dateStr: string;
  timeStr: string;
  customer: string;
  phone: string;
  cashier: string;
  txnType: string;
  items: { productName: string; sku: string; qty: number; unitPrice: number; total: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
}) {
  const itemRows = items.map((item, i) => `
    <tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:10px 8px;color:#6b7280;font-size:12px;">${i + 1}</td>
      <td style="padding:10px 8px;">
        <div style="font-weight:700;color:#111827;font-size:13px;">${item.productName}</div>
        ${item.sku ? `<div style="font-size:10px;color:#9ca3af;font-family:monospace;margin-top:2px;">SKU: ${item.sku}</div>` : ''}
      </td>
      <td style="padding:10px 8px;text-align:center;font-weight:700;color:#111827;font-size:13px;">${item.qty}</td>
      <td style="padding:10px 8px;text-align:right;color:#374151;font-size:13px;font-family:monospace;">Rs. ${item.unitPrice.toLocaleString()}</td>
      <td style="padding:10px 8px;text-align:right;font-weight:800;color:#111827;font-size:13px;font-family:monospace;">Rs. ${item.total.toLocaleString()}</td>
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
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; }
    .brand-name { font-size:26px; font-weight:900; color:#2563eb; letter-spacing:-0.5px; }
    .brand-sub  { font-size:11px; color:#6b7280; font-weight:500; margin-top:2px; }
    .invoice-label { text-align:right; }
    .invoice-label h2 { font-size:22px; font-weight:900; color:#111827; letter-spacing:-0.5px; }
    .invoice-label p  { font-size:12px; color:#6b7280; font-weight:500; margin-top:4px; }
    .divider { border:none; border-top:2px solid #2563eb; margin:0 0 30px; opacity:0.2; }
    .meta { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:14px; margin-bottom:32px; }
    .meta-box { background:#f9fafb; border:1px solid #f0f0f0; border-radius:10px; padding:12px 14px; }
    .meta-label { font-size:9px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px; }
    .meta-value { font-size:13px; font-weight:700; color:#111827; }
    .section-title { font-size:11px; font-weight:800; color:#2563eb; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:12px; }
    table { width:100%; border-collapse:collapse; margin-bottom:28px; }
    thead tr { background:#f9fafb; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; }
    thead th { padding:10px 8px; text-align:left; font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:0.08em; }
    thead th:last-child, thead th:nth-child(4) { text-align:right; }
    thead th:nth-child(3) { text-align:center; }
    .totals { display:flex; justify-content:flex-end; margin-bottom:28px; }
    .totals-box { width:300px; }
    .total-row { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; font-weight:600; color:#374151; border-bottom:1px solid #f3f4f6; }
    .total-row:last-child { border-bottom:none; }
    .total-row.discount { color:#ef4444; }
    .total-row.tax { color:#059669; }
    .grand-total { display:flex; justify-content:space-between; align-items:center; background:#2563eb; color:#fff; padding:14px 16px; border-radius:12px; margin-top:10px; }
    .grand-total span:first-child { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; }
    .grand-total span:last-child  { font-size:20px; font-weight:900; font-family:monospace; }
    .footer { text-align:center; padding-top:24px; border-top:1px solid #f0f0f0; margin-top:8px; }
    .footer p { font-size:12px; color:#9ca3af; font-weight:500; }
    .footer .thank-you { font-size:15px; font-weight:800; color:#2563eb; margin-bottom:4px; }
    @media print { body { background:#fff; } .page { padding:32px; max-width:100%; } }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-name">Hardware POS</div>
      <div class="brand-sub">Hardware &amp; Building Materials</div>
    </div>
    <div class="invoice-label">
      <h2>INVOICE</h2>
      <p>${invoiceNo}</p>
    </div>
  </div>
  <hr class="divider" />
  <div class="meta">
    <div class="meta-box"><div class="meta-label">Date</div><div class="meta-value">${dateStr}</div><div style="font-size:11px;color:#6b7280;margin-top:2px;">${timeStr}</div></div>
    <div class="meta-box"><div class="meta-label">Customer</div><div class="meta-value">${customer}</div><div style="font-size:11px;color:#6b7280;margin-top:2px;">${phone}</div></div>
    <div class="meta-box"><div class="meta-label">Cashier</div><div class="meta-value">${cashier}</div></div>
    <div class="meta-box"><div class="meta-label">Payment</div><div class="meta-value" style="text-transform:capitalize;">${txnType}</div><div style="font-size:11px;color:#059669;margin-top:2px;font-weight:700;">Paid</div></div>
  </div>
  <div class="section-title">Items Purchased</div>
  <table>
    <thead><tr>
      <th style="width:36px;">#</th>
      <th>Product</th>
      <th style="width:60px;text-align:center;">Qty</th>
      <th style="width:130px;text-align:right;">Unit Price</th>
      <th style="width:130px;text-align:right;">Total</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <div class="totals">
    <div class="totals-box">
      <div class="total-row"><span>Subtotal</span><span style="font-family:monospace;">Rs. ${subtotal.toLocaleString()}</span></div>
      ${discount > 0 ? `<div class="total-row discount"><span>Discount</span><span style="font-family:monospace;">-Rs. ${discount.toLocaleString()}</span></div>` : ''}
      ${tax > 0 ? `<div class="total-row tax"><span>Tax</span><span style="font-family:monospace;">Rs. ${tax.toLocaleString()}</span></div>` : ''}
      <div class="grand-total"><span>Total Amount</span><span>Rs. ${totalAmount.toLocaleString()}</span></div>
    </div>
  </div>
  <div class="footer">
    <p class="thank-you">Thank you for your purchase!</p>
    <p>Please retain this invoice for your records &bull; Returns accepted within 7 days with receipt</p>
    <p style="margin-top:8px;font-size:10px;color:#d1d5db;">Generated on ${dateStr} at ${timeStr} &bull; ${invoiceNo}</p>
  </div>
</div>
<script>window.onload = () => { window.print(); }<\/script>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  initialMode?: 'view' | 'edit' | 'receipt';
}

// ─── Normalize one item from any backend shape ───────────────────────────────
// Handles: { productName }, { product: { name } }, { stock: { product: { name } } },
//          { stockItem: { product: { name } } }, { itemName }, { name }, { title }, etc.
function normalizeItem(raw: any) {
  // ── Product name ──────────────────────────────────────────────────────────
  const productName =
    raw.productName          ||
    raw.product_name         ||
    raw.itemName             ||
    raw.item_name            ||
    raw.productTitle         ||
    raw.product_title        ||
    raw.product?.name        ||
    raw.product?.productName ||
    raw.stock?.product?.name ||
    raw.stockItem?.product?.name ||
    raw.stockItem?.name      ||
    raw.item?.name           ||
    raw.name                 ||
    raw.title                ||
    raw.label                ||
    '';

  // ── Product ID ───────────────────────────────────────────────────────────
  const productId =
    raw.productId            ||
    raw.product_id           ||
    raw.product?.id          ||
    raw.product?._id         ||
    raw.stock?.product?.id   ||
    raw.stock?.product?._id  ||
    raw.stockId              ||
    raw.stock_id             ||
    raw.stock?.id            ||
    raw.stock?._id           ||
    '';

  // ── SKU ──────────────────────────────────────────────────────────────────
  const sku =
    raw.sku                  ||
    raw.product?.sku         ||
    raw.stock?.product?.sku  ||
    raw.stockItem?.sku       ||
    '';

  // ── Quantity ─────────────────────────────────────────────────────────────
  const qty = Number(
    raw.quantity  ??
    raw.qty       ??
    raw.count     ??
    raw.amount    ??
    1
  );

  // ── Unit price ───────────────────────────────────────────────────────────
  const unitPrice = Number(
    raw.unitPrice            ??
    raw.unit_price           ??
    raw.sellingPrice         ??
    raw.selling_price        ??
    raw.price                ??
    raw.product?.selling_price ??
    raw.product?.sellingPrice  ??
    raw.stock?.product?.selling_price ??
    raw.stock?.product?.sellingPrice  ??
    0
  );

  return {
    productId,
    productName: productName || 'Unknown Item',
    sku,
    qty,
    unitPrice,
    get total() { return this.qty * this.unitPrice; },
  };
}

// ─── Helper: does this object look like a line-item? ─────────────────────────
function looksLikeItem(o: any): boolean {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
  return (
    'productId'   in o || 'product_id'  in o ||
    'productName' in o || 'product_name' in o ||
    'itemName'    in o || 'item_name'   in o  ||
    'stockId'     in o || 'stock_id'    in o  ||
    'quantity'    in o || 'qty'         in o  ||
    'unitPrice'   in o || 'unit_price'  in o  ||
    'sellingPrice' in o ||
    // has a nested product/stock object with a name
    !!(o.product?.name) || !!(o.stock?.product?.name)
  );
}

// ─── Aggressively find items array anywhere inside a response ─────────────────
function extractItems(obj: any, depth = 0): any[] {
  if (!obj || typeof obj !== 'object' || depth > 6) return [];

  // obj itself is an array of items
  if (Array.isArray(obj) && obj.length > 0 && looksLikeItem(obj[0])) {
    return obj;
  }

  // Named keys (highest priority)
  const itemKeys = [
    'items', 'saleItems', 'sale_items', 'orderItems', 'invoiceItems',
    'lineItems', 'line_items', 'products', 'cart', 'details',
    'transaction_items', 'purchasedItems', 'purchased_items',
  ];

  for (const k of itemKeys) {
    const val = obj[k];
    // Handle stringified JSON
    if (typeof val === 'string' && val.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.length > 0 && looksLikeItem(parsed[0])) return parsed;
      } catch { /* ignore */ }
    }
    if (Array.isArray(val) && val.length > 0 && looksLikeItem(val[0])) return val;
  }

  // Any array property whose first element looks like a line item
  for (const k of Object.keys(obj)) {
    let arr: any = obj[k];
    if (typeof arr === 'string' && arr.trim().startsWith('[')) {
      try { arr = JSON.parse(arr); } catch { /* ignore */ }
    }
    if (Array.isArray(arr) && arr.length > 0 && looksLikeItem(arr[0])) return arr;
  }

  // Recurse into nested plain objects
  for (const k of Object.keys(obj)) {
    const child = obj[k];
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      const found = extractItems(child, depth + 1);
      if (found.length > 0) return found;
    }
  }

  return [];
}

// ─── Find the invoice object (unwrap data/sale/invoice wrappers) ──────────────
function unwrapInvoice(raw: any): any {
  if (!raw || typeof raw !== 'object') return {};
  if (raw.invoiceNumber || raw.totalAmount !== undefined || raw.customerName || raw.customer) return raw;
  if (raw.data)    return unwrapInvoice(raw.data);
  if (raw.sale)    return unwrapInvoice(raw.sale);
  if (raw.invoice) return unwrapInvoice(raw.invoice);
  return raw;
}

export default function TransactionDetailsModal({
  isOpen, onClose, invoiceId, initialMode = 'view',
}: Props) {
  const [activeTab, setActiveTab]           = useState<'view' | 'edit' | 'receipt'>(initialMode);
  const [isSaving, setIsSaving]             = useState(false);
  const [loading, setLoading]               = useState(false);
  const [data, setData]                     = useState<any>(null);
  const [editData, setEditData]             = useState<any>({});
  const [mounted, setMounted]               = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting]         = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Load invoice ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !invoiceId) return;

    setActiveTab(initialMode);
    setLoading(true);
    setData(null);

    const buildState = (invoice: any, rawItems: any[]) => {
      const normalized = rawItems.map(normalizeItem);

      // Log what we got so devs can debug backend shape easily
      if (normalized.length === 0) {
        console.warn('[TransactionModal] No items extracted from response. rawItems =', rawItems, '| full invoice =', invoice);
      }

      // Use real items if found, otherwise empty (table shows its own empty state)
      const finalItems = normalized.length > 0 ? normalized : [];

      setData({ ...invoice, _normalizedItems: finalItems });
      setEditData({
        customerName: invoice.customerName || invoice.customer?.name || '',
        phone:        invoice.customerPhone || invoice.customer?.phone || '',
        email:        invoice.customerEmail || invoice.customer?.email || '',
        discount:     Number(invoice.discount ?? 0),
        notes:        invoice.notes || '',
        items:        finalItems.map(it => ({ ...it })),
      });
    };


    // Primary: fetch single sale
    api.get(`/sales/${invoiceId}`)
      .then(res => {
        const invoice = unwrapInvoice(res.data);
        const rawItems = extractItems(res.data);
        buildState(invoice, rawItems);
      })
      .catch(async () => {
        // Fallback: search the full sales list
        try {
          const allRes = await api.get('/sales', { params: { limit: 2000 } });
          let list: any[] = [];
          const d = allRes.data;
          if (Array.isArray(d?.data?.data?.items)) list = d.data.data.items;
          else if (Array.isArray(d?.data?.items))  list = d.data.items;
          else if (Array.isArray(d?.items))         list = d.items;
          else if (Array.isArray(d?.data))          list = d.data;
          else if (Array.isArray(d))                list = d;

          const invoice = list.find(i =>
            i.invoiceNumber === invoiceId || i.id === invoiceId || i._id === invoiceId
          );
          
          if (invoice) {
            const realId = invoice._id || invoice.id;
            if (realId && realId !== invoiceId) {
              try {
                const realRes = await api.get(`/sales/${realId}`);
                const fullInvoice = unwrapInvoice(realRes.data);
                const rawItems = extractItems(realRes.data);
                if (rawItems.length > 0) {
                  buildState(fullInvoice, rawItems);
                  return;
                }
              } catch (err) {
                console.warn('[TransactionModal] Re-fetch by realId failed:', err);
              }
            }
            buildState(invoice, extractItems(invoice));
          }
        } catch (e) {
          console.error('[TransactionModal] All fetches failed:', e);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, invoiceId, initialMode]);

  // ── Save edit ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        customerName: editData.customerName,
        customerPhone: editData.phone,
        customerEmail: editData.email,
        discount: editData.discount,
        notes: editData.notes,
        items: editData.items.map((it: any) => ({
          productId: it.productId,
          productName: it.productName,
          quantity: it.qty,
          unitPrice: it.unitPrice,
        })),
      };
      await api.put(`/sales/${invoiceId}`, payload);
      // Reflect edits locally
      setData((prev: any) => ({
        ...prev,
        customerName: editData.customerName,
        customerPhone: editData.phone,
        notes: editData.notes,
        discount: editData.discount,
        _normalizedItems: editData.items,
      }));
      setActiveTab('view');
    } catch (err: any) {
      console.error('[TransactionModal] Save failed:', err?.response?.data || err);
      alert(err?.response?.data?.message || 'Error saving changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete invoice ────────────────────────────────────────────────────────────
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Always prefer the real UUID so DELETE /sales/:uuid works reliably
      const realId = data?.id || data?._id || invoiceId;
      await api.delete(`/sales/${realId}`);
      setShowDeleteConfirm(false);
      onClose();
      // Force reload to ensure the list reflects the deletion immediately
      window.location.reload();
    } catch (err: any) {
      console.error('[TransactionModal] Delete failed:', err);
      alert(err?.response?.data?.message || 'Failed to delete invoice. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  // ── Derived display values ──────────────────────────────────────────────────
  const invNum        = data?.invoiceNumber || data?.id || invoiceId;
  const dateStr       = data?.createdAt || data?.date || data?.created_at;
  const formattedDate = dateStr ? format(new Date(dateStr), 'dd/MM/yyyy') : '—';
  const formattedTime = dateStr ? format(new Date(dateStr), 'HH:mm')     : '';

  const viewItems: ReturnType<typeof normalizeItem>[] = data?._normalizedItems ?? [];

  const subtotal    = viewItems.reduce((s, it) => s + it.total, 0) || Number(data?.subtotal ?? data?.totalAmount ?? 0);
  const discount    = Number(data?.discount ?? 0);
  const tax         = Number(data?.tax ?? 0);
  const totalAmount = Number(data?.totalAmount ?? data?.amount ?? (subtotal - discount + tax));

  const payStatus = data?.paymentStatus || data?.status || 'Completed';
  const customer  = data?.customerName  || data?.customer?.name   || 'Walk-in';
  const phone     = data?.customerPhone || data?.customer?.phone  || '—';
  const txnType   = data?.paymentMethod || data?.saleType         || 'CASH';
  const cashier   = data?.user?.name    || data?.cashierName      || 'System';

  // ── Render ──────────────────────────────────────────────────────────────────
  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-50 w-full max-w-[1100px] h-[90vh] rounded-3xl shadow-2xl flex flex-col relative overflow-hidden">

        {/* ── HEADER ── */}
        <div className={`px-8 py-5 flex items-center justify-between text-white shrink-0 transition-colors duration-300 ${activeTab === 'edit' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-[18px] font-black tracking-tight">Invoice: {invNum}</h2>
              {activeTab === 'edit' && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Editing Mode</span>
              )}
            </div>
            <p className="text-[11px] font-medium text-white/75 mt-0.5">
              ID: {invoiceId} | Created: {formattedDate}{formattedTime ? ` at ${formattedTime}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {activeTab !== 'edit' && (
              <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-[12px] font-black uppercase">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                {payStatus}
              </span>
            )}
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-white/70 uppercase">Total Amount</span>
              <span className="text-[20px] font-black leading-none">Rs. {totalAmount.toLocaleString()}</span>
            </div>
            <div className="h-8 border-l border-white/20 mx-1"></div>
            <div className="flex items-center gap-2">
              {activeTab !== 'edit' && (
                <>
                  <button onClick={handleDelete} title="Delete" className="w-9 h-9 rounded-lg bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setActiveTab('edit')} title="Edit" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadInvoicePDF({ invoiceNo: invNum, dateStr: formattedDate, timeStr: formattedTime, customer, phone, cashier, txnType, items: viewItems, subtotal, discount, tax, totalAmount })}
                    title="Download PDF"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}
              <button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── META SUB-HEADER ── */}
        <div className="bg-white px-8 py-3 border-b border-gray-100 flex flex-wrap gap-8 shrink-0">
          {[
            { label: 'Customer', value: customer },
            { label: 'Phone',    value: phone },
            { label: 'Transaction Type', value: txnType },
            { label: 'Cashier', value: cashier },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">{label}</span>
              <span className="text-[13px] font-bold text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* ── TAB BAR ── */}
        <div className="bg-white px-8 flex items-center gap-6 border-b border-gray-100 shrink-0">
          {([
            { id: 'view',    label: 'View Details',  Icon: Eye },
            { id: 'edit',    label: 'Edit Transaction', Icon: Edit2 },
            { id: 'receipt', label: 'Receipt View',  Icon: FileText },
          ] as const).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-3.5 flex items-center gap-2 text-[13px] font-bold transition-all relative ${
                activeTab === id
                  ? id === 'edit' ? 'text-emerald-600' : 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && id === 'edit' && (
                <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded-sm uppercase ml-1">Active</span>
              )}
              {activeTab === id && (
                <div className={`absolute bottom-0 left-0 w-full h-[3px] rounded-t-full ${id === 'edit' ? 'bg-emerald-600' : 'bg-blue-600'}`} />
              )}
            </button>
          ))}
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600" />
              <p className="text-[13px] font-medium text-gray-400">Loading invoice details…</p>
            </div>
          ) : (
            <>
              {/* ── VIEW / RECEIPT ── */}
              {(activeTab === 'view' || activeTab === 'receipt') && (
                <div className="max-w-[900px] mx-auto space-y-6 pb-24">

                  {/* Items table */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="text-[14px] font-black text-gray-900 mb-5 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-blue-500" />
                      Items Purchased
                      <span className="ml-auto text-[12px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {viewItems.length} {viewItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </h4>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-10">#</th>
                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20 text-center">SKU</th>
                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16 text-center">Qty</th>
                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-32 text-right">Unit Price</th>
                          <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-32 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-gray-400 text-[13px]">
                              No items recorded for this invoice.
                            </td>
                          </tr>
                        ) : (
                          viewItems.map((item, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 text-[13px] text-gray-400">{i + 1}</td>
                              <td className="py-4">
                                <p className="text-[13px] font-bold text-gray-900">{item.productName}</p>
                              </td>
                              <td className="py-4 text-center">
                                <span className="text-[11px] font-mono text-gray-400">{item.sku || '—'}</span>
                              </td>
                              <td className="py-4 text-center">
                                <span className="text-[13px] font-black text-gray-900">{item.qty}</span>
                              </td>
                              <td className="py-4 text-right text-[13px] font-medium text-gray-700 font-mono">
                                Rs. {item.unitPrice.toLocaleString()}
                              </td>
                              <td className="py-4 text-right text-[14px] font-black text-gray-900 font-mono">
                                Rs. {item.total.toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary block */}
                  <div className="flex justify-end">
                    <div className="w-[360px] bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
                      <div className="flex justify-between text-[12px] font-bold text-gray-500">
                        <span className="uppercase tracking-widest text-[9px]">Subtotal</span>
                        <span className="font-mono text-gray-900 text-[14px]">Rs. {subtotal.toLocaleString()}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-[12px] font-bold text-red-500">
                          <span className="uppercase tracking-widest text-[9px]">Discount</span>
                          <span className="font-mono text-[14px]">−Rs. {discount.toLocaleString()}</span>
                        </div>
                      )}
                      {tax > 0 && (
                        <div className="flex justify-between text-[12px] font-bold text-emerald-500">
                          <span className="uppercase tracking-widest text-[9px]">Tax</span>
                          <span className="font-mono text-[14px]">+Rs. {tax.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Total Amount</span>
                        <span className="text-[22px] font-black text-blue-600 font-mono">Rs. {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── EDIT MODE ── */}
              {activeTab === 'edit' && (
                <div className="max-w-[900px] mx-auto space-y-6 pb-28">
                  {/* Warning banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[13px] font-black text-amber-900 mb-1">Editing Active Transaction</h5>
                      <p className="text-[12px] text-amber-800 font-medium">Changes will update the invoice immediately upon saving.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start">
                    {/* LEFT: Customer + Items */}
                    <div className="flex flex-col gap-6">

                      {/* Customer details */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-[14px] font-black text-gray-900 flex items-center gap-2 mb-5">
                          <User className="w-4 h-4 text-blue-500" /> Customer Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Customer Name</label>
                            <input type="text" value={editData.customerName ?? ''} onChange={e => setEditData({ ...editData, customerName: e.target.value })}
                              className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-gray-900" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Phone</label>
                            <input type="text" value={editData.phone ?? ''} onChange={e => setEditData({ ...editData, phone: e.target.value })}
                              className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-gray-900" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Email</label>
                            <input type="email" value={editData.email ?? ''} onChange={e => setEditData({ ...editData, email: e.target.value })}
                              className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-gray-900" />
                          </div>
                        </div>
                      </div>

                      {/* Editable items */}
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-[14px] font-black text-gray-900 flex items-center gap-2 mb-5">
                          <ShoppingBag className="w-4 h-4 text-emerald-500" /> Edit Purchased Items
                        </h4>

                        <div className="space-y-3">
                          {(editData.items ?? []).map((item: any, i: number) => (
                            <div key={i} className="flex gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                              <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Product Name</label>
                                <input type="text"
                                  value={item.productName ?? ''}
                                  onChange={e => {
                                    const n = [...editData.items];
                                    n[i] = { ...n[i], productName: e.target.value };
                                    setEditData({ ...editData, items: n });
                                  }}
                                  className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-all font-bold text-gray-900" />
                              </div>
                              <div className="w-20">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Qty</label>
                                <input type="number" min={1}
                                  value={item.qty ?? item.quantity ?? 1}
                                  onChange={e => {
                                    const n = [...editData.items];
                                    n[i] = { ...n[i], qty: Number(e.target.value) };
                                    setEditData({ ...editData, items: n });
                                  }}
                                  className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-all font-bold text-gray-900 text-center" />
                              </div>
                              <div className="w-32">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Unit Price</label>
                                <input type="number"
                                  value={item.unitPrice ?? item.price ?? 0}
                                  onChange={e => {
                                    const n = [...editData.items];
                                    n[i] = { ...n[i], unitPrice: Number(e.target.value) };
                                    setEditData({ ...editData, items: n });
                                  }}
                                  className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-all font-bold text-gray-900 text-right" />
                              </div>
                              <button
                                onClick={() => {
                                  const n = editData.items.filter((_: any, idx: number) => idx !== i);
                                  setEditData({ ...editData, items: n });
                                }}
                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          <button
                            onClick={() => setEditData({
                              ...editData,
                              items: [...(editData.items ?? []), { productId: '', productName: 'New Item', sku: '', qty: 1, unitPrice: 0, get total() { return this.qty * this.unitPrice; } }],
                            })}
                            className="w-full py-3 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-xl text-[12px] font-bold text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> Add Item
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Discount + Notes */}
                    <div className="space-y-4">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h4 className="text-[14px] font-black text-gray-900 mb-4">Discount & Notes</h4>
                        <div className="flex flex-col gap-4">
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Discount Amount (Rs)</label>
                            <input type="number" value={editData.discount ?? 0}
                              onChange={e => setEditData({ ...editData, discount: Number(e.target.value) })}
                              className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 transition-all font-mono font-bold text-gray-900" />
                          </div>
                          <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Invoice Notes</label>
                            <textarea value={editData.notes ?? ''}
                              onChange={e => setEditData({ ...editData, notes: e.target.value })}
                              rows={4}
                              placeholder="Optional notes…"
                              className="w-full text-[12.5px] border border-gray-200 rounded-lg px-3 py-2 outline-none resize-none focus:border-emerald-500 transition-all font-medium text-gray-900" />
                          </div>
                        </div>
                      </div>

                      {/* Live total preview */}
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Calculated Total</p>
                        {(() => {
                          const s = (editData.items ?? []).reduce((acc: number, it: any) => acc + (it.qty ?? it.quantity ?? 1) * (it.unitPrice ?? it.price ?? 0), 0);
                          const d = Number(editData.discount ?? 0);
                          const t = s - d;
                          return (
                            <div className="flex flex-col gap-1 text-[12px] font-bold text-gray-700">
                              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">Rs. {s.toLocaleString()}</span></div>
                              {d > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span className="font-mono">−Rs. {d.toLocaleString()}</span></div>}
                              <div className="border-t border-emerald-200 mt-1 pt-1 flex justify-between text-emerald-700 text-[14px] font-black"><span>Total</span><span className="font-mono">Rs. {t.toLocaleString()}</span></div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── FOOTER: VIEW ── */}
        {activeTab !== 'edit' && !loading && (
          <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={() => downloadInvoicePDF({ invoiceNo: invNum, dateStr: formattedDate, timeStr: formattedTime, customer, phone, cashier, txnType, items: viewItems, subtotal, discount, tax, totalAmount })}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-blue-600 hover:bg-blue-50 transition"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={() => downloadInvoicePDF({ invoiceNo: invNum, dateStr: formattedDate, timeStr: formattedTime, customer, phone, cashier, txnType, items: viewItems, subtotal, discount, tax, totalAmount })}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-blue-600 hover:bg-blue-50 transition"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[13px] font-bold transition">Close</button>
          </div>
        )}

        {/* ── FOOTER: EDIT ── */}
        {activeTab === 'edit' && !loading && (
          <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
              <Clock className="w-3.5 h-3.5" /> Edit mode active
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab('view')} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition">
                <X className="w-4 h-4" /> Discard Changes
              </button>
              <button onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 rounded-lg text-[13px] font-bold text-white hover:bg-emerald-700 transition shadow-sm disabled:opacity-70 disabled:cursor-wait">
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {showDeleteConfirm && mounted && createPortal(
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{ animation: 'fadeInScale 0.2s ease-out' }}
          >
            {/* Header */}
            <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black text-[16px]">Delete Invoice</h3>
                <p className="text-red-100 text-[11px] font-medium mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-gray-700 text-[14px] leading-relaxed">
                You are about to permanently delete invoice{' '}
                <span className="font-black text-gray-900">{data?.invoiceNumber || invoiceId}</span>.
              </p>
              <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-red-700 text-[12px] leading-relaxed">
                  All invoice items, payment records, and associated data will be <strong>permanently removed</strong> from the database. This cannot be recovered.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[13px] font-black transition shadow-sm disabled:opacity-70 disabled:cursor-wait"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Yes, Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.92); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
}
