import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAppSelector } from "@/app/hooks";
import { useGetMyOrdersQuery } from "@/services/ordersApi";

const currencyFormatter = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const statusTone: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REFUND_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
  REFUNDED: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatRelativeTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 45) return "Just now";
  if (diffSeconds < 3600) return `${Math.max(1, Math.floor(diffSeconds / 60))}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 172800) return "Yesterday";
  return date.toLocaleDateString();
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isFetching, error } = useGetMyOrdersQuery(undefined, {
    skip: !user,
  });

  const orders = data?.data ?? [];

  const hasOrders = orders.length > 0;

  const groupedByVendor = useMemo(() => {
    if (!orders.length) return [];
    return orders;
  }, [orders]);

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-4 py-16">
        <div className="max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Sign in to view your orders</p>
          <p className="text-sm text-slate-500">
            We need to know who you are before showing your bookings and purchases.
          </p>
          <button
            type="button"
            onClick={() => navigate("/sign-in")}
            className="w-full rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">My account</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">My orders</h1>
          <p className="text-sm text-slate-500">
            All your confirmed purchases, bookings, and refunds in one place.
          </p>
        </div>

        {isLoading || isFetching ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
            Loading your orders...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm font-semibold text-rose-700">
            Unable to load orders right now. Please try again later.
          </div>
        ) : !hasOrders ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            <p className="text-lg font-semibold text-slate-900">No orders yet</p>
            <p className="mt-2">Browse the marketplace to place your first order.</p>
            <button
              type="button"
              onClick={() => navigate("/marketplace")}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Browse services
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedByVendor.map((order) => (
              <div key={order.id} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {order.vendor.businessName}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-lg font-semibold text-slate-900">
                        Order #{order.items[0]?.orderNumber ?? order.id.slice(-6)}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusTone[order.status] ?? "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">Placed {formatRelativeTime(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total paid</p>
                    <p className="text-2xl font-semibold text-slate-900">{formatCurrency(order.totalFinal)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 md:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.offering.name}</p>
                        <p className="text-xs text-slate-500">{item.offering.serviceTitle}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.quantity} × {formatCurrency(item.priceFinal)} per unit
                        </p>
                        {item.slotId ? <p className="text-xs text-slate-500">Slot booked: {item.slotId}</p> : null}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Line total</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatCurrency(item.quantity * item.priceFinal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <Link
                    to={
                      order.items[0]?.offering.serviceId
                        ? `/service/${order.items[0]?.offering.serviceId}`
                        : "/marketplace"
                    }
                    className="font-medium text-blue-600 hover:underline"
                  >
                    View service details
                  </Link>
                  <span>
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
