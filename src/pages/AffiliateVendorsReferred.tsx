import { useMemo } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetAffiliateStatsQuery } from "@/features/affiliate/api/affiliateApi";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 2,
  }).format(value ?? 0);

type VendorAggregate = {
  vendorName: string;
  services: number;
  clicks: number;
  bookings: number;
  earnings: number;
};

export default function AffiliateVendorsReferred() {
  const user = useAppSelector((state) => state.auth.user);
  const canViewAffiliateDashboard = Boolean(user && (user.roles ?? []).includes("AFFILIATE"));

  const { data: statsRes, isLoading } = useGetAffiliateStatsQuery(undefined, {
    skip: !canViewAffiliateDashboard,
    refetchOnMountOrArgChange: true,
  });

  const vendors = useMemo<VendorAggregate[]>(() => {
    const map = new Map<string, VendorAggregate>();
    for (const row of statsRes?.data.services ?? []) {
      const key = row.vendorName || "Unknown vendor";
      const current = map.get(key) ?? {
        vendorName: key,
        services: 0,
        clicks: 0,
        bookings: 0,
        earnings: 0,
      };

      current.services += 1;
      current.clicks += row.clicks ?? 0;
      current.bookings += row.bookings ?? 0;
      current.earnings += row.earnings ?? 0;
      map.set(key, current);
    }

    return Array.from(map.values()).sort((a, b) => b.bookings - a.bookings || b.earnings - a.earnings);
  }, [statsRes?.data.services]);

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!canViewAffiliateDashboard) {
    return <Navigate to="/affiliate-marketing" replace />;
  }

  if (isLoading) {
    return <div className="p-8">Loading vendors referred...</div>;
  }

  return (
    <DashboardContainer className="space-y-6 pb-8">
      <TitleBreadCrumbs title="Vendors Referred" breadCrumbTitle="Affiliate / Vendors Referred" />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Attributed Vendors</h2>
          <p className="text-sm text-slate-500">
            Vendors where your affiliate links generated clicks, bookings, or earnings.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Vendor</th>
                <th className="px-3 py-3">Services</th>
                <th className="px-3 py-3">Clicks</th>
                <th className="px-3 py-3">Bookings</th>
                <th className="px-3 py-3">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length ? (
                vendors.map((row) => (
                  <tr key={row.vendorName} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-semibold text-slate-900">{row.vendorName}</td>
                    <td className="px-3 py-3 text-slate-700">{row.services}</td>
                    <td className="px-3 py-3 text-slate-700">{row.clicks}</td>
                    <td className="px-3 py-3 text-slate-700">{row.bookings}</td>
                    <td className="px-3 py-3 text-slate-900">{currency(row.earnings)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-slate-500">
                    No vendor attribution data yet.
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
