import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export interface CreateCheckoutSessionItem {
  offeringId: string;
  quantity: number;
  slotId?: string | null;
}

export interface CreateCheckoutSessionPayload {
  userId: string;
  vendorId: string;
  items: CreateCheckoutSessionItem[];
  promoCode?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  message: string;
  data: {
    sessionUrl: string;
    sessionId: string | null;
    orderId: string;
  };
}

export const checkoutApi = createApi({
  reducerPath: "checkoutApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation<
      CreateCheckoutSessionResponse,
      CreateCheckoutSessionPayload
    >({
      query: (body) => ({
        url: "/marketplace/create-checkout-session",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateCheckoutSessionMutation } = checkoutApi;
