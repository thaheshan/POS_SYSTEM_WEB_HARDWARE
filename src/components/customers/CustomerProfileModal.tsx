'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X, Phone, Mail, MapPin, CreditCard, ShoppingBag, TrendingUp,
  Printer, FileDown, Package, Calendar, Clock, AlertCircle,
  ChevronDown, ChevronUp, ReceiptText, Banknote, ExternalLink, User, RotateCcw,
  Eye
} from 'lucide-react';
import api from '@/api/axiosInstance';
import { shopApi } from '@/api/shop';
import { openThermalPrintWindow } from '@/utils/thermalReceiptTemplate';
import TransactionDetailsModal from '@/components/sales/TransactionDetailsModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDisplayDate = (dateVal?: string): string => {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  } catch {}
  return String(dateVal).split('T')[0];
};

const formatDisplayTime = (timeVal?: string, dateVal?: string): string => {
  if (!timeVal && !dateVal) return '';
  if (timeVal && timeVal.includes('T')) {
    const part = timeVal.split('T')[1];
    return part ? part.slice(0, 5) : '';
  }
  if (timeVal && !timeVal.startsWith('1970') && !timeVal.includes('-')) {
    return timeVal.slice(0, 5);
  }
  if (dateVal && dateVal.includes('T') && !dateVal.endsWith('00:00:00.000Z')) {
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      }
    } catch {}
  }
  return '';
};

const extractItems = (obj: any): any[] => {
  if (!obj || typeof obj !== 'object') return [];
  if (Array.isArray(obj) && obj.length > 0) return obj;

  const itemKeys = [
    'items',
    'saleItems',
    'sale_items',
    'orderItems',
    'invoiceItems',
    'lineItems',
    'line_items',
    'products',
    'cart',
    'details',
    'transaction_items',
    'purchasedItems',
    'purchased_items',
  ];

  for (const k of itemKeys) {
    let val = obj[k];
    if (typeof val === 'string' && val.trim().startsWith('[')) {
      try { val = JSON.parse(val); } catch {}
    }
    if (Array.isArray(val) && val.length > 0) return val;
  }
  return [];
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  customerType: string;
  totalPurchases: number;
  outstanding: number;
  transactions: number;
  isOverdue: boolean;
  lastActive: string;
  initials: string;
}

interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  sku?: string;
  discount_amount?: number;
}

interface Invoice {
  invoice_id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_time: string;
  sale_type: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  payment_status: string;
  notes?: string;
  items: InvoiceItem[];
}

interface CustomerProfileModalProps {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
}

