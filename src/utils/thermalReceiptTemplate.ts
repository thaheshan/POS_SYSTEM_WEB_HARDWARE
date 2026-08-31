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
export function formatESCPosTextStream(data: HardwarePrintReceiptPayload, widthChars = 48): string {
  const line = "-".repeat(widthChars);
  const doubleLine = "=".repeat(widthChars);
  const storeNameText = data.storeName || "Futura Hardware";

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
  if (data.storeAddress) lines.push(center(data.storeAddress));
  if (data.storePhone) lines.push(center(`Tel: ${data.storePhone}`));
  lines.push(line);

  // Meta
  lines.push(leftRight(`Invoice: ${data.invoiceNo}`, `Date: ${data.date}`));
  lines.push(leftRight(`Cashier: ${data.cashier}`, `Type: ${data.customerType || "Walk-In"}`));
  if (data.customerName && data.customerName !== "Walk-in Customer") {
    lines.push(`Customer: ${data.customerName}`);
    if (data.customerPhone) lines.push(`Phone: ${data.customerPhone}`);
  }
  lines.push(leftRight(`Payment: ${data.paymentMethod}`, `Status: ${data.creditLeftover && data.creditLeftover > 0 ? "CREDIT SALE" : "PAID"}`));
  lines.push(line);

  // Item Table
  lines.push(leftRight("ITEM", "QTY x PRICE   TOTAL"));
  lines.push(line);

  data.items.forEach((item) => {
    // Truncate name if too long
    const maxNameLength = widthChars - 22;
    const nameStr = item.name.length > maxNameLength ? item.name.slice(0, maxNameLength - 2) + ".." : item.name;
    const rightStr = `${item.qty} x ${item.price.toLocaleString()} = ${item.lineTotal.toLocaleString()}`;
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
  lines.push(leftRight("Amount Tendered:", `Rs. ${data.amountTendered.toLocaleString()}`));
  if (data.creditLeftover && data.creditLeftover > 0) {
    lines.push(leftRight("Credit Added Today:", `Rs. ${data.creditLeftover.toLocaleString()}`));
    if (data.totalOutstandingCredit !== undefined) {
      lines.push(leftRight("Total Account Credit:", `Rs. ${data.totalOutstandingCredit.toLocaleString()}`));
    }
  } else {
    lines.push(leftRight("Change Returned:", `Rs. ${data.change.toLocaleString()}`));
  }

  // Footer
  lines.push(line);
  lines.push(center(`Thank you for shopping at ${storeNameText}!`));
  lines.push(center("Returns accepted within 7 days with receipt."));
  lines.push(center("futurahardware.com"));
  lines.push("\n\n\n"); // Feed for paper cut

  return lines.join("\n");
}

/**
 * 2. Dedicated HTML Thermal Receipt Window Generator (Exact 80mm / 58mm Paper Size)
 * Triggered when printing to thermal receipt printer via OS print driver dialog.
 */
export function printThermalHTMLReceipt(data: HardwarePrintReceiptPayload) {
  const storeNameText = data.storeName || "Futura Hardware";

  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td colspan="3" class="item-name">${item.name}</td>
    </tr>
    <tr class="item-calc">
      <td class="qty">${item.qty} x Rs. ${item.price.toLocaleString()}</td>
      <td class="wh">${item.warehouseName || ""}</td>
      <td class="line-total">Rs. ${item.lineTotal.toLocaleString()}</td>
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
        size: 80mm auto;
        margin: 0;
      }
      body {
        width: 78mm;
        margin: 0 auto;
        padding: 4mm 2mm;
      }
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      line-height: 1.3;
      color: #000;
      background: #fff;
      width: 78mm;
      margin: 0 auto;
      padding: 10px 4px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .title { font-size: 16px; font-weight: 900; letter-spacing: -0.5px; }
    .subtitle { font-size: 10px; margin-bottom: 4px; }
    .divider { border-top: 1px dashed #000; margin: 6px 0; }
    .double-divider { border-top: 2px double #000; margin: 6px 0; }
    .row { display: flex; justify-content: space-between; }
    .meta-row { font-size: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 4px 0; }
    .item-name { font-weight: bold; padding-top: 4px; font-size: 11px; }
    .item-calc { font-size: 10px; border-bottom: 1px dotted #ccc; }
    .qty { width: 50%; }
    .wh { width: 20%; font-size: 8px; color: #555; text-align: center; }
    .line-total { width: 30%; text-align: right; font-weight: bold; }
    .grand-total-box {
      font-size: 14px;
      font-weight: 900;
      padding: 4px 0;
      display: flex;
      justify-content: space-between;
    }
    .footer { font-size: 9px; margin-top: 10px; }
  </style>
</head>
<body>
  <!-- Thermal Header -->
  <div class="text-center">
    <div class="title">${storeNameText.toUpperCase()}</div>
    <div class="subtitle">Hardware &amp; Building Materials</div>
    ${data.storeAddress ? `<div>${data.storeAddress}</div>` : ""}
    ${data.storePhone ? `<div>Tel: ${data.storePhone}</div>` : ""}
  </div>

  <div class="divider"></div>

  <!-- Meta Info -->
  <div class="meta-row">
    <div class="row"><span>Inv #: ${data.invoiceNo}</span><span>${data.date}</span></div>
    <div class="row"><span>Cashier: ${data.cashier}</span><span>Type: ${data.customerType || "Walk-In"}</span></div>
    ${
      data.customerName && data.customerName !== "Walk-in Customer"
        ? `<div class="row"><span>Cust: ${data.customerName}</span><span>${data.customerPhone || ""}</span></div>`
        : ""
    }
    <div class="row"><span>Pay Method: ${data.paymentMethod}</span><span>${data.creditLeftover && data.creditLeftover > 0 ? "[CREDIT SALE]" : "[PAID]"}</span></div>
  </div>

  <div class="divider"></div>

  <!-- Item Table -->
  <table>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="divider"></div>

  <!-- Totals -->
  <div class="row"><span>Subtotal:</span><span>Rs. ${data.subtotal.toLocaleString()}</span></div>
  ${data.discount > 0 ? `<div class="row"><span>Discount:</span><span>-Rs. ${data.discount.toLocaleString()}</span></div>` : ""}
  <div class="double-divider"></div>
  <div class="grand-total-box">
    <span>TOTAL:</span>
    <span>Rs. ${data.total.toLocaleString()}</span>
  </div>
  <div class="double-divider"></div>

  <!-- Payment Breakdown -->
  <div class="row"><span>Tendered / Paid:</span><span>Rs. ${data.amountTendered.toLocaleString()}</span></div>
  ${
    data.creditLeftover && data.creditLeftover > 0
      ? `
  <div class="row bold"><span>Credit Added Today:</span><span>Rs. ${data.creditLeftover.toLocaleString()}</span></div>
  ${data.totalOutstandingCredit !== undefined ? `<div class="row bold"><span>Total Account Credit:</span><span>Rs. ${data.totalOutstandingCredit.toLocaleString()}</span></div>` : ""}
  `
      : `
  <div class="row"><span>Change:</span><span>Rs. ${data.change.toLocaleString()}</span></div>
  `
  }

  <div class="divider"></div>

  <!-- Footer -->
  <div class="text-center footer">
    <div>Thank you for shopping at ${storeNameText}!</div>
    <div>Returns accepted within 7 days with receipt</div>
    <div>futurahardware.com</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 500);
    };
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) {
    alert("Pop-up blocked. Please allow pop-ups for Futura Hardware POS to print thermal receipts.");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
