import { baseQueryWithReauth } from "@/app/services/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";

export type VendorComparisonStats = {
  totalVisitors: number;
  visitorsLast7Days: number;
  repeatVisitorsPercentage: number;
  totalBookings: number;
  conversionRate: number;
};

export type VendorComparisonRecord = {
  vendorId: string;
  vendorName: string;
  totalServices: number;
  avgRating: number;
  yearsActive: number;
  stats: VendorComparisonStats;
  tags: string[];
};

export const vendorComparisonApi = createApi({
  reducerPath: "vendorComparisonApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    compareVendors: builder.query<{ data: VendorComparisonRecord[] }, { ids: string[] }>({
      query: ({ ids }) => ({
        url: `/compare-vendors`,
        params: { ids: ids.join(",") },
      }),
    }),
    listVendors: builder.query<{ data: { id: string; name: string; category: string }[] }, void>({
      query: () => ({ url: "/compare-vendors/list" }),
    }),
    trackVisit: builder.mutation<{ data: unknown }, { vendorId: string; sessionId: string; userId?: string }>({
      query: (body) => ({
        url: `/compare-vendors/track`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCompareVendorsQuery, useTrackVisitMutation, useListVendorsQuery } = vendorComparisonApi;
