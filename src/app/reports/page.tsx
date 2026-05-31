"use client";

import MainLayout from "@/components/layout/MainLayout";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Download,
  Clock,
  FileText,
  BarChart2,
  Boxes,
  Coins,
  ShieldCheck,
  ChevronDown,
  X,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { DateRange } from "react-day-picker";
import { endOfMonth, format, startOfMonth } from "date-fns";
import SalesDatePicker from "@/components/sales/SalesDatePicker";

import CategoryAReportModal from "@/components/sales/CategoryAReportModal";
import CategoryBReportModal from "@/components/sales/CategoryBReportModal";
import CategoryCReportModal from "@/components/sales/CategoryCReportModal";
import CategoryPrintView from "@/components/sales/CategoryPrintView";

import ReportStatCard from "@/components/reports/ReportStatCard";
import ReportCategoryCard from "@/components/reports/ReportCategoryCard";
import RevenueTrendChart from "@/components/reports/RevenueTrendChart";
import TaxBreakdownChart from "@/components/reports/TaxBreakdownChart";
import AllTransactionsTable from "@/components/reports/AllTransactionsTable";
import { BASE_URL } from "@/lib/constants/api";
import {
  useGetInventoryReportQuery,
  useGetSalesReportQuery,
  useGetTaxReportQuery,
  useGetTopProductsQuery,
} from "@/api/reportApi";

type LegacyTxn = {
  id: string;
  rawId: string;
  time: string;
  amount: string;
  rawAmount: number;
  mode: string;
  type: "Taxable" | "Overflow" | "Labour";
};

type LegacyData = {
  catA: {
    core: number;
    vat: number;
    avg: number;
    items: number;
    txns: number;
    recentTxns: LegacyTxn[];
    allTxns: LegacyTxn[];
  };
  catB: {
    core: number;
    overflow: number;
    baseNonTax: number;
    avg: number;
    items: number;
    txns: number;
    recentTxns: LegacyTxn[];
    allTxns: LegacyTxn[];
    topProducts: Array<{ name: string; sold: number; amount: string }>;
  };
  catC: {
    core: number;
    labour: number;
    install: number;
    misc: number;
    entries: number;
    recentEntries: Array<{ name: string; value: number }>;
    allTxns: LegacyTxn[];
    breakdown: Array<{ name: string; value: number }>;
  };
};

const EMPTY_DATA: LegacyData = {
  catA: {
    core: 0,
    vat: 0,
    avg: 0,
    items: 0,
    txns: 0,
    recentTxns: [],
    allTxns: [],
  },
  catB: {
    core: 0,
    overflow: 0,
    baseNonTax: 0,
    avg: 0,
    items: 0,
    txns: 0,
    recentTxns: [],
    allTxns: [],
    topProducts: [],
  },
  catC: {
    core: 0,
    labour: 0,
    install: 0,
    misc: 0,
    entries: 0,
    recentEntries: [],
    allTxns: [],
    breakdown: [],
  },
};

function toIsoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function getDefaultDateRange(): DateRange {
  return {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  };
}

function unwrapResponse(raw: any) {
  return raw?.data?.data ?? raw?.data ?? raw ?? {};
}

function unwrapArray(raw: any, keys: string[]) {
  if (Array.isArray(raw)) {
    return raw;
  }

  const candidates = [raw?.data, raw?.items, raw?.results, raw?.payload];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  for (const key of keys) {
    if (Array.isArray(raw?.[key])) {
      return raw[key];
    }
  }

  return [];
}

function firstNumber(raw: any, keys: string[]) {
  for (const key of keys) {
    const value = raw?.[key];
    if (value !== undefined && value !== null && value !== "") {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }
  }

  return 0;
}

