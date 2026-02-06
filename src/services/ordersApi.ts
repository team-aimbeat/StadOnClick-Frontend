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
  slotId: string | null;
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

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getMyOrders: builder.query<OrdersResponse, void>({
      query: () => "/orders/me",
      providesTags: (result) =>
        result
          ? result.data.map((order) => ({ type: "Order" as const, id: order.id }))
          : [{ type: "Order", id: "LIST" }],
    }),
  }),
});

export const { useGetMyOrdersQuery } = ordersApi;
