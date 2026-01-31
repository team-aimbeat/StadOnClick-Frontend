import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export interface CreateOrderPayload {
  userId: string;
  vendorId: string;
  offeringId: string;
  slotId?: string | null;
  quantity?: number;
}

export interface CreateOrderResponse {
  message: string;
  data: {
    id: string;
    status: string;
    totalFinal: number;
    currency: string;
    createdAt: string;
  };
}

export const vendorOrdersApi = createApi({
  reducerPath: "vendorOrdersApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderPayload>({
      query: (body) => ({
        url: "/vendor/orders",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateOrderMutation } = vendorOrdersApi;
