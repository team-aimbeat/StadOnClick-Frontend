    import { BookingRow } from "@/pages/BookingsPage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const bookingsApi = createApi({
  reducerPath: "bookingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl:import.meta.env.VITE_API_URL,
  }),
  tagTypes: ["Bookings"],
  endpoints: (builder) => ({
    getBookings: builder.query<BookingRow[], void>({
      query: () => "/vendor/bookings",
      providesTags: ["Bookings"],
    }),

    updateBookingStatus: builder.mutation<
      void,
      { id: string; status: BookingRow["status"] }
    >({
      query: ({ id, status }) => ({
        url: `/vendor/bookings/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Bookings"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
} = bookingsApi;
