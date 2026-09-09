import api from "@/api/axiosInstance";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FUTURA HARDWARE POS — TEXT.LK SMS SERVICE (SUB-ACCOUNT: 09E63916 / Thaheshan)
 * API Endpoint : POST https://app.text.lk/api/v3/sms/send
 * Bearer Token : 5712|3BWcH4C9bFA69kplnjXmXlauJmxG1HIsPuXef5RF1eafd116
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TEXT_LK_API_URL = "https://app.text.lk/api/v3/sms/send";
const TEXT_LK_API_TOKEN = "5712|3BWcH4C9bFA69kplnjXmXlauJmxG1HIsPuXef5RF1eafd116";

/**
 * Dynamically fetch the current Shop Name from active user session / localStorage.
 * Defaults to "Futura Hardware" if not found.
 */
export function getShopName(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("shop_name") || localStorage.getItem("store_name");
    if (saved && saved.trim()) return saved.trim();
    try {
      const userRaw = localStorage.getItem("pos_user") || localStorage.getItem("user");
      if (userRaw) {
        const u = JSON.parse(userRaw);
        const name = u?.shop?.name || u?.shopName || u?.shop_name || u?.tenantName;
        if (name && name.trim()) return name.trim();
      }
    } catch {}
  }
  return "Futura Hardware";
}

export function getTEXTLKSenderID(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("TEXT_LK_SENDER_ID");
    if (saved && saved.trim()) return saved.trim();
  }
  return "TextLKDemo";
}

/**
 * Normalise a Sri Lankan phone number to E.164 format (94XXXXXXXXX)
 */
export function normaliseLKPhone(raw: string): string {
  if (!raw) return "";
  let phone = raw.trim().replace(/\s+/g, "").replace(/-/g, "");
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0") && phone.length === 10) phone = "94" + phone.slice(1);
  if (!phone.startsWith("94") && phone.length === 9) phone = "94" + phone;
  return phone;
}

/**
 * Core function to send SMS via text.lk API v3
 */
export async function sendViaTEXTLK(
  recipient: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  const normalised = normaliseLKPhone(recipient);
  if (!normalised || normalised.length < 11) {
    return { success: false, message: `Invalid phone number: ${recipient}` };
  }

  const senderId = getTEXTLKSenderID();

  try {
    // Call internal Next.js API route (runs Node.js server-to-server to bypass browser CSRF & CORS)
    const res = await fetch("/api/shop/self-report-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send-sms",
        recipient: normalised,
        sender_id: senderId,
        message,
      }),
    });

    const json = await res.json().catch(() => ({}));
    console.log("[TEXT.LK Server Proxy Response]", normalised, res.status, json);

    if (res.ok && json?.status !== "error" && !json?.message?.toLowerCase?.().includes("csrf")) {
      return { success: true, message: `SMS sent via TEXT.LK to ${normalised}.` };
    }

    return {
      success: false,
      message: json?.message || "Failed to send SMS via TEXT.LK",
    };
  } catch (err: any) {
    console.warn("[TEXT.LK SMS Proxy Warning]:", err?.message || err);
    return { success: false, message: err?.message || "SMS dispatch error" };
  }
}

export interface CreditPurchaseSMSPayload {
  customerName: string;
  customerPhone: string;
  date: string;
  items: { name: string; qty: number }[]; // Items with qty ONLY — NO per-item prices
  totalOrderAmount: number;
  amountPaid: number;
  leftoverCreditAmount: number;
  totalOutstandingCreditBalance: number;
  invoiceRef: string;
  shopName?: string;
}

/**
 * Format Credit Purchase SMS — sent when a credit sale is completed at POS checkout.
 * Structured with clear section line breaks and gaps.
 * NO per-item prices — ONLY item names and purchase count (xQty).
 * Includes Shop Name at the start and end.
 */
