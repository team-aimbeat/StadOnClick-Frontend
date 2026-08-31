import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export type ReportsSummary = {
  totalCustomers: number;
  totalVendors: number;
  totalOrders: number;
  totalRevenue: number;
  totalLeads: number;
};

export type ReportRow = Record<string, unknown>;

export type ReportListResponse = {
  data: ReportRow[];
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
};

export type DateRangeParams = {
  from?: string;
  to?: string;
  search?: string;
  status?: string;
};

export const adminReportsApi = createApi({
  reducerPath: "adminReportsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ReportsSummary", "ReportList"],
  endpoints: (builder) => ({
    getSummary: builder.query<ReportsSummary, DateRangeParams | void>({
      query: (params) => ({
        url: "/admin/reports/summary",
        method: "GET",
        params,
      }),
      providesTags: ["ReportsSummary"],
    }),
    getReportRows: builder.query<
      ReportListResponse,
      { entity: string; params?: DateRangeParams & Record<string, unknown> }
    >({
      query: ({ entity, params }) => ({
        url: `/admin/reports/${entity}`,
        method: "GET",
        params,
      }),
      providesTags: (_result, _error, arg) => [
        { type: "ReportList", id: arg.entity },
      ],
    }),
  }),
});

export const { useGetSummaryQuery, useGetReportRowsQuery } = adminReportsApi;
