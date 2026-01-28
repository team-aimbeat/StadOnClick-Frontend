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
  }),
});

export const {
  useGetVendorWalletQuery,
  useAdjustWalletMutation,
  useApprovePayoutMutation,
  useRejectPayoutMutation,
} = adminFinanceApi;
