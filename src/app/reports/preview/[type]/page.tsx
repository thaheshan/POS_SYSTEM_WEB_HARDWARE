"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PrintableReport from "@/components/reports/PrintableReport";

// Import Tables
import InventoryReportTable from "@/components/reports/modules/InventoryReportTable";
import PurchaseOrderTable from "@/components/reports/modules/PurchaseOrderTable";
import SalesReportTable from "@/components/reports/modules/SalesReportTable";
import TransactionInvoiceTable from "@/components/reports/modules/TransactionInvoiceTable";
import CustomerReportTable from "@/components/reports/modules/CustomerReportTable";
import StaffReportTable from "@/components/reports/modules/StaffReportTable";

// Import APIs (Ensure these map to your NestJS backend)
import { salesAPI } from "@/api/endpoints/sales";
import { inventoryAPI } from "@/api/endpoints/inventory";
import { customersAPI } from "@/api/endpoints/customers";
import { staffAPI } from "@/api/endpoints/staff";
import { ordersAPI } from "@/api/endpoints/orders";

import { authAPI } from "@/api/endpoints/auth";
import { settingsAPI } from "@/api/endpoints/settings";

import { ShopDetails, ReportMetadata } from "@/types/report";

interface ReportPageProps {
  params: {
    type: string;
  };
}

