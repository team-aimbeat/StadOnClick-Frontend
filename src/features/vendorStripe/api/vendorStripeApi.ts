import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export interface StripeStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  accountId: string | null;
  onboardingRequired: boolean;
  onboardingComplete: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pendingVerification: string[];
    disabledReason: string | null;
  };
  lastOnboardedAt: string | null;
}

export interface StripeLinkPayload {
  url: string;
  accountId: string;
  mode: "onboarding" | "dashboard";
}

export const vendorStripeApi = createApi({
  reducerPath: "vendorStripeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["StripeStatus"],
  endpoints: (builder) => ({
    getStripeStatus: builder.query<{ success: boolean; data: StripeStatus }, void>({
      query: () => ({
        url: "/vendor/stripe/status",
        method: "GET",
      }),
      providesTags: ["StripeStatus"],
    }),

    connectStripe: builder.mutation<{ success: boolean; data: StripeLinkPayload }, void>({
      query: () => ({
        url: "/vendor/stripe/connect",
        method: "POST",
      }),
    }),
    createStripeDashboardLink: builder.mutation<{ success: boolean; data: StripeLinkPayload }, void>({
      query: () => ({
        url: "/vendor/stripe/dashboard-link",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetStripeStatusQuery,
  useConnectStripeMutation,
  useCreateStripeDashboardLinkMutation,
} = vendorStripeApi;
