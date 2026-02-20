import { useState } from "react";
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

export default function AffiliateCommission() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const user = useAppSelector((state) => state.auth.user);
  const canViewAffiliateDashboard = Boolean(user && (user.roles ?? []).includes("AFFILIATE"));

  const { data: commissionsRes, isLoading } = useGetAffiliateCommissionsQuery(
    { page, limit },
    {
      skip: !canViewAffiliateDashboard,
      refetchOnMountOrArgChange: true,
    },
  );

  const commissions = commissionsRes?.items ?? [];
  const pagination = commissionsRes?.pagination;

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!canViewAffiliateDashboard) {
    return <Navigate to="/affiliate-marketing" replace />;
  }

  if (isLoading) {
    return <div className="p-8">Loading commissions...</div>;
  }

  return (
    <DashboardContainer className="space-y-6 pb-8">
      <TitleBreadCrumbs title="Commission" breadCrumbTitle="Affiliate / Commission" />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Commission Transactions</h2>
          <p className="text-sm text-slate-500">Earned, pending, and paid commission rows.</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Booking</th>
                <th className="px-3 py-3">Referred User</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Booking Amount</th>
                <th className="px-3 py-3">Commission</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length ? (
                commissions.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-3 text-slate-700">{row.bookingId}</td>
                    <td className="px-3 py-3 text-slate-700">{row.referredUser ?? "-"}</td>
                    <td className="px-3 py-3 text-slate-700">{new Date(row.date).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-slate-900">{currency(row.bookingAmount)}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{currency(row.amount)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-slate-500">
                    No commissions yet.
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
