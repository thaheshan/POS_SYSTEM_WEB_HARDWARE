import { baseApi } from "@/store/baseApi";

export type ReportDateRange = {
  startDate: string;
  endDate: string;
};

export const reportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSalesReport: build.query<any, ReportDateRange>({
      query: (params) => ({
        url: "/reports/sales",
        params,
      }),
    }),
    getInventoryReport: build.query<any, ReportDateRange>({
      query: (params) => ({
        url: "/reports/inventory",
        params,
      }),
    }),
    getTaxReport: build.query<any, ReportDateRange>({
      query: (params) => ({
        url: "/reports/tax",
        params,
      }),
    }),
    getTopProducts: build.query<any, ReportDateRange>({
      query: (params) => ({
        url: "/reports/products/top",
        params,
      }),
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetInventoryReportQuery,
  useGetTaxReportQuery,
  useGetTopProductsQuery,
} = reportApi;