function firstString(raw: any, keys: string[]) {
  for (const key of keys) {
    const value = raw?.[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

function formatCurrency(value: number) {
  return `Rs. ${Math.round(value || 0).toLocaleString()}`;
}

function formatDateOnly(value?: string | Date) {
  if (!value) {
    return "---";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "---";
  }

  return format(date, "MMM d, yyyy");
}

function formatTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildExportUrl(
  type: string,
  formatType: string,
  dateRange: DateRange | undefined,
) {
  const apiRoot = BASE_URL.replace(/\/$/, "");
  const params = new URLSearchParams({
    format: formatType,
    startDate: dateRange?.from ? toIsoDate(dateRange.from) : "",
    endDate: dateRange?.to ? toIsoDate(dateRange.to) : "",
  });

  return `${apiRoot}/reports/${type}/export?${params.toString()}`;
}

function mapTransactions(
  items: any[],
  type: "Taxable" | "Overflow" | "Labour",
) {
  return items.map((item: any) => {
    const rawAmount = Number(
      item.rawAmount ?? item.amount ?? item.totalAmount ?? item.total ?? 0,
    );
    return {
      id: item.id ?? item.invoiceNumber ?? item.invoiceNo ?? item.rawId ?? "",
      rawId:
        item.rawId ?? item.id ?? item.invoiceNumber ?? item.invoiceNo ?? "",
      time:
        item.time ?? formatTime(item.createdAt ?? item.date ?? item.timestamp),
      amount: String(item.amount ?? rawAmount.toLocaleString()),
      rawAmount,
      mode: item.mode ?? item.saleType ?? item.paymentMethod ?? "Cash",
      type,
    } as LegacyTxn;
  });
}

function buildLegacyData(
  salesReport: any,
  taxReport: any,
  topProductsReport: any,
  inventoryReport: any,
): LegacyData {
  const sales = unwrapResponse(salesReport);
  const tax = unwrapResponse(taxReport);
  const topProductsSource = unwrapResponse(topProductsReport);
  const inventorySource = unwrapResponse(inventoryReport);

  if (sales?.catA && sales?.catB && sales?.catC) {
    return sales;
  }

  const categoryItems = unwrapArray(sales, [
    "categoryRevenue",
    "revenueByCategory",
    "categoryBreakdown",
    "categories",
  ]);
  const categoryTotals = categoryItems
    .slice(0, 3)
    .map((item: any) =>
      firstNumber(item, [
        "core",
        "revenue",
        "amount",
        "value",
        "totalRevenue",
        "totalAmount",
      ]),
    );

  const totalRevenue =
    firstNumber(sales, [
      "totalRevenue",
      "revenue",
      "grossRevenue",
      "salesRevenue",
      "netRevenue",
    ]) || categoryTotals.reduce((sum, value) => sum + value, 0);

  const categoryA =
    firstNumber(sales, ["catARevenue", "categoryARevenue", "taxableRevenue"]) ||
    categoryTotals[0] ||
    totalRevenue;
  const categoryB =
    firstNumber(sales, [
      "catBRevenue",
      "categoryBRevenue",
      "overflowRevenue",
    ]) ||
    categoryTotals[1] ||
    0;
  const categoryC =
    firstNumber(sales, [
      "catCRevenue",
      "categoryCRevenue",
      "labourRevenue",
      "serviceRevenue",
    ]) ||
    categoryTotals[2] ||
    0;

  const vatCollected =
    firstNumber(tax, ["vatAmount", "vatCollected", "vat", "vatTotal"]) ||
    Math.round(categoryA * 0.18);
  const totalTransactions = firstNumber(sales, [
    "totalTransactions",
    "transactionCount",
    "transactions",
    "count",
  ]);

  const transactionsRaw = unwrapArray(sales, [
    "allTxns",
    "transactions",
    "items",
    "data",
  ]);
  const topProductsRaw = unwrapArray(topProductsSource, [
    "topProducts",
    "products",
    "items",
    "data",
  ]);
  const inventoryItems = unwrapArray(inventorySource, [
    "slowMovingItems",
    "slowMovingInventory",
    "items",
    "products",
  ]);

  const allTransactions = mapTransactions(transactionsRaw, "Taxable");
  const recentTransactions = allTransactions.slice(0, 5);
  const topProducts = topProductsRaw.slice(0, 10).map((item: any) => ({
    name:
      firstString(item, ["name", "productName", "product_name", "title"]) ||
      "Product",
    sold: firstNumber(item, [
      "sold",
      "quantity",
      "qty",
      "totalQty",
      "unitsSold",
      "salesCount",
    ]),
    amount: String(
      firstNumber(item, [
        "amount",
        "revenue",
        "totalRevenue",
        "value",
      ]).toLocaleString(),
    ),
  }));

  const slowEntries = inventoryItems
    .map((item: any) => ({
      name:
        firstString(item, ["name", "productName", "product_name", "title"]) ||
        "Item",
      value: firstNumber(item, [
        "estimatedValue",
        "value",
        "totalValue",
        "inventoryValue",
        "amount",
      ]),
    }))
    .slice(0, 5);

  return {
    catA: {
      core: categoryA,
      vat: vatCollected,
      avg: totalTransactions ? Math.round(categoryA / totalTransactions) : 0,
      items:
        firstNumber(sales, ["itemsSold", "totalItems", "itemCount"]) ||
        totalTransactions,
      txns: totalTransactions,
      recentTxns: recentTransactions,
      allTxns: allTransactions,
    },
    catB: {
      core: categoryB,
      overflow: categoryB,
      baseNonTax: firstNumber(sales, ["baseNonTax", "nonTaxRevenue"]) || 0,
      avg: totalTransactions ? Math.round(categoryB / totalTransactions) : 0,
      items: firstNumber(sales, ["overflowItems", "categoryBItems"]) || 0,
      txns: 0,
      recentTxns: [],
      allTxns: [],
      topProducts,
    },
    catC: {
      core: categoryC,
      labour: firstNumber(sales, ["labourRevenue"]) || 0,
      install: firstNumber(sales, ["installRevenue"]) || 0,
      misc: firstNumber(sales, ["miscRevenue"]) || 0,
      entries: firstNumber(sales, ["catCEntries", "entries"]) || 0,
      recentEntries: slowEntries,
      allTxns: allTransactions,
      breakdown: slowEntries,
    },
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const defaultRange = useMemo(() => getDefaultDateRange(), []);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getDefaultDateRange(),
  );
  const [reportModal, setReportModal] = useState<null | "A" | "B" | "C">(null);
  const [printCategory, setPrintCategory] = useState<null | "A" | "B" | "C">(
    null,
  );
  const [printTimeFilter, setPrintTimeFilter] = useState("Last 24 Hours");

  const effectiveRange = dateRange ?? defaultRange;

  const queryRange = useMemo(
    () => ({
      startDate: effectiveRange.from
        ? toIsoDate(effectiveRange.from)
        : toIsoDate(startOfMonth(new Date())),
      endDate: effectiveRange.to
        ? toIsoDate(effectiveRange.to)
        : toIsoDate(endOfMonth(new Date())),
    }),
    [effectiveRange],
  );

  const {
    data: salesReport,
    isLoading: salesLoading,
    isFetching: salesFetching,
  } = useGetSalesReportQuery(queryRange);
  const {
    data: inventoryReport,
    isLoading: inventoryLoading,
    isFetching: inventoryFetching,
  } = useGetInventoryReportQuery(queryRange);
  const {
    data: taxReport,
    isLoading: taxLoading,
    isFetching: taxFetching,
  } = useGetTaxReportQuery(queryRange);
  const {
    data: topProductsReport,
    isLoading: topProductsLoading,
    isFetching: topProductsFetching,
  } = useGetTopProductsQuery(queryRange);

  const loading =
    salesLoading || inventoryLoading || taxLoading || topProductsLoading;
  const fetching =
    salesFetching || inventoryFetching || taxFetching || topProductsFetching;
  const data = useMemo(
    () =>
      buildLegacyData(
        salesReport,
        taxReport,
        topProductsReport,
        inventoryReport,
      ),
    [salesReport, taxReport, topProductsReport, inventoryReport],
  );

  const handleExport = (type: string, formatType: string) => {
    const url = buildExportUrl(type, formatType, dateRange);
    window.open(url, "_blank");
  };

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto pb-20 print:hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[32px] md:text-[36px] font-black text-gray-900 tracking-tighter leading-tight mb-2">
              Reports & Analytics
            </h1>
            <p className="text-[14px] font-medium text-gray-500 tracking-wide">
              Comprehensive business insights, tax reports, and performance
              analytics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-[12px] px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors min-w-[200px]">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-[13px] font-bold text-gray-700">
                      {dateRange?.from
                        ? format(dateRange.from, "MMM d, yyyy")
                        : "Select Date..."}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="bg-white p-7 rounded-[32px] shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in duration-300 w-[380px] print:hidden"
                  sideOffset={12}
                  align="end"
                >
                  <div className="flex flex-col min-h-[460px]">
                    <div className="flex justify-between items-center mb-6 pl-2">
                      <h4 className="text-[17px] font-black text-blue-900 tracking-tight">
                        Select Time Period
                      </h4>
                      <Popover.Close className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all">
                        <X className="w-5 h-5" />
                      </Popover.Close>
                    </div>
                    <div className="flex-1 py-2">
                      <SalesDatePicker
                        dateRange={dateRange}
                        onSelect={setDateRange}
                      />
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between pl-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">
                          Selected Range
                        </span>
                        <div className="text-[13px] font-black text-blue-700 flex items-center gap-2">
                          {dateRange?.from
                            ? formatDateOnly(dateRange.from)
                            : "---"}
                          {dateRange?.to && (
                            <>
                              <span className="text-gray-300 font-light">
                                —
                              </span>
                              {formatDateOnly(dateRange.to)}
                            </>
                          )}
                        </div>
                      </div>
                      <Popover.Close asChild>
                        <button className="bg-blue-900 hover:bg-blue-800 text-white px-7 py-3 rounded-2xl font-black text-[13px] shadow-lg shadow-blue-100 transition-all active:scale-95">
                          Apply
                        </button>
                      </Popover.Close>
                    </div>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            <button className="flex items-center gap-2 bg-white border border-gray-200 rounded-[12px] px-4 py-2.5 shadow-sm hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" />
              Scheduled
            </button>

            <button
              className="flex items-center gap-2 bg-[#1e40af] text-white rounded-[12px] px-6 py-2.5 shadow-sm hover:bg-blue-800 transition-colors text-[13px] font-black tracking-wide"
              onClick={() => handleExport("sales", "csv")}
            >
              <Download className="w-4 h-4" />
              Export All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <ReportStatCard
            title="Total Revenue"
            value={
              loading
                ? "..."
                : `Rs. ${(data.catA.core + data.catB.core + data.catC.core).toLocaleString()}`
            }
            icon={
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
            }
            variant="blue"
            trend={fetching ? "Refreshing" : "+18.5%"}
            trendText="vs last month"
          />
          <ReportStatCard
            title="Gross Profit"
            value={
              loading
                ? "..."
                : `Rs. ${Math.round((data.catA.core + data.catB.core + data.catC.core) * 0.256).toLocaleString()}`
            }
            icon={
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
            }
            variant="green"
            marginText="25.6%"
          />
          <ReportStatCard
            title="Transactions"
            value={
              loading
                ? "..."
                : (data.catA.txns + data.catB.txns).toLocaleString()
            }
            icon={
              <div className="w-9 h-9 rounded-xl bg-[#fef08a] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#854d0e]" />
              </div>
            }
            variant="white"
            trend={fetching ? "Refreshing" : "+8.2%"}
            trendText="vs last month"
          />
          <ReportStatCard
            title="VAT Collected"
            value={loading ? "..." : `Rs. ${data.catA.vat.toLocaleString()}`}
            icon={
              <div className="w-9 h-9 rounded-xl bg-[#f3e8ff] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#9333ea]" />
              </div>
            }
            variant="white"
            badge="IRD Compliant"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 relative z-10">
          <ReportCategoryCard
            title="Sales Reports"
            description="Daily, weekly, and monthly sales summaries, product performance, and cashier reports"
            icon={<BarChart2 className="w-7 h-7 text-white" />}
            iconBgClass="bg-[#2563eb]"
            badge={{
              text: "8 Reports",
              colorClass: "bg-[#eff6ff] text-[#2563eb]",
            }}
            reports={[
              "Daily Sales Summary",
              "Sales by Product",
              "Sales by Cashier",
            ]}
            onButtonClick={() => router.push("/reports/sales")}
            buttonText="View All Sales Reports"
            buttonColorClass="bg-[#1e40af] hover:bg-blue-800"
          />
          <ReportCategoryCard
            title="Tax & Compliance"
            description="IRD tax compliance reports, VAT summaries, Category A/B/C breakdowns for Sri Lanka"
            icon={<FileText className="w-7 h-7 text-white" />}
            iconBgClass="bg-[#8b5cf6]"
            badge={{
              text: "6 Reports",
              colorClass: "bg-[#f3e8ff] text-[#9333ea]",
            }}
            cardContext={
              <div className="bg-[#ecfdf5] border border-green-100 rounded-lg px-3 py-2 flex items-center gap-2 max-w-max">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span className="text-[11px] font-black text-[#059669] uppercase tracking-widest">
                  IRD Compliant Format
                </span>
              </div>
            }
            reports={["Category A Report", "Monthly VAT Summary"]}
            onReportClick={(r) => {
              if (r === "Category A Report") setReportModal("A");
            }}
            onButtonClick={() => router.push("/reports/tax")}
            buttonText="View All Tax Reports"
            buttonColorClass="bg-[#8b5cf6] hover:bg-purple-600"
          />
          <ReportCategoryCard
            title="Inventory Reports"
            description="Stock levels, movement history, valuation, low stock alerts, and reorder analysis"
            icon={<Boxes className="w-7 h-7 text-white" />}
            iconBgClass="bg-[#059669]"
            badge={{
              text: "7 Reports",
              colorClass: "bg-[#ecfdf5] text-[#059669]",
            }}
            reports={[
              "Current Stock Overview",
              "Low Stock Report",
              "Inventory Valuation",
            ]}
            onButtonClick={() => router.push("/reports/inventory")}
            buttonText="View All Inventory Reports"
            buttonColorClass="bg-[#059669] hover:bg-green-700"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-0 mb-8">
          <RevenueTrendChart />
          <TaxBreakdownChart salesData={data} loading={loading} />
        </div>

        <div className="relative z-0">
          <AllTransactionsTable dateRange={dateRange} />
        </div>
      </div>

      <CategoryAReportModal
        isOpen={reportModal === "A"}
        onClose={() => setReportModal(null)}
        onPrintPDF={(timeFilter) => {
          setPrintCategory("A");
          setPrintTimeFilter(timeFilter);
          setTimeout(() => {
            window.print();
            setPrintCategory(null);
          }, 100);
        }}
        data={data}
      />
      <CategoryBReportModal
        isOpen={reportModal === "B"}
        onClose={() => setReportModal(null)}
        onPrintPDF={(timeFilter) => {
          setPrintCategory("B");
          setPrintTimeFilter(timeFilter);
          setTimeout(() => {
            window.print();
            setPrintCategory(null);
          }, 100);
        }}
        data={data}
      />
      <CategoryCReportModal
        isOpen={reportModal === "C"}
        onClose={() => setReportModal(null)}
        onPrintPDF={(timeFilter) => {
          setPrintCategory("C");
          setPrintTimeFilter(timeFilter);
          setTimeout(() => {
            window.print();
            setPrintCategory(null);
          }, 100);
        }}
        data={data}
      />

      <CategoryPrintView
        category={printCategory}
        dateRange={dateRange}
        timeFilter={printTimeFilter}
        data={data}
      />
    </MainLayout>
  );
}
