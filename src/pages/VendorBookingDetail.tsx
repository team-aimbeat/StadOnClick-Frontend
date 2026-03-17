import { useEffect, useMemo } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineBanknotes,
  HiOutlineCalendar,
  HiOutlineEnvelope,
  HiOutlineSparkles,
  HiOutlineTag,
} from "react-icons/hi2";

import { useAppDispatch } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useGetBookingsQuery, useGetVendorBookingFeedQuery } from "@/services/bookingsApi";

const VendorBookingDetail = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useAppDispatch();
  const { data: bookings, isLoading: isBookingsLoading } = useGetBookingsQuery();
  const { data: bookingFeed, isLoading: isBookingFeedLoading } = useGetVendorBookingFeedQuery();

  useEffect(() => {
    dispatch(setPageTitle(`Booking ${bookingId ?? ""}`));
  }, [dispatch, bookingId]);

  const booking = useMemo(() => {
    const normalizedBooking = bookings?.find(
      (row) => row.bookingId === bookingId || row.id === bookingId,
    );

    if (normalizedBooking) {
      return normalizedBooking;
    }

    const rawBooking = bookingFeed?.bookings?.find(
      (row) =>
        row.id === bookingId ||
        row.orderItem?.orderNumber === bookingId ||
        row.orderItem?.orderId === bookingId,
    );

    if (!rawBooking) {
      return null;
    }

    const customerName = [
      rawBooking.user?.firstName,
      rawBooking.user?.lastName,
      rawBooking.user?.email,
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");

    return {
      bookingId: rawBooking.id,
      id: rawBooking.orderItem?.orderNumber ?? rawBooking.id,
      customer: customerName || "Guest",
      service:
        rawBooking.vendorService?.title ?? rawBooking.vendorService?.category?.name ?? "Service",
      status: rawBooking.status,
      startTime: rawBooking.slot?.startTime ?? rawBooking.createdAt,
      city: rawBooking.vendorService?.category?.name ?? "Unknown",
      channel: "Marketplace",
      amount: Number(rawBooking.orderItem?.priceFinal ?? 0),
      contact: rawBooking.user?.email,
    };
  }, [bookings, bookingFeed?.bookings, bookingId]);

  const statusTone = useMemo(() => {
    switch (booking?.status) {
      case "COMPLETED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "CONFIRMED":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "CANCELLED":
        return "border-slate-200 bg-slate-100 text-slate-700";
      case "REFUND_REQUESTED":
      case "REFUNDED":
        return "border-rose-200 bg-rose-50 text-rose-700";
      default:
        return "border-slate-200 bg-slate-100 text-slate-700";
    }
  }, [booking?.status]);

  if (isBookingsLoading || isBookingFeedLoading) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <TitleBreadCrumbs title="Loading booking" breadCrumbTitle="Vendor / Booking detail" />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Loading booking details...
        </div>
      </DashboardContainer>
    );
  }

  if (!booking) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <TitleBreadCrumbs title="Booking not found" breadCrumbTitle="Vendor / Booking detail" />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Booking {bookingId} could not be located.
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <TitleBreadCrumbs
        title={`Booking ${booking.id}`}
        breadCrumbTitle={`Vendor / Bookings / ${booking.id}`}
      />

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <NavLink
                to="/vendor/bookings/upcoming"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
              >
                <HiOutlineArrowLeft className="h-4 w-4" />
                Back to bookings
              </NavLink>

              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
                  Booking overview
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black tracking-tight text-slate-950">
                    {booking.customer}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${statusTone}`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">{booking.service}</p>
                  <p className="text-sm text-slate-500">Reference {booking.id}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[340px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Contact
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900 break-all">
                  {booking.contact || "Not available"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  City / category
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{booking.city}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <HiOutlineCalendar className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Scheduled</p>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">
                {new Date(booking.startTime).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <HiOutlineTag className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Channel</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{booking.channel}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <HiOutlineBanknotes className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Booking value</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">
                {booking.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <HiOutlineEnvelope className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em]">Customer email</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900 break-all">
                {booking.contact || "Not available"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
              Notes
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              This booking is scheduled via {booking.channel}. Contact {booking.customer} if
              rescheduling is needed.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-slate-800"
            >
              Confirm booking
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel booking
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Mark completed
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 transition-colors hover:bg-slate-50"
            >
              View customer profile
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
              Operations
            </p>
            <h3 className="text-xl font-black tracking-tight text-slate-950">
              Recommended next steps
            </h3>
            <p className="text-sm leading-7 text-slate-600">
              Confirm the slot, share the booking confirmation with the customer, and make sure
              the service handoff is ready before the scheduled time.
            </p>
          </div>
          <NavLink
            to="/vendor/insights"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700 transition-colors hover:bg-slate-100"
          >
            <HiOutlineSparkles className="h-4 w-4 text-indigo-500" />
            Similar booking insights
          </NavLink>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorBookingDetail;
