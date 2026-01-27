import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type VendorNotificationItem = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  entityType: string;
  entityId: string;
  readAt?: string | null;
  createdAt: string;
};

type ListResponse = {
  data: VendorNotificationItem[];
};

export const vendorNotificationsApi = createApi({
  reducerPath: "vendorNotificationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["VendorNotifications"],
  endpoints: (builder) => ({
    listVendorNotifications: builder.query<VendorNotificationItem[], void>({
      query: () => ({ url: "/vendor/notifications", method: "GET" }),
      transformResponse: (response: ListResponse | VendorNotificationItem[]) => {
        if (Array.isArray(response)) return response;
        return response.data ?? [];
      },
      providesTags: [{ type: "VendorNotifications", id: "LIST" }],
    }),
    markVendorNotificationRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vendor/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "VendorNotifications", id: "LIST" }],
    }),
    markAllVendorNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/vendor/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "VendorNotifications", id: "LIST" }],
    }),
  }),
});

export const {
  useListVendorNotificationsQuery,
  useMarkVendorNotificationReadMutation,
  useMarkAllVendorNotificationsReadMutation,
} = vendorNotificationsApi;