export function formatCreditPurchaseSMSTemplate(data: CreditPurchaseSMSPayload): string {
  const shopName = data.shopName || getShopName();
  const itemsList =
    data.items && data.items.length > 0
      ? data.items.map((i) => `• ${i.qty}x ${i.name}`).join("\n")
      : "• Credit Purchase Items";

  return [
    `[${shopName}]`,
    `--------------------------------`,
    `Dear ${data.customerName},`,
    ``,
    `CREDIT PURCHASE RECEIPT`,
    `Date: ${data.date}`,
    `Invoice: ${data.invoiceRef}`,
    ``,
    `Purchased Items (Qty Only):`,
    itemsList,
    ``,
    `Order Total: Rs. ${data.totalOrderAmount.toLocaleString()}`,
    `Amount Paid Today: Rs. ${data.amountPaid.toLocaleString()}`,
    `Credit Added Today: Rs. ${data.leftoverCreditAmount.toLocaleString()}`,
    ``,
    `Total Outstanding Credit: Rs. ${data.totalOutstandingCreditBalance.toLocaleString()}`,
    `--------------------------------`,
    `Thank you for purchasing with ${shopName}!`,
  ].join("\n");
}

/**
 * Format Monthly/Batch/Single Credit Reminder Template
 * Includes Shop Name at the start and end, structured line gaps,
 * and optional recent bills purchase history details.
 */
export function formatMonthlyCreditReminderSMSTemplate(
  customerName: string,
  totalOutstandingCreditBalance: number,
  purchaseHistorySummary?: string,
  shopNameOverride?: string
): string {
  const shopName = shopNameOverride || getShopName();

  const lines = [
    `[${shopName}]`,
    `--------------------------------`,
    `Dear ${customerName},`,
    ``,
    `CREDIT ACCOUNT REMINDER`,
  ];

  if (purchaseHistorySummary && purchaseHistorySummary.trim()) {
    lines.push(
      ``,
      `Outstanding Purchases Details:`,
      purchaseHistorySummary.trim()
    );
  }

  lines.push(
    ``,
    `Current Total Outstanding Balance:`,
    `Rs. ${totalOutstandingCreditBalance.toLocaleString()}`,
    ``,
    `Please visit our shop or contact us to settle your outstanding balance at your earliest convenience.`,
    `--------------------------------`,
    `Thank you for purchasing with ${shopName}!`
  );

  return lines.join("\n");
}

/**
 * Format Credit Settlement Payment Receipt Template
 */
export function formatCreditSettlementSMSTemplate(
  customerName: string,
  amountPaid: number,
  remainingBalance: number,
  paymentMethod: string,
  shopNameOverride?: string
): string {
  const shopName = shopNameOverride || getShopName();

  return [
    `[${shopName}]`,
    `--------------------------------`,
    `Dear ${customerName},`,
    ``,
    `CREDIT SETTLEMENT RECEIPT`,
    `Payment Received: Rs. ${amountPaid.toLocaleString()}`,
    `Payment Method: ${paymentMethod}`,
    ``,
    `Remaining Outstanding Balance: Rs. ${remainingBalance.toLocaleString()}`,
    `--------------------------------`,
    `Thank you for purchasing with ${shopName}!`,
  ].join("\n");
}

/**
 * Helper to fetch and format recent credit purchase history for a customer.
 * Lists items with QUANTITIES ONLY — NO individual product prices!
 */
