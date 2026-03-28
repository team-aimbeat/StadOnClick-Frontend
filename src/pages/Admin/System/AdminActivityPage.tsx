import { useMemo } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Activity, Clock3, Shield, UserCheck } from "lucide-react";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetAdminStaffQuery } from "@/features/admin/staff/adminStaffApi";
import type { StaffUser, StaffUserRole } from "@/features/admin/staff/adminStaff.types";

dayjs.extend(relativeTime);

const RECENT_LOGIN_WINDOW_DAYS = 7;

const roleMeta: Record<StaffUserRole, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  },
  SUPPORT_ADMIN: {
    label: "Support Admin",
    className: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
  },
  MODERATOR: {
    label: "Moderator",
    className: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  },
};

function formatDateTime(value?: string | null) {
  if (!value) return "Never recorded";
  return dayjs(value).format("DD MMM YYYY, hh:mm A");
}

function formatLastSeen(value?: string | null) {
  if (!value) return "No login recorded";
  return `${dayjs(value).fromNow()} (${formatDateTime(value)})`;
}

function getFullName(user: StaffUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

export default function AdminActivityPage() {
  const { data, isLoading, isFetching, isError } = useGetAdminStaffQuery(
    { page: 1, limit: 100 },
    { refetchOnMountOrArgChange: true }
  );

  const staff = useMemo(() => data?.items ?? [], [data]);
  const sortedStaff = useMemo(
    () =>
      [...staff].sort((a, b) => {
        const aTime = a.lastLoginAt ? dayjs(a.lastLoginAt).valueOf() : 0;
        const bTime = b.lastLoginAt ? dayjs(b.lastLoginAt).valueOf() : 0;
        return bTime - aTime;
      }),
    [staff]
  );

  const summary = useMemo(() => {
    const recentThreshold = dayjs().subtract(RECENT_LOGIN_WINDOW_DAYS, "day");

    return staff.reduce(
      (acc, member) => {
        if (member.status === "ACTIVE") acc.active += 1;
        if (!member.lastLoginAt) {
          acc.neverLoggedIn += 1;
        } else if (dayjs(member.lastLoginAt).isAfter(recentThreshold)) {
          acc.recentLogins += 1;
        }

        return acc;
      },
      {
        total: staff.length,
        active: 0,
        recentLogins: 0,
        neverLoggedIn: 0,
      }
    );
  }, [staff]);

  const latestLogin = sortedStaff.find((member) => member.lastLoginAt);

  return (
    <DashboardContainer className="space-y-6 pb-10">
      <TitleBreadCrumbs title="Admin Activity" breadCrumbTitle="Admin / System / Activity" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900/5 p-2 text-slate-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Staff Accounts
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Active Access
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.active}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Recent Logins
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.recentLogins}</p>
              <p className="text-xs text-slate-500">Within the last 7 days</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Latest Login
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {latestLogin ? getFullName(latestLogin) : "No logins yet"}
              </p>
              <p className="text-xs text-slate-500">
                {latestLogin?.lastLoginAt ? dayjs(latestLogin.lastLoginAt).fromNow() : "No activity"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Staff Login Audit</h2>
            <p className="text-sm text-slate-500">
              Last login, joined date, role, and current access state for admin-side accounts.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {isFetching ? "Refreshing..." : `${staff.length} records`}
          </span>
        </div>

        {isLoading && (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="p-5 text-sm text-rose-600">Unable to load admin activity right now.</div>
        )}

        {!isLoading && !isError && !sortedStaff.length && (
          <div className="p-5 text-sm text-slate-600">No admin activity records found.</div>
        )}

        {!isLoading && !isError && !!sortedStaff.length && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Staff</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Last Login</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedStaff.map((member) => (
                  <tr key={member.id} className="align-top hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{getFullName(member)}</span>
                        <span className="text-xs text-slate-500">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {member.roles.map((role) => (
                          <span
                            key={`${member.id}-${role}`}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${roleMeta[role].className}`}
                          >
                            {roleMeta[role].label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          member.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
                            : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{formatLastSeen(member.lastLoginAt)}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDateTime(member.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardContainer>
  );
}
