import { useParams } from "react-router-dom";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { useGetVendorProfileByIdQuery } from "@/features/admin/vendors/api/vendorsApi";

const money = new Intl.NumberFormat("en-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

export default function VendorProfileAdminPage() {
  const { vendorId = "" } = useParams<{ vendorId: string }>();
  const { data, isLoading, isError } = useGetVendorProfileByIdQuery(vendorId, {
    skip: !vendorId,
  });

  if (isLoading) {
    return (
      <DashboardContainer>
        <p className="text-sm text-slate-600">Loading vendor profile...</p>
      </DashboardContainer>
    );
  }

  if (isError || !data?.data?.vendor) {
    return (
      <DashboardContainer>
        <p className="text-sm text-rose-600">Unable to load vendor profile.</p>
      </DashboardContainer>
    );
  }

  const { vendor, service, recentBookings } = data.data;

  return (
    <DashboardContainer className="space-y-6">
      <TitleBreadCrumbs title="Vendor Profile" breadCrumbTitle="Admin / Vendors / Profile" />

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">{vendor.businessName}</h2>
        <div className="mt-3 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <p>Email: <span className="font-semibold">{vendor.user?.email ?? vendor.contactEmail ?? "-"}</span></p>
          <p>Status: <span className="font-semibold">{vendor.status}</span></p>
          <p>KYC: <span className="font-semibold">{vendor.kycStatus}</span></p>
          <p>City: <span className="font-semibold">{vendor.city?.name ?? "-"}</span></p>
          <p>Bookings: <span className="font-semibold">{vendor.totalBookings ?? 0}</span></p>
          <p>Revenue: <span className="font-semibold">{money.format(Number(vendor.totalRevenue ?? 0))}</span></p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">Service</h3>
        {!service ? (
          <p className="mt-2 text-sm text-slate-600">No active service found.</p>
        ) : (
          <div className="mt-3 rounded-xl border border-slate-100 p-4 text-sm">
            <p className="font-semibold text-slate-900">{service.title}</p>
            <p className="mt-1 text-slate-600">{service.description}</p>
            <p className="mt-2 text-slate-700">Status: <span className="font-semibold">{service.status}</span></p>
            <p className="text-slate-700">
              Offerings: <span className="font-semibold">{service._count?.offerings ?? 0}</span> | Bookings:{" "}
              <span className="font-semibold">{service._count?.bookings ?? 0}</span>
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">Recent Bookings</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Offering</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={5}>
                    No recent bookings.
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking: any) => (
                  <tr key={booking.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{booking.orderItem?.orderNumber ?? "-"}</td>
                    <td className="px-3 py-2">{booking.user?.email ?? "-"}</td>
                    <td className="px-3 py-2">{booking.orderItem?.offering?.name ?? "-"}</td>
                    <td className="px-3 py-2">
                      {money.format(Number(booking.orderItem?.priceFinal ?? 0))}
                    </td>
                    <td className="px-3 py-2">{booking.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardContainer>
  );
}
