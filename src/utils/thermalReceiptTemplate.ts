import { HardwarePrintReceiptPayload } from "./hardwareIntegration";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FUTURA HARDWARE POS — THERMAL RECEIPT PRINTER TEMPLATE (80mm / 58mm)
 * Suitable for all standard ESC/POS Thermal Printers (Epson, Xprinter, Sunmi, Star)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * 1. Format raw ESC/POS Text Stream for Direct Serial / TCP / USB Drivers (48 cols for 80mm, 32 cols for 58mm)
 */
export function formatESCPosTextStream(data: HardwarePrintReceiptPayload, widthChars = 40): string {
  const line = "-".repeat(widthChars);
  const doubleLine = "=".repeat(widthChars);
  const storeNameText = data.storeName || "Trinco Hardware & Electricals";
  const storeAddressText = data.storeAddress || "Anuradapura Junction, Trincomalee, Sri Lanka";
  const storePhoneText = data.storePhone || "+94763539351";

  const center = (text: string) => {
    const pad = Math.max(0, Math.floor((widthChars - text.length) / 2));
    return " ".repeat(pad) + text;
  };

  const leftRight = (left: string, right: string) => {
    const space = Math.max(1, widthChars - left.length - right.length);
    return left + " ".repeat(space) + right;
  };

  const lines: string[] = [];

  // Header
  lines.push(center(storeNameText.toUpperCase()));
  lines.push(center("Hardware & Building Materials"));
  if (storeAddressText) lines.push(center(storeAddressText));
  if (storePhoneText) lines.push(center(`Tel: ${storePhoneText}`));
  lines.push(line);

  // Meta
  lines.push(leftRight(`Inv: ${data.invoiceNo}`, `${data.date.slice(0, 10)}`));
  lines.push(leftRight(`Cashier: ${data.cashier}`, `Type: ${data.customerType || "Walk-In"}`));
  if (data.customerName && data.customerName !== "Walk-in Customer") {
    lines.push(`Cust: ${data.customerName}`);
    if (data.customerPhone) lines.push(`Tel: ${data.customerPhone}`);
  }
  lines.push(leftRight(`Pay: ${data.paymentMethod}`, `Status: ${data.creditLeftover && data.creditLeftover > 0 ? "CREDIT" : "PAID"}`));
  lines.push(line);

  // Item Table
  lines.push(leftRight("ITEM", "QTY"));
  lines.push(line);

  data.items.forEach((item) => {
    const maxNameLength = widthChars - 8;
    const nameStr = item.name.length > maxNameLength ? item.name.slice(0, maxNameLength - 2) + ".." : item.name;
    const rightStr = `${item.qty}x`;
    lines.push(leftRight(nameStr, rightStr));
  });

  lines.push(line);

  // Totals
  lines.push(leftRight("Subtotal:", `Rs. ${data.subtotal.toLocaleString()}`));
  if (data.discount > 0) {
    lines.push(leftRight("Discount:", `-Rs. ${data.discount.toLocaleString()}`));
  }
  lines.push(doubleLine);
  lines.push(leftRight("GRAND TOTAL:", `Rs. ${data.total.toLocaleString()}`));
  lines.push(doubleLine);

  // Payment Breakdown
  lines.push(leftRight("Paid / Tendered:", `Rs. ${data.amountTendered.toLocaleString()}`));
  if (data.creditLeftover && data.creditLeftover > 0) {
    lines.push(leftRight("Credit Added:", `Rs. ${data.creditLeftover.toLocaleString()}`));
    if (data.totalOutstandingCredit !== undefined) {
      lines.push(leftRight("Total Account Credit:", `Rs. ${data.totalOutstandingCredit.toLocaleString()}`));
    }
  } else {
    lines.push(leftRight("Change:", `Rs. ${data.change.toLocaleString()}`));
  }

  // Footer
  lines.push(line);
  lines.push(center(`Thank you for shopping!`));
  if (storeAddressText) lines.push(center(storeAddressText));
  if (storePhoneText) lines.push(center(`Tel: ${storePhoneText}`));
  lines.push("\n\n\n"); // Feed for paper cut

  return lines.join("\n");
}

/**
 * 2. Dedicated HTML Thermal Receipt Window Generator (Exact 58mm/80mm Safe Paper Boundary)
 * Triggered when printing to thermal receipt printer via OS print driver dialog.
 */
