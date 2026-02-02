import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

export interface CreateOrderItemPayload {
  offeringId: string;
  quantity: number;
  slotId?: string | null;
}

export interface CreateOrderPayload {
  userId: string;
  vendorId: string;
  items: CreateOrderItemPayload[];
  promoCode?: string;
}

export interface CreateOrderResponse {
  message: string;
  data: {
    orderId: string;
    status: string;
    currency: string;
    vendorId: string;
    userId: string;
    createdAt: string;
    summary: {
      subtotal: number;
      tax: number;
      discount: number;
      total: number;
    };
    items: Array<{
      id: string;
      offeringId: string;
      quantity: number;
      slotId: string | null;
      pricePerUnit: number;
      totalPrice: number;
      orderNumber: string;
    }>;
    coupon?: {
      code: string;
      discountType: string;
      value: number;
    } | null;
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
