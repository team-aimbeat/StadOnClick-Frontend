import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export interface StripeStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  accountId?: string;
  onboardingComplete: boolean;
}

export const vendorStripeApi = createApi({
  reducerPath: "vendorStripeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["StripeStatus"],
  endpoints: (builder) => ({
    getStripeStatus: builder.query<{ status: string; data: StripeStatus }, void>({
      query: () => ({
        url: "/vendor/stripe/status",
        method: "GET",
      }),
      providesTags: ["StripeStatus"],
    }),

    connectStripe: builder.mutation<{ status: string; data: { url: string } }, void>({
      query: () => ({
        url: "/vendor/stripe/connect",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetStripeStatusQuery,
  useConnectStripeMutation,
} = vendorStripeApi;
