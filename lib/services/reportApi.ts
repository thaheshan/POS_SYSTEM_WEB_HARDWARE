import { baseApi } from "@/store/baseApi";
import type {
  InventoryReport,
  ReportDateRange,
  ReportExportFormat,
  ReportExportType,
  SalesReport,
  TaxReport,
  TopProductReportItem,
} from "@/types";

// Keep the query argument shapes explicit so report screens can pass only the filters they need.
type TopProductsQueryArg = {
  limit?: number;
} | void;

// Export requests only need the report type and file format.
type ExportReportQueryArg = {
  type: ReportExportType;
  format: ReportExportFormat;
};

export const reportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Sales analytics are filtered by date range and cached briefly to keep dashboards current.
    getSalesReport: build.query<SalesReport, ReportDateRange>({
      query: (params) => ({
        url: "/reports/sales",
        params,
      }),
      keepUnusedDataFor: 60,
    }),

    // Inventory analytics are read-only and use the same short cache window.
    getInventoryReport: build.query<InventoryReport, void>({
      query: () => ({
        url: "/reports/inventory",
      }),
      keepUnusedDataFor: 60,
    }),

    // Tax reports also use the date range filter because compliance views are period-based.
    getTaxReport: build.query<TaxReport, ReportDateRange>({
      query: (params) => ({
        url: "/reports/tax",
        params,
      }),
      keepUnusedDataFor: 60,
    }),

    // Top products power the manager dashboard widgets and best-seller charts.
    getTopProducts: build.query<TopProductReportItem[], TopProductsQueryArg>({
      query: (params) => ({
        url: "/reports/products/top",
        params: params ?? { limit: 10 },
      }),
      keepUnusedDataFor: 60,
    }),

    // Export returns a blob so the frontend can trigger CSV/PDF downloads directly.
    exportReport: build.query<Blob, ExportReportQueryArg>({
      query: ({ type, format }) => ({
        url: `/reports/${type}/export`,
        params: { format },
        responseHandler: async (response) => response.blob(),
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetInventoryReportQuery,
  useGetTaxReportQuery,
  useGetTopProductsQuery,
  useLazyExportReportQuery,
} = reportApi;
