import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseUrl = "https://ejowthhbspsguurnrgxn.supabase.co";
  const supabaseKey = "sb_secret_NC9BnI09ypHj_IgPaApdtg_Jun45R9J";

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  try {
    const { id: customerId } = await params;
    if (!customerId) {
      return NextResponse.json({ success: false, message: "Customer ID required" }, { status: 400 });
    }

    // 1. Fetch all sales_invoices for this customer (newest first)
    const invRes = await fetch(
      `${supabaseUrl}/rest/v1/sales_invoices?customer_id=eq.${encodeURIComponent(
        customerId.trim()
      )}&order=created_at.desc`,
      { headers, cache: "no-store" }
    );
    const invoices = await invRes.json().catch(() => []);

    if (!Array.isArray(invoices)) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Fetch items for these invoices (try multiple candidate table names)
    const invoiceIds = invoices.map((i: any) => i.invoice_id).filter(Boolean);
    const invoiceNumbers = invoices.map((i: any) => i.invoice_number).filter(Boolean);

    let itemsByInvoiceId: Record<string, any[]> = {};

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
            const rawItems = await itRes.json();
            if (Array.isArray(rawItems) && rawItems.length > 0) {
              for (const it of rawItems) {
                const key = it.invoice_id || it.invoice_number;
                if (!itemsByInvoiceId[key]) itemsByInvoiceId[key] = [];
                itemsByInvoiceId[key].push({
                  name: it.product_name || it.name || it.item_name || "Product",
                  quantity: Number(it.quantity || it.qty || 1),
                  unit_price: Number(it.unit_price || it.price || 0),
                  line_total: Number(
                    it.total ||
                      it.line_total ||
                      Number(it.quantity || 1) * Number(it.unit_price || 0)
                  ),
                  sku: it.sku || "",
                  discount_amount: Number(it.discount_amount || it.discount || 0),
                });
              }
              break; // Found matching table — stop searching
            }
          }
        } catch {}
      }
    }

    // 3. Map invoices to a consistent shape with items embedded
    const mapped = invoices.map((inv: any) => {
      const invKey = inv.invoice_id || inv.invoice_number;
      const bal =
        inv.balance != null
          ? Number(inv.balance)
          : Math.max(0, Number(inv.total_amount || 0) - Number(inv.paid_amount || 0));
      return {
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
        payment_status:
          inv.payment_status || (bal > 0 ? "UNPAID" : "PAID"),
        notes: inv.notes || "",
        items: itemsByInvoiceId[invKey] || [],
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
