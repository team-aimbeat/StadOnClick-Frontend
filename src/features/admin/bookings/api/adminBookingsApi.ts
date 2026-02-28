import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";
import type {
  AdminBookingListRequest,
  AdminBookingListResponse,
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
  }),
});

export const {
  useDecideBookingRefundMutation,
  useListAdminBookingsQuery,
  useLazyListAdminBookingsQuery,
} = adminBookingsApi;