export function printThermalHTMLReceipt(data: HardwarePrintReceiptPayload) {
  const storeNameText = data.storeName || "Trinco Hardware & Electricals";
  const storeAddressText = data.storeAddress || "Anuradapura Junction, Trincomalee, Sri Lanka";
  const storePhoneText = data.storePhone || "+94763539351";

  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td colspan="3" class="item-name">${item.name}</td>
    </tr>
    <tr class="item-calc">
      <td class="qty" colspan="2">${item.qty} x</td>
      <td class="wh">${item.warehouseName || ""}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt-${data.invoiceNo}</title>
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
    .qty { width: 55%; font-weight: 700; }
    .wh { width: 15%; font-size: 8px; color: #444; text-align: center; }
    .line-total { width: 30%; text-align: right; font-weight: 900; }
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
    <div class="title">${storeNameText}</div>
    <div class="subtitle">Hardware &amp; Building Materials</div>
    ${data.storeAddress ? `<div style="font-size:9.5px; font-weight:600;">${data.storeAddress}</div>` : ""}
    ${data.storePhone ? `<div style="font-size:9.5px; font-weight:700;">Tel: ${data.storePhone}</div>` : ""}
  </div>

  <div class="divider"></div>

  <!-- Meta Info -->
  <table style="width:100%; font-size:10px; font-weight:700;">
    <tr>
      <td style="width:52%;">Inv #: ${data.invoiceNo}</td>
      <td style="width:48%; text-align:right;">${data.date}</td>
    </tr>
    <tr>
      <td style="width:60%;">Cashier: ${data.cashier}</td>
      <td style="width:40%; text-align:right;">Type: ${data.customerType || "Walk-In"}</td>
    </tr>
    ${
      data.customerName && data.customerName !== "Walk-in Customer"
        ? `<tr><td colspan="2">Cust: ${data.customerName} ${data.customerPhone ? `(${data.customerPhone})` : ""}</td></tr>`
        : ""
    }
    <tr>
      <td style="width:50%;">Pay: ${data.paymentMethod}</td>
      <td style="width:50%; text-align:right;">${data.creditLeftover && data.creditLeftover > 0 ? "[CREDIT SALE]" : "[PAID]"}</td>
    </tr>
  </table>

  <div class="divider"></div>

  <!-- Item Table -->
  <table>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="divider"></div>

  <!-- Totals -->
  <table style="width:100%; font-size:11px; font-weight:700;">
    <tr>
      <td>Subtotal:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${data.subtotal.toLocaleString()}</td>
    </tr>
    ${data.discount > 0 ? `<tr><td>Discount:</td><td style="text-align:right; font-weight:900;">-Rs. ${data.discount.toLocaleString()}</td></tr>` : ""}
  </table>

  <div class="double-divider"></div>

  <table style="width:100%;" class="grand-total-box">
    <tr>
      <td style="font-size:13.5px; font-weight:900;">TOTAL:</td>
      <td style="font-size:13.5px; font-weight:900; text-align:right;">Rs. ${data.total.toLocaleString()}</td>
    </tr>
  </table>

  <div class="double-divider"></div>

  <!-- Payment Breakdown -->
  <table style="width:100%; font-size:10.5px; font-weight:700;">
    <tr>
      <td>Tendered / Paid:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${data.amountTendered.toLocaleString()}</td>
    </tr>
    ${
      data.creditLeftover && data.creditLeftover > 0
        ? `
    <tr class="bold">
      <td>Credit Added Today:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${data.creditLeftover.toLocaleString()}</td>
    </tr>
    ${data.totalOutstandingCredit !== undefined ? `<tr class="bold"><td>Total Account Credit:</td><td style="text-align:right; font-weight:900;">Rs. ${data.totalOutstandingCredit.toLocaleString()}</td></tr>` : ""}
    `
        : `
    <tr>
      <td>Change:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${data.change.toLocaleString()}</td>
    </tr>
    `
    }
  </table>

  <div class="divider"></div>

  <!-- Footer -->
  <div class="text-center footer">
    <div>Thank you for shopping at ${storeNameText}!</div>
    ${storeAddressText ? `<div>${storeAddressText}</div>` : ""}
    ${storePhoneText ? `<div>Tel: ${storePhoneText}</div>` : ""}
  </div>

</body>
</html>`;

  // ── Silent Iframe Print (no popup window) ──────────────────────────────────
  // Uses a hidden off-screen iframe. The browser OS print dialog appears
  // directly — no browser popup window is opened.
  // NOTE: Completely silent zero-dialog printing is ONLY possible via the
  //       Local Print Agent at localhost:9100 (tried first in printThermalReceipt).
  // ──────────────────────────────────────────────────────────────────────────

  const triggerPrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:80mm;height:1px;border:none;opacity:0;pointer-events:none;';

    let hasPrinted = false;

    const cleanup = () => {
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch {}
      }, 4000);
    };

    const doPrint = () => {
      if (hasPrinted) return;
      hasPrinted = true;
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('[Thermal Print] iframe.print() failed:', e);
      } finally {
        cleanup();
      }
    };

    // Set onload BEFORE appending so it never fires early
    iframe.onload = doPrint;

    // Use blob URL as src — this reliably fires onload
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    document.body.appendChild(iframe);

    // Revoke blob URL after use
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    // Safety fallback: if onload doesn't fire within 2s, print anyway
    setTimeout(() => {
      if (!hasPrinted) {
        doPrint();
      }
    }, 2000);
  };

  triggerPrint();
}

/**
 * 3. Dedicated Return / Exchange Thermal Receipt Template Generator
 * Triggers thermal print window directly with return items, refund totals, reason & restock status.
 */
export interface ReturnReceiptPayload {
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  returnNo: string;
  originalInvoiceNo: string;
  date: string;
  cashier: string;
  customerName?: string;
  reason: string;
  isRestocked: boolean;
  refundAmount: number;
  items: {
    name: string;
    sku?: string;
    qty: number;
    price: number;
    lineTotal: number;
  }[];
}

export function printReturnThermalHTMLReceipt(data: ReturnReceiptPayload) {
  const storeNameText = data.storeName || "Futura Hardware";
  const reasonText = (data.reason || "RETURN").replace(/_/g, " ").toUpperCase();

  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td colspan="3" class="item-name">${item.name}</td>
    </tr>
    <tr class="item-calc">
      <td class="qty" colspan="2">${item.qty} x</td>
      <td class="wh">${item.sku || ""}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Return-${data.returnNo}</title>
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
    .subtitle { font-size: 10px; font-weight: 900; margin-bottom: 2px; color: #000; border: 1px border #000; padding: 2px 4px; display: inline-block; margin-top: 3px; }
    .divider { border-top: 1px dashed #000; margin: 5px 0; }
    .double-divider { border-top: 2px double #000; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    td { vertical-align: top; padding: 1px 0; }
    .item-name { font-weight: 800; font-size: 11px; padding-top: 3px; word-break: break-word; }
    .item-calc { font-size: 10.5px; border-bottom: 1px dotted #bbb; padding-bottom: 3px; }
    .qty { width: 55%; font-weight: 700; }
    .wh { width: 15%; font-size: 8px; color: #444; text-align: center; }
    .line-total { width: 30%; text-align: right; font-weight: 900; }
    .grand-total-box {
      font-size: 13.5px;
      font-weight: 900;
      padding: 3px 0;
    }
    .footer { font-size: 9.5px; font-weight: 700; margin-top: 8px; line-height: 1.3; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="text-center">
    <div class="title">${storeNameText}</div>
    <div class="subtitle">*** RETURN / REFUND VOUCHER ***</div>
    ${data.storeAddress ? `<div style="font-size:9.5px; font-weight:600;">${data.storeAddress}</div>` : ""}
    ${data.storePhone ? `<div style="font-size:9.5px; font-weight:700;">Tel: ${data.storePhone}</div>` : ""}
  </div>

  <div class="divider"></div>

  <!-- Meta Info -->
  <table style="width:100%; font-size:10px; font-weight:700;">
    <tr>
      <td style="width:52%;">Return #: ${data.returnNo}</td>
      <td style="width:48%; text-align:right;">${data.date}</td>
    </tr>
    <tr>
      <td style="width:52%;">Orig Inv #: ${data.originalInvoiceNo}</td>
      <td style="width:48%; text-align:right;">Cashier: ${data.cashier}</td>
    </tr>
    ${data.customerName ? `<tr><td colspan="2">Cust: ${data.customerName}</td></tr>` : ""}
    <tr>
      <td colspan="2" style="padding-top:2px;">Reason: <strong>${reasonText}</strong></td>
    </tr>
    <tr>
      <td colspan="2" style="font-size:9.5px; font-weight:800;">
        Stock Status: ${data.isRestocked ? "[RESTOCKED TO INVENTORY]" : "[DEFECTIVE - NOT RESTOCKED]"}
      </td>
    </tr>
  </table>

  <div class="divider"></div>

  <!-- Returned Items Table -->
  <div style="font-size:10px; font-weight:900; margin-bottom:2px;">RETURNED ITEMS:</div>
  <table>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="divider"></div>

  <!-- Refund Summary -->
  <div class="double-divider"></div>
  <table style="width:100%;" class="grand-total-box">
    <tr>
      <td style="font-size:13.5px; font-weight:900;">TOTAL REFUND:</td>
      <td style="font-size:13.5px; font-weight:900; text-align:right;">Rs. ${data.refundAmount.toLocaleString()}</td>
    </tr>
  </table>
  <div class="double-divider"></div>

  <!-- Footer -->
  <div class="text-center footer">
    <div>*** OFFICIAL RETURN VOUCHER ***</div>
    <div>Thank you for your cooperation</div>
    <div>futurahardware.com</div>
  </div>
</body>
</html>`;

  // Hidden Iframe Print
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;width:80mm;height:1px;border:none;opacity:0;pointer-events:none;";

  let hasPrinted = false;

  const cleanup = () => {
    setTimeout(() => {
      try { document.body.removeChild(iframe); } catch {}
    }, 4000);
  };

  const doPrint = () => {
    if (hasPrinted) return;
    hasPrinted = true;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn("[Return Thermal Print] iframe.print() failed:", e);
    } finally {
      cleanup();
    }
  };

  iframe.onload = doPrint;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  setTimeout(() => {
    if (!hasPrinted) {
      doPrint();
    }
  }, 2000);
}

