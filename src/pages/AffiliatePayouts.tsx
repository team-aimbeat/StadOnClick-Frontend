import { useMemo } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetAffiliateCommissionsQuery } from "@/features/affiliate/api/affiliateApi";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const isSettledStatus = (status: string) => {
  const normalized = status.toLowerCase();
  return normalized.includes("paid") || normalized.includes("approved") || normalized.includes("completed");
};

export default function AffiliatePayouts() {
  const user = useAppSelector((state) => state.auth.user);
  const canViewAffiliateDashboard = Boolean(user && (user.roles ?? []).includes("AFFILIATE"));

  const { data: commissionsRes, isLoading } = useGetAffiliateCommissionsQuery(
    { page: 1, limit: 100 },
    {
      skip: !canViewAffiliateDashboard,
      refetchOnMountOrArgChange: true,
    },
  );

  const commissions = commissionsRes?.items ?? [];
  const payoutRows = useMemo(
    () =>
      commissions
        .filter((row) => isSettledStatus(row.status))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [commissions],
  );

  const totalPaid = payoutRows.reduce((sum, row) => sum + (row.amount ?? 0), 0);
  const totalPending = commissions
    .filter((row) => !isSettledStatus(row.status))
    .reduce((sum, row) => sum + (row.amount ?? 0), 0);

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!canViewAffiliateDashboard) {
    return <Navigate to="/affiliate-marketing" replace />;
  }

  if (isLoading) {
    return <div className="p-8">Loading payouts...</div>;
  }

  return (
    <DashboardContainer className="space-y-6 pb-8">
      <TitleBreadCrumbs title="Payouts" breadCrumbTitle="Affiliate / Payouts" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Paid Out</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{currency(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Payout Amount</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{currency(totalPending)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Payout History</h2>
        <p className="text-sm text-slate-500">Settled commission payouts based on booking commissions.</p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Payout Date</th>
                <th className="px-3 py-3">Reference</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payoutRows.length ? (
                payoutRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-3 text-slate-700">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-slate-700">{row.id}</td>
                    <td className="px-3 py-3 text-slate-700">Booking {row.bookingId}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{currency(row.amount)}</td>
                    <td className="px-3 py-3 text-slate-700">{row.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">
                    No payouts yet.
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
