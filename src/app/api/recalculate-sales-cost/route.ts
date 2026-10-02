import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/recalculate-sales-cost
 *
 * Body: {
 *   productId: string,
 *   newCostPrice?: number,
 *   newSellingPrice?: number,
 *   updateCost?: boolean,
 *   updateSelling?: boolean
 * }
 *
 * Retroactively recalculates historical sales_invoice_items for this product:
 * - Updates cost_price if cost changed
 * - Updates unit_price & line_total if selling price changed
 * - Recalculates profit = line_total - (quantity * cost_price)
 * - Also updates the parent sales_invoices (subtotal, total_amount, total_profit)
 *   so dashboards, receipts, and sales reports remain 100% synchronized!
 */
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || "https://ejowthhbspsguurnrgxn.supabase.co";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const headers: Record<string, string> = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  try {
    const body = await req.json();
    const { productId, newCostPrice, newSellingPrice, updateCost, updateSelling } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId is required" },
        { status: 400 }
      );
    }

    const shouldUpdateCost = Boolean(updateCost || (newCostPrice !== undefined && newCostPrice !== null));
    const shouldUpdateSelling = Boolean(updateSelling || (newSellingPrice !== undefined && newSellingPrice !== null));

    const finalCostPrice = shouldUpdateCost ? Number(newCostPrice) : undefined;
    const finalSellingPrice = shouldUpdateSelling ? Number(newSellingPrice) : undefined;

    // Step 1: Fetch all invoice items for this product
    const fetchRes = await fetch(
      `${supabaseUrl}/rest/v1/sales_invoice_items?select=item_id,invoice_id,quantity,unit_price,cost_price,line_total,profit&product_id=eq.${productId}`,
      { headers }
    );
    const items = await fetchRes.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No previous sales found for this product. Nothing to recalculate.",
        updatedItemsCount: 0,
      });
    }

    // Step 2: Update each sales_invoice_item with new price/cost and profit
    let updatedItemsCount = 0;
    const affectedInvoiceIds = new Set<string>();
    const errors: string[] = [];

    for (const item of items) {
      const qty = Number(item.quantity || 0);
      const itemUnitPrice = shouldUpdateSelling && finalSellingPrice !== undefined
        ? finalSellingPrice
        : Number(item.unit_price || 0);

      const itemCostPrice = shouldUpdateCost && finalCostPrice !== undefined
        ? finalCostPrice
        : Number(item.cost_price || 0);

      const newLineTotal = Math.round(qty * itemUnitPrice * 100) / 100;
      const newProfit = Math.round((newLineTotal - qty * itemCostPrice) * 100) / 100;

      try {
        const patchPayload: Record<string, any> = {
          cost_price: itemCostPrice,
          profit: newProfit,
        };
        if (shouldUpdateSelling) {
          patchPayload.unit_price = itemUnitPrice;
          patchPayload.line_total = newLineTotal;
        }

        const patchRes = await fetch(
          `${supabaseUrl}/rest/v1/sales_invoice_items?item_id=eq.${item.item_id}`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify(patchPayload),
          }
        );

        if (patchRes.ok) {
          updatedItemsCount++;
          if (item.invoice_id) {
            affectedInvoiceIds.add(item.invoice_id);
          }
        } else {
          const errText = await patchRes.text();
          errors.push(`item ${item.item_id}: ${errText}`);
        }
      } catch (itemErr: any) {
        errors.push(`item ${item.item_id}: ${itemErr?.message}`);
      }
    }

    // Step 3: Recalculate parent sales_invoices if selling price or profit changed
    let updatedInvoicesCount = 0;
    if (affectedInvoiceIds.size > 0) {
      for (const invoiceId of Array.from(affectedInvoiceIds)) {
        try {
          // Fetch all items for this invoice
          const invItemsRes = await fetch(
            `${supabaseUrl}/rest/v1/sales_invoice_items?select=line_total,profit&invoice_id=eq.${invoiceId}`,
            { headers }
          );
          const invItems = await invItemsRes.json();

          if (Array.isArray(invItems) && invItems.length > 0) {
            const newSubtotal = invItems.reduce((acc, it) => acc + Number(it.line_total || 0), 0);
            const newTotalProfit = invItems.reduce((acc, it) => acc + Number(it.profit || 0), 0);

            // Fetch current invoice to adjust total_amount by discount/tax
            const invRes = await fetch(
              `${supabaseUrl}/rest/v1/sales_invoices?select=discount_amount,tax_amount&invoice_id=eq.${invoiceId}`,
              { headers }
            );
            const invDataArr = await invRes.json();
            const invData = Array.isArray(invDataArr) ? invDataArr[0] : null;

            const discount = Number(invData?.discount_amount || 0);
            const tax = Number(invData?.tax_amount || 0);
            const newTotalAmount = Math.max(0, newSubtotal - discount + tax);

            const patchInvRes = await fetch(
              `${supabaseUrl}/rest/v1/sales_invoices?invoice_id=eq.${invoiceId}`,
              {
                method: "PATCH",
                headers,
                body: JSON.stringify({
                  subtotal: Math.round(newSubtotal * 100) / 100,
                  total_amount: Math.round(newTotalAmount * 100) / 100,
                  total_profit: Math.round(newTotalProfit * 100) / 100,
                }),
              }
            );

            if (patchInvRes.ok) {
              updatedInvoicesCount++;
            }
          }
        } catch (invErr: any) {
          console.error(`Failed to update parent invoice ${invoiceId}:`, invErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalPreviousSalesItems: items.length,
      updatedItemsCount,
      updatedInvoicesCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Recalculated ${updatedItemsCount} sales item(s) across ${updatedInvoicesCount} invoice(s).`,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
