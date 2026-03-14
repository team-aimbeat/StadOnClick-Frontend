import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  AdminOrderListRequest,
  AdminOrderListResponse,
} from "@/features/admin/orders/types/adminOrder.types";

export const adminOrdersApi = createApi({
  reducerPath: "adminOrdersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminOrders"],
  endpoints: (builder) => ({
    listAdminOrders: builder.query<AdminOrderListResponse["data"], AdminOrderListRequest | void>(
      {
        query: (params) => ({
          url: "/admin/orders",
          method: "GET",
          params: params ?? {},
        }),
        transformResponse: (response: AdminOrderListResponse) => response.data,
        providesTags: ["AdminOrders"],
      }
    ),
    cancelAdminOrder: builder.mutation<
      { success: boolean; data: unknown },
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/admin/orders/${id}/cancel`,
        method: "PATCH",
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ["AdminOrders"],
    }),
  }),
});

export const {
  useListAdminOrdersQuery,
  useLazyListAdminOrdersQuery,
  useCancelAdminOrderMutation,
} = adminOrdersApi;