export async function fetchCustomerCreditHistorySummary(
  customerId?: string,
  customerPhone?: string,
  customerName?: string
): Promise<string> {
  if (!customerId && !customerPhone && !customerName) return "";
  try {
    const res = await api.get("/sales", { params: { limit: 500 } });
    // Unwrap all possible backend response shapes
    const rawData =
      res.data?.data?.data ||
      res.data?.data?.items ||
      res.data?.data ||
      res.data?.items ||
      res.data ||
      [];
    const allSales: any[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData?.items)
      ? rawData.items
      : [];

    const normalisePhone = (p: string) =>
      p ? p.replace(/\s+/g, "").replace(/^\+/, "").replace(/^0/, "94") : "";
    const normCustPhone = customerPhone ? normalisePhone(customerPhone) : "";
    const normCustName = customerName ? customerName.trim().toLowerCase() : "";

    // Step 1: Filter by customer identity (ID, phone, or name)
    const matchingCustomerSales = allSales.filter((s: any) => {
      const matchId =
        customerId &&
        (s.customerId === customerId ||
          s.customer_id === customerId ||
          s.customer?.id === customerId);

      const matchPhone =
        normCustPhone &&
        (normalisePhone(s.customerPhone || "") === normCustPhone ||
          normalisePhone(s.phone || "") === normCustPhone ||
          normalisePhone(s.customer?.phone || "") === normCustPhone);

      const matchName =
        normCustName &&
        (s.customerName?.toLowerCase() === normCustName ||
          s.customer?.name?.toLowerCase() === normCustName ||
          s.name?.toLowerCase() === normCustName);

      return matchId || matchPhone || matchName;
    });

    if (matchingCustomerSales.length === 0) return "";

    // Step 2: Prefer credit sales, fall back to all sales for this customer
    let creditSales = matchingCustomerSales.filter((s: any) => {
      const pm = String(s.paymentMethod || "").toUpperCase();
      return (
        pm.includes("CREDIT") ||
        Number(s.creditAmountAdded || s.creditAmount || s.leftoverCreditAmount || 0) > 0
      );
    });
    if (creditSales.length === 0) creditSales = matchingCustomerSales;

    const recentSales = creditSales
      .sort((a: any, b: any) =>
        new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime()
      );

    // ── Deep item extractor (mirrors TransactionDetailsModal logic) ──
    const looksLikeItem = (o: any): boolean => {
      if (!o || typeof o !== "object" || Array.isArray(o)) return false;
      return (
        "productId" in o || "product_id" in o ||
        "productName" in o || "product_name" in o ||
        "itemName" in o || "item_name" in o ||
        "stockId" in o || "stock_id" in o ||
        "quantity" in o || "qty" in o ||
        "unitPrice" in o || "unit_price" in o ||
        !!o.product?.name || !!o.stock?.product?.name
      );
    };

    const deepExtractItems = (obj: any, depth = 0): any[] => {
      if (!obj || typeof obj !== "object" || depth > 6) return [];
      if (Array.isArray(obj) && obj.length > 0 && looksLikeItem(obj[0])) return obj;
      const itemKeys = [
        "items", "saleItems", "sale_items", "orderItems", "invoiceItems",
        "lineItems", "line_items", "products", "cart", "details",
        "transaction_items", "purchasedItems", "purchased_items",
      ];
      for (const k of itemKeys) {
        const val = obj[k];
        if (typeof val === "string" && val.trim().startsWith("[")) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed) && parsed.length > 0 && looksLikeItem(parsed[0])) return parsed;
          } catch {}
        }
        if (Array.isArray(val) && val.length > 0 && looksLikeItem(val[0])) return val;
      }
      for (const k of Object.keys(obj)) {
        let arr: any = obj[k];
        if (typeof arr === "string" && arr.trim().startsWith("[")) {
          try { arr = JSON.parse(arr); } catch {}
        }
        if (Array.isArray(arr) && arr.length > 0 && looksLikeItem(arr[0])) return arr;
      }
      for (const k of Object.keys(obj)) {
        const child = obj[k];
        if (child && typeof child === "object" && !Array.isArray(child)) {
          const found = deepExtractItems(child, depth + 1);
          if (found.length > 0) return found;
        }
      }
      return [];
    };

    const extractProductName = (i: any): string =>
      i.productName || i.product_name || i.itemName || i.item_name ||
      i.productTitle || i.product?.name || i.stock?.product?.name ||
      i.stockItem?.product?.name || i.stockItem?.name ||
      i.item?.name || i.name || i.title || i.label || "";

    // Step 3: Format lines, fetching full sale detail if items are missing from list
    const lines: string[] = [];
    for (const s of recentSales) {
      const dateStr = s.createdAt
        ? new Date(s.createdAt).toLocaleDateString("en-GB")
        : s.date || "";
      const invRef = s.invoiceNumber || s.invoiceNo || s.invoice_number || s.id || "INV";
      const billTotal = Number(s.total || s.totalAmount || s.amount || 0);

      // Try deep extraction from list response first
      let saleItems = deepExtractItems(s);

      // If no items, fetch full sale detail by ID
      if (saleItems.length === 0 && s.id) {
        try {
          const detailRes = await api.get(`/sales/${s.id}`);
          saleItems = deepExtractItems(detailRes.data);
        } catch {}
      }

      const itemList =
        saleItems.length > 0
          ? saleItems
              .map((i: any) => `${Number(i.quantity || i.qty || i.count || 1)}x ${extractProductName(i) || "Item"}`)
              .join(", ")
          : null;

      lines.push(
        [
          `• Inv: ${invRef} (${dateStr})`,
          itemList ? `  Items: ${itemList}` : null,
          `  Bill Total: Rs. ${billTotal.toLocaleString()}`,
        ].filter(Boolean).join("\n")
      );
    }

    return lines.join("\n\n");
  } catch (err) {
    console.warn("Could not fetch customer purchase history for SMS reminder", err);
    return "";
  }
}

