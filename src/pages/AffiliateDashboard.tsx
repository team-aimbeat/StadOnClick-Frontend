import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAppSelector } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import {
  useGetAffiliateCommissionsQuery,
  useGetAffiliateDashboardQuery,
  useGetAffiliateReferralsQuery,
} from "@/features/affiliate/api/affiliateApi";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "SEK", maximumFractionDigits: 2 }).format(
    value ?? 0,
  );

export default function AffiliateDashboard() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const user = useAppSelector((state) => state.auth.user);
  const canViewAffiliateDashboard = Boolean(user && (user.roles ?? []).includes("AFFILIATE"));

  const { data: dashboardRes, isLoading: dashboardLoading } = useGetAffiliateDashboardQuery(undefined, {
    skip: !canViewAffiliateDashboard,
  });
  const { data: referralsRes, isLoading: referralsLoading } = useGetAffiliateReferralsQuery({ page, limit }, {
    skip: !canViewAffiliateDashboard,
  });
  const { data: commissionsRes } = useGetAffiliateCommissionsQuery({ page: 1, limit: 10 }, {
    skip: !canViewAffiliateDashboard,
  });

  const dashboard = dashboardRes?.data;
  const referrals = referralsRes?.items ?? [];
  const pagination = referralsRes?.pagination;
  const chartData = useMemo(
    () =>
      (dashboard?.monthlyEarnings ?? []).map((row) => ({
        month: row.month,
        earnings: row.amount,
      })),
    [dashboard?.monthlyEarnings],
  );
  const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "/api/v1").replace(/\/$/, "");
  const exportHref = `${apiBaseUrl}/affiliate/referrals?export=csv&page=1&limit=1000`;

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!canViewAffiliateDashboard) {
    return <Navigate to="/affiliate-marketing" replace />;
  }

  if (dashboardLoading || referralsLoading) {
    return <div className="p-8">Loading affiliate dashboard...</div>;
  }

  return (
    <DashboardContainer className="space-y-6">
      <TitleBreadCrumbs title="Affiliate Dashboard" breadCrumbTitle="Affiliate / Dashboard" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase text-slate-500">Total Referrals</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{dashboard?.summary.totalReferrals ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase text-slate-500">Active Referrals</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{dashboard?.summary.activeReferrals ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase text-slate-500">Total Commission Earned</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {currency(dashboard?.summary.totalCommissionEarned ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase text-slate-500">Pending Commission</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">{currency(dashboard?.summary.pendingCommission ?? 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Monthly Earnings</h2>
            <span className="text-xs text-slate-500">Commission from paid bookings</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => currency(Number(value ?? 0))} />
                <Bar dataKey="earnings" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Referral Link</h2>
          <p className="mt-3 text-sm text-slate-500">Referral code</p>
          <p className="font-semibold text-slate-900">{dashboard?.affiliate.referralCode ?? "-"}</p>
          <p className="mt-3 text-sm text-slate-500">Referral URL</p>
          <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 break-all">
            {dashboard?.affiliate.referralLink ?? "-"}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                if (!dashboard?.affiliate.referralLink) return;
                await navigator.clipboard.writeText(dashboard.affiliate.referralLink);
              }}
            >
              Copy Link
            </Button>
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                dashboard?.affiliate.referralLink ?? "",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Open QR
            </a>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">Recent commissions</p>
            <ul className="mt-2 space-y-2 text-sm">
              {(commissionsRes?.items ?? []).slice(0, 5).map((row) => (
                <li key={row.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <span className="text-slate-700">{row.bookingId.slice(0, 8)}...</span>
                  <span className="font-semibold text-slate-900">{currency(row.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Referral Details</h2>
          <a
            href={exportHref}
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            target="_blank"
            rel="noreferrer"
          >
            Export CSV
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-3">Referral</th>
                <th className="px-2 py-3">Booking ID</th>
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3">Amount</th>
                <th className="px-2 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((row) => (
                <tr key={`${row.referralId}-${row.bookingId ?? "none"}`} className="border-b border-slate-100">
                  <td className="px-2 py-3">
                    <p className="font-semibold text-slate-900">{row.referredName}</p>
                    <p className="text-xs text-slate-500">{row.referredEmail}</p>
                  </td>
                  <td className="px-2 py-3 text-slate-700">{row.bookingId ?? "-"}</td>
                  <td className="px-2 py-3 text-slate-700">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-2 py-3 text-slate-900">{currency(row.amount)}</td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination || pagination.page <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!pagination || pagination.page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
}
