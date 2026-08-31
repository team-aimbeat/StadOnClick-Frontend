import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  AdminBookingListRequest,
  AdminBookingListResponse,
  AdminBookingLog,
} from "@/features/admin/bookings/types/adminBooking.types";

export const adminBookingsApi = createApi({
  reducerPath: "adminBookingsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminBookings"],
  endpoints: (builder) => ({
    listAdminBookings: builder.query<AdminBookingListResponse["data"], AdminBookingListRequest | void>(
      {
        query: (params) => ({
          url: "/admin/bookings",
          method: "GET",
          params: params ?? {},
        }),
        transformResponse: (response: AdminBookingListResponse) => response.data,
        providesTags: ["AdminBookings"],
      }
    ),
    decideBookingRefund: builder.mutation<
      { success: boolean; booking: { id: string; status: string } },
      { id: string; action: "APPROVE" | "REJECT"; reason?: string }
    >({
      query: ({ id, action, reason }) => ({
        url: `/admin/bookings/${id}/refund`,
        method: "PATCH",
        body: {
          action,
          reason,
        },
      }),
      invalidatesTags: ["AdminBookings"],
    }),
    getBookingLogs: builder.query<AdminBookingLog[], string>({
      query: (bookingId) => ({
        url: `/admin/bookings/${bookingId}/logs`,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: AdminBookingLog[] }) => response.data,
    }),
    getServiceBookingLogs: builder.query<AdminBookingLog[], string>({
      query: (serviceId) => ({
        url: `/admin/bookings/logs`,
        method: "GET",
        params: { serviceId },
      }),
      transformResponse: (response: { success: boolean; data: AdminBookingLog[] }) => response.data,
    }),
  }),
});

export const {
  useDecideBookingRefundMutation,
  useListAdminBookingsQuery,
  useLazyListAdminBookingsQuery,
  useGetBookingLogsQuery,
  useGetServiceBookingLogsQuery,
} = adminBookingsApi;
