import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetBookingLogsQuery } from "@/features/admin/bookings/api/adminBookingsApi";
import { AdminBookingLog } from "@/features/admin/bookings/types/adminBooking.types";

const AdminBookingLogsPage = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();

  const {
    data: logs = [],
    isFetching,
    isError,
    error,
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

  return (
    <DashboardContainer className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TitleBreadCrumbs title="Booking Logs" breadCrumbTitle="Admin / Bookings / Logs" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Booking</p>
            <p className="text-sm font-semibold text-slate-900">{bookingId}</p>
            <p className="text-xs text-slate-500">Full audit of key operations for this booking.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/bookings")}
            className="rounded-md bg-[#4F7DFF] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3c63d1]"
          >
            Back to bookings
          </button>
        </div>

        <div className="mt-4">
          {contentState === "loading" && (
            <div className="space-y-3">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="h-14 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          )}

          {contentState === "error" && (
            <p className="text-sm text-rose-600">Unable to load booking logs right now.</p>
          )}

          {contentState === "empty" && (
            <p className="text-sm text-slate-600">
              No log entries for this booking yet. (Log feed not available)
            </p>
          )}

          {contentState === "ready" && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {logs.map((log: AdminBookingLog) => (
                      <tr key={log.id} className="align-top hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                          {dayjs(log.createdAt).format("DD MMM YYYY, HH:mm")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                              {log.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                              {log.actorType}
                            </span>
                            {log.actorName ? (
                              <span className="text-xs text-slate-600">{log.actorName}</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {log.description ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminBookingLogsPage;
