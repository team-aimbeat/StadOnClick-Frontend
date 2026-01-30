import { BookingRow } from "@/pages/BookingsPage";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type VendorBooking = {
  id: string;
  status: BookingRow["status"];
  createdAt: string;
  slot?: { startTime?: string };
  user?: { firstName?: string; lastName?: string; email?: string };
  vendorService?: {
    title?: string;
    category?: { name?: string };
  };
  orderItem?: { priceFinal?: string,orderNumber?:any };
};

type VendorBookingsResponse = {
  count: number;
  bookings: VendorBooking[];
};

const toBookingRow = (booking: VendorBooking): BookingRow => {
  const customerName = [booking.user?.firstName, booking.user?.lastName,booking.user?.email]
    .filter(Boolean)
    .join(" ")
    .trim()
    .replace(/\s+/g, " ");

  return {
    id: booking?.orderItem?.orderNumber,
    customer: customerName || "Guest",
    service: booking.vendorService?.category?.name ?? "Service",
    status: booking.status,
    startTime: booking.slot?.startTime ?? booking.createdAt,
    city: booking.vendorService?.category?.name ?? "Unknown",
    channel: "Marketplace",
    amount: Number(booking.orderItem?.priceFinal ?? 0),
    contact: booking.user?.email,
  };
};

export const bookingsApi = createApi({
  reducerPath: "bookingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  tagTypes: ["Bookings"],
  endpoints: (builder) => ({
    getBookings: builder.query<BookingRow[], void>({
      query: () => "/vendor/bookings",
      transformResponse: (response: VendorBookingsResponse) =>
        response.bookings.map(toBookingRow),
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