function ReportPageContent({ params }: ReportPageProps) {
  const { type } = params;
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
  const [metadata, setMetadata] = useState<ReportMetadata | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const dateNow = new Date().toISOString().split("T")[0];
      const timeNow = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      try {
        const [shopRes, userRes] = await Promise.all([
          settingsAPI.getShopDetails().catch(() => null),
          authAPI.getMe().catch(() => null),
        ]);

        const shop: ShopDetails = {
          name: shopRes?.data?.name || "Company Name",
          address: shopRes?.data?.address || "Company Address",
          contactNumber: shopRes?.data?.phone || "Contact Number",
          email: shopRes?.data?.email || "Email",
          registrationNumber: shopRes?.data?.registrationNumber,
          logoUrl: shopRes?.data?.logoUrl,
        };

        const generatedBy =
          userRes?.data?.name || userRes?.data?.user?.name || "System User";

        let tableData: any = null;
        let title = "Official Report";

        switch (type) {
          case "inventory": {
            title = "Inventory Status Report";
            const res = await inventoryAPI.getAll();
            const rawItems = res.data?.data || res.data || [];
            tableData = rawItems.map((item: any) => {
              const currentStock = item.stockQty ?? 0;
              const reorderLevel = item.reorderLevel ?? 0;
              let stockStatus: "In Stock" | "Low Stock" | "Out of Stock" =
                "In Stock";
              if (currentStock === 0) stockStatus = "Out of Stock";
              else if (currentStock <= reorderLevel) stockStatus = "Low Stock";

              return {
                sku: item.sku || "N/A",
                productName: item.name || "N/A",
                category: item.category?.name || item.categoryId || "General",
                currentStock,
                reorderLevel,
                stockStatus,
                inventoryValuation: currentStock * (item.costPrice || 0),
              };
            });
            break;
          }
          case "purchase-order": {
            title = "Supplier Purchase Order";
            const poId = searchParams.get("id");
            if (!poId)
              throw new Error(
                "Purchase Order ID parameter (?id=...) is required.",
              );
            const res = await ordersAPI.getById(poId);
            const po = res.data?.data || res.data;
            tableData = {
              poNumber: po.invoiceNo || `PO-${po.id.slice(-6).toUpperCase()}`,
              supplierName: po.supplier?.name || "N/A",
              supplierContact: po.supplier?.phone || "N/A",
              supplierEmail: po.supplier?.email || "N/A",
              status:
                po.status === "received"
                  ? "Delivered"
                  : po.status === "sent"
                    ? "Shipped"
                    : "Pending",
              items: po.items.map((item: any) => ({
                productName: item.product?.name || "N/A",
                sku: item.product?.sku || "N/A",
                orderedQuantity: item.quantity,
                unitCost: item.unitPrice,
                totalCost: item.totalPrice,
              })),
            };
            break;
          }
          case "sales": {
            title = "Daily Sales Summary";
            const startDate = searchParams.get("startDate") || dateNow;
            const endDate = searchParams.get("endDate") || dateNow;
            const res = await salesAPI.getReport(startDate, endDate);
            const data = res.data?.data || res.data;
            tableData = {
              summary: {
                totalTransactions: data.summary?.totalTransactions || 0,
                totalRevenue: data.summary?.totalRevenue || 0,
                cashTotal: data.summary?.cashTotal || 0,
                cardTotal: data.summary?.cardTotal || 0,
              },
              items: (data.items || []).map((sale: any) => ({
                invoiceNumber: sale.invoiceNo,
                date: sale.createdAt,
                customerName: sale.customer?.name || "Walk-in Customer",
                cashierName: sale.cashier?.name || "Cashier",
                paymentMethod:
                  sale.paymentMethod === "cash"
                    ? "Cash"
                    : sale.paymentMethod === "card"
                      ? "Card"
                      : "Bank Transfer",
                totalAmount: sale.total,
              })),
            };
            break;
          }
          case "invoice": {
            title = "Transaction Invoice";
            const invoiceId = searchParams.get("id");
            if (!invoiceId)
              throw new Error(
                "Transaction ID parameter (?id=...) is required.",
              );
            const res = await salesAPI.getById(invoiceId);
            const sale = res.data?.data || res.data;
            tableData = {
              transactionNumber: sale.invoiceNo,
              transactionType: "Sale",
              date: sale.createdAt,
              partyName: sale.customer?.name || "Walk-in Customer",
              partyContact: sale.customer?.phone || "N/A",
              partyAddress: sale.customer?.address,
              items: sale.items.map((item: any) => ({
                itemName: item.product?.name || "N/A",
                sku: item.product?.sku || "N/A",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
              })),
              subtotal: sale.subtotal,
              discount: sale.discount,
              tax: (sale.taxVAT || 0) + (sale.taxNBT || 0),
              grandTotal: sale.total,
            };
            break;
          }
          case "customer": {
            title = "Customer Directory & Value";
            const res = await customersAPI.getAll();
            const rawCustomers = res.data?.data || res.data || [];
            tableData = {
              summary: {
                totalCustomers: rawCustomers.length,
                activeCustomers: rawCustomers.filter(
                  (c: any) => c.totalPurchases > 0,
                ).length,
                newThisMonth: rawCustomers.filter((c: any) => {
                  const regDate = new Date(c.createdAt);
                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                  return regDate >= oneMonthAgo;
                }).length,
              },
              items: rawCustomers.map((c: any) => ({
                customerId: `CUS-${c.id.slice(-5).toUpperCase()}`,
                customerName: c.name,
                contactNumber: c.phone,
                email: c.email || "N/A",
                registrationDate: c.createdAt?.split("T")[0] || "N/A",
                totalPurchases: c.totalPurchases || 0,
                status: c.loyaltyPoints >= 0 ? "Active" : "Inactive",
              })),
            };
            break;
          }
          case "staff": {
            title = "Staff Management Report";
            const res = await staffAPI.getAll();
            const rawStaff = res.data?.data || res.data || [];
            tableData = {
              summary: {
                totalStaff: rawStaff.length,
                activeStaff: rawStaff.filter((s: any) => s.isActive).length,
                onLeave: 0,
              },
              items: rawStaff.map((s: any) => ({
                staffId: `EMP-${s.id.slice(-3).toUpperCase()}`,
                staffName: s.name,
                role: s.role,
                contactNumber: s.phone || "N/A",
                email: s.email,
                registrationDate: s.createdAt?.split("T")[0] || "N/A",
                status: s.isActive ? "Active" : "Inactive",
              })),
            };
            break;
          }
          default:
            throw new Error(`Unknown report type: "${type}"`);
        }

        setShopDetails(shop);
        setMetadata({
          title,
          generatedDate: dateNow,
          generatedTime: timeNow,
          generatedBy,
        });
        setReportData(tableData);
      } catch (err: any) {
        console.warn(
          `API call failed for dynamic report "${type}", attempting fallback mock data:`,
          err,
        );

        // Fallback datasets for local development
        if (process.env.NODE_ENV !== "production") {
          let fallbackData: any = null;
          let title = "Fallback Report";

          const mockShop: ShopDetails = {
            name: "AutoParts Superstore (Dev Mode)",
            address: "123 Sheikh Zayed Rd, Dubai, UAE",
            contactNumber: "+971 50 123 4567",
            email: "info@autoparts.ae",
            registrationNumber: "TRN-987654321",
          };

          switch (type) {
            case "inventory":
              title = "Inventory Status Report";
              fallbackData = [
                {
                  sku: "BRK-001",
                  productName: "Ceramic Brake Pads",
                  category: "Brakes",
                  currentStock: 45,
                  reorderLevel: 20,
                  stockStatus: "In Stock",
                  inventoryValuation: 135000.0,
                },
                {
                  sku: "OIL-05W30",
                  productName: "Synthetic Motor Oil 5L",
                  category: "Fluids",
                  currentStock: 12,
                  reorderLevel: 15,
                  stockStatus: "Low Stock",
                  inventoryValuation: 84000.0,
                },
              ];
              break;
            case "purchase-order":
              title = "Supplier Purchase Order";
              fallbackData = {
                poNumber: "PO-2026-06-0042",
                supplierName: "Apex Auto Parts Wholesale Ltd",
                supplierContact: "+971 4 555 8989",
                supplierEmail: "orders@apexautoparts.com",
                status: "Approved",
                items: [
                  {
                    productName: "Ceramic Brake Pads (Front)",
                    sku: "BRK-001",
                    orderedQuantity: 50,
                    unitCost: 1500,
                    totalCost: 75000,
                  },
                ],
              };
              break;
            case "sales":
              title = "Daily Sales Summary";
              fallbackData = {
                summary: {
                  totalTransactions: 6,
                  totalRevenue: 285500.0,
                  cashTotal: 120500.0,
                  cardTotal: 165000.0,
                },
                items: [
                  {
                    invoiceNumber: "INV-10045",
                    date: "2026-06-26 09:12 AM",
                    customerName: "Walk-in Customer",
                    cashierName: "Kamal D.",
                    paymentMethod: "Cash",
                    totalAmount: 12500.0,
                  },
                ],
              };
              break;
            case "invoice":
              title = "Transaction Invoice";
              fallbackData = {
                transactionNumber: "TRN-998822",
                transactionType: "Sale",
                date: "2026-06-26 03:10 PM",
                partyName: "Saman Kumara",
                partyContact: "+94 77 123 4567",
                partyAddress: "45/2 Temple Road, Colombo 06",
                items: [
                  {
                    itemName: "Ceramic Brake Pads (Front)",
                    sku: "BRK-001",
                    quantity: 1,
                    unitPrice: 8500.0,
                    totalPrice: 8500.0,
                  },
                ],
                subtotal: 8500.0,
                discount: 0.0,
                tax: 0.0,
                grandTotal: 8500.0,
              };
              break;
            case "customer":
              title = "Customer Directory & Value";
              fallbackData = {
                summary: {
                  totalCustomers: 1250,
                  activeCustomers: 840,
                  newThisMonth: 45,
                },
                items: [
                  {
                    customerId: "CUS-00142",
                    customerName: "Saman Kumara",
                    contactNumber: "+94 77 123 4567",
                    email: "saman.k@example.com",
                    registrationDate: "2025-01-15",
                    totalPurchases: 450000.0,
                    status: "Active",
                  },
                ],
              };
              break;
            case "staff":
              title = "Staff Management Report";
              fallbackData = {
                summary: { totalStaff: 12, activeStaff: 10, onLeave: 2 },
                items: [
                  {
                    staffId: "EMP-001",
                    staffName: "Kamal Dissanayake",
                    role: "Store Manager",
                    contactNumber: "+94 77 111 2222",
                    email: "kamal.d@autoparts.ae",
                    registrationDate: "2023-01-10",
                    status: "Active",
                  },
                ],
              };
              break;
            default:
              throw new Error(`Unknown fallback route: "${type}"`);
          }

          setShopDetails(mockShop);
          setMetadata({
            title,
            generatedDate: dateNow,
            generatedTime: timeNow,
            generatedBy: "Local Dev Admin",
          });
          setReportData(fallbackData);
        } else {
          setError(err.message || "Failed to load report data from server.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold">Generating Printable Report...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData || !shopDetails || !metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-rose-600 font-sans p-6">
        <div className="bg-white p-8 rounded-2xl shadow border border-slate-200 text-center max-w-md w-full">
          <h2 className="text-lg font-bold mb-2">Report Error</h2>
          <p className="text-xs text-slate-500 mb-6">
            {error || "Could not retrieve report parameters."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded hover:bg-slate-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <PrintableReport
      shopDetails={shopDetails}
      metadata={metadata}
      showDeveloperControls={process.env.NODE_ENV !== "production"}
    >
      {type === "inventory" && <InventoryReportTable data={reportData} />}
      {type === "purchase-order" && <PurchaseOrderTable data={reportData} />}
      {type === "sales" && <SalesReportTable data={reportData} />}
      {type === "invoice" && <TransactionInvoiceTable data={reportData} />}
      {type === "customer" && <CustomerReportTable data={reportData} />}
      {type === "staff" && <StaffReportTable data={reportData} />}
    </PrintableReport>
  );
}

export default function DynamicReportPage(props: ReportPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold">Loading Report Viewer...</p>
          </div>
        </div>
      }
    >
      <ReportPageContent {...props} />
    </Suspense>
  );
}
