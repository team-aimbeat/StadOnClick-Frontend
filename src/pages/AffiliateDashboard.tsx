import { useMemo, useState } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  HiOutlineCalendarDays,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineBanknotes,
  HiOutlineChartBarSquare,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentChartBar,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineUserGroup,
  HiOutlineWallet,
} from "react-icons/hi2";

import { useAppSelector } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatsCard from "@/components/shared/StatsCard";
import { cn } from "@/lib/utils";
import {
  useGetAffiliateCommissionsQuery,
  useGetAffiliateDashboardQuery,
  useGetAffiliateReferralsQuery,
} from "@/features/affiliate/api/affiliateApi";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "SEK", maximumFractionDigits: 2 }).format(
    value ?? 0,
  );

const dashboardTabs = [
  { label: "Overview", to: "/affiliate/overview" },
  { label: "Referrals", to: "/affiliate/referrals" },
  { label: "Vendors Referred", to: "/affiliate/vendors-referred" },
  { label: "Commission", to: "/affiliate/commission" },
  { label: "Wallet", to: "/affiliate/wallet" },
  { label: "Payouts", to: "/affiliate/payouts" },
  { label: "Reports", to: "/affiliate/reports" },
  { label: "Profile Settings", to: "/affiliate/profile-settings" },
];

const getStatusBadgeClasses = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("paid") || normalized.includes("approved") || normalized.includes("completed")) {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (normalized.includes("pending") || normalized.includes("processing")) {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  }
  if (normalized.includes("rejected") || normalized.includes("failed") || normalized.includes("cancelled")) {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
};

export default function AffiliateDashboard() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const user = useAppSelector((state) => state.auth.user);
  const canViewAffiliateDashboard = Boolean(user && (user.roles ?? []).includes("AFFILIATE"));

  const { data: dashboardRes, isLoading: dashboardLoading } = useGetAffiliateDashboardQuery(undefined, {
    skip: !canViewAffiliateDashboard,
    refetchOnMountOrArgChange: true,
  });
  const { data: referralsRes, isLoading: referralsLoading } = useGetAffiliateReferralsQuery({ page, limit }, {
    skip: !canViewAffiliateDashboard,
    refetchOnMountOrArgChange: true,
  });
  const { data: commissionsRes } = useGetAffiliateCommissionsQuery({ page: 1, limit: 10 }, {
    skip: !canViewAffiliateDashboard,
    refetchOnMountOrArgChange: true,
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

  const affiliateName = `${(user.firstName ?? "Affiliate").toUpperCase()}'S Business`;

  const statCards = [
    {
      label: "Total Referrals",
      value: dashboard?.summary.totalReferrals ?? 0,
      icon: HiOutlineUserGroup,
      accentColor: "blue" as const,
      subtitle: "All-time referrals",
    },
    {
      label: "Active Referrals",
      value: dashboard?.summary.activeReferrals ?? 0,
      icon: HiOutlineArrowPathRoundedSquare,
      accentColor: "green" as const,
      subtitle: "Currently active",
    },
    {
      label: "Total Commission Earned",
      value: currency(dashboard?.summary.totalCommissionEarned ?? 0),
      icon: HiOutlineCurrencyDollar,
      accentColor: "purple" as const,
      subtitle: "Approved and paid",
    },
    {
      label: "Pending Commission",
      value: currency(dashboard?.summary.pendingCommission ?? 0),
      icon: HiOutlineBanknotes,
      accentColor: "yellow" as const,
      subtitle: "Awaiting approval",
    },
    {
      label: "Commission Rate",
      value: `${dashboard?.affiliate.commissionRate ?? 0}%`,
      icon: HiOutlineChartBarSquare,
      accentColor: "cyan" as const,
      subtitle: "Default affiliate rate",
    },
    {
      label: "Recent Commissions",
      value: commissionsRes?.pagination.total ?? 0,
      icon: HiOutlineWallet,
      accentColor: "green" as const,
      subtitle: "Tracked commission rows",
    },
  ];

  return (
    <DashboardContainer className="space-y-6 pb-8">
      <TitleBreadCrumbs title="Affiliate Dashboard" breadCrumbTitle="Affiliate / Dashboard" />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xl font-bold text-slate-900">{affiliateName}</p>
            <p className="text-xs font-semibold text-slate-500">
              {new Date(dashboard?.affiliate.joinedAt ?? Date.now()).toLocaleDateString()} -{" "}
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <HiOutlineCalendarDays className="h-4 w-4" />
            Affiliate performance overview
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200">
          {dashboardTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  "pb-3 text-sm font-semibold text-slate-600 transition hover:text-slate-900",
                  isActive && "border-b-2 border-blue-600 text-blue-700",
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {statCards.map((card) => (
          <StatsCard
            key={card.label}
            title={card.label}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            accentColor={card.accentColor}
            showTrendIcon={false}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Monthly Earnings</h2>
            <span className="text-xs text-slate-500">Commission from paid bookings</span>
          </div>
          <div className="h-[300px] w-full">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => currency(Number(value ?? 0))} />
                  <Bar dataKey="earnings" fill="#0b59a2" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-500">No earnings data yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Affiliate Code</h2>
          <p className="mt-3 text-sm text-slate-500">Referral code</p>
          <p className="font-semibold tracking-wide text-slate-900">{dashboard?.affiliate.referralCode ?? "-"}</p>
          <p className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Service-specific affiliate links are generated from each marketplace service page.
          </p>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">Recent commissions</p>
            {(commissionsRes?.items ?? []).length ? (
              <ul className="mt-2 space-y-2 text-sm">
                {(commissionsRes?.items ?? []).slice(0, 5).map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
                  >
                    <span className="text-slate-700">{row.bookingId.slice(0, 8)}...</span>
                    <span className="font-semibold text-slate-900">{currency(row.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                No commissions yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Referral Details</h2>
          <a
            href={exportHref}
            className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            target="_blank"
            rel="noreferrer"
          >
            Export CSV
          </a>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Referral</th>
                <th className="px-3 py-3">Booking ID</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length ? (
                referrals.map((row) => (
                  <tr key={`${row.referralId}-${row.bookingId ?? "none"}`} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{row.referredName}</p>
                      <p className="text-xs text-slate-500">{row.referredEmail}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{row.bookingId ?? "-"}</td>
                    <td className="px-3 py-3 text-slate-700">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-slate-900">{currency(row.amount)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">
                    No referral activity yet.
                  </td>
                </tr>
              )}
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
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination || pagination.page <= 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
