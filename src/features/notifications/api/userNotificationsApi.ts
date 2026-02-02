import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithReauth } from "@/app/services/baseApi";

export type UserNotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entityType: string;
  entityId: string;
  escalationId: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
};

type NotificationsResponse = {
  data: UserNotificationItem[];
  meta: NotificationsMeta;
};

type UnreadCountResponse = { data: { count: number } } | { count: number };

type GetNotificationsArgs = {
  page?: number;
  limit?: number;
};

export const userNotificationsApi = createApi({
  reducerPath: "userNotificationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserNotifications", "UserNotificationsUnread"],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, GetNotificationsArgs | void>({
      query: (arg) => {
        const page = arg?.page ?? 1;
        const limit = arg?.limit ?? 5;
        return {
          url: "/notifications",
          method: "GET",
          params: { page, limit },
        };
      },
      providesTags: (result) =>
        result
          ? [
              { type: "UserNotifications", id: "LIST" },
              ...result.data.map((notification) => ({
                type: "UserNotifications",
                id: notification.id,
              })),
            ]
          : [{ type: "UserNotifications", id: "LIST" }],
    }),

    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => ({ url: "/notifications/unread-count", method: "GET" }),
      transformResponse: (response: { data: { count: number } } | { count: number }) => {
        if ('count' in response) {
          return response;
        }
        return response;
      },
      providesTags: [{ type: "UserNotificationsUnread", id: "COUNT" }],
    }),

    markNotificationRead: builder.mutation<{ success: boolean; unreadCount: number }, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "UserNotifications", id: "LIST" },
        { type: "UserNotificationsUnread", id: "COUNT" },
      ],
    }),

    markAllRead: builder.mutation<{ success: boolean; unreadCount: number }, void>({
      query: () => ({ url: "/notifications/read-all", method: "POST" }),
      invalidatesTags: [
        { type: "UserNotifications", id: "LIST" },
        { type: "UserNotificationsUnread", id: "COUNT" },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
} = userNotificationsApi;
