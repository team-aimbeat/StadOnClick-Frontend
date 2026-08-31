import { Flame, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { DealTimer } from "@/components/marketplace/DealTimer";
import { Button } from "@/components/ui/button";
import { useListPremiumDealsQuery } from "@/services/marketplaceApi";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

export default function DealsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useListPremiumDealsQuery({
    limit: 24,
    offset: 0,
    sort: "NEWEST",
  });

  if (isLoading) {
    return <div className="px-6 py-14 text-sm text-slate-600">Loading active deals...</div>;
  }

  const services = data?.data ?? [];

  return (
    <div className="min-h-screen bg-[#F6F8FB] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[32px] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed,white_55%,#eff6ff)] p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">
            Limited Time Deals
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">
            Active discounted offerings
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            These cards are driven by offerings whose deal end time is still in the future.
          </p>
        </section>

        {data?.isLocked ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            <p className="text-base font-semibold text-slate-900">Hot deals are locked</p>
            <p className="mt-2">
              Purchase a customer subscription plan to access premium discounted offers.
            </p>
            <Button className="mt-5 rounded-full" onClick={() => navigate("/subscriptions")}>
              View subscription plans
            </Button>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No active deals are live right now.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const featuredDeal = service.offeringsPreview[0];
              return (
                <article
                  key={service.id}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={service.thumbnailUrl ?? service.mediaUrls[0] ?? ""}
                    alt={service.title}
                    className="h-52 w-full object-cover"
                  />
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{service.title}</p>
                        <p className="mt-1 text-sm font-medium text-blue-600">{service.categoryName}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {service.ratingAvg.toFixed(1)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      <span>{service.cityName ?? "Location unavailable"}</span>
                    </div>

                    <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                        <Flame className="h-4 w-4" />
                        {featuredDeal.discountPercent}% OFF
                      </div>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {featuredDeal.name}
                      </p>
                      <div className="mt-3 flex items-end gap-3">
                        <p className="text-2xl font-black text-slate-900">
                          {money.format(featuredDeal.effectivePrice)}
                        </p>
                        <p className="pb-1 text-sm font-semibold text-slate-400 line-through">
                          {money.format(featuredDeal.basePrice)}
                        </p>
                      </div>
                      <DealTimer
                        endTime={featuredDeal.dealEndTime}
                        className="mt-3 text-sm font-semibold text-slate-600"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/service/${service.id}`)}
                      className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      View service
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