// ─────────────────────────────────────────────────────────────────────────────
// ── EXCHANGE RECEIPT THERMAL HTML PRINT ──────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

export interface ExchangeReceiptPayload {
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  exchangeNo: string;
  originalInvoiceNo: string;
  date: string;
  cashier: string;
  customerName?: string;
  returnedItems: {
    name: string;
    sku?: string;
    qty: number;
    price: number;
    lineTotal: number;
  }[];
  newItems: {
    name: string;
    sku?: string;
    qty: number;
    price: number;
    lineTotal: number;
  }[];
  returnedTotal: number;
  newTotal: number;
  deltaAmount: number;
}

export function printExchangeThermalHTMLReceipt(data: ExchangeReceiptPayload) {
  const storeNameText = data.storeName || "Futura Hardware";

  const returnedRows = data.returnedItems
    .map(
      (item) => `
    <tr>
      <td colspan="3" class="item-name">${item.name}</td>
    </tr>
    <tr class="item-calc">
      <td class="qty" colspan="2">${item.qty} x</td>
      <td class="wh">${item.sku || ""}</td>
    </tr>`
    )
    .join("");

  const newRows = data.newItems
    .map(
      (item) => `
    <tr>
      <td colspan="3" class="item-name">${item.name}</td>
    </tr>
    <tr class="item-calc">
      <td class="qty" colspan="2">${item.qty} x</td>
      <td class="wh">${item.sku || ""}</td>
    </tr>`
    )
    .join("");

  const isAdditionalPaid = data.deltaAmount > 0;
  const isRefunded = data.deltaAmount < 0;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Exchange-${data.exchangeNo}</title>
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
      width: 58mm;
      max-width: 58mm;
      margin: 0 auto;
      padding: 3mm 1mm;
      color: #000;
      background: #fff;
      font-size: 11px;
      line-height: 1.35;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .shop-title { font-size: 15px; font-weight: 900; text-transform: uppercase; margin-bottom: 2px; }
    .receipt-title { font-size: 12px; font-weight: 800; text-transform: uppercase; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0; margin: 6px 0; }
    .meta-table { width: 100%; margin-bottom: 6px; font-size: 10px; border-collapse: collapse; }
    .meta-table td { padding: 1px 0; vertical-align: top; }
    .meta-label { color: #333; width: 45%; }
    .meta-val { font-weight: bold; text-align: right; }
    .section-header { font-size: 10.5px; font-weight: 800; text-transform: uppercase; margin-top: 8px; margin-bottom: 4px; padding: 2px 0; border-bottom: 1px solid #000; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    .items-table td { padding: 1px 0; vertical-align: top; }
    .item-name { font-weight: 700; font-size: 11px; }
    .item-calc { font-size: 10px; font-family: monospace; }
    .item-calc .qty { width: 50%; }
    .item-calc .wh { width: 20%; color: #555; }
    .item-calc .line-total { width: 30%; text-align: right; font-weight: bold; }
    .summary-table { width: 100%; border-top: 1px dashed #000; margin-top: 6px; padding-top: 4px; font-size: 11px; }
    .summary-table td { padding: 2px 0; }
    .grand-total { font-size: 13px; font-weight: 900; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; }
    .footer { margin-top: 10px; border-top: 1px dashed #000; padding-top: 6px; font-size: 10px; text-align: center; }
  </style>
</head>
<body>
  <div class="text-center">
    <div class="shop-title">${storeNameText}</div>
    ${data.storeAddress ? `<div>${data.storeAddress}</div>` : ""}
    ${data.storePhone ? `<div>Tel: ${data.storePhone}</div>` : ""}
    <div class="receipt-title">ITEM EXCHANGE RECEIPT</div>
  </div>

  <table class="meta-table">
    <tr><td class="meta-label">Exchange No:</td><td class="meta-val">${data.exchangeNo}</td></tr>
    <tr><td class="meta-label">Orig Invoice:</td><td class="meta-val">${data.originalInvoiceNo}</td></tr>
    <tr><td class="meta-label">Date & Time:</td><td class="meta-val">${data.date}</td></tr>
    <tr><td class="meta-label">Cashier:</td><td class="meta-val">${data.cashier}</td></tr>
    ${data.customerName ? `<tr><td class="meta-label">Customer:</td><td class="meta-val">${data.customerName}</td></tr>` : ""}
  </table>

  <div class="section-header">1. RETURNED ITEMS</div>
  <table class="items-table">
    ${returnedRows || '<tr><td colspan="3">None</td></tr>'}
  </table>

  <div class="section-header">2. NEW ISSUED ITEMS</div>
  <table class="items-table">
    ${newRows || '<tr><td colspan="3">None</td></tr>'}
  </table>

  <table class="summary-table">
    <tr>
      <td>Total Returned:</td>
      <td class="text-right bold">Rs. ${data.returnedTotal.toLocaleString()}</td>
    </tr>
    <tr>
      <td>New Items Total:</td>
      <td class="text-right bold">Rs. ${data.newTotal.toLocaleString()}</td>
    </tr>
    ${
      isAdditionalPaid
        ? `<tr class="grand-total">
            <td class="bold">AMOUNT PAID TODAY:</td>
            <td class="text-right bold">Rs. ${data.deltaAmount.toLocaleString()}</td>
          </tr>`
        : isRefunded
        ? `<tr class="grand-total">
            <td class="bold">AMOUNT REFUNDED:</td>
            <td class="text-right bold">Rs. ${Math.abs(data.deltaAmount).toLocaleString()}</td>
          </tr>`
        : `<tr class="grand-total">
            <td class="bold">EVEN EXCHANGE:</td>
            <td class="text-right bold">Rs. 0</td>
          </tr>`
    }
  </table>

  <div class="footer">
    <div class="bold">Thank you for shopping at ${storeNameText}!</div>
    <div>Please retain this exchange receipt for your records.</div>
  </div>
</body>
</html>`;

  // Spool print job via invisible iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";

  let hasPrinted = false;

  const cleanup = () => {
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {}
    }, 4000);
  };

  const doPrint = () => {
    if (hasPrinted) return;
    hasPrinted = true;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn("[Exchange Thermal Print] iframe.print() failed:", e);
    } finally {
      cleanup();
    }
  };

  iframe.onload = doPrint;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => URL.revokeObjectURL(url), 10000);

  setTimeout(() => {
    if (!hasPrinted) {
      doPrint();
    }
  }, 2000);
}