/**
 * Send Credit Purchase SMS Notification (called after POS credit checkout)
 */
export async function sendCreditPurchaseSMS(
  payload: CreditPurchaseSMSPayload
): Promise<{ success: boolean; message: string }> {
  const message = formatCreditPurchaseSMSTemplate(payload);
  console.log("[TEXT.LK SMS] Sending Credit Purchase Notification:", {
    recipient: payload.customerPhone,
    message,
  });
  return sendViaTEXTLK(payload.customerPhone, message);
}

/**
 * Send a single credit reminder SMS to a customer
 */
export async function sendSingleCreditReminderSMS(
  customerName: string,
  phone: string,
  outstandingBalance: number,
  customerId?: string,
  purchaseHistorySummary?: string
): Promise<{ success: boolean; message: string }> {
  let summary = purchaseHistorySummary || "";
  if (!summary && (customerId || phone || customerName)) {
    summary = await fetchCustomerCreditHistorySummary(customerId, phone, customerName);
  }

  const message = formatMonthlyCreditReminderSMSTemplate(
    customerName,
    outstandingBalance,
    summary
  );
  return sendViaTEXTLK(phone, message);
}

/**
 * Send Credit Settlement Payment Receipt SMS
 */
export async function sendCreditSettlementSMS(
  customerName: string,
  phone: string,
  amountPaid: number,
  remainingBalance: number,
  paymentMethod: string
): Promise<{ success: boolean; message: string }> {
  const message = formatCreditSettlementSMSTemplate(
    customerName,
    amountPaid,
    remainingBalance,
    paymentMethod
  );
  console.log("[TEXT.LK SMS] Sending Credit Settlement Receipt:", { recipient: phone, message });
  return sendViaTEXTLK(phone, message);
}

/**
 * Batch Credit Reminder — iterates through provided credit customers with outstanding balances
 * and dispatches TEXT.LK SMS reminders to each.
 */
export async function triggerBatchCreditReminders(
  creditCustomers?: { id?: string; name: string; phone: string; outstanding: number; purchaseHistorySummary?: string }[]
): Promise<{ success: boolean; sentCount: number; message: string }> {
  let list = creditCustomers || [];

  if (list.length === 0) {
    try {
      const res = await api.get("/customers");
      const rawData = res.data?.data || res.data || [];
      const items: any[] = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : [];
      list = items
        .map((c: any) => ({
          id: c.id,
          name: c.name || "Customer",
          phone: c.phone || "",
          outstanding: Number(c.outstandingBalance ?? c.outstanding ?? 0),
        }))
        .filter((c) => c.outstanding > 0 && c.phone && c.phone !== "N/A");
    } catch (e) {
      console.warn("Could not fetch customer list for batch SMS reminders", e);
    }
  }

  const eligible = list.filter((c) => c.outstanding > 0 && c.phone && c.phone !== "N/A");

  if (eligible.length === 0) {
    return {
      success: true,
      sentCount: 0,
      message: "No overdue/credit customers with valid phone numbers found.",
    };
  }

  let sent = 0;
  for (const c of eligible) {
    const historySummary = c.purchaseHistorySummary || (await fetchCustomerCreditHistorySummary(c.id, c.phone, c.name));
    const res = await sendSingleCreditReminderSMS(
      c.name,
      c.phone,
      c.outstanding,
      c.id,
      historySummary
    );
    if (res.success) sent++;
    await new Promise((r) => setTimeout(r, 250));
  }

  return {
    success: true,
    sentCount: sent,
    message: `Batch SMS credit reminders sent to ${sent} customer(s) via TEXT.LK.`,
  };
}


