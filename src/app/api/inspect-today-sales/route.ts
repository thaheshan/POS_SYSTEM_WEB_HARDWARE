import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabaseUrl = process.env.SUPABASE_URL || "https://ejowthhbspsguurnrgxn.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  try {
    // 1. Fetch customer Subash
    const custRes = await fetch(
      `${supabaseUrl}/rest/v1/customers?customer_name=ilike.*Subash*`,
      { headers, cache: "no-store" }
    );
    const customers = await custRes.json();

    const subashId = customers?.[0]?.customer_id || customers?.[0]?.id;

    // 2. Fetch sales_invoices for Subash
    let invoices: any[] = [];
    if (subashId) {
      const invRes = await fetch(
        `${supabaseUrl}/rest/v1/sales_invoices?customer_id=eq.${subashId}&order=created_at.asc`,
        { headers, cache: "no-store" }
      );
      invoices = await invRes.json();
    }

    // 3. Fetch credit transactions or payments if table exists
    let payments: any[] = [];
    if (subashId) {
      const payRes = await fetch(
        `${supabaseUrl}/rest/v1/customer_payments?customer_id=eq.${subashId}`,
        { headers, cache: "no-store" }
      );
      payments = await payRes.json().catch(() => []);
    }

    // 4. Calculate actual sums
    const totalPurchasesAll = invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
    const totalCreditInvoices = invoices
      .filter((inv) => String(inv.sale_type || inv.payment_type || "").toUpperCase() === "CREDIT")
      .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
    const totalPaidOnCredit = invoices
      .filter((inv) => String(inv.sale_type || inv.payment_type || "").toUpperCase() === "CREDIT")
      .reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0);
    const totalCashInvoices = invoices
      .filter((inv) => String(inv.sale_type || inv.payment_type || "").toUpperCase() !== "CREDIT")
      .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
    // Use the actual `balance` column directly for true outstanding
    const calculatedOutstanding = invoices.reduce(
      (sum, inv) => sum + Math.max(0, Number(inv.balance ?? inv.total_amount - inv.paid_amount ?? 0)),
      0
    );

    let patchResult = null;
    const url = new URL(req.url);
    const shouldReconcile = url.searchParams.get("reconcile") === "true";

    if (shouldReconcile && subashId) {
      const cleanName = (customers?.[0]?.customer_name || "Subash").trim();
      const patchBody: Record<string, any> = {
        customer_name: cleanName,
        outstanding_balance: calculatedOutstanding,
        total_purchases: totalPurchasesAll,
      };
      if (customers?.[0] && "transactions_count" in customers[0]) {
        patchBody.transactions_count = invoices.length;
      } else if (customers?.[0] && "transactions" in customers[0]) {
        patchBody.transactions = invoices.length;
      }

      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/customers?customer_id=eq.${subashId}`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            Prefer: "return=representation",
          },
          body: JSON.stringify(patchBody),
        }
      );
      patchResult = await patchRes.json().catch(() => null);
    }

    return NextResponse.json({
      success: true,
      customers,
      invoicesSummary: {
        count: invoices.length,
        totalPurchasesAll,
        totalCreditInvoices,
        totalCashInvoices,
        calculatedOutstanding,
        dbStoredOutstanding: customers?.[0]?.outstanding_balance,
        dbStoredPurchases: customers?.[0]?.total_purchases,
      },
      reconciled: shouldReconcile,
      patchResult,
      invoices,
      payments,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message });
  }
}
