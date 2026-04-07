import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlinePlayCircle,
  HiOutlineShieldCheck,
  HiOutlineStopCircle,
} from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetBookingLogsQuery } from "@/features/admin/bookings/api/adminBookingsApi";
import type { AdminBookingLog } from "@/features/admin/bookings/types/adminBooking.types";

const actionBadgeClass = (action: string) => {
  const normalized = action.toUpperCase();
  if (normalized.includes("SUCCESS") || normalized.includes("CONFIRM") || normalized === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (
    normalized.includes("FLAG") ||
    normalized.includes("REJECT") ||
    normalized.includes("CANCEL") ||
    normalized.includes("ERROR")
  ) {
    return "bg-rose-100 text-rose-700";
  }
  if (normalized.includes("WARN")) {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-blue-100 text-blue-700";
};

const actorBadgeClass = (actorType: string) => {
  const normalized = actorType.toUpperCase();
  if (normalized === "SYSTEM") return "bg-slate-100 text-slate-700";
  if (normalized === "ADMIN") return "bg-blue-100 text-blue-700";
  if (normalized === "SUPPORT") return "bg-violet-100 text-violet-700";
  if (normalized === "VENDOR") return "bg-emerald-100 text-emerald-700";
  if (normalized === "CUSTOMER") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
};

const isSuccessAction = (action: string) => {
  const normalized = action.toUpperCase();
  return normalized.includes("SUCCESS") || normalized.includes("CONFIRM") || normalized === "APPROVED";
};

const isCancelAction = (action: string) => {
  const normalized = action.toUpperCase();
  return normalized.includes("FLAG") || normalized.includes("REJECT") || normalized.includes("CANCEL") || normalized.includes("ERROR") || normalized.includes("REFUND");
};

const AdminBookingLogsPage = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();

  const {
    data: logs = [],
    isFetching,
    isError,
    error,
    refetch,
  } = useGetBookingLogsQuery(bookingId ?? "");

  const statusCode =
    error && typeof error === "object" && "status" in error
      ? (error as { status?: number }).status
      : undefined;

  const contentState = useMemo(() => {
    if (isFetching) return "loading";
    if (isError && statusCode !== 404) return "error";
    if (!logs.length || statusCode === 404) return "empty";
    return "ready";
  }, [isError, isFetching, logs.length, statusCode]);

  const normalizedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [logs],
  );

  const totalBookings = normalizedLogs.length;
  const successfulEvents = normalizedLogs.filter((log) => isSuccessAction(log.action)).length;
  const cancellations = normalizedLogs.filter((log) => isCancelAction(log.action)).length;
  const avgExecution = useMemo(() => {
    if (normalizedLogs.length < 2) return "0ms";
    const ordered = [...normalizedLogs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const gaps = ordered.slice(1).map(
      (log, index) => new Date(log.createdAt).getTime() - new Date(ordered[index].createdAt).getTime(),
    );
    const avgGap = Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length);
    return `${avgGap}ms`;
  }, [normalizedLogs]);

  const footerRange = totalBookings
    ? `Showing 1 to ${Math.min(25, totalBookings)} of ${totalBookings.toLocaleString()} results`
    : "Showing 0 results";

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TitleBreadCrumbs title="Booking Execution Logs" breadCrumbTitle="Admin / Bookings / Logs" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white px-6 py-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-[30px] font-black tracking-tight text-slate-950">Booking Execution Logs</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Review granular audit trails for booking operations. Monitor system-wide events and actor interactions in real time.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Booking</span>
                <span className="text-[#3554e0]">{bookingId?.slice(0, 8) ?? "Logs"}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                System Operational
              </div>
            </div>

            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3554e0] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(53,84,224,0.24)] hover:bg-[#2945c6]"
            >
              <HiOutlineArrowPath className="h-4 w-4" />
              Load Logs
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Total Bookings</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  {totalBookings.toLocaleString("en-US")}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <HiOutlineInformationCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">+12.5%</span>
              <span className="text-slate-400">vs last period</span>
            </div>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Successful</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  {totalBookings ? `${((successfulEvents / totalBookings) * 100).toFixed(1)}%` : "0%"}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <HiOutlineCheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">Stable</span>
              <span className="text-slate-400">{successfulEvents.toLocaleString()} events</span>
            </div>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Cancellations</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  {cancellations.toLocaleString("en-US")}
                </p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                <HiOutlineStopCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold">
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">+2.1%</span>
              <span className="text-slate-400">requires review</span>
            </div>
          </div>

          <div className="rounded-[18px] bg-[#0f172a] p-4 text-white shadow-[0_12px_28px_rgba(15,23,42,0.25)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Avg Execution</p>
                <p className="mt-2 text-3xl font-black tracking-tight">{avgExecution}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-2 text-white/90">
                <HiOutlineClock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold text-white/70">
              <span>Real-time</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/85">monitoring</span>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[20px] border border-slate-100 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <div>
              <p className="text-[18px] font-semibold text-slate-950">Transaction Registry</p>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-[#3554e0] hover:bg-[#edf2ff]"
              >
                <HiOutlineAdjustmentsHorizontal className="h-4 w-4" />
                Filter Columns
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <HiOutlineArrowDownTray className="h-4 w-4" />
                CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="border-t border-slate-100 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {contentState === "loading" && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-slate-500">
                      Loading logs...
                    </td>
                  </tr>
                )}

                {contentState === "error" && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-rose-600">
                      Unable to load booking logs right now.
                    </td>
                  </tr>
                )}

                {contentState === "empty" && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-slate-500">
                      No log entries for this booking yet.
                    </td>
                  </tr>
                )}

                {contentState === "ready" &&
                  normalizedLogs.map((log: AdminBookingLog) => {
                    const ref = `TX-${log.id.slice(-4).toUpperCase()}`;
                    return (
                      <tr key={log.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                          <div className="font-medium">{dayjs(log.createdAt).format("HH:mm:ss")}</div>
                          <div className="text-xs text-slate-400">{dayjs(log.createdAt).format("MMM DD, YYYY")}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${actionBadgeClass(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${actorBadgeClass(log.actorType)}`}>
                              {log.actorType.slice(0, 2)}
                            </span>
                            <div>
                              <div className="font-medium text-slate-900">
                                {log.actorName || `${log.actorType[0]}${log.actorType.slice(1).toLowerCase()}`}
                              </div>
                              <div className="text-xs text-slate-400">{log.actorType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{log.description ?? "-"}</td>
                        <td className="px-6 py-4 text-right font-semibold text-[#3554e0]">{ref}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">{footerRange}</p>
            <div className="flex items-center gap-2 text-slate-400">
              <button type="button" className="rounded-full p-2 hover:bg-slate-50">
                <span className="sr-only">Previous page</span>
                <HiOutlinePlayCircle className="h-4 w-4 rotate-180" />
              </button>
              <span className="rounded-full bg-[#3554e0] px-3 py-1.5 text-xs font-semibold text-white">1</span>
              <span className="px-1 text-slate-400">2</span>
              <span className="px-1 text-slate-400">3</span>
              <span className="px-1 text-slate-400">...</span>
              <span className="px-1 text-slate-400">52</span>
              <button type="button" className="rounded-full p-2 hover:bg-slate-50">
                <span className="sr-only">Next page</span>
                <HiOutlinePlayCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminBookingLogsPage;