export default function CustomerProfileModal({ customer, onClose, onEdit }: CustomerProfileModalProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [shopProfile, setShopProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'cash'>('all');
  const [productCatalog, setProductCatalog] = useState<Record<string, any>>({});
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch shop profile
    shopApi.getProfile().then(setShopProfile).catch(() => {});
    try {
      const cached = localStorage.getItem('pos_shop_profile');
      if (cached) setShopProfile(JSON.parse(cached));
    } catch {}

    // 2. Fetch products catalog map for resilient product name resolution
    api.get('/products', { params: { limit: 1000 } })
      .then((res) => {
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.items)
          ? res.data.items
          : [];
        const map: Record<string, any> = {};
        for (const p of list) {
          const id = p.id || p.productId || p.product_id || p._id;
          if (id) map[id] = p;
        }
        setProductCatalog(map);
        fetchInvoices(map);
      })
      .catch(() => {
        fetchInvoices({});
      });
  }, [customer.id]);

  const fetchInvoices = async (catalogMapOverride?: Record<string, any>) => {
    setLoading(true);
    try {
      const catMap = catalogMapOverride || productCatalog;
      const cleanPhone = (customer.phone || '').replace(/\D/g, '');
      const cleanName = (customer.name || '').trim();

      // Helper to normalize any raw invoice shape (from Next.js API or NestJS backend)
      const normalizeInvoice = (raw: any): Invoice => {
        const rawItems = extractItems(raw);

        const items = rawItems.map((it: any) => {
          const pid = String(
            it.productId ||
            it.product_id ||
            it.product?.id ||
            it.product?._id ||
            it.stock?.product?.id ||
            it.stockId ||
            it.stock_id ||
            ''
          );

          const catalogItem = pid && catMap ? catMap[pid] : null;

          const directName =
            it.productName ||
            it.product_name ||
            it.itemName ||
            it.item_name ||
            it.productTitle ||
            it.product_title ||
            it.product?.name ||
            it.product?.productName ||
            it.stock?.product?.name ||
            it.stockItem?.product?.name ||
            it.stockItem?.name ||
            it.item?.name ||
            it.name ||
            it.title ||
            it.label ||
            '';

          const resolvedName =
            (directName && directName !== 'Product' && directName !== 'Unknown Product' ? directName : '') ||
            catalogItem?.name ||
            catalogItem?.productName ||
            catalogItem?.product_name ||
            directName ||
            'Product';

          const sku =
            it.sku ||
            it.product?.sku ||
            it.stock?.product?.sku ||
            it.stockItem?.sku ||
            catalogItem?.sku ||
            '';

          const quantity = Number(it.quantity ?? it.qty ?? it.count ?? it.amount ?? 1);
          const unit_price = Number(
            it.unit_price ??
            it.unitPrice ??
            it.sellingPrice ??
            it.selling_price ??
            it.price ??
            catalogItem?.selling_price ??
            catalogItem?.sellingPrice ??
            catalogItem?.price ??
            0
          );
          const discount_amount = Number(it.discount_amount ?? it.discountAmount ?? it.discount ?? 0);
          const line_total = Number(
            it.line_total ??
            it.lineTotal ??
            it.total ??
            (quantity * unit_price - discount_amount)
          );

          return {
            name: resolvedName,
            quantity,
            unit_price,
            line_total: Math.max(0, line_total),
            sku,
            discount_amount,
          };
        });

        const total = Number(raw.total_amount ?? raw.totalAmount ?? raw.total ?? 0);
        const paid = Number(raw.paid_amount ?? raw.paidAmount ?? raw.paid ?? 0);
        const rawBal = raw.balance ?? raw.outstandingBalance ?? raw.outstanding;
        const balance = rawBal !== undefined && rawBal !== null ? Number(rawBal) : Math.max(0, total - paid);

        const rawCreatedAt = raw.created_at || raw.createdAt || '';
        const rawDate = raw.invoice_date || raw.invoiceDate || rawCreatedAt;
        const rawTime = raw.invoice_time || raw.invoiceTime || (rawCreatedAt ? String(rawCreatedAt).slice(11, 19) : '');

        return {
          invoice_id: raw.invoice_id || raw.invoiceId || raw.id || raw.invoice_number || raw.invoiceNumber || '',
          invoice_number: raw.invoice_number || raw.invoiceNumber || raw.no || 'N/A',
          invoice_date: formatDisplayDate(rawDate),
          invoice_time: formatDisplayTime(rawTime, rawDate),
          sale_type: String(raw.sale_type || raw.saleType || raw.payment_method || raw.paymentMethod || 'CASH').toUpperCase(),
          subtotal: Number(raw.subtotal ?? raw.total ?? total),
          discount_amount: Number(raw.discount_amount ?? raw.discountAmount ?? raw.discount ?? 0),
          total_amount: total,
          paid_amount: paid,
          balance: isNaN(balance) ? 0 : balance,
          payment_status: String(raw.payment_status || raw.paymentStatus || (balance > 0 ? 'UNPAID' : 'PAID')).toUpperCase(),
          notes: raw.notes || '',
          items,
        };
      };

      let invData: Invoice[] = [];

      // 1. Internal Next.js API route: by customer ID
      try {
        const res = await fetch(
          `/api/customers/invoices?customerId=${encodeURIComponent(customer.id)}&name=${encodeURIComponent(cleanName)}&phone=${encodeURIComponent(cleanPhone)}&t=${Date.now()}`
        );
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            invData = json.data.map(normalizeInvoice);
          }
        }
      } catch {}

      // 2. NestJS Backend /sales endpoint (where all checkout invoices and items live!)
      if (invData.length === 0) {
        try {
          const salesRes = await api.get('/sales', { params: { limit: 1000 } });
          const d = salesRes.data;
          let list: any[] = [];
          if (Array.isArray(d?.data?.data?.items)) list = d.data.data.items;
          else if (Array.isArray(d?.data?.items)) list = d.data.items;
          else if (Array.isArray(d?.items)) list = d.items;
          else if (Array.isArray(d?.data)) list = d.data;
          else if (Array.isArray(d)) list = d;

          const matched = list.filter((inv: any) => {
            const invCustId = String(inv.customerId || inv.customer_id || inv.customer?.id || '').toLowerCase();
            const targetId = String(customer.id || '').toLowerCase();
            if (targetId && invCustId && (invCustId === targetId || invCustId.includes(targetId) || targetId.includes(invCustId))) {
              return true;
            }
            const phone = String(inv.customerPhone || inv.customer_phone || inv.customer?.phone || '').replace(/\D/g, '');
            if (cleanPhone && phone && (phone === cleanPhone || phone.includes(cleanPhone) || cleanPhone.includes(phone))) {
              return true;
            }
            const name = String(inv.customerName || inv.customer_name || inv.customer?.name || '').trim().toLowerCase();
            if (cleanName && name && (name === cleanName.toLowerCase() || name.includes(cleanName.toLowerCase()))) {
              return true;
            }
            return false;
          });

          if (matched.length > 0) {
            // For matched invoices, check if item names are present. If not, fetch /sales/:id
            const detailed = await Promise.all(
              matched.map(async (inv: any) => {
                const realId = inv.id || inv._id || inv.invoice_id || inv.invoiceId;
                const existingItems = extractItems(inv);
                const hasItemNames =
                  Array.isArray(existingItems) &&
                  existingItems.length > 0 &&
                  existingItems.some((it: any) => {
                    const n = it.productName || it.name || it.product_name || it.itemName || it.item_name || it.product?.name;
                    return n && n !== 'Product';
                  });

                if (hasItemNames) {
                  return normalizeInvoice(inv);
                }

                if (realId) {
                  try {
                    const detailRes = await api.get(`/sales/${realId}`);
                    const fullData = detailRes.data?.data || detailRes.data;
                    return normalizeInvoice({ ...inv, ...fullData });
                  } catch {}
                }
                return normalizeInvoice(inv);
              })
            );
            invData = detailed;
          }
        } catch (backendErr) {
          console.warn('[CustomerProfile] /sales backend fetch fallback:', backendErr);
        }
      }

      // 3. Direct internal reconcile API route
      if (invData.length === 0) {
        try {
          const res = await fetch(
            `/api/customers/reconcile?customerId=${encodeURIComponent(customer.id)}&name=${encodeURIComponent(cleanName)}&t=${Date.now()}`
          );
          const json = await res.json();
          if (json.results?.[0]?.invoicesSummary && json.results[0].invoicesSummary.length > 0) {
            invData = json.results[0].invoicesSummary.map(normalizeInvoice);
          }
        } catch {}
      }

      // Sort newest first
      invData.sort((a, b) => {
        const da = new Date(a.invoice_date || 0).getTime() || 0;
        const db = new Date(b.invoice_date || 0).getTime() || 0;
        return db - da;
      });

      setInvoices(invData);
    } catch (err) {
      console.error('[CustomerProfile] Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived Stats ────────────────────────────────────────────────────────
  const totalSales = invoices.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const totalCreditSales = invoices.filter(i => String(i.sale_type).toUpperCase() === 'CREDIT')
    .reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const totalCashSales = invoices.filter(i => String(i.sale_type).toUpperCase() !== 'CREDIT')
    .reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const totalOutstanding = invoices.reduce((s, i) => s + Math.max(0, Number(i.balance || 0)), 0);

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'credit') return String(inv.sale_type).toUpperCase() === 'CREDIT';
    if (activeTab === 'cash') return String(inv.sale_type).toUpperCase() !== 'CREDIT';
    return true;
  });

  // ─── Store Name ───────────────────────────────────────────────────────────
  const storeName = (() => {
    const n = shopProfile?.name || '';
    if (n && !n.toLowerCase().includes('futura') && !n.toLowerCase().includes("user's")) return n;
    return 'Trinco Hardware & Electricals';
  })();
  const storePhone = shopProfile?.phone || '';
  const storeAddress = shopProfile?.address || '';

  // ─── PDF Download ─────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const html = generatePurchaseHistoryHTML();
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);
  };

  // ─── Thermal Print ────────────────────────────────────────────────────────
  const handleThermalPrint = () => {
    const html = generateThermalHTML();
    openThermalPrintWindow(html, `CustomerHistory-${customer.name.replace(/\s+/g, '_')}`);
  };

  // ─── Dedicated HTML Thermal Receipt Generator (Exact Sales Thermal Slip Template & Font) ────
  const generateThermalHTML = (): string => {
    const now = new Date().toLocaleString('en-GB');

    const invoiceSections = filteredInvoices.map((inv, idx) => {
      const dateStr = inv.invoice_date 
        ? `${inv.invoice_date} ${inv.invoice_time || ''}`.trim()
        : 'N/A';

      const itemRows = (inv.items || []).map((item) => {
        const itemDiscount = Number(item.discount_amount) || 0;
        const finalLineTotal = item.line_total || item.quantity * (item.unit_price || 0);
        const discountRow = itemDiscount > 0
          ? `
        <tr class="item-disc">
          <td colspan="2" style="font-size:10px; font-weight:700; padding-left:4px; color:#000;">
            Item Discount
          </td>
          <td class="line-total" style="color:#000; font-weight:800;">-Rs. ${itemDiscount.toLocaleString()}</td>
        </tr>`
          : '';

        return `
        <tr>
          <td colspan="3" class="item-name">${item.name}</td>
        </tr>
        <tr class="item-calc">
          <td class="qty">${item.quantity} x Rs. ${Number(item.unit_price).toLocaleString()}</td>
          <td class="wh">${item.sku || ''}</td>
          <td class="line-total">Rs. ${finalLineTotal.toLocaleString()}</td>
        </tr>${discountRow}`;
      }).join('');

      const isCredit = String(inv.sale_type).toUpperCase() === 'CREDIT' || Number(inv.balance) > 0;

      return `
      <!-- Invoice ${idx + 1} Section -->
      <table style="width:100%; font-size:10px; font-weight:700; margin-top:4px;">
        <tr>
          <td style="width:55%;"><b>#${idx + 1}. Inv:</b> ${inv.invoice_number || 'N/A'}</td>
          <td style="width:45%; text-align:right;">${dateStr}</td>
        </tr>
        <tr>
          <td>Pay: ${inv.sale_type || 'N/A'}</td>
          <td style="text-align:right;">${isCredit ? '[CREDIT / PARTIAL]' : '[PAID]'}</td>
        </tr>
      </table>

      ${itemRows ? `
      <table style="margin-top:2px;">
        <tbody>
          ${itemRows}
        </tbody>
      </table>` : `
      <div style="font-size:9.5px; color:#444; padding:2px 0;">(No item breakdown recorded)</div>
      `}

      <table style="width:100%; font-size:10.5px; font-weight:700; margin-top:2px;">
        <tr>
          <td>Invoice Total:</td>
          <td style="text-align:right; font-weight:900;">Rs. ${Number(inv.total_amount || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td>Paid:</td>
          <td style="text-align:right; font-weight:900;">Rs. ${Number(inv.paid_amount || 0).toLocaleString()}</td>
        </tr>
        ${Number(inv.balance) > 0 ? `
        <tr class="bold" style="color:#c00;">
          <td>Outstanding:</td>
          <td style="text-align:right; font-weight:900;">Rs. ${Number(inv.balance).toLocaleString()}</td>
        </tr>` : ''}
      </table>
      <div class="divider"></div>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CustomerHistory-${customer.name}</title>
  <style>
    @media print {
      @page {
        size: auto;
        margin: 0mm !important;
      }
      html, body {
        width: 100% !important;
        max-width: 58mm !important;
        margin: 0 auto !important;
        padding: 0 !important;
      }
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      width: 100%;
      max-width: 58mm;
      margin: 0 auto;
      padding: 4px 2px;
      word-break: break-word;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: 800; }
    .title { font-size: 14px; font-weight: 900; letter-spacing: -0.3px; text-transform: uppercase; }
    .subtitle { font-size: 10px; font-weight: 700; margin-bottom: 2px; color: #111; }
    .divider { border-top: 1px dashed #000; margin: 5px 0; }
    .double-divider { border-top: 2px double #000; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    td { vertical-align: top; padding: 1px 0; }
    .item-name { font-weight: 800; font-size: 11px; padding-top: 3px; word-break: break-word; }
    .item-calc { font-size: 10.5px; border-bottom: 1px dotted #bbb; padding-bottom: 3px; }
    .qty { width: 50%; font-weight: 700; }
    .wh { width: 15%; font-size: 8px; color: #444; text-align: center; }
    .line-total { width: 35%; text-align: right; font-weight: 900; }
    .grand-total-box {
      font-size: 14px;
      font-weight: 900;
      padding: 3px 0;
    }
    .footer { font-size: 9.5px; font-weight: 700; margin-top: 8px; line-height: 1.3; }
  </style>
</head>
<body>
  <!-- Thermal Header -->
  <div class="text-center">
    <div class="title">${storeName}</div>
    ${storeAddress ? `<div style="font-size:9.5px; font-weight:600;">${storeAddress}</div>` : ''}
    ${storePhone ? `<div style="font-size:9.5px; font-weight:700;">Tel: ${storePhone}</div>` : ''}
  </div>

  <div class="divider"></div>

  <div class="text-center" style="font-size:11.5px; font-weight:900; letter-spacing:0.3px; text-transform:uppercase;">
    CUSTOMER PURCHASE STATEMENT
  </div>

  <div class="divider"></div>

  <!-- Meta / Customer Info -->
  <table style="width:100%; font-size:10px; font-weight:700;">
    <tr>
      <td colspan="2">Cust: <b>${customer.name}</b></td>
    </tr>
    <tr>
      <td style="width:60%;">Tel: ${customer.phone || 'N/A'}</td>
      <td style="width:40%; text-align:right;">Type: ${customer.customerType || 'Individual'}</td>
    </tr>
    <tr>
      <td style="width:50%;">Printed: ${now}</td>
      <td style="width:50%; text-align:right;">Invoices: ${filteredInvoices.length}</td>
    </tr>
  </table>

  <div class="divider"></div>

  <!-- Invoices List & Product Details -->
  ${invoiceSections || '<div class="text-center" style="padding:10px 0; color:#555;">No purchase records found</div>'}

  <!-- Summary of Account -->
  <div class="double-divider"></div>

  <table style="width:100%; font-size:11px; font-weight:700;">
    <tr>
      <td>Total Purchases:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${(totalSales || customer.totalPurchases).toLocaleString()}</td>
    </tr>
    <tr>
      <td>Cash Sales:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${totalCashSales.toLocaleString()}</td>
    </tr>
    <tr>
      <td>Credit Sales:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${totalCreditSales.toLocaleString()}</td>
    </tr>
  </table>

  <div class="double-divider"></div>

  <table style="width:100%;" class="grand-total-box">
    <tr>
      <td style="font-size:13.5px; font-weight:900;">TOTAL PURCHASES:</td>
      <td style="font-size:13.5px; font-weight:900; text-align:right;">Rs. ${(totalSales || customer.totalPurchases).toLocaleString()}</td>
    </tr>
  </table>

  <div class="double-divider"></div>

  <!-- Outstanding Breakdown -->
  <table style="width:100%; font-size:10.5px; font-weight:700;">
    <tr class="bold" style="font-size:11.5px; background:#f9f9f9;">
      <td style="padding:3px 2px;">TOTAL OUTSTANDING:</td>
      <td style="text-align:right; font-weight:900; font-size:12px; color:#c00; padding:3px 2px;">
        Rs. ${(totalOutstanding || customer.outstanding).toLocaleString()}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="font-size:8.5px; font-weight:700; color:#555; text-align:right;">(Total Credit)</td>
    </tr>
  </table>

  <div class="divider"></div>

  <!-- Footer -->
  <div class="text-center footer">
    <div>Thank you for shopping at ${storeName}!</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch (e) {}
      }, 250);
    };
  </script>
</body>
</html>`;
  };

  // ─── Full A4 PDF HTML ─────────────────────────────────────────────────────
  const generatePurchaseHistoryHTML = (): string => {
    const now = new Date().toLocaleString('en-GB');
    const rows = filteredInvoices.map((inv, idx) => {
      const date = inv.invoice_date
        ? `${inv.invoice_date}${inv.invoice_time ? '<br/><small style="color:#6b7280;font-size:10px;">' + inv.invoice_time + '</small>' : ''}`
        : 'N/A';
      const saleTypeBadge = String(inv.sale_type).toUpperCase() === 'CREDIT'
        ? `<span style="background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:6px;font-size:10px;font-weight:900;">CREDIT</span>`
        : `<span style="background:#d1fae5;color:#059669;padding:2px 7px;border-radius:6px;font-size:10px;font-weight:900;">CASH</span>`;
      const statusBadge = String(inv.payment_status).toUpperCase() === 'UNPAID'
        ? `<span style="background:#fee2e2;color:#dc2626;padding:2px 7px;border-radius:6px;font-size:10px;font-weight:900;">UNPAID</span>`
        : `<span style="background:#d1fae5;color:#059669;padding:2px 7px;border-radius:6px;font-size:10px;font-weight:900;">PAID</span>`;
      const balance = Number(inv.balance || 0);
      const balanceHtml = balance > 0
        ? `<span style="color:#dc2626;font-weight:900;">Rs. ${balance.toLocaleString()}</span>`
        : `<span style="color:#059669;font-weight:700;">-</span>`;

      // Items sub-rows
      let itemsHtml = '';
      if (inv.items?.length > 0) {
        itemsHtml = `<tr><td colspan="8" style="padding:0 12px 8px 40px;">
          <table style="width:100%;border-collapse:collapse;font-size:11px;">
            <thead><tr style="background:#f8fafc;">
              <th style="padding:4px 8px;text-align:left;color:#6b7280;font-weight:700;border-bottom:1px solid #e5e7eb;">Product</th>
              <th style="padding:4px 8px;text-align:center;color:#6b7280;font-weight:700;border-bottom:1px solid #e5e7eb;">Qty</th>
              <th style="padding:4px 8px;text-align:right;color:#6b7280;font-weight:700;border-bottom:1px solid #e5e7eb;">Unit Price</th>
              <th style="padding:4px 8px;text-align:right;color:#6b7280;font-weight:700;border-bottom:1px solid #e5e7eb;">Total</th>
            </tr></thead><tbody>
            ${inv.items.map(item => `
              <tr>
                <td style="padding:4px 8px;color:#111827;font-weight:600;">${item.name}</td>
                <td style="padding:4px 8px;text-align:center;color:#374151;font-weight:700;">${item.quantity}</td>
                <td style="padding:4px 8px;text-align:right;color:#374151;font-weight:600;font-family:monospace;">Rs. ${Number(item.unit_price).toLocaleString()}</td>
                <td style="padding:4px 8px;text-align:right;color:#111827;font-weight:900;font-family:monospace;">Rs. ${Number(item.line_total).toLocaleString()}</td>
              </tr>`).join('')}
            </tbody>
          </table></td></tr>`;
      }

      return `
        <tr style="border-bottom:1px solid #f3f4f6;${Number(inv.balance) > 0 ? 'background:#fff5f5;' : ''}">
          <td style="padding:10px 12px;font-size:11px;color:#6b7280;font-weight:700;">${idx + 1}</td>
          <td style="padding:10px 12px;font-size:11px;color:#1e40af;font-weight:900;font-family:monospace;">${inv.invoice_number || 'N/A'}</td>
          <td style="padding:10px 12px;font-size:11px;">${date}</td>
          <td style="padding:10px 12px;">${saleTypeBadge}</td>
          <td style="padding:10px 12px;font-size:12px;font-weight:900;font-family:monospace;">Rs. ${Number(inv.total_amount || 0).toLocaleString()}</td>
          <td style="padding:10px 12px;font-size:12px;font-weight:700;font-family:monospace;color:#059669;">Rs. ${Number(inv.paid_amount || 0).toLocaleString()}</td>
          <td style="padding:10px 12px;">${balanceHtml}</td>
          <td style="padding:10px 12px;">${statusBadge}</td>
        </tr>
        ${itemsHtml}`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>Purchase History - ${customer.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @page{size:A4;margin:20mm;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter',sans-serif;background:#f9fafb;color:#111827;font-size:13px;}
  .page{max-width:860px;margin:0 auto;background:#fff;padding:40px;border-radius:12px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #1e40af;}
  .store-name{font-size:22px;font-weight:900;color:#1e40af;letter-spacing:-0.5px;}
  .report-title{font-size:18px;font-weight:900;color:#111827;text-align:right;}
  .report-sub{font-size:11px;color:#6b7280;font-weight:500;text-align:right;margin-top:4px;}
  .customer-card{background:linear-gradient(135deg,#1e40af,#2563eb);border-radius:16px;padding:20px 24px;color:#fff;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;}
  .cust-initials{width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;border:2px solid rgba(255,255,255,0.3);}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
  .kpi{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:14px;text-align:center;}
  .kpi-label{font-size:10px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;}
  .kpi-value{font-size:18px;font-weight:900;color:#111827;}
  .kpi-credit .kpi-value{color:#dc2626;}
  table{width:100%;border-collapse:collapse;}
  thead tr{background:#1e40af;}
  thead th{padding:10px 12px;text-align:left;font-size:10px;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:0.08em;}
  tbody tr:hover{background:#f8fafc;}
  .footer{margin-top:32px;text-align:center;font-size:11px;color:#9ca3af;font-weight:500;padding-top:16px;border-top:1px solid #f3f4f6;}
  @media print{body{background:#fff;}.page{box-shadow:none;border-radius:0;}}
</style></head>
<body><div class="page">
  <div class="header">
    <div>
      <div class="store-name">${storeName}</div>
      ${storeAddress ? `<div style="font-size:11px;color:#6b7280;margin-top:3px;">${storeAddress}</div>` : ''}
      ${storePhone ? `<div style="font-size:11px;color:#6b7280;">Tel: ${storePhone}</div>` : ''}
    </div>
    <div>
      <div class="report-title">Customer Purchase History</div>
      <div class="report-sub">Generated: ${now}</div>
    </div>
  </div>

  <div class="customer-card">
    <div style="display:flex;align-items:center;gap:16px;">
      <div class="cust-initials">${customer.initials}</div>
      <div>
        <div style="font-size:20px;font-weight:900;letter-spacing:-0.3px;">${customer.name}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:3px;">${customer.customerType} Customer  •  ${customer.phone}</div>
        ${customer.email !== 'N/A' ? `<div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">${customer.email}</div>` : ''}
      </div>
    </div>
    ${customer.isOverdue ? `<div style="background:#ef4444;color:#fff;padding:6px 14px;border-radius:8px;font-size:11px;font-weight:900;text-transform:uppercase;">OVERDUE</div>` : ''}
  </div>

  <div class="kpis">
    <div class="kpi">
      <div class="kpi-label">Total Purchases</div>
      <div class="kpi-value">Rs. ${(totalSales || customer.totalPurchases).toLocaleString()}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Cash Sales</div>
      <div class="kpi-value" style="color:#059669;">Rs. ${totalCashSales.toLocaleString()}</div>
    </div>
    <div class="kpi kpi-credit">
      <div class="kpi-label">Credit Sales</div>
      <div class="kpi-value">Rs. ${totalCreditSales.toLocaleString()}</div>
    </div>
    <div class="kpi kpi-credit">
      <div class="kpi-label">Outstanding</div>
      <div class="kpi-value">Rs. ${(totalOutstanding || customer.outstanding).toLocaleString()}</div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th>#</th>
      <th>Invoice No.</th>
      <th>Date / Time</th>
      <th>Type</th>
      <th>Total</th>
      <th>Paid</th>
      <th>Balance</th>
      <th>Status</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="8" style="text-align:center;padding:24px;color:#9ca3af;">No invoices found</td></tr>'}</tbody>
  </table>

  <div class="footer">
    This report was generated from ${storeName} POS System • ${now}<br/>
    Customer ID: ${customer.id}
  </div>
</div>
<script>window.print();</script>
</body></html>`;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  const typeColor = (type: string) => {
    return String(type).toUpperCase() === 'CREDIT'
      ? 'bg-red-100 text-red-700 border-red-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const statusColor = (status: string) => {
    return String(status).toUpperCase() === 'UNPAID'
      ? 'bg-red-100 text-red-700'
      : 'bg-emerald-100 text-emerald-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-3 md:p-6">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#1e40af] to-[#2563eb] px-6 py-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-[20px] font-black border border-white/30 shrink-0">
                {customer.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[20px] font-black tracking-tight">{customer.name}</h2>
                  {customer.isOverdue && (
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">Overdue</span>
                  )}
                </div>
                <p className="text-blue-200 text-[12px] font-bold mt-0.5">{customer.customerType} Customer</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-blue-200 font-medium">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
                  {customer.email !== 'N/A' && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleThermalPrint}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-xl text-[11px] font-black transition-all"
                title="Print as 80mm thermal receipt"
              >
                <Printer className="w-3.5 h-3.5" /> Thermal
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-xl text-[11px] font-black transition-all"
                title="Download as PDF"
              >
                <FileDown className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-900 px-3 py-2 rounded-xl text-[11px] font-black transition-all"
              >
                <User className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Strip ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-gray-100 shrink-0">
          {[
            { label: 'Total Purchases', value: `Rs. ${(totalSales || customer.totalPurchases).toLocaleString()}`, color: 'text-blue-700', bg: 'bg-blue-50', Icon: ShoppingBag },
            { label: 'Cash Sales', value: `Rs. ${totalCashSales.toLocaleString()}`, color: 'text-emerald-700', bg: 'bg-emerald-50', Icon: Banknote },
            { label: 'Credit Sales', value: `Rs. ${totalCreditSales.toLocaleString()}`, color: 'text-orange-700', bg: 'bg-orange-50', Icon: CreditCard },
            { label: 'Outstanding', value: `Rs. ${(totalOutstanding || customer.outstanding).toLocaleString()}`, color: customer.outstanding > 0 ? 'text-red-700' : 'text-gray-700', bg: customer.outstanding > 0 ? 'bg-red-50' : 'bg-gray-50', Icon: AlertCircle },
          ].map(({ label, value, color, bg, Icon }) => (
            <div key={label} className={`${bg} px-5 py-4 flex items-center gap-3 border-r border-gray-100 last:border-r-0`}>
              <div className={`w-9 h-9 rounded-xl ${bg} border border-white/60 flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider ${color} opacity-70`}>{label}</p>
                <p className={`text-[14px] font-black ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 px-5 py-3 border-b border-gray-100 shrink-0 bg-gray-50/50">
          {(['all', 'credit', 'cash'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-[#1e40af] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab === 'all' ? `All (${invoices.length})` :
               tab === 'credit' ? `Credit (${invoices.filter(i => String(i.sale_type).toUpperCase() === 'CREDIT').length})` :
               `Cash (${invoices.filter(i => String(i.sale_type).toUpperCase() !== 'CREDIT').length})`}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={fetchInvoices}
              className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-blue-600 transition-colors"
              title="Refresh invoices"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* ── Invoice Table ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto" ref={printRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-[13px] font-bold text-gray-400">Loading purchase history...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <ReceiptText className="w-12 h-12 text-gray-200" />
              <p className="text-[14px] font-black text-gray-400">No invoices found</p>
              <p className="text-[12px] font-bold text-gray-300">No {activeTab !== 'all' ? activeTab : ''} purchases recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50 border-b-2 border-gray-100 sticky top-0 z-10">
                  <tr>
                    {['#', 'Invoice No.', 'Date & Time', 'Type', 'Total Amount', 'Paid Amount', 'Balance', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, idx) => {
                    const isExpanded = expandedInvoice === inv.invoice_id;
                    const hasBalance = Number(inv.balance) > 0;
                    return (
                      <React.Fragment key={inv.invoice_id || idx}>
                        <tr
                          className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer ${hasBalance ? 'bg-red-50/30' : ''}`}
                          onClick={() => setExpandedInvoice(isExpanded ? null : inv.invoice_id)}
                        >
                          <td className="px-4 py-3 text-[12px] text-gray-400 font-bold">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-black text-blue-700 font-mono">
                              {inv.invoice_number || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-[12px] font-bold text-gray-900 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                {inv.invoice_date || 'N/A'}
                              </span>
                              {inv.invoice_time && (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {inv.invoice_time}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${typeColor(inv.sale_type)}`}>
                              {inv.sale_type || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[13px] font-black text-gray-900 font-mono whitespace-nowrap">
                            Rs. {Number(inv.total_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-[13px] font-bold text-emerald-700 font-mono whitespace-nowrap">
                            Rs. {Number(inv.paid_amount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            {hasBalance ? (
                              <span className="text-[13px] font-black text-red-600 font-mono whitespace-nowrap">
                                Rs. {Number(inv.balance).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[12px] text-emerald-600 font-bold">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${statusColor(inv.payment_status)}`}>
                              {inv.payment_status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {inv.items?.length > 0 && (
                                <span className="text-[10px] font-bold text-gray-400">
                                  {inv.items.length} item{inv.items.length !== 1 ? 's' : ''}
                                </span>
                              )}
                              <button
                                type="button"
                                title="View transaction details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInvoiceId(inv.invoice_id || inv.invoice_number);
                                }}
                                className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title={isExpanded ? "Collapse items" : "Expand items"}
                                onClick={() => setExpandedInvoice(isExpanded ? null : inv.invoice_id)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {isExpanded
                                  ? <ChevronUp className="w-4 h-4" />
                                  : <ChevronDown className="w-4 h-4" />
                                }
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ── Expanded: Product Line Items ── */}
                        {isExpanded && (
                          <tr className="bg-blue-50/20 border-b border-blue-100">
                            <td colSpan={9} className="px-6 py-4">
                              {inv.items && inv.items.length > 0 ? (
                                <div>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <Package className="w-3 h-3" /> Products in this invoice
                                  </p>
                                  <table className="w-full text-[12px]">
                                    <thead>
                                      <tr className="border-b border-blue-100">
                                        <th className="text-left py-1.5 px-3 text-[10px] font-black text-gray-500 uppercase">Product</th>
                                        {inv.items.some(i => i.sku) && (
                                          <th className="text-left py-1.5 px-3 text-[10px] font-black text-gray-500 uppercase">SKU</th>
                                        )}
                                        <th className="text-center py-1.5 px-3 text-[10px] font-black text-gray-500 uppercase">Qty</th>
                                        <th className="text-right py-1.5 px-3 text-[10px] font-black text-gray-500 uppercase">Unit Price</th>
                                        {inv.items.some(i => i.discount_amount && i.discount_amount > 0) && (
                                          <th className="text-right py-1.5 px-3 text-[10px] font-black text-gray-500 uppercase">Discount</th>
                                        )}
                                        <th className="text-right py-1.5 px-3 text-[10px] font-black text-gray-500 uppercase">Line Total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {inv.items.map((item, i) => (
                                        <tr key={i} className="border-b border-blue-50/60 last:border-0">
                                          <td className="py-2 px-3 font-bold text-gray-900">{item.name}</td>
                                          {inv.items.some(ii => ii.sku) && (
                                            <td className="py-2 px-3 font-mono text-gray-400 text-[10px]">{item.sku || '—'}</td>
                                          )}
                                          <td className="py-2 px-3 text-center font-black text-gray-800">{item.quantity}</td>
                                          <td className="py-2 px-3 text-right font-mono text-gray-700">Rs. {Number(item.unit_price).toLocaleString()}</td>
                                          {inv.items.some(ii => ii.discount_amount && ii.discount_amount > 0) && (
                                            <td className="py-2 px-3 text-right font-mono text-red-600">
                                              {item.discount_amount && item.discount_amount > 0 ? `-Rs. ${Number(item.discount_amount).toLocaleString()}` : '—'}
                                            </td>
                                          )}
                                          <td className="py-2 px-3 text-right font-black text-gray-900 font-mono">Rs. {Number(item.line_total).toLocaleString()}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot className="border-t-2 border-blue-100">
                                      <tr>
                                        <td colSpan={3} className="py-2 px-3 text-[11px] font-black text-gray-500 uppercase">Invoice Summary</td>
                                        <td className="py-2 px-3 text-right font-bold text-gray-600 text-[11px]">Subtotal</td>
                                        <td colSpan={2} className="py-2 px-3 text-right font-black text-gray-900 font-mono">
                                          Rs. {Number(inv.subtotal || inv.total_amount || 0).toLocaleString()}
                                        </td>
                                      </tr>
                                      {Number(inv.discount_amount) > 0 && (
                                        <tr>
                                          <td colSpan={4} className="py-1 px-3 text-right font-bold text-gray-500 text-[11px]">Discount</td>
                                          <td colSpan={2} className="py-1 px-3 text-right font-black text-red-600 font-mono text-[11px]">
                                            -Rs. {Number(inv.discount_amount).toLocaleString()}
                                          </td>
                                        </tr>
                                      )}
                                      <tr>
                                        <td colSpan={4} className="py-2 px-3 text-right font-black text-gray-900 text-[13px]">TOTAL</td>
                                        <td colSpan={2} className="py-2 px-3 text-right font-black text-gray-900 font-mono text-[14px]">
                                          Rs. {Number(inv.total_amount || 0).toLocaleString()}
                                        </td>
                                      </tr>
                                      {Number(inv.balance) > 0 && (
                                        <tr className="bg-red-50">
                                          <td colSpan={4} className="py-2 px-3 text-right font-black text-red-700 text-[12px]">Outstanding Balance</td>
                                          <td colSpan={2} className="py-2 px-3 text-right font-black text-red-700 font-mono text-[13px]">
                                            Rs. {Number(inv.balance).toLocaleString()}
                                          </td>
                                        </tr>
                                      )}
                                    </tfoot>
                                  </table>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 text-[12px] text-gray-400 font-bold py-2">
                                  <Package className="w-4 h-4" />
                                  <span>No item-level details available for this invoice.</span>
                                  <div className="ml-auto text-[11px] text-gray-400">
                                    Total: <strong className="text-gray-700 font-mono">Rs. {Number(inv.total_amount || 0).toLocaleString()}</strong>
                                    {inv.notes && <> • Notes: {inv.notes}</>}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                <tfoot className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 z-10">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-[11px] font-black text-gray-700 uppercase tracking-wider">
                      Total ({filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''})
                    </td>
                    <td className="px-4 py-3 text-[14px] font-black text-gray-900 font-mono whitespace-nowrap">
                      Rs. {filteredInvoices.reduce((s, i) => s + Number(i.total_amount || 0), 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[14px] font-black text-emerald-700 font-mono whitespace-nowrap">
                      Rs. {filteredInvoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[14px] font-black text-red-700 font-mono whitespace-nowrap">
                      Rs. {filteredInvoices.reduce((s, i) => s + Math.max(0, Number(i.balance || 0)), 0).toLocaleString()}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="shrink-0 px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-400">
            Customer ID: {customer.id.substring(0, 8).toUpperCase()}  •  Added: {customer.lastActive}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleThermalPrint}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-[11px] font-black transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print Thermal
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-[#1e40af] hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-[11px] font-black transition-all"
            >
              <FileDown className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-xl text-[11px] font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {selectedInvoiceId && (
        <TransactionDetailsModal
          isOpen={!!selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
          invoiceId={selectedInvoiceId}
        />
      )}
    </div>
  );
}
