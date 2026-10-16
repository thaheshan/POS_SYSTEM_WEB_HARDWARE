import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/debug-invoice-items?invoiceId=<uuid>
 * Debug endpoint — returns raw Supabase data so we can see exact column names
 */
export async function GET(req: Request) {
  const supabaseUrl = "https://ejowthhbspsguurnrgxn.supabase.co";
  const supabaseKey = "sb_secret_NC9BnI09ypHj_IgPaApdtg_Jun45R9J";

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  const url = new URL(req.url);
  const invoiceId = url.searchParams.get("invoiceId");
  const customerId = url.searchParams.get("customerId");

  const result: Record<string, any> = {};

  try {
    // 1. Check sales_invoice_items columns for this invoice
    if (invoiceId) {
      const tables = ["sales_invoice_items", "invoice_items", "sale_items", "order_items"];
      for (const table of tables) {
        try {
          const r = await fetch(
            `${supabaseUrl}/rest/v1/${table}?invoice_id=eq.${invoiceId}&limit=3`,
            { headers, cache: "no-store" }
          );
          const data = await r.json();
          result[`${table}_by_invoice_id`] = { status: r.status, data };
        } catch (e: any) {
          result[`${table}_by_invoice_id`] = { error: e.message };
        }
      }
    }

    // 2. Check products table — what does a sample row look like?
    try {
      const r = await fetch(
        `${supabaseUrl}/rest/v1/products?limit=2`,
        { headers, cache: "no-store" }
      );
      const data = await r.json();
      result["products_sample"] = { status: r.status, columns: Array.isArray(data) && data.length > 0 ? Object.keys(data[0]) : [], sample: data };
    } catch (e: any) {
      result["products_sample"] = { error: e.message };
    }

    // 3. Check sales_invoices for customer
    if (customerId) {
      try {
        const r = await fetch(
          `${supabaseUrl}/rest/v1/sales_invoices?customer_id=eq.${customerId}&limit=2`,
          { headers, cache: "no-store" }
        );
        const data = await r.json();
        result["sales_invoices_for_customer"] = { status: r.status, data };

        // If we got invoices, try fetching items for the first one
        if (Array.isArray(data) && data.length > 0) {
          const firstInvId = data[0].invoice_id;
          const firstInvNo = data[0].invoice_number;
          if (firstInvId) {
            const ir = await fetch(
              `${supabaseUrl}/rest/v1/sales_invoice_items?invoice_id=eq.${firstInvId}&limit=5`,
              { headers, cache: "no-store" }
            );
            const idata = await ir.json();
            result["items_for_first_invoice_by_id"] = {
              invoice_id: firstInvId,
              invoice_number: firstInvNo,
              status: ir.status,
              columns: Array.isArray(idata) && idata.length > 0 ? Object.keys(idata[0]) : [],
              data: idata,
            };
          }
        }
      } catch (e: any) {
        result["sales_invoices_for_customer"] = { error: e.message };
      }
    }

    return NextResponse.json({ success: true, debug: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
