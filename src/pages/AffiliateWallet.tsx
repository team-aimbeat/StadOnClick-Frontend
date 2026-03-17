import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import {
  useGetAffiliateCommissionsQuery,
  useGetAffiliateDashboardQuery,
} from "@/features/affiliate/api/affiliateApi";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 2,
  }).format(value ?? 0);

export default function AffiliateWallet() {
  const user = useAppSelector((state) => state.auth.user);
  const canViewAffiliateDashboard = Boolean(user && (user.roles ?? []).includes("AFFILIATE"));

  const { data: dashboardRes, isLoading: dashboardLoading } = useGetAffiliateDashboardQuery(undefined, {
    skip: !canViewAffiliateDashboard,
    refetchOnMountOrArgChange: true,
  });
  const { data: commissionsRes, isLoading: commissionsLoading } = useGetAffiliateCommissionsQuery(
    { page: 1, limit: 20 },
    {
      skip: !canViewAffiliateDashboard,
      refetchOnMountOrArgChange: true,
    },
  );

  const dashboard = dashboardRes?.data;
  const commissions = commissionsRes?.items ?? [];

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!canViewAffiliateDashboard) {
    return <Navigate to="/affiliate-marketing" replace />;
  }

  if (dashboardLoading || commissionsLoading) {
    return <div className="p-8">Loading wallet...</div>;
  }

  return (
    <DashboardContainer className="space-y-6 pb-8">
      <TitleBreadCrumbs title="Wallet" breadCrumbTitle="Affiliate / Wallet" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available Balance</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {currency(dashboard?.affiliate.totalEarnings ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Settled commissions</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Balance</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {currency(dashboard?.affiliate.totalPending ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Awaiting settlement</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Lifetime Earnings</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {currency((dashboard?.affiliate.totalEarnings ?? 0) + (dashboard?.affiliate.totalPending ?? 0))}
          </p>
          <p className="mt-1 text-xs text-slate-500">Total affiliate earnings</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Wallet Activity</h2>
        <p className="text-sm text-slate-500">Recent commission movements.</p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Reference</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length ? (
                commissions.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-3 text-slate-700">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-slate-700">{row.bookingId}</td>
                    <td className="px-3 py-3 text-slate-700">Commission credit</td>
                    <td className="px-3 py-3 text-slate-700">{row.status}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{currency(row.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">
                    No wallet activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardContainer>
  );
}
