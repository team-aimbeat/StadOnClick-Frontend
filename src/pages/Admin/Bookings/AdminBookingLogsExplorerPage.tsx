import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  HiOutlineArrowDownTray,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineHome,
} from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import { useGetServiceBookingLogsQuery } from "@/features/admin/bookings/api/adminBookingsApi";
import type { AdminBookingLog } from "@/features/admin/bookings/types/adminBooking.types";
import { useListAdminServicesQuery } from "@/features/admin/services/api/adminServicesApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const actionBadgeClass = (action: string) => {
  const normalized = action.toUpperCase();
  if (normalized.includes("SUCCESS") || normalized.includes("CONFIRM") || normalized === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (normalized.includes("CANCEL") || normalized.includes("REJECT") || normalized.includes("REFUND")) {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-slate-100 text-slate-700";
};

const actorBadgeClass = (actorType: string) => {
  const normalized = actorType.toUpperCase();
  if (normalized === "SYSTEM") return "bg-blue-100 text-blue-700";
  if (normalized === "ADMIN") return "bg-slate-100 text-slate-700";
  if (normalized === "SUPPORT") return "bg-violet-100 text-violet-700";
  if (normalized === "VENDOR") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
};

const AdminBookingLogsExplorerPage = () => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);

  const { data: servicesResponse } = useListAdminServicesQuery({ limit: 200, status: "all" });
  const serviceOptions = useMemo(
    () =>
      (servicesResponse?.data ?? []).map((svc: any) => ({
        id: svc.id,
        label: svc.title ?? svc.name ?? "Untitled service",
      })),
    [servicesResponse?.data],
  );

  const {
    data: logs = [],
    isFetching,
    isError,
    error,
    refetch,
  } = useGetServiceBookingLogsQuery(serviceId ?? skipToken);

  const statusCode =
    error && typeof error === "object" && "status" in error
      ? (error as { status?: number }).status
      : undefined;

  const showError = isError && statusCode !== 404;
  const showEmpty = !isFetching && !showError && (!logs.length || statusCode === 404);

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-[28px] font-black tracking-tight text-slate-950">Booking Logs</h1>
          <p className="text-sm text-slate-500">Overview and key insights</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
          <HiOutlineHome className="h-4 w-4 text-slate-400" />
          <HiOutlineChevronRight className="h-4 w-4 text-slate-300" />
          <span>Admin</span>
          <HiOutlineChevronRight className="h-4 w-4 text-slate-300" />
          <span className="font-semibold text-slate-900">Booking Logs</span>
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)]">
        <div className="mt-6 rounded-[20px] border border-slate-200 bg-white p-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Service</label>
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedServiceId ?? ""}
                onValueChange={(val) => setSelectedServiceId(val || null)}
              >
                <SelectTrigger className="w-full max-w-[460px] rounded-xl border-slate-200 bg-white shadow-sm">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent className="max-h-96 overflow-y-auto">
                  {serviceOptions.map((svc) => (
                    <SelectItem key={svc.id} value={svc.id}>
                      {svc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => {
                  setServiceId(selectedServiceId ?? serviceOptions[0]?.id ?? null);
                }}
                disabled={!selectedServiceId && !serviceOptions[0]?.id}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5b7cff] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(91,124,255,0.24)] transition hover:bg-[#4969e8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiOutlineClock className="h-4 w-4" />
                Load logs
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Pick a service to view all booking logs for that service in table format.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-[18px] border border-slate-100">
            {isFetching && (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="h-14 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            )}

            {showError && (
              <p className="p-4 text-sm text-rose-600">Unable to load booking logs right now.</p>
            )}

            {showEmpty && (
              <p className="p-4 text-sm text-slate-600">
                No log entries for this booking yet. (Log feed not available)
              </p>
            )}

            {!isFetching && !showError && !showEmpty && (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-sm">
                  <thead className="bg-[#f5f6f8] text-left text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Actor</th>
                      <th className="px-6 py-4">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: AdminBookingLog) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                          <div className="text-sm font-medium">
                            {dayjs(log.createdAt).format("DD MMM YYYY, HH:mm")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${actionBadgeClass(log.action)}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${actorBadgeClass(log.actorType)}`}
                            >
                              {log.actorType}
                            </span>
                            <span className="text-xs text-slate-600">{log.actorName ?? "-"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs leading-6 text-slate-700">
                          {log.description ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              {serviceId ? `Showing ${logs.length.toLocaleString()} logs` : "Select a service to load logs"}
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-[#3554e0] hover:bg-[#edf2ff]"
            >
              <HiOutlineArrowDownTray className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminBookingLogsExplorerPage;
