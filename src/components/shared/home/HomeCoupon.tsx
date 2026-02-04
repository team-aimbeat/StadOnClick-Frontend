import dayjs from "dayjs";

import { useGetWelcomeCouponsQuery, type WelcomeCoupon } from "@/services/welcomeCouponsApi";

function formatDiscount(coupon: WelcomeCoupon) {
  const value = Number(coupon.value);
  if (!Number.isFinite(value)) return coupon.value;
  return coupon.discountType === "FLAT" ? `₹${value}` : `${value}%`;
}

function CouponCard({ coupon }: { coupon: WelcomeCoupon }) {
  const validUntilLabel = coupon.validTill ? dayjs(coupon.validTill).format("DD MMM YYYY") : "--";
  const minOrderValue = Number(coupon.minorder ?? 0);
  const usesValue = Number(coupon.uses ?? 0);

  return (
    <article className="relative h-[120px] overflow-hidden rounded-lg border border-amber-300 bg-[#fffaf0] shadow-sm">
      <span className="pointer-events-none absolute left-[120px] top-0 hidden h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f7ecc3] sm:block" />
      <span className="pointer-events-none absolute left-[120px] bottom-0 hidden h-6 w-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#f7ecc3] sm:block" />

      <div className="flex h-full flex-col sm:flex-row">
        <div className="flex w-full flex-col justify-center gap-1 border-b border-dashed border-amber-300 px-4 py-4 sm:w-[120px] sm:border-b-0 sm:border-r">
          <p className="text-[11px] font-medium tracking-wide text-slate-700">Code</p>
          <p className="text-[18px] font-bold text-[#D62A2A]">{coupon.code}</p>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-4">
          <p className="text-[13px] font-semibold text-slate-800">{coupon.title}</p>
          <p className="text-[12px] text-slate-600">
            {formatDiscount(coupon)} off • Valid till {validUntilLabel}
            {Number.isFinite(minOrderValue) && minOrderValue > 0 ? ` • Min ₹${minOrderValue}` : ""}
            {Number.isFinite(usesValue) && usesValue > 0 ? ` • Uses ${usesValue}` : ""}
            {coupon.onlyNewCustomers ? " • New customers only" : ""}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function HomeCoupon() {
  const { data: coupons = [], isLoading } = useGetWelcomeCouponsQuery({ limit: 4 });

  return (
    <section className="w-screen -mx-[calc((100vw-100%)/2)] bg-[#f7ecc3] py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-[120px] animate-pulse rounded-lg border border-amber-200 bg-[#fffaf0]"
              />
            ))
          ) : coupons.length ? (
            coupons.map((coupon) => <CouponCard key={coupon.code} coupon={coupon} />)
          ) : (
            <div className="rounded-lg border border-amber-200 bg-[#fffaf0] p-6 text-sm text-slate-600 md:col-span-2">
              No coupons available right now.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
