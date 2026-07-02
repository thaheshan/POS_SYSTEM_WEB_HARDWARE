import { baseApi } from '../../src/store/baseApi';
import {
  SalesReport,
  InventoryReport,
  TaxReport,
  TopProductReportItem,
} from '../../src/types';

export const reportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSalesReport: build.query<SalesReport, { startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/reports/sales',
        params,
      }),
      keepUnusedDataFor: 60,
    }),

    getInventoryReport: build.query<InventoryReport, void>({
      query: () => ({
        url: '/reports/inventory',
      }),
      keepUnusedDataFor: 60,
    }),

    getTaxReport: build.query<TaxReport, { startDate: string; endDate: string }>({
      query: (params) => ({
        url: '/reports/tax',
        params,
      }),
      keepUnusedDataFor: 60,
    }),

    getTopProducts: build.query<TopProductReportItem[], { limit?: number } | void>({
      query: (params) => ({
        url: '/reports/products/top',
        params: params || { limit: 10 },
      }),
      keepUnusedDataFor: 60,
    }),

    exportReport: build.query<Blob, { type: string; format: 'csv' | 'pdf' }>({
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
