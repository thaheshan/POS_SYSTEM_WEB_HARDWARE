import { baseApi } from './baseApi';

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query<any, { startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/reports/sales',
        params,
      }),
    }),
    getInventoryReport: builder.query<any, { startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/reports/inventory',
        params,
      }),
    }),
    getTaxReport: builder.query<any, { startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/reports/tax',
        params,
      }),
    }),
    getTopProducts: builder.query<any, { startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/reports/top-products',
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
