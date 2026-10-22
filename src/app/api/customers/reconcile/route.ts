import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  return handleReconcile(req);
}

export async function POST(req: Request) {
  return handleReconcile(req);
}

async function handleReconcile(req: Request) {
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
    const customerName = url.searchParams.get("name") || url.searchParams.get("customerName");
    const all = url.searchParams.get("all") === "true";

    // Try backend reconcile first if token is available
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      try {
        const backendRes = await fetch(`${backendUrl}/customers/reconcile${customerId ? `?customerId=${customerId}` : ''}`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json"
          }
        });
        const backendData = await backendRes.json();
        if (backendData.status === "success") {
          return NextResponse.json({ success: true, ...backendData });
        }
      } catch {}
    }

    // 1. Fetch target customers
    let targetCustomersUrl = `${supabaseUrl}/rest/v1/customers?select=*`;
    if (customerId) {
      targetCustomersUrl += `&customer_id=eq.${customerId.trim()}`;
    } else if (customerName) {
      targetCustomersUrl += `&customer_name=ilike.*${encodeURIComponent(customerName.trim())}*`;
    } else if (!all) {
      // Default to Subash if no specific customer specified
      targetCustomersUrl += `&customer_name=ilike.*Subash*`;
    }

    const custRes = await fetch(targetCustomersUrl, { headers, cache: "no-store" });
    const customers = await custRes.json();

    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No matching customers found for reconciliation.",
      });
    }

    const results = [];

    // 2. Reconcile each matched customer
    for (const cust of customers) {
      const cId = cust.customer_id || cust.id;
      if (!cId) continue;

      // Fetch all invoices for this customer
      const invRes = await fetch(
        `${supabaseUrl}/rest/v1/sales_invoices?customer_id=eq.${cId}&order=created_at.asc`,
        { headers, cache: "no-store" }
      );
      const invoices = await invRes.json().catch(() => []);

      const safeInvoices = Array.isArray(invoices) ? invoices : [];

      // Calculate totals
      const totalPurchases = safeInvoices.reduce(
        (sum, inv) => sum + Number(inv.total_amount || 0),
        0
      );

      // True outstanding = sum of balance column (unpaid remainder) across ALL invoices
      // The `balance` column in sales_invoices is always set by checkout as (total - paid)
      const trueOutstanding = safeInvoices.reduce((sum, inv) => {
        return sum + Math.max(0, Number(inv.balance ?? 0));
      }, 0);

      // Credit invoices list (for reporting only)
      const creditInvoices = safeInvoices.filter(
        (inv) => String(inv.sale_type || inv.payment_type || "").toUpperCase() === "CREDIT"
      );

      const cleanName = String(cust.customer_name || cust.name || "").trim();

      const patchBody: Record<string, any> = {
        customer_name: cleanName,
        outstanding_balance: trueOutstanding,
        total_purchases: totalPurchases,
      };
      if ("transactions_count" in cust) {
        patchBody.transactions_count = safeInvoices.length;
      } else if ("transactions" in cust) {
        patchBody.transactions = safeInvoices.length;
      }

      // Update customer record in Supabase
      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/customers?customer_id=eq.${cId}`,
        {
          method: "PATCH",
          headers: {
            ...headers,
            Prefer: "return=representation",
          },
          body: JSON.stringify(patchBody),
        }
      );
      const updatedData = await patchRes.json().catch(() => null);

      results.push({
        customerId: cId,
        customerName: cleanName,
        previousState: {
          outstanding_balance: cust.outstanding_balance,
          total_purchases: cust.total_purchases,
          transactions_count: cust.transactions_count,
        },
        reconciledState: {
          outstanding_balance: trueOutstanding,
          total_purchases: totalPurchases,
          transactions_count: safeInvoices.length,
          unpaidCreditInvoicesCount: creditInvoices.length,
        },
        invoicesSummary: safeInvoices.map((i: any) => ({
          no: i.invoice_number,
          sale_type: i.sale_type,
          payment_type: i.payment_type,
          total: i.total_amount,
          paid: i.paid_amount,
          balance: i.balance,
          status: i.payment_status,
          invoice_date: i.invoice_date || (i.created_at ? i.created_at.slice(0, 10) : ''),
          invoice_time: i.invoice_time || (i.created_at ? i.created_at.slice(11, 19) : ''),
          created_at: i.created_at,
        })),
        updatedRecord: updatedData,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Reconciled ${results.length} customer(s) successfully.`,
      results,
      sampleInvoice: results[0] ? undefined : null,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
