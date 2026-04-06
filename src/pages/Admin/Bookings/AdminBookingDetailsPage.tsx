import { useEffect, useMemo } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineEnvelope,
  HiOutlineTag,
  HiOutlinePrinter,
  HiOutlineShare,
} from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useAppDispatch } from "@/app/hooks";
import { useGetBookingLogsQuery, useListAdminBookingsQuery } from "@/features/admin/bookings/api/adminBookingsApi";
import type { AdminBookingItem, AdminBookingLog } from "@/features/admin/bookings/types/adminBooking.types";

type DetailLogTone = "customer" | "system" | "vendor";

const LOG_TONES: Record<DetailLogTone, { badge: string; dot: string }> = {
  customer: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  system: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-600",
  },
  vendor: {
    badge: "border-slate-200 bg-slate-100 text-slate-700",
    dot: "bg-slate-400",
  },
};

const toTone = (actorType: AdminBookingLog["actorType"]): DetailLogTone => {
  if (actorType === "CUSTOMER") return "customer";
  if (actorType === "VENDOR") return "vendor";
  return "system";
};

const AdminBookingDetailsPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: bookingsResponse, isFetching: isBookingsFetching } = useListAdminBookingsQuery({
    page: 1,
    limit: 500,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const booking = useMemo<AdminBookingItem | null>(() => {
    const items = bookingsResponse?.data ?? [];
    return (
      items.find((item) => item.id === bookingId || item.orderItem?.orderNumber === bookingId) ??
      null
    );
  }, [bookingId, bookingsResponse?.data]);

  const {
    data: bookingLogs = [],
    isFetching: isLogsFetching,
    isError: isLogsError,
    error: logsError,
  } = useGetBookingLogsQuery(bookingId ?? "");

  const logsStatusCode =
    logsError && typeof logsError === "object" && "status" in logsError
      ? (logsError as { status?: number }).status
      : undefined;
  const showLogsError = isLogsError && logsStatusCode !== 404;

  useEffect(() => {
    dispatch(setPageTitle(`Booking ${bookingId ?? ""}`));
  }, [dispatch, bookingId]);

  const customerName = booking
    ? [booking.user.firstName, booking.user.lastName].filter(Boolean).join(" ")
    : "";
  const orderNumber = booking?.orderItem?.orderNumber ?? booking?.id ?? bookingId ?? "";
  const paymentValue = Number(booking?.orderItem?.priceFinal ?? booking?.orderItem?.priceOriginal ?? 0);
  const serviceTitle = booking?.vendorService?.title ?? booking?.vendorService?.category?.name ?? "Service";
  const vendorName = booking?.vendorProfile?.businessName ?? "Vendor";
  const slotDate = booking?.slot?.startTime ? dayjs(booking.slot.startTime) : null;
  const statusLabel = booking?.status ?? "PENDING";

  if (isBookingsFetching && !booking) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <TitleBreadCrumbs title="Loading booking" breadCrumbTitle="Admin / Bookings / Details" />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Loading booking details...
        </div>
      </DashboardContainer>
    );
  }

  if (!booking) {
    return (
      <DashboardContainer className="space-y-4 pt-8">
        <TitleBreadCrumbs title="Booking not found" breadCrumbTitle="Admin / Bookings / Details" />
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Booking {bookingId} could not be located.
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <TitleBreadCrumbs
        title={`Booking ${orderNumber}`}
        breadCrumbTitle={`Admin / Bookings / ${orderNumber}`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">{orderNumber}</h1>
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
          {statusLabel}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_360px]">
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Customer details
              </p>
              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
                  {(customerName || "A").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-lg font-black tracking-tight text-slate-950">
                    {customerName || "Unknown customer"}
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm text-slate-500 break-all">
                    <HiOutlineEnvelope className="h-4 w-4" />
                    {booking.user.email}
                  </p>
                  <p className="text-sm text-slate-500">{vendorName}</p>
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
                    <p className="text-sm font-semibold text-slate-900">{serviceTitle}</p>
                    <p className="text-sm text-slate-500">{vendorName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <HiOutlineCalendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {slotDate ? slotDate.format("DD MMM YYYY") : "TBD"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {slotDate ? slotDate.format("hh:mm A") : "TBD"}
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
            <div className="mt-5 space-y-0">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4">
                <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <HiOutlineTag className="h-4 w-4" />
                  Booking value
                </span>
                <span className="text-sm font-semibold text-slate-950">
                  {paymentValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  kr
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4">
                <span className="text-sm text-slate-600">Payment status</span>
                <span className="text-sm font-semibold text-slate-950">Captured</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-4">
                <span className="text-base font-semibold text-slate-950">Total paid</span>
                <span className="text-xl font-black tracking-tight text-blue-600">
                  {paymentValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  kr
                </span>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                Payment successfully processed via Stripe Connect on booking capture.
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Notes
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              This booking is scheduled via Marketplace. Contact {customerName || "the customer"}{" "}
              if rescheduling is needed.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Activity log
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Recent booking actions and system updates.
          </p>

          <div className="mt-5 space-y-4">
            {isLogsFetching && (
              <div className="space-y-3">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="h-28 animate-pulse rounded-[20px] bg-slate-100" />
                ))}
              </div>
            )}

            {showLogsError && (
              <p className="text-sm text-rose-600">Unable to load booking logs right now.</p>
            )}

            {!isLogsFetching && (bookingLogs.length === 0 || logsStatusCode === 404) && !showLogsError && (
              <p className="text-sm text-slate-600">
                No log entries for this booking yet. (Log feed not available)
              </p>
            )}

            {bookingLogs.map((log: AdminBookingLog, index) => {
              const tone = LOG_TONES[toTone(log.actorType)];

              return (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="relative flex w-4 justify-center pt-4">
                    <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                    {index < bookingLogs.length - 1 ? (
                      <span className="absolute left-1/2 top-7 h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-slate-200" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 rounded-[20px] border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${tone.badge}`}
                      >
                        {log.actorType}
                      </span>
                      <span className="text-sm font-black uppercase tracking-tight text-slate-950">
                        {log.action}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {dayjs(log.createdAt).format("DD MMM YYYY, HH:mm")}
                    </p>
                    {log.description ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700">{log.description}</p>
                    ) : null}
                    {log.actorName ? (
                      <p className="mt-2 text-[11px] font-medium text-slate-500">By {log.actorName}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 text-center">
            <NavLink
              to={`/admin/bookings/${bookingId}/logs`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              View Full History
              <HiOutlineArrowLeft className="h-4 w-4 rotate-180" />
            </NavLink>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
  
        <button
          type="button"
          onClick={() => navigate("/admin/bookings")}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          Back to bookings
        </button>
      </div>
    </DashboardContainer>
  );
};

export default AdminBookingDetailsPage;
