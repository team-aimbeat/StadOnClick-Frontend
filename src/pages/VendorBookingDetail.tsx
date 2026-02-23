import { useEffect, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineCalendar, HiOutlineUser, HiOutlineSparkles } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useGetBookingsQuery } from "@/services/bookingsApi";

const VendorBookingDetail = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useAppDispatch();
  const { data: bookings } = useGetBookingsQuery();

  useEffect(() => {
    dispatch(setPageTitle(`Booking ${bookingId ?? ""}`));
  }, [dispatch, bookingId]);

  const booking = useMemo(
    () => bookings?.find((row) => row.bookingId === bookingId || row.id === bookingId),
    [bookings, bookingId],
  );

  if (!booking) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <TitleBreadCrumbs title="Booking not found" breadCrumbTitle="Vendor / Booking detail" />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          Booking {bookingId} could not be located.
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <TitleBreadCrumbs
        title={`Booking ${booking.id}`}
        breadCrumbTitle={`Vendor / Bookings / ${booking.id}`}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <NavLink
          to="/vendor/bookings/upcoming"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to bookings
        </NavLink>
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Customer</p>
              <p className="text-lg font-semibold text-slate-900">{booking.customer}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Status</p>
              <p className="text-sm font-semibold text-blue-600">{booking.status}</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-slate-700">
              <HiOutlineCalendar className="inline h-4 w-4 text-slate-500" />
              <span className="ml-1">Start: {new Date(booking.startTime).toLocaleString()}</span>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
              Channel: {booking.channel}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
              ₹{booking.amount.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-500">
            Notes
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            This booking is scheduled via {booking.channel}. Contact {booking.customer} if rescheduling is needed.
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            className="rounded-full border border-blue-200 px-3 py-1 text-blue-600"
          >
            Confirm booking
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
          >
            Cancel booking
          </button>
          <button
            type="button"
            className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-600"
          >
            Mark completed
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
          >
            View customer profile
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Operations</p>
        <p className="mt-2 text-sm text-slate-600">
          Recommended next steps: confirm slot, share SMS confirmation, ensure SKU readiness.
        </p>
        <NavLink
          to="/vendor/insights"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500"
        >
          <HiOutlineSparkles className="h-4 w-4" />
          See insights for similar bookings
        </NavLink>
      </div>
    </DashboardContainer>
  );
};

export default VendorBookingDetail;
