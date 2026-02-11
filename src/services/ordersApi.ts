import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

type OrderVendor = {
  id: string;
  businessName: string;
  slug: string;
};

type OrderItemPayload = {
  id: string;
  quantity: number;
  orderNumber: string;
  priceFinal: number;
  offering: {
    id: string;
    name: string;
    serviceTitle: string;
    serviceId: string | null;
  };
};

type OrderPayload = {
  id: string;
  status: string;
  vendor: OrderVendor;
  createdAt: string;
  totalFinal: number;
  items: OrderItemPayload[];
};

type OrdersResponse = {
  data: OrderPayload[];
};

type VendorOrderPayload = {
  id: string;
  status: string;
  userId: string;
  createdAt: string;
  currency: string;
  totalOriginal: number;
  totalDiscount: number;
  totalFinal: number;
  commissionRate: number;
  commissionAmount: number;
  vendorPayoutAmount: number;
  items: Array<{
    id: string;
    quantity: number;
    orderNumber: string;
    priceFinal: number;
    offering: {
      id: string;
      name: string;
      serviceTitle: string;
      serviceId: string | null;
    };
  }>;
};

type VendorOrdersResponse = {
  data: VendorOrderPayload[];
};

export type OrderReceiptItem = {
  id: string;
  offeringId: string;
  name: string;
  serviceTitle: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  orderNumber: string;
};

export type OrderReceiptSummary = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
};

export type OrderReceiptVendor = {
  id: string;
  businessName: string;
  slug: string;
  contactEmail: string | null;
};

export type OrderReceiptPayment = {
  sessionId: string | null;
  paymentIntentId: string | null;
  chargeId: string | null;
  receiptUrl: string | null;
  receiptNumber: string | null;
  amountReceived: number;
  currency: string;
  paymentMethod: string;
};

export type StripeSessionInfo = {
  id: string | null;
  status: string | null;
  metadata: Record<string, string>;
  amountTotal: number | null;
};

export type OrderReceiptPayload = {
  orderId: string;
  orderNumber: string | null;
  status: string;
  vendor: OrderReceiptVendor;
  buyer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  summary: OrderReceiptSummary;
  createdAt: string;
  items: OrderReceiptItem[];
  payment: OrderReceiptPayment;
  stripeSession: StripeSessionInfo;
};

export type OrderReceiptResponse = {
  message: string;
  data: OrderReceiptPayload;
};

export type OrderReceiptQuery = {
  sessionId?: string;
  orderId?: string;
};

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getVendorOrders: builder.query<VendorOrdersResponse, void>({
      query: () => "vendor/orders",
      providesTags: [{ type: "Order", id: "VENDOR_LIST" }],
    }),
    getMyOrders: builder.query<OrdersResponse, void>({
      query: () => "vendor/orders/me",
      providesTags: (result) =>
        result
          ? result.data.map((order) => ({ type: "Order" as const, id: order.id }))
          : [{ type: "Order", id: "LIST" }],
    }),
    getOrderReceipt: builder.query<OrderReceiptResponse, OrderReceiptQuery>({
      query: (params) => ({
        url: "/orders/confirmation",
        params: {
          ...(params.sessionId ? { session_id: params.sessionId } : {}),
          ...(params.orderId ? { order_id: params.orderId } : {}),
        },
      }),
    }),
  }),
});

export const { useGetVendorOrdersQuery, useGetMyOrdersQuery, useGetOrderReceiptQuery } = ordersApi;
