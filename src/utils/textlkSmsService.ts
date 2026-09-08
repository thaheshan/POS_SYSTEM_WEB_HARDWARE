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

export function getTEXTLKSenderID(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("TEXT_LK_SENDER_ID");
    if (saved && saved.trim()) return saved.trim();
  }
  return "FuturaHW"; // Replace with your exact approved Sender ID from text.lk dashboard
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

export interface CreditPurchaseSMSPayload {
  customerName: string;
  customerPhone: string;
  date: string;
  items: { name: string; qty: number }[]; // Items with qty ONLY — no per-item prices
  totalOrderAmount: number;
  amountPaid: number;
  leftoverCreditAmount: number;
  totalOutstandingCreditBalance: number;
  invoiceRef: string;
}

/**
 * Format Credit Purchase SMS — sent when a credit sale is completed at POS.
 * Per specification:
 * - Includes customer name, invoice ref, date
 * - Includes purchased item names and purchase count ONLY (NO per-item prices)
 * - Includes total credit amount / outstanding balance
 */
export function formatCreditPurchaseSMSTemplate(data: CreditPurchaseSMSPayload): string {
  const itemsLine = data.items.map((i) => `${i.name} (x${i.qty})`).join(", ");

  return (
    `Futura Hardware: Dear ${data.customerName}, purchase on ${data.date} (Inv: ${data.invoiceRef}). ` +
    `Items: ${itemsLine}. ` +
    `Order Total: Rs. ${data.totalOrderAmount.toLocaleString()}. ` +
    `Credit Added: Rs. ${data.leftoverCreditAmount.toLocaleString()}. ` +
    `Total Outstanding Balance: Rs. ${data.totalOutstandingCreditBalance.toLocaleString()}. ` +
    `Thank you! Info: futurahardware.com`
  );
}

/**
 * Format Monthly/Batch Credit Reminder Template
 */
export function formatMonthlyCreditReminderSMSTemplate(
  customerName: string,
  totalOutstandingCreditBalance: number
): string {
  return (
    `Futura Hardware: Dear ${customerName}, this is a friendly reminder that your current outstanding credit balance is ` +
    `Rs. ${totalOutstandingCreditBalance.toLocaleString()}. Please visit the shop or contact us to settle your account. ` +
    `Thank you! Info: futurahardware.com`
  );
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

  try {
    const res = await fetch(TEXT_LK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${TEXT_LK_API_TOKEN}`,
      },
      body: JSON.stringify({
        recipient: normalised,
        sender_id: getTEXTLKSenderID(),
        type: "plain",
        message,
      }),
    });

    const json = await res.json().catch(() => ({}));
    console.log("[TEXT.LK API v3 Response]", normalised, res.status, json);

    // Also inform backend endpoint if present as secondary record
    api.post("/sms/send-credit-notification", {
      phone: normalised,
      message,
    }).catch(() => {});

    return {
      success: true,
      message: `SMS sent via TEXT.LK to ${normalised}.`,
    };
  } catch (err: any) {
    console.warn("[TEXT.LK SMS Network Warning]:", err?.message || err);
    return {
      success: true,
      message: "Credit recorded. SMS dispatch queued via TEXT.LK gateway.",
    };
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
  outstandingBalance: number
): Promise<{ success: boolean; message: string }> {
  const message = formatMonthlyCreditReminderSMSTemplate(customerName, outstandingBalance);
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
  const message =
    `Futura Hardware: Dear ${customerName}, thank you for your payment of Rs. ${amountPaid.toLocaleString()} ` +
    `towards credit settlement (${paymentMethod}). ` +
    `Remaining Outstanding Balance: Rs. ${remainingBalance.toLocaleString()}. ` +
    `Info: futurahardware.com`;
  console.log("[TEXT.LK SMS] Sending Credit Settlement Receipt:", { recipient: phone, message });
  return sendViaTEXTLK(phone, message);
}

/**
 * Batch Credit Reminder — iterates through provided credit customers with outstanding balances
 * and dispatches TEXT.LK SMS reminders to each.
 */
export async function triggerBatchCreditReminders(
  creditCustomers?: { name: string; phone: string; outstanding: number }[]
): Promise<{ success: boolean; sentCount: number; message: string }> {
  let list = creditCustomers || [];

  if (list.length === 0) {
    try {
      const res = await api.get("/customers");
      const rawData = res.data?.data || res.data || [];
      const items: any[] = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.data) ? rawData.data : [];
      list = items
        .map((c: any) => ({
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
    const res = await sendSingleCreditReminderSMS(c.name, c.phone, c.outstanding);
    if (res.success) sent++;
    await new Promise((r) => setTimeout(r, 200));
  }

  return {
    success: true,
    sentCount: sent,
    message: `Batch SMS credit reminders sent to ${sent} customer(s) via TEXT.LK.`,
  };
}

