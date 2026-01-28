import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import { WalletSummary } from "@/features/vendorWallet/api/walletApi";

export const adminFinanceApi = createApi({
  reducerPath: "adminFinanceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminWallet"],
  endpoints: (builder) => ({
    getVendorWallet: builder.query<{ status: string; data: { summary: WalletSummary, recentTransactions: any[] } }, string>({
      query: (vendorId) => ({
        url: `/admin/finance/${vendorId}`,
        method: "GET",
      }),
      providesTags: ["AdminWallet"],
    }),

    adjustWallet: builder.mutation<any, { vendorId: string; amount: number; direction: "CREDIT" | "DEBIT"; description: string }>({
      query: (body) => ({
        url: "/admin/finance/adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminWallet"],
    }),

    approvePayout: builder.mutation<any, string>({
      query: (payoutId) => ({
        url: `/admin/finance/payouts/${payoutId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["AdminWallet"],
    }),

    rejectPayout: builder.mutation<any, { payoutId: string; reason: string }>({
      query: ({ payoutId, ...body }) => ({
        url: `/admin/finance/payouts/${payoutId}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminWallet"],
    }),

    getPayouts: builder.query<{ status: string; data: { data: any[]; meta: any } }, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({
        url: "/admin/finance/payouts",
        method: "GET",
        params,
      }),
      providesTags: ["AdminWallet"],
    }),

    getPlatformStats: builder.query<{ status: string; data: { totalRevenue: number; pendingLiability: number; totalPayouts: number; currency: string } }, void>({
      query: () => ({
        url: "/admin/finance/platform-stats",
        method: "GET",
      }),
      providesTags: ["AdminWallet"],
    }),

    getPlatformTransactions: builder.query<{ status: string; data: { data: any[]; meta: any } }, { page?: number; limit?: number }>({
      query: (params) => ({
        url: "/admin/finance/platform-transactions",
        method: "GET",
        params,
      }),
      providesTags: ["AdminWallet"],
    }),
  }),
});

export const {
  useGetVendorWalletQuery,
  useAdjustWalletMutation,
  useApprovePayoutMutation,
  useRejectPayoutMutation,
  useGetPayoutsQuery,
  useGetPlatformStatsQuery,
  useGetPlatformTransactionsQuery,
} = adminFinanceApi;
