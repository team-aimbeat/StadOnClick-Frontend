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
  }),
});

export const { useListAdminBookingsQuery, useLazyListAdminBookingsQuery } = adminBookingsApi;
