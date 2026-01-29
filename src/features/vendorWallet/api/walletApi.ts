import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export interface WalletSummary {
  availableBalance: number;
  lockedBalance: number;
  pendingPayoutBalance: number;
  lifetimeEarnings: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: string;
  direction: "CREDIT" | "DEBIT";
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "REVERSED";
  sourceType: string;
  sourceId: string | null;
  description: string | null;
  createdAt: string;
}

export interface TransactionsResponse {
  status: string;
  data: WalletTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const vendorWalletApi = createApi({
  reducerPath: "vendorWalletApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Wallet", "Transactions"],
  endpoints: (builder) => ({
    getWalletSummary: builder.query<{ status: string; data: WalletSummary }, void>({
      query: () => ({
        url: "/vendor/wallet/summary",
        method: "GET",
      }),
      providesTags: ["Wallet"],
    }),

    getWalletTransactions: builder.query<TransactionsResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => ({
        url: "/vendor/wallet/transactions",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: (result) => 
        result 
          ? [...result.data.map(({ id }) => ({ type: 'Transactions' as const, id })), 'Transactions']
          : ['Transactions'],
    }),

    requestPayout: builder.mutation<{ status: string; data: any }, { amount: number }>({
      query: (body) => ({
        url: "/vendor/wallet/payout-request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet", "Transactions"],
    }),
  }),
});

export const {
  useGetWalletSummaryQuery,
  useGetWalletTransactionsQuery,
  useRequestPayoutMutation,
} = vendorWalletApi;
