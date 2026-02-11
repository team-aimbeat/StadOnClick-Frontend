import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  LeadPlan,
  LeadSubscriptionStatus,
} from "../types/leadPlans.types";

type PurchaseResponse = {
  url?: string;
  checkoutUrl?: string;
};

export const vendorLeadSubscriptionsApi = createApi({
  reducerPath: "vendorLeadSubscriptionsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VendorLeadPlans", "VendorLeadSubscription"],
  endpoints: (builder) => ({
    listLeadPlans: builder.query<LeadPlan[], void>({
      query: () => ({
        url: "/vendor/lead-plans",
        method: "GET",
      }),
      transformResponse: (response: LeadPlan[] | { data?: LeadPlan[] }) => {
        if (Array.isArray(response)) {
          return response;
        }

        if (response && Array.isArray(response.data)) {
          return response.data;
        }

        return [];
      },
      providesTags: (result) =>
        result && result.length > 0
          ? [
              ...result.map((plan) => ({
                type: "VendorLeadPlans" as const,
                id: plan.id,
              })),
              { type: "VendorLeadPlans" as const, id: "LIST" },
            ]
          : [{ type: "VendorLeadPlans" as const, id: "LIST" }],
    }),

    getLeadSubscriptionStatus: builder.query<LeadSubscriptionStatus, void>({
      query: () => ({
        url: "/vendor/lead-subscription",
        method: "GET",
      }),
      providesTags: [{ type: "VendorLeadSubscription", id: "STATUS" }],
    }),

    purchaseLeadSubscription: builder.mutation<
      PurchaseResponse,
      { planId: string }
    >({
      query: ({ planId }) => ({
        url: "/vendor/lead-subscriptions",
        method: "POST",
        body: { planId },
      }),
      invalidatesTags: [
        { type: "VendorLeadPlans", id: "LIST" },
        { type: "VendorLeadSubscription", id: "STATUS" },
      ],
    }),

    confirmLeadSubscriptionCheckout: builder.mutation<
      LeadSubscriptionStatus,
      { sessionId: string }
    >({
      query: ({ sessionId }) => ({
        url: "/vendor/lead-subscriptions/confirm",
        method: "POST",
        body: { sessionId },
      }),
      invalidatesTags: [{ type: "VendorLeadSubscription", id: "STATUS" }],
    }),
  }),
});

export const {
  useListLeadPlansQuery,
  useGetLeadSubscriptionStatusQuery,
  usePurchaseLeadSubscriptionMutation,
  useConfirmLeadSubscriptionCheckoutMutation,
} = vendorLeadSubscriptionsApi;
