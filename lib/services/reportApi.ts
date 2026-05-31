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
      providesTags: () => [{ type: "Report", id: "sales" }],
      keepUnusedDataFor: 60,
    }),

    // Inventory analytics are read-only and use the same short cache window.
    getInventoryReport: build.query<InventoryReport, void>({
      query: () => "/reports/inventory",
      providesTags: () => [{ type: "Report", id: "inventory" }],
      keepUnusedDataFor: 60,
    }),

    // Tax reports also use the date range filter because compliance views are period-based.
    getTaxReport: build.query<TaxReport, ReportDateRange>({
      query: (params) => ({
        url: "/reports/tax",
        params,
      }),
      providesTags: () => [{ type: "Report", id: "tax" }],
      keepUnusedDataFor: 60,
    }),

    // Top products power the manager dashboard widgets and best-seller charts.
    getTopProducts: build.query<TopProductReportItem[], TopProductsQueryArg>({
      query: ({ limit = 10 } = {}) => ({
        url: "/reports/products/top",
        params: { limit },
      }),
      providesTags: () => [{ type: "Report", id: "top-products" }],
      keepUnusedDataFor: 60,
    }),

    // Export resolves to an object URL string so the cache stays serializable.
    exportReport: build.query<string, ExportReportQueryArg>({
      query: ({ type, format }) => ({
        url: `/reports/${type}/export`,
        params: { format },
        responseHandler: async (response) => response.blob(),
      }),
      transformResponse: (blob: Blob) => URL.createObjectURL(blob),
      async onCacheEntryAdded(
        _arg,
        { cacheDataLoaded, cacheEntryRemoved, getCacheEntry },
      ) {
        await cacheDataLoaded;

        const objectUrl = getCacheEntry().data;

        await cacheEntryRemoved;

        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      },
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
