import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/customers/invoices?customerId=<uuid>
 * Fetches all invoices + product line items for a customer directly from Supabase.
 * This internal route bypasses the NestJS backend so it always has fresh data.
 */
export async function GET(req: Request) {
  const supabaseUrl = process.env.SUPABASE_URL || "https://ejowthhbspsguurnrgxn.supabase.co";
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "sb_secret_NC9BnI09ypHj_IgPaApdtg_Jun45R9J";

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  try {
    const url = new URL(req.url);
    const customerId = url.searchParams.get("customerId");
    const customerName = url.searchParams.get("name");
    const customerPhone = url.searchParams.get("phone");

    if (!customerId && !customerName && !customerPhone) {
      return NextResponse.json(
        { success: false, message: "customerId, name, or phone required" },
        { status: 400 }
      );
    }

    // 1. Fetch invoices directly by customer_id
    let invoices: any[] = [];
    if (customerId) {
      const invRes = await fetch(
        `${supabaseUrl}/rest/v1/sales_invoices?customer_id=eq.${encodeURIComponent(
          customerId.trim()
        )}&order=created_at.desc`,
        { headers, cache: "no-store" }
      );
      const resData = await invRes.json().catch(() => []);
      if (Array.isArray(resData)) {
        invoices = resData;
      }
    }

    // 2. If no invoices found by ID, look up customer by name/phone first
    if (invoices.length === 0 && (customerName || customerPhone)) {
      let custQuery = `${supabaseUrl}/rest/v1/customers?select=*`;
      if (customerName) {
        custQuery += `&customer_name=ilike.*${encodeURIComponent(customerName.trim())}*`;
      }
      try {
        const custRes = await fetch(custQuery, { headers, cache: "no-store" });
        const matchedCusts = await custRes.json();
        if (Array.isArray(matchedCusts) && matchedCusts.length > 0) {
          const matchedId = matchedCusts[0].customer_id || matchedCusts[0].id;
          if (matchedId) {
            const invRes = await fetch(
              `${supabaseUrl}/rest/v1/sales_invoices?customer_id=eq.${encodeURIComponent(matchedId)}&order=created_at.desc`,
              { headers, cache: "no-store" }
            );
            const resData = await invRes.json().catch(() => []);
            if (Array.isArray(resData)) {
              invoices = resData;
            }
          }
        }
      } catch {}
    }

    // 3. Fallback: search sales_invoices by customer_phone column directly
    if (invoices.length === 0 && customerPhone) {
      try {
        const invRes = await fetch(
          `${supabaseUrl}/rest/v1/sales_invoices?customer_phone=ilike.*${encodeURIComponent(customerPhone.trim())}*&order=created_at.desc`,
          { headers, cache: "no-store" }
        );
        const resData = await invRes.json().catch(() => []);
        if (Array.isArray(resData) && resData.length > 0) {
          invoices = resData;
        }
      } catch {}
    }

    if (!Array.isArray(invoices) || invoices.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 4. Fetch line items from candidate tables
    const invoiceIds = invoices.map((i: any) => i.invoice_id).filter(Boolean);
    const invoiceNumbers = invoices.map((i: any) => i.invoice_number).filter(Boolean);
    let rawItems: any[] = [];

    if (invoiceIds.length > 0 || invoiceNumbers.length > 0) {
      const candidateTables = [
        "sales_invoice_items",
        "invoice_items",
        "sale_items",
        "order_items",
      ];

      for (const table of candidateTables) {
        try {
          const filter =
            invoiceIds.length > 0
              ? `invoice_id=in.(${invoiceIds.join(",")})`
              : `invoice_number=in.(${invoiceNumbers.join(",")})`;

          const itRes = await fetch(
            `${supabaseUrl}/rest/v1/${table}?${filter}`,
            { headers, cache: "no-store" }
          );
          if (itRes.ok) {
            const data = await itRes.json();
            if (Array.isArray(data) && data.length > 0) {
              rawItems = data;
              break;
            }
          }
        } catch {}
      }
    }

    // 5. Batch-fetch product names for items that have product_id but no inline name
    // Try both column names: Supabase products table may use 'id' or 'product_id'
    const productNameMap: Record<string, string> = {};
    const productSkuMap: Record<string, string> = {};

    const missingIds = rawItems
      .filter((it: any) => !(it.productName || it.product_name || it.itemName || it.item_name || it.name) && (it.product_id || it.productId))
      .map((it: any) => it.product_id || it.productId)
      .filter(Boolean);

    const uniqueMissingIds = [...new Set(missingIds)] as string[];

    if (uniqueMissingIds.length > 0) {
      const idList = uniqueMissingIds.join(",");
      // Try 'id' first (most common PK in Supabase auto-generated schemas)
      for (const pkCol of ["id", "product_id"]) {
        try {
          const prodRes = await fetch(
            `${supabaseUrl}/rest/v1/products?select=${pkCol},name,product_name,sku&${pkCol}=in.(${idList})`,
            { headers, cache: "no-store" }
          );
          if (prodRes.ok) {
            const prods = await prodRes.json();
            if (Array.isArray(prods) && prods.length > 0) {
              for (const p of prods) {
                const pid = p[pkCol] || p.id || p.product_id;
                if (pid) {
                  productNameMap[pid] = p.name || p.product_name || "";
                  productSkuMap[pid] = p.sku || "";
                }
              }
              break; // found names, stop trying
            }
          }
        } catch {}
      }
    }

    // 6. Group items by invoice key with resolved product names
    const itemsByKey: Record<string, any[]> = {};
    for (const it of rawItems) {
      const key = it.invoice_id || it.invoice_number;
      if (!itemsByKey[key]) itemsByKey[key] = [];
      const pid = it.product_id || it.productId || "";
      const resolvedName =
        it.productName ||
        it.product_name ||
        it.itemName ||
        it.item_name ||
        it.name ||
        (pid ? productNameMap[pid] : "") ||
        "Product";
      const resolvedSku = it.sku || (pid ? productSkuMap[pid] : "") || "";
      itemsByKey[key].push({
        productId: pid,
        product_id: pid,
        name: resolvedName,
        quantity: Number(it.quantity || it.qty || 1),
        unit_price: Number(it.unit_price || it.price || 0),
        line_total: Number(
          it.total ||
            it.line_total ||
            Number(it.quantity || 1) * Number(it.unit_price || 0)
        ),
        sku: resolvedSku,
        discount_amount: Number(it.discount_amount || it.discount || 0),
      });
    }

    // 7. Map invoices to consistent shape with embedded items
    const mapped = invoices.map((inv: any) => {
      const invKey = inv.invoice_id || inv.invoice_number;
      const bal =
        inv.balance != null
          ? Number(inv.balance)
          : Math.max(0, Number(inv.total_amount || 0) - Number(inv.paid_amount || 0));
      return {
        // Keep the raw Supabase invoice_id so the client can call /sales/:id on NestJS
        id: inv.invoice_id || inv.invoice_number,
        invoice_id: inv.invoice_id || inv.invoice_number,
        invoice_number: inv.invoice_number || "N/A",
        invoice_date:
          inv.invoice_date || (inv.created_at ? inv.created_at.slice(0, 10) : ""),
        invoice_time:
          inv.invoice_time || (inv.created_at ? inv.created_at.slice(11, 19) : ""),
        sale_type: inv.sale_type || inv.payment_type || "CASH",
        subtotal: Number(inv.subtotal || inv.total_amount || 0),
        discount_amount: Number(inv.discount_amount || 0),
        total_amount: Number(inv.total_amount || 0),
        paid_amount: Number(inv.paid_amount || 0),
        balance: bal,
        payment_status: inv.payment_status || (bal > 0 ? "UNPAID" : "PAID"),
        notes: inv.notes || "",
        items: itemsByKey[invKey] || [],
      };
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
