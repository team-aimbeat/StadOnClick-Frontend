import { useMemo } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  HiOutlineCalendarDays,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineBanknotes,
  HiOutlineChartBarSquare,
  HiOutlineCurrencyDollar,
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
  const page = 1;
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
  const referredUsers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; profileImageUrl?: string | null }>();
    for (const row of referrals) {
      if (!map.has(row.referredUserId)) {
        map.set(row.referredUserId, {
          id: row.referredUserId,
          name: row.referredName || row.referredEmail || "User",
          profileImageUrl: row.profileImageUrl ?? null,
        });
      }
    }
    return Array.from(map.values()).slice(0, 5);
  }, [referrals]);
  const chartData = useMemo(
    () =>
      (dashboard?.monthlyEarnings ?? []).map((row) => ({
        month: new Date(`${row.month}-01`).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        earnings: row.amount,
      })),
    [dashboard?.monthlyEarnings],
  );
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {dashboard?.summary.totalReferrals ?? 0} referred users
              </p>
              <p className="text-sm text-slate-500">
                Keep engaging your newest referrals.
              </p>
            </div>
            <NavLink
              to="/affiliate/referrals"
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View all
            </NavLink>
          </div>

          <div className="mt-5 flex flex-wrap items-start gap-5">
            {referredUsers.length ? (
              referredUsers.map((user) => {
                const avatarUrl =
                  user.profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=E2E8F0&color=334155&size=96`;
                return (
                  <div key={user.id} className="w-16 text-center">
                    <img
                      src={avatarUrl}
                      alt={user.name}
                      className="mx-auto h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <p className="mt-2 truncate text-xs font-semibold text-slate-700">
                      {user.name}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No referred users yet.</p>
            )}
          </div>
        </div>
      </div>


    </DashboardContainer>
  );
}
