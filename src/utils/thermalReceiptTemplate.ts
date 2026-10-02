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
  const storeNameText =
    data.storeName && !data.storeName.toLowerCase().includes("futura") && !data.storeName.toLowerCase().includes("user's")
      ? data.storeName
      : "Trinco Hardware & Electricals";
  const storeAddressText = data.storeAddress || "";
  const storePhoneText = data.storePhone || "";

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
  if (storeAddressText) lines.push(center(storeAddressText));
  if (storePhoneText) lines.push(center(`Tel: ${storePhoneText}`));
  lines.push(line);

  // Meta
  lines.push(leftRight(`Inv: ${data.invoiceNo}`, `${data.date.slice(0, 10)}`));
  lines.push(leftRight(`Cashier: ${data.cashier}`, `Type: ${data.customerType || "Walk-In"}`));
  if (data.customerName && data.customerName !== "Walk-in Customer") {
    lines.push(`Cust: ${data.customerName}`);
  }
  lines.push(leftRight(`Pay: ${data.paymentMethod}`, `Status: ${data.creditLeftover && data.creditLeftover > 0 ? "CREDIT" : "PAID"}`));
  lines.push(line);

  // Item Table
  lines.push(leftRight("ITEM", "TOTAL"));
  lines.push(line);

  data.items.forEach((item) => {
    lines.push(item.name);
    const itemDiscount = Number(item.discountAmount) || 0;
    const unitPriceStr = `Rs. ${Number(item.price).toLocaleString()}`;
    const finalLineTotal = item.lineTotal || item.qty * (item.price || 0);
    const qtyStr = `  ${item.qty} x ${unitPriceStr}`;
    const totalStr = `Rs. ${finalLineTotal.toLocaleString()}`;
    lines.push(leftRight(qtyStr, totalStr));
    // Show product-specific discount directly under the product line
    if (itemDiscount > 0) {
      const discountLabel = item.discountPercentage && item.discountPercentage > 0
        ? `  Discount (${item.discountPercentage.toFixed(0)}%)`
        : `  Item Discount`;
      const discountValue = `-Rs. ${itemDiscount.toLocaleString()}`;
      lines.push(leftRight(discountLabel, discountValue));
    }
  });

  lines.push(line);

  // Totals — item-level discounts are already shown under each product above
  const totalOrderDiscount = Number(data.discount) || 0;

  lines.push(leftRight("Subtotal:", `Rs. ${data.subtotal.toLocaleString()}`));
  if (totalOrderDiscount > 0) {
    lines.push(leftRight("Order Discount:", `-Rs. ${totalOrderDiscount.toLocaleString()}`));
  }
  lines.push(doubleLine);
  lines.push(leftRight("GRAND TOTAL:", `Rs. ${data.total.toLocaleString()}`));
  lines.push(doubleLine);

  // Payment Breakdown
  const isCredit =
    (data.creditLeftover && data.creditLeftover > 0) ||
    String(data.paymentMethod).toUpperCase() === "CREDIT";
  if (isCredit) {
    lines.push(leftRight("Paid So Far:", `Rs. ${data.amountTendered.toLocaleString()}`));
    lines.push(leftRight("Outstanding Balance:", `Rs. ${(data.creditLeftover ?? 0).toLocaleString()}`));
    lines.push(line);
    const finalCredit =
      data.totalOutstandingCredit !== undefined && data.totalOutstandingCredit !== null
        ? data.totalOutstandingCredit
        : data.creditLeftover ?? 0;
    lines.push(leftRight("TOTAL OUTSTANDING:", `Rs. ${Number(finalCredit).toLocaleString()}`));
    lines.push(center("(Total Credit)"));
    lines.push(line);
  } else {
    lines.push(leftRight("Tendered / Paid:", `Rs. ${data.amountTendered.toLocaleString()}`));
    lines.push(leftRight("Change:", `Rs. ${data.change.toLocaleString()}`));
  }

  // Footer
  lines.push(line);
  lines.push(center(`Thank you for shopping at ${storeNameText}!`));
  lines.push("\n\n\n"); // Feed for paper cut

  return lines.join("\n");
}

