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
import dayjs from "dayjs";

import { useAppDispatch } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useGetBookingsQuery, useGetVendorBookingFeedQuery } from "@/services/bookingsApi";

type EnrichedBooking = {
  bookingId: string;
  id: string;
  customer: string;
  service: string;
  status: string;
  startTime: string;
  city: string;
  channel: string;
  amount: number;
  contact?: string;
  createdAt: string;
  vendorName: string;
  orderNumber: string;
};

type ActivityTone = "green" | "blue" | "slate" | "amber";

type BookingActivity = {
  tone: ActivityTone;
  actor: string;
  title: string;
  description: string;
  timestamp: string;
};

const toneMap: Record<ActivityTone, { dot: string; badge: string }> = {
  green: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  blue: { dot: "bg-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  slate: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  amber: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
};

const statusTone = (status?: string) => {
  switch (status) {
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
};

const VendorBookingDetail = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const dispatch = useAppDispatch();
  const { data: bookings, isLoading: isBookingsLoading } = useGetBookingsQuery();
  const { data: bookingFeed, isLoading: isBookingFeedLoading } = useGetVendorBookingFeedQuery();

  useEffect(() => {
    dispatch(setPageTitle(`Booking ${bookingId ?? ""}`));
  }, [dispatch, bookingId]);

  const booking = useMemo<EnrichedBooking | null>(() => {
    const normalizedBooking = bookings?.find(
      (row) => row.bookingId === bookingId || row.id === bookingId,
    );

    if (normalizedBooking) {
      return {
        ...normalizedBooking,
        createdAt: normalizedBooking.startTime,
        vendorName: normalizedBooking.city,
        orderNumber: normalizedBooking.id,
      };
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

    const customerName = [rawBooking.user?.firstName, rawBooking.user?.lastName, rawBooking.user?.email]
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
      createdAt: rawBooking.createdAt,
      vendorName: rawBooking.vendorService?.title ?? rawBooking.vendorService?.category?.name ?? "Vendor service",
      orderNumber: rawBooking.orderItem?.orderNumber ?? rawBooking.id,
    };
  }, [bookings, bookingFeed?.bookings, bookingId]);

  const activityLog = useMemo<BookingActivity[]>(() => {
    if (!booking) {
      return [];
    }

    return [
      {
        tone: "green",
        actor: "CUSTOMER",
        title: "BOOKING_CREATED",
        timestamp: booking.createdAt,
        description: `Booking placed by ${booking.customer} (Order ${booking.orderNumber}).`,
      },
      {
        tone: booking.status === "CONFIRMED" ? "blue" : booking.status === "PENDING" ? "amber" : "slate",
        actor: "SYSTEM",
        title: `STATUS_${booking.status}`,
        timestamp: booking.startTime,
        description: `Status set to ${booking.status}.`,
      },
      {
        tone: "slate",
        actor: "SYSTEM",
        title: "BOOKING_SUMMARY",
        timestamp: booking.startTime,
        description: `Customer: ${booking.customer}; Vendor: ${booking.vendorName}.`,
      },
    ];
  }, [booking]);

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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
  
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">{booking.id}</h2>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${statusTone(booking.status)}`}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">


        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Customer details
              </p>
              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                  {booking.customer.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-lg font-black tracking-tight text-slate-950">{booking.customer}</p>
                  <p className="inline-flex items-center gap-2 text-sm text-slate-500 break-all">
                    <HiOutlineEnvelope className="h-4 w-4" />
                    {booking.contact || "Not available"}
                  </p>
                  <p className="text-sm text-slate-500">{booking.city}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Service slot
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <HiOutlineTag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{booking.service}</p>
                    <p className="text-sm text-slate-500">{booking.vendorName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <HiOutlineCalendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {dayjs(booking.startTime).format("DD MMM YYYY")}
                    </p>
                    <p className="text-sm text-slate-500">
                      {dayjs(booking.startTime).format("hh:mm A")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Payment summary
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <HiOutlineBanknotes className="h-4 w-4" />
                  Booking value
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {booking.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  kr
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <span className="text-sm text-slate-600">Payment status</span>
                <span className="text-sm font-semibold text-slate-900">Captured</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-slate-900">Total paid</span>
                <span className="text-xl font-black tracking-tight text-blue-600">
                  {booking.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  kr
                </span>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                Payment successfully processed and linked to the booking record.
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Notes
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              This booking is scheduled via {booking.channel}. Contact {booking.customer} if
              rescheduling is needed.
            </p>
          </div>
        </div>

        <div className="space-y-6">


          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Activity log
            </p>
            <div className="mt-5 space-y-4">
              {activityLog.map((entry, index) => {
                const tone = toneMap[entry.tone];

                return (
                  <div key={`${entry.title}-${index}`} className="flex items-start gap-3">
                    <div className="relative flex w-4 justify-center">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                      {index < activityLog.length - 1 ? (
                        <span className="absolute left-1/2 top-4 h-8 w-px -translate-x-1/2 bg-slate-200" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tone.badge}`}>
                          {entry.actor}
                        </span>
                        <p className="text-sm font-black tracking-tight text-slate-950">{entry.title}</p>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {dayjs(entry.timestamp).format("DD MMM YYYY, HH:mm")}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{entry.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 text-center">
              <NavLink
                to="/vendor/insights"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                View Full History
                <HiOutlineArrowLeft className="h-4 w-4 rotate-180" />
              </NavLink>
            </div>
          </div>
        </div>
      </div>

 
    </DashboardContainer>
  );
};

export default VendorBookingDetail;
