import { BookingRow } from "@/pages/BookingsPage";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/app/services/baseApi";

type VendorBooking = {
  id: string;
  vendorServiceId?: string;
  status: BookingRow["status"];
  cancelledAt?: string | null;
  createdAt: string;
  slotId?: string | null;
  slot?: { startTime?: string };
  user?: { firstName?: string; lastName?: string; email?: string };
  vendorService?: {
    id?: string;
    title?: string;
    category?: { name?: string };
  };
  orderItem?: { priceFinal?: string; orderNumber?: string; quantity?: number };
};

type VendorBookingsResponse = {
  count: number;
  bookings: VendorBooking[];
};

export type VendorBookingFeedItem = VendorBooking;
export type VendorBookingFeedResponse = VendorBookingsResponse;

const normalizeVendorBookingsResponse = (response: unknown): VendorBookingsResponse => {
  if (!response || typeof response !== "object") {
    return { count: 0, bookings: [] };
  }

  const raw = response as {
    count?: unknown;
    bookings?: unknown;
    data?: { count?: unknown; bookings?: unknown };
  };
  const source =
    raw.data && typeof raw.data === "object"
      ? raw.data
      : raw;
  const bookings = Array.isArray(source.bookings)
    ? (source.bookings as VendorBooking[])
    : [];
  const count =
    typeof source.count === "number"
      ? source.count
      : bookings.length;

  return { count, bookings };
};

const toBookingRow = (booking: VendorBooking): BookingRow => {
  const customerName = [
    booking.user?.firstName,
    booking.user?.lastName,
    booking.user?.email,
  ]
    .filter(Boolean)
    .join(" ")
    .trim()
    .replace(/\s+/g, " ");

  return {
    bookingId: booking.id,
    id: booking.orderItem?.orderNumber ?? booking.id,
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
  baseQuery: baseQueryWithReauth, // ✅ SAME AS authApi
  tagTypes: ["Bookings"],
  endpoints: (builder) => ({
    getBookings: builder.query<BookingRow[], void>({
      query: () => "/vendor/bookings",
      transformResponse: (response: unknown) =>
        normalizeVendorBookingsResponse(response).bookings.map(toBookingRow),
      providesTags: ["Bookings"],
    }),
    getVendorBookingFeed: builder.query<VendorBookingFeedResponse, void>({
      query: () => "/vendor/bookings",
      transformResponse: (response: unknown) =>
        normalizeVendorBookingsResponse(response),
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
  useGetVendorBookingFeedQuery,
  useUpdateBookingStatusMutation,
} = bookingsApi;