/**
 * Opens a dedicated thermal receipt popup window and initiates printing.
 * Guarantees that the thermal window actually opens on screen and triggers print.
 */
export function openThermalPrintWindow(html: string, title = "Thermal Receipt") {
  if (typeof window === "undefined") return;

  const width = 420;
  const height = 650;
  const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
  const top = Math.max(0, Math.floor((window.screen.height - height) / 2));

  // 1. Try opening a centered dedicated thermal preview & print popup window
  const printWin = window.open(
    "",
    "_blank",
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes`
  );

  if (printWin) {
    try {
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.focus();
      setTimeout(() => {
        try {
          printWin.focus();
          printWin.print();
        } catch (e) {
          console.warn("[Thermal Print] Window print failed:", e);
        }
      }, 350);
      return;
    } catch (e) {
      console.warn("[Thermal Print] Failed to write to print window:", e);
    }
  }

  // 2. Fallback: Open via Blob URL in new tab if blank popup was blocked
  try {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const newTab = window.open(url, "_blank");
    if (newTab) {
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }
  } catch (e) {
    console.warn("[Thermal Print] Blob URL fallback failed:", e);
  }

  // 3. Last Resort: Same-origin iframe fallback
  try {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn("[Thermal Print] Iframe print failed:", e);
        }
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {}
        }, 5000);
      }, 350);
    }
  } catch (e) {
    console.error("[Thermal Print] All print methods failed:", e);
  }
}

/**
 * 2. Dedicated HTML Thermal Receipt Window Generator (Exact 58mm/80mm Safe Paper Boundary)
 * Triggered when printing to thermal receipt printer via OS print driver dialog.
 */
export function printThermalHTMLReceipt(data: HardwarePrintReceiptPayload) {
  const storeNameText =
    data.storeName && !data.storeName.toLowerCase().includes("futura") && !data.storeName.toLowerCase().includes("user's")
      ? data.storeName
      : "Trinco Hardware & Electricals";
  const storeAddressText = data.storeAddress || "";
  const storePhoneText = data.storePhone || "";

  const itemRows = data.items
    .map(
      (item) => {
        const itemDiscount = Number(item.discountAmount) || 0;
        const finalLineTotal = item.lineTotal || item.qty * (item.price || 0);
        const discountRow = itemDiscount > 0
          ? `
    <tr class="item-disc">
      <td colspan="2" style="font-size:10px; font-weight:700; padding-left:4px; color:#000;">${
        item.discountPercentage && item.discountPercentage > 0
          ? `  Discount (${item.discountPercentage.toFixed(0)}%)`
          : `  Item Discount`
      }</td>
      <td class="line-total" style="color:#000; font-weight:800;">-Rs. ${itemDiscount.toLocaleString()}</td>
    </tr>`
          : "";

        return `
    <tr>
      <td colspan="3" class="item-name">${item.name}</td>
    </tr>
    <tr class="item-calc">
      <td class="qty">${item.qty} x Rs. ${Number(item.price).toLocaleString()}</td>
      <td class="wh">${item.warehouseName || ""}</td>
      <td class="line-total">Rs. ${finalLineTotal.toLocaleString()}</td>
    </tr>${discountRow}`;
      }
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
    <div class="title">${storeNameText}</div>
    ${storeAddressText ? `<div style="font-size:9.5px; font-weight:600;">${storeAddressText}</div>` : ""}
    ${storePhoneText ? `<div style="font-size:9.5px; font-weight:700;">Tel: ${storePhoneText}</div>` : ""}
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
        ? `<tr><td colspan="2">Cust: ${data.customerName}</td></tr>`
        : ""
    }
    <tr>
      <td style="width:50%;">Pay: ${data.paymentMethod}</td>
      <td style="width:50%; text-align:right;">${
        data.creditLeftover && data.creditLeftover > 0 ? "[PARTIAL / CREDIT]" : "[PAID]"
      }</td>
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

  <!-- Totals — item-level discounts already shown under each product above -->
  ${(() => {
    const totalOrderDiscountHtml = Number(data.discount) || 0;
    return `
  <table style="width:100%; font-size:11px; font-weight:700;">
    <tr>
      <td>Subtotal:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${data.subtotal.toLocaleString()}</td>
    </tr>
    ${totalOrderDiscountHtml > 0 ? `<tr><td>Order Discount:</td><td style="text-align:right; font-weight:900;">-Rs. ${totalOrderDiscountHtml.toLocaleString()}</td></tr>` : ""}
  </table>`;
  })()}

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
    ${
      (data.creditLeftover && data.creditLeftover > 0) ||
      String(data.paymentMethod).toUpperCase() === "CREDIT"
        ? `
    <tr>
      <td>Paid So Far:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${data.amountTendered.toLocaleString()}</td>
    </tr>
    <tr class="bold" style="color:#c00;">
      <td>Outstanding Balance:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${(data.creditLeftover ?? 0).toLocaleString()}</td>
    </tr>
    <tr>
      <td colspan="2" style="border-top:1px dashed #000; padding-top:4px;"></td>
    </tr>
    <tr class="bold" style="font-size:11.5px; background:#f9f9f9;">
      <td style="padding:3px 2px;">TOTAL OUTSTANDING:</td>
      <td style="text-align:right; font-weight:900; font-size:12px; color:#c00; padding:3px 2px;">Rs. ${Number(
        data.totalOutstandingCredit !== undefined && data.totalOutstandingCredit !== null
          ? data.totalOutstandingCredit
          : data.creditLeftover ?? 0
      ).toLocaleString()}</td>
    </tr>
    <tr>
      <td colspan="2" style="font-size:8.5px; font-weight:700; color:#555; text-align:right;">(Total Credit)</td>
    </tr>
    `
        : `
    <tr>
      <td>Tendered / Paid:</td>
      <td style="text-align:right; font-weight:900;">Rs. ${data.amountTendered.toLocaleString()}</td>
    </tr>
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

  openThermalPrintWindow(html, `Receipt-${data.invoiceNo}`);
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
  const storeNameText =
    data.storeName && !data.storeName.toLowerCase().includes("futura") && !data.storeName.toLowerCase().includes("user's")
      ? data.storeName
      : "Trinco Hardware & Electricals";
  const storeAddressText = data.storeAddress || "";
  const storePhoneText = data.storePhone || "";
  const reasonText = (data.reason || "RETURN").replace(/_/g, " ").toUpperCase();

  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td colspan="3" class="item-name">${item.name}</td>
    </tr>
    <tr class="item-calc">
      <td class="qty">${item.qty} x</td>
      <td class="wh">${item.sku || ""}</td>
      <td class="line-total">Rs. ${(item.lineTotal || item.qty * (item.price || 0)).toLocaleString()}</td>
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
    .qty { width: 50%; font-weight: 700; }
    .wh { width: 15%; font-size: 8px; color: #444; text-align: center; }
    .line-total { width: 35%; text-align: right; font-weight: 900; }
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
    <div>${storeNameText}</div>
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

  openThermalPrintWindow(html, `Return-${data.returnNo}`);
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
  const storeNameText =
    data.storeName && !data.storeName.toLowerCase().includes("futura") && !data.storeName.toLowerCase().includes("user's")
      ? data.storeName
      : "Trinco Hardware & Electricals";
  const storeAddressText = data.storeAddress || "";
  const storePhoneText = data.storePhone || "";

  const returnedRows = data.returnedItems
    .map(
      (item) => `
    <tr>
      <td colspan="3" class="item-name">${item.name}</td>
    </tr>
    <tr class="item-calc">
      <td class="qty">${item.qty} x</td>
      <td class="wh">${item.sku || ""}</td>
      <td class="line-total">Rs. ${(item.lineTotal || item.qty * (item.price || 0)).toLocaleString()}</td>
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
      <td class="qty">${item.qty} x</td>
      <td class="wh">${item.sku || ""}</td>
      <td class="line-total">Rs. ${(item.lineTotal || item.qty * (item.price || 0)).toLocaleString()}</td>
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

  openThermalPrintWindow(html, `Exchange-${data.exchangeNo}`);
}
