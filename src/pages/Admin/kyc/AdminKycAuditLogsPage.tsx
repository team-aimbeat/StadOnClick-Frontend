import { Fragment, useMemo, useState } from "react";
import {
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineXMark,
} from "react-icons/hi2";

import { useGetAllKycAuditLogsQuery } from "@/services/adminKycApi";

type AuditLogRow = {
  id: string;
  vendor: string;
  vendorAvatar: string | null;
  vendorId: string;
  documentType: string;
  action: string;
  performedBy: string;
  date: string;
  time: string;
  comment: string | null;
};

const actionBadgeClass = (action: string) => {
  const normalized = action.trim().toUpperCase();

  if (normalized === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (normalized === "REJECTED") return "bg-rose-100 text-rose-700";
  if (normalized === "REQUESTED REUPLOAD") return "bg-blue-100 text-blue-700";
  if (normalized === "SUBMITTED") return "bg-amber-100 text-amber-700";

  return "bg-slate-100 text-slate-700";
};

const AdminKycAuditLogsPage = () => {
  const { data = [], isFetching } = useGetAllKycAuditLogsQuery();
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const rows: AuditLogRow[] = useMemo(
    () =>
      data.map((log) => {
        const date = new Date(log.createdAt);
        const vendorName = log.document.vendor?.user?.firstName ?? "Unknown Vendor";
        const vendorId =
          log.document.vendor?.id ??
          log.document.id ??
          "—";

        return {
          id: log.id,
          vendor: vendorName,
          vendorAvatar: log.document.vendor?.user?.profileImageUrl ?? null,
          vendorId,
          documentType: log.document.type.replace(/_/g, " "),
          action: log.action.replace(/_/g, " "),
          performedBy: `${log.performedBy?.firstName} ${log.performedBy?.lastName ?? ""}`.trim(),
          date: date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          time: date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          comment: log.comment ?? null,
        };
      }),
    [data],
  );

  const totalVerified = rows.filter((row) => row.action.toUpperCase() === "APPROVED").length;
  const activeFlags = rows.filter((row) => row.action.toUpperCase() === "REJECTED").length;
  const efficiencyIndex = rows.length ? Math.round(((rows.length - activeFlags) / rows.length) * 1000) / 10 : 0;
  const visibleRows = rows.filter((row) => {
    const action = row.action.toUpperCase();

    if (activeFilter === "ALL") return true;
    if (activeFilter === "PENDING") return action === "SUBMITTED" || action === "REQUESTED REUPLOAD";
    if (activeFilter === "APPROVED") return action === "APPROVED";
    return action === "REJECTED";
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] bg-white p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <h1 className="text-[28px] font-black tracking-tight text-slate-950">KYC Audit Logs</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Real-time surveillance of global KYC document verifications and entity screening.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-[16px] bg-slate-100 p-1">
          {[
            { label: "All Logs", value: "ALL" as const },
            { label: "Pending", value: "PENDING" as const },
            { label: "Approved", value: "APPROVED" as const },
            { label: "Rejected", value: "REJECTED" as const },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={`rounded-[12px] px-4 py-3 text-sm font-semibold transition ${
                activeFilter === tab.value
                  ? "bg-white text-[#3554e0] shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[18px] border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Total Verified
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            {totalVerified.toLocaleString("en-US")}
          </p>
          <p className="mt-3 text-xs font-semibold text-emerald-600">+14.2% from last month</p>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Active Flags
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-rose-600">
            {activeFlags.toLocaleString("en-US")}
          </p>
          <p className="mt-3 text-xs text-slate-500">Requires manual compliance review</p>
        </div>

        <div className="relative overflow-hidden rounded-[18px] border border-[#4f67e8] bg-[#4f67e8] p-4 text-white md:col-span-2 xl:col-span-1">
          <div className="absolute right-0 top-0 h-full w-28 rounded-l-[24px] bg-white/10" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
              Efficiency Index
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight">{efficiencyIndex.toFixed(1)}%</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/75">
              Automated verification throughput performing above institutional baseline.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-[#9aa6ff] bg-white px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-[#6d74ff]/25 bg-[#eef2ff] text-[#3651e9]">
              <HiOutlineSparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Quarterly Compliance Pulse</p>
              <p className="text-sm text-slate-500">
                {rows.length
                  ? `${Math.round((totalVerified / rows.length) * 100)}% of logged actions are approved this quarter.`
                  : "No audit logs loaded yet."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-md bg-[#eef3ff] px-3 py-2 text-xs font-semibold text-[#3554e0]">
              <HiOutlineSparkles className="h-4 w-4" />
              Insight: Risk Profile Improved
            </span>

          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white">
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[18px] font-semibold text-slate-950">Recent Logs</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <HiOutlineClock className="h-4 w-4" />
              Filter
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead className="border-t border-slate-100 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Vendor & ID</th>
                <th className="px-5 py-4">Document</th>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Performed By</th>
                <th className="px-5 py-4">Date/Time</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {visibleRows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-slate-100 last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={row.vendorAvatar || "/avatar-placeholder.png"}
                          alt={row.vendor}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{row.vendor}</p>
                          <p className="text-xs text-slate-400">ID: {row.vendorId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{row.documentType}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${actionBadgeClass(row.action)}`}>
                        {row.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{row.performedBy || "System"}</td>
                    <td className="px-5 py-4">
                      <div className="text-slate-700">{row.date}</div>
                      <div className="text-xs text-slate-400">{row.time}</div>
                    </td>
                  </tr>

                  {row.action.toUpperCase() === "REJECTED" && row.comment && (
                    <tr>
                      <td colSpan={5} className="px-5 pb-4">
                        <div className="flex flex-col gap-4 rounded-[14px] border border-rose-100 bg-rose-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-lg bg-rose-100 text-rose-600">
                              <HiOutlineXMark className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold uppercase tracking-[0.12em] text-rose-600">
                                Rejection Reason
                              </p>
                              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{row.comment}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              className="text-sm font-semibold text-[#3554e0] hover:text-[#2947cc]"
                            >
                              Resend Request
                            </button>
                            <button
                              type="button"
                              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                            >
                              Close Case
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {!isFetching && visibleRows.length === 0 && (
          <div className="px-5 py-6 text-sm text-slate-500">No audit logs match this filter.</div>
        )}

        {isFetching && <div className="px-5 py-4 text-sm text-slate-500">Loading logs...</div>}
      </div>
    </div>
  );
};

export default AdminKycAuditLogsPage;
