import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useGetOrderReceiptQuery } from "@/services/ordersApi";
import { CheckCircle } from "lucide-react";

const RECEIPT_STORAGE_KEY = "stadonclick.latestOrderReceipt";

const currencyFormatter = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId =
    searchParams.get("session_id") ?? searchParams.get("sessionId") ?? undefined;
  const orderId =
    searchParams.get("order_id") ?? searchParams.get("orderId") ?? undefined;
  const [fallbackParams, setFallbackParams] = useState<
    { sessionId?: string; orderId?: string } | undefined
  >(undefined);

  useEffect(() => {
    if (sessionId || orderId) {
      setFallbackParams(undefined);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const raw = window.sessionStorage.getItem(RECEIPT_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.sessionId || parsed?.orderId) {
        setFallbackParams({
          sessionId: parsed.sessionId ?? undefined,
          orderId: parsed.orderId ?? undefined,
        });
        window.sessionStorage.removeItem(RECEIPT_STORAGE_KEY);
      } else {
        window.sessionStorage.removeItem(RECEIPT_STORAGE_KEY);
      }
    } catch {
      window.sessionStorage.removeItem(RECEIPT_STORAGE_KEY);
    }
  }, [sessionId, orderId]);

  const requestParams = useMemo(
    () => ({
      sessionId: sessionId ?? fallbackParams?.sessionId,
      orderId: orderId ?? fallbackParams?.orderId,
    }),
    [sessionId, orderId, fallbackParams],
  );

  const shouldSkip = !requestParams.sessionId && !requestParams.orderId;
  const { data, isLoading, isFetching, error } = useGetOrderReceiptQuery(requestParams, {
    skip: shouldSkip,
  });

  const receipt = data?.data;
  const missingParams = shouldSkip;

  if (missingParams) {
    return (
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Order reference missing</p>
          <p className="text-sm text-slate-500">
            We need a session or order identifier to show your receipt. Please return to the marketplace and try again.
          </p>
          <Button className="mt-4" onClick={() => navigate("/orders")}>
            View my orders
          </Button>
        </div>
      </section>
    );
  }

  if (isLoading || isFetching) {
    return (
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Loading receipt...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-rose-700">We couldn't load your receipt</p>
          <p className="mt-2 text-sm text-rose-700">
            {error?.data?.message ||
              "Please return to the orders page and select the receipt you want to view."}
          </p>
          <Button className="mt-4" onClick={() => navigate("/orders")}>
            View my orders
          </Button>
        </div>
      </section>
    );
  }

  if (!receipt) {
    return (
      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Receipt not found</p>
          <Button className="mt-4" onClick={() => navigate("/orders")}>
            View my orders
          </Button>
        </div>
      </section>
    );
  }

  const { summary, vendor, payment, items, status, orderNumber, createdAt } = receipt;
  const formattedDate = formatDate(createdAt);
  const shippingAddress = receipt.buyer.firstName || receipt.buyer.lastName
    ? `${receipt.buyer.firstName ?? ""} ${receipt.buyer.lastName ?? ""}`.trim()
    : vendor.contactEmail
      ? `${vendor.businessName} HQ`
      : "StadOnClick customer";

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#ffe8c9] px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_25px_50px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <CheckCircle className="h-6 w-6" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">Thank you for your order!</p>
            <p className="text-sm text-slate-500">
              Booking confirmed with {vendor.businessName || "StadOnClick"} - we'll follow up shortly.
            </p>
            <span className="rounded-full border border-slate-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
              {status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="mt-8 grid gap-4 text-xs uppercase tracking-[0.35em] text-slate-400 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 text-center">
              <p className="text-[0.6rem]">date ordered</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{formattedDate}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 text-center">
              <p className="text-[0.6rem]">order no.</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                #{orderNumber ?? receipt.orderId.slice(-6)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 text-center">
              <p className="text-[0.6rem]">shipping address</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{shippingAddress}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-base font-semibold text-slate-900">{item.name}</p>
                  {item.serviceTitle && (
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                      {item.serviceTitle}
                    </p>
                  )}
                  <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-semibold text-slate-900">
                    {formatCurrency(item.totalPrice)}
                  </p>
                  <p className="text-xs text-slate-500">per unit {formatCurrency(item.pricePerUnit)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">summary</p>
              <p className="mt-1 text-sm text-slate-500">Shipping address: {shippingAddress}</p>
              <p className="text-sm text-slate-500">Payment method: {payment.paymentMethod}</p>
            </div>
            <div className="space-y-1 text-right text-slate-500">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span className="text-slate-900">{formatCurrency(summary.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Taxes</span>
                <span className="text-slate-900">{formatCurrency(summary.tax)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span>-{formatCurrency(summary.discount)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(summary.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-center text-sm text-slate-500">
            <p>Thank you for shopping with us.</p>
            <p className="font-semibold text-slate-900">{vendor.businessName || "StadOnClick"} Team</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              {payment.receiptUrl ? (
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  View Stripe receipt
                </a>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Receipt not available from Stripe
                </span>
              )}
              {payment.receiptNumber && (
                <span className="text-xs text-slate-500">Receipt #{payment.receiptNumber}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/orders")}
                className="text-sm font-semibold"
              >
                Go to my orders
              </Button>
                <Link
                  to={`/orders/confirmation?order_id=${receipt.orderId}`}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  Reload receipt
                </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
