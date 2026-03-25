import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { skipToken } from "@reduxjs/toolkit/query";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import {
  useGetServiceBookingLogsQuery,
} from "@/features/admin/bookings/api/adminBookingsApi";
import { AdminBookingLog } from "@/features/admin/bookings/types/adminBooking.types";
import { useListAdminServicesQuery } from "@/features/admin/services/api/adminServicesApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminBookingLogsExplorerPage = () => {
  const [serviceId, setServiceId] = useState<string | null>(null);

  const { data: servicesResponse } = useListAdminServicesQuery({ limit: 200, status: "all" });
  const serviceOptions = useMemo(
    () =>
      (servicesResponse?.data ?? []).map((svc: any) => ({
        id: svc.id,
        label: svc.title ?? svc.name ?? "Untitled service",
      })),
    [servicesResponse?.data]
  );

  const {
    data: logs = [],
    isFetching,
    isError,
    error,
  } = useGetServiceBookingLogsQuery(serviceId ?? skipToken);

  const statusCode =
    error && typeof error === "object" && "status" in error
      ? (error as { status?: number }).status
      : undefined;

  const showError = isError && statusCode !== 404;
  const showEmpty = !isFetching && !showError && (!logs.length || statusCode === 404);

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <TitleBreadCrumbs title="Booking Logs" breadCrumbTitle="Admin / Booking Logs" />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800">
            Service
          </label>
          <div className="flex flex-wrap gap-2">
              <Select
                value={serviceId ?? ""}
                onValueChange={(val) => setServiceId(val || null)}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>  
              <SelectContent className="max-h-100 overflow-y-auto">
                {serviceOptions.map((svc) => (
                  <SelectItem key={svc.id} value={svc.id}>
                    {svc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() =>
                setServiceId((prev) => (prev ?? (serviceOptions[0]?.id ?? null)))
              }
              className="rounded-lg bg-[#4F7DFF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3c63d1]"
            >
              Load logs
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Pick a service to view all booking logs for that service in table format.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200">
          {isFetching && (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((idx) => (
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
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                          {log.action}
                        </span>
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
                        {log.description ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminBookingLogsExplorerPage;
