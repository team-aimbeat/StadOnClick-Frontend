import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Package,
  RefreshCcw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { HiOutlinePencilSquare, HiOutlinePlus } from "react-icons/hi2";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServiceMasterCategory } from "@/services/serviceCategoriesApi";
import {
  useGetServiceOfferingsQuery,
  useLazyGetServiceOfferingsQuery,
} from "@/services/vendorOfferingsApi";
import type { VendorOffering, VendorSlot } from "@/services/vendorOfferingsApi";
import {
  useGetVendorServicesQuery,
  type VendorServiceEntity,
} from "@/services/vendorServicesApi";

import well from "@/assets/Images/well.jpg";
import wellSm from "@/assets/Images/optimized/well-sm.jpg";
import type { Visual } from "@/pages/vendor-services/vendorServicesVisuals";

import { AddOfferingDialog } from "@/pages/vendor-services/AddOfferingDialog";
import {
  categoryVisuals,
  masterServiceVisuals,
} from "@/pages/vendor-services/vendorServicesVisuals";

const fallbackOverviewVisual = (label: string): Visual => ({
  src: well,
  alt: `${label} visual`,
  srcSet: `${wellSm} 480w, ${well} 1200w`,
});

const isRenderableImageUrl = (value?: string | null) => {
  if (!value) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  );
};

type VendorServiceOverviewProps = {
  service: VendorServiceEntity;
  masterServices: ServiceMasterCategory[];
  onEditService: () => void;
  onEditOfferings: (offeringId?: string) => void;
  requestAddOfferingOpen?: boolean;
  onConsumeAddOfferingRequest?: () => void;
};

type RangePreset = "today" | "7d" | "30d" | "custom";

type AggregateStats = {
  totalSlots: number;
  openSlots: number;
  fullSlots: number;
  cancelledSlots: number;
  totalCapacity: number;
  remainingSeats: number;
  bookedUnits: number;
  totalSales: number;
  totalPurchase: number;
  salesReturn: number;
  purchaseReturn: number;
};

type ServiceTrendRow = {
  id: string;
  title: string;
  image: string;
  booked: number;
  revenue: number;
  growth: number;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatMoney = (value: number) => money.format(Math.max(0, value));

const computeChangePct = (current: number, previous: number) => {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const toDateKey = (iso: string) => new Date(iso).toISOString().slice(0, 10);

const buildDateKeys = (start: Date, end: Date) => {
  const dates: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
};

export function VendorServiceOverview({
  service,
  masterServices,
  onEditService,
  onEditOfferings,
  requestAddOfferingOpen,
  onConsumeAddOfferingRequest,
}: VendorServiceOverviewProps) {
  const [addOfferingOpen, setAddOfferingOpen] = useState(false);
  const [selectedAnalyticsOfferingId, setSelectedAnalyticsOfferingId] =
    useState<string>("ALL");
  const [rangePreset, setRangePreset] = useState<RangePreset>("7d");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [serviceTrends, setServiceTrends] = useState<ServiceTrendRow[]>([]);
  const [serviceTrendsLoading, setServiceTrendsLoading] = useState(false);
  const [loadServiceOfferings] = useLazyGetServiceOfferingsQuery();

  const { data: offerings = [], isFetching, refetch } = useGetServiceOfferingsQuery(
    service.id,
    {
      skip: !service.id,
    },
  );
  const { data: vendorServices = [] } = useGetVendorServicesQuery();
  const mappedUserServices = useMemo(() => {
    const seen = new Set<string>();
    return vendorServices.filter((vendorService) => {
      if (!vendorService?.id || seen.has(vendorService.id)) return false;
      seen.add(vendorService.id);
      return true;
    });
  }, [vendorServices]);

  useEffect(() => {
    if (requestAddOfferingOpen) {
      setAddOfferingOpen(true);
      onConsumeAddOfferingRequest?.();
    }
  }, [onConsumeAddOfferingRequest, requestAddOfferingOpen]);

  useEffect(() => {
    const now = new Date();
    const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);

    if (rangePreset === "custom") return;

    if (rangePreset === "today") {
      const today = toIsoDate(now);
      setDateFrom(today);
      setDateTo(today);
      return;
    }

    const start = toIsoDate(now);
    const end = new Date(now);
    end.setDate(now.getDate() + (rangePreset === "7d" ? 6 : 29));
    setDateFrom(start);
    setDateTo(toIsoDate(end));
  }, [rangePreset]);

  const master = useMemo(
    () => masterServices?.find((m) => m.id === service.category?.masterCategoryId),
    [masterServices, service.category?.masterCategoryId],
  );

  const masterVisual =
    masterServiceVisuals[master?.slug ?? ""] ??
    fallbackOverviewVisual(master?.name ?? "Master service");
  const categoryVisual = categoryVisuals[service.category?.slug ?? ""] ?? masterVisual;

  const primaryImage = isRenderableImageUrl(service.media?.[0]?.url)
    ? (service.media?.[0]?.url as string)
    : categoryVisual.src;

  const analytics = useMemo(() => {
    const selectedOfferings: VendorOffering[] =
      selectedAnalyticsOfferingId === "ALL"
        ? offerings
        : offerings.filter((offering) => offering.id === selectedAnalyticsOfferingId);

    const offeringById = new Map(selectedOfferings.map((offering) => [offering.id, offering]));
    const allSlots = selectedOfferings.flatMap((offering) => offering.slots ?? []);

    const hasDateBounds = Boolean(dateFrom && dateTo);
    const start = hasDateBounds ? new Date(`${dateFrom}T00:00:00`) : null;
    const end = hasDateBounds ? new Date(`${dateTo}T23:59:59.999`) : null;

    const filterSlotsByRange = (
      slots: VendorSlot[],
      rangeStart: Date | null,
      rangeEnd: Date | null,
    ) => {
      if (!rangeStart || !rangeEnd) return slots;
      return slots.filter((slot) => {
        const slotStart = new Date(slot.startTime);
        return slotStart >= rangeStart && slotStart <= rangeEnd;
      });
    };

    const currentSlots = filterSlotsByRange(allSlots, start, end);

    const daysInRange =
      start && end
        ? Math.max(Math.floor((end.getTime() - start.getTime()) / 86400000) + 1, 1)
        : 7;

    const previousEnd = start ? new Date(start.getTime() - 1) : null;
    const previousStart = previousEnd
      ? new Date(previousEnd.getTime() - (daysInRange - 1) * 86400000)
      : null;
    const previousSlots = filterSlotsByRange(allSlots, previousStart, previousEnd);

    const buildStats = (slots: VendorSlot[]): AggregateStats => {
      const totalSlots = slots.length;
      const openSlots = slots.filter((slot) => slot.status === "OPEN").length;
      const fullSlots = slots.filter((slot) => slot.status === "FULL").length;
      const cancelledSlots = slots.filter((slot) => slot.status === "CANCELLED").length;

      const totalCapacity = slots.reduce((sum, slot) => sum + Math.max(slot.capacity ?? 0, 0), 0);
      const remainingSeats = slots.reduce((sum, slot) => sum + Math.max(slot.remaining ?? 0, 0), 0);
      const bookedUnits = Math.max(totalCapacity - remainingSeats, 0);

      let totalSales = 0;
      let totalPurchase = 0;
      let salesReturn = 0;
      let purchaseReturn = 0;

      for (const slot of slots) {
        const offering = offeringById.get(slot.offeringId);
        const salePrice = Number(offering?.salePrice ?? offering?.basePrice ?? 0);
        const basePrice = Number(offering?.basePrice ?? offering?.salePrice ?? 0);
        const booked = Math.max((slot.capacity ?? 0) - (slot.remaining ?? 0), 0);
        const remaining = Math.max(slot.remaining ?? 0, 0);

        totalSales += booked * salePrice;
        totalPurchase += Math.max(slot.capacity ?? 0, 0) * basePrice;
        purchaseReturn += remaining * basePrice;

        if (slot.status === "CANCELLED") {
          salesReturn += Math.max(booked, 1) * salePrice;
        }
      }

      return {
        totalSlots,
        openSlots,
        fullSlots,
        cancelledSlots,
        totalCapacity,
        remainingSeats,
        bookedUnits,
        totalSales,
        totalPurchase,
        salesReturn,
        purchaseReturn,
      };
    };

    const currentStats = buildStats(currentSlots);
    const previousStats = buildStats(previousSlots);

    const dateBuckets = new Map<
      string,
      { totalSales: number; totalPurchase: number; totalBookings: number }
    >();
    for (const slot of currentSlots) {
      const offering = offeringById.get(slot.offeringId);
      const salePrice = Number(offering?.salePrice ?? offering?.basePrice ?? 0);
      const basePrice = Number(offering?.basePrice ?? offering?.salePrice ?? 0);
      const booked = Math.max((slot.capacity ?? 0) - (slot.remaining ?? 0), 0);
      const dateKey = toDateKey(slot.startTime);
      const existing = dateBuckets.get(dateKey) ?? {
        totalSales: 0,
        totalPurchase: 0,
        totalBookings: 0,
      };
      existing.totalSales += booked * salePrice;
      existing.totalPurchase += Math.max(slot.capacity ?? 0, 0) * basePrice;
      existing.totalBookings += booked;
      dateBuckets.set(dateKey, existing);
    }

    let dateSeries: Array<{
      date: string;
      totalSales: number;
      totalPurchase: number;
      totalBookings: number;
    }> = [];
    if (start && end) {
      dateSeries = buildDateKeys(start, end).map((date) => {
        const bucket = dateBuckets.get(date) ?? {
          totalSales: 0,
          totalPurchase: 0,
          totalBookings: 0,
        };
        return {
          date,
          totalSales: bucket.totalSales,
          totalPurchase: bucket.totalPurchase,
          totalBookings: bucket.totalBookings,
        };
      });
    } else {
      dateSeries = Array.from(dateBuckets.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([date, value]) => ({ date, ...value }));
    }

    const offeringTrends = selectedOfferings
      .map((offering) => {
        const offeringCurrentSlots = currentSlots.filter((slot) => slot.offeringId === offering.id);
        const offeringPreviousSlots = previousSlots.filter((slot) => slot.offeringId === offering.id);

        const bookedNow = offeringCurrentSlots.reduce(
          (sum, slot) => sum + Math.max((slot.capacity ?? 0) - (slot.remaining ?? 0), 0),
          0,
        );
        const bookedPrevious = offeringPreviousSlots.reduce(
          (sum, slot) => sum + Math.max((slot.capacity ?? 0) - (slot.remaining ?? 0), 0),
          0,
        );

        const revenue = bookedNow * Number(offering.salePrice ?? offering.basePrice ?? 0);

        return {
          id: offering.id,
          name: offering.name,
          booked: bookedNow,
          revenue,
          growth: computeChangePct(bookedNow, bookedPrevious),
        };
      })
      .sort((a, b) => {
        if (b.booked !== a.booked) return b.booked - a.booked;
        return b.revenue - a.revenue;
      });

    const recentTransactions = currentSlots
      .slice()
      .sort((a, b) => (a.startTime < b.startTime ? 1 : -1))
      .slice(0, 8)
      .map((slot) => {
        const offering = offeringById.get(slot.offeringId);
        const booked = Math.max((slot.capacity ?? 0) - (slot.remaining ?? 0), 0);
        const amount = booked * Number(offering?.salePrice ?? offering?.basePrice ?? 0);
        return {
          id: slot.id,
          offeringName: offering?.name ?? "Offering",
          status: slot.status,
          amount,
          slotTime: slot.startTime,
        };
      });

    const weekOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayMap = new Map<string, number>(weekOrder.map((day) => [day, 0]));
    for (const slot of currentSlots) {
      const day = weekOrder[new Date(slot.startTime).getDay()];
      const booked = Math.max((slot.capacity ?? 0) - (slot.remaining ?? 0), 0);
      weekdayMap.set(day, (weekdayMap.get(day) ?? 0) + booked);
    }

    const weekdayActivity = weekOrder.map((day) => ({ day, value: weekdayMap.get(day) ?? 0 }));

    const totalCustomers = currentStats.bookedUnits;
    const firstTimeCustomers = Math.max(totalCustomers - currentStats.fullSlots, 0);
    const repeatCustomers = currentStats.fullSlots;

    return {
      selectedOfferings,
      currentStats,
      previousStats,
      dateSeries,
      offeringTrends,
      recentTransactions,
      totalCustomers,
      firstTimeCustomers,
      repeatCustomers,
      weekdayActivity,
      slotCoverage:
        selectedOfferings.length > 0
          ? Math.round(
              (selectedOfferings.filter((offering) => offering.usesSlots).length /
                selectedOfferings.length) *
                100,
            )
          : 0,
    };
  }, [dateFrom, dateTo, offerings, selectedAnalyticsOfferingId]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!mappedUserServices.length) {
        setServiceTrends([]);
        return;
      }

      const hasRange = Boolean(dateFrom && dateTo);
      const start = hasRange ? new Date(`${dateFrom}T00:00:00`) : null;
      const end = hasRange ? new Date(`${dateTo}T23:59:59.999`) : null;

      const daysInRange =
        start && end
          ? Math.max(Math.floor((end.getTime() - start.getTime()) / 86400000) + 1, 1)
          : 7;
      const previousEnd = start ? new Date(start.getTime() - 1) : null;
      const previousStart = previousEnd
        ? new Date(previousEnd.getTime() - (daysInRange - 1) * 86400000)
        : null;

      const withinRange = (slot: VendorSlot, rangeStart: Date | null, rangeEnd: Date | null) => {
        if (!rangeStart || !rangeEnd) return true;
        const slotStart = new Date(slot.startTime);
        return slotStart >= rangeStart && slotStart <= rangeEnd;
      };

      const compute = (items: VendorOffering[], rangeStart: Date | null, rangeEnd: Date | null) => {
        let booked = 0;
        let revenue = 0;
        for (const offering of items) {
          for (const slot of offering.slots ?? []) {
            if (!withinRange(slot, rangeStart, rangeEnd)) continue;
            const slotBooked = Math.max((slot.capacity ?? 0) - (slot.remaining ?? 0), 0);
            booked += slotBooked;
            revenue += slotBooked * Number(offering.salePrice ?? offering.basePrice ?? 0);
          }
        }
        return { booked, revenue };
      };

      setServiceTrendsLoading(true);
      try {
        const rows = await Promise.all(
          mappedUserServices.map(async (vendorService) => {
            try {
              const serviceOfferings = await loadServiceOfferings(vendorService.id, true).unwrap();
              const current = compute(serviceOfferings, start, end);
              const previous = compute(serviceOfferings, previousStart, previousEnd);
              const fallbackImage =
                categoryVisuals[vendorService.category?.slug ?? ""]?.src ??
                fallbackOverviewVisual(vendorService.title).src;
              const image = isRenderableImageUrl(vendorService.media?.[0]?.url)
                ? (vendorService.media?.[0]?.url as string)
                : fallbackImage;

              return {
                id: vendorService.id,
                title: vendorService.title,
                image,
                booked: current.booked,
                revenue: current.revenue,
                growth: computeChangePct(current.booked, previous.booked),
              } satisfies ServiceTrendRow;
            } catch {
              return null;
            }
          }),
        );

        if (!active) return;

        setServiceTrends(
          rows
            .filter((row): row is ServiceTrendRow => Boolean(row))
            .sort((a, b) => {
              if (b.booked !== a.booked) return b.booked - a.booked;
              return b.revenue - a.revenue;
            }),
        );
      } finally {
        if (active) setServiceTrendsLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [dateFrom, dateTo, loadServiceOfferings, mappedUserServices]);

  const maxSales = Math.max(...analytics.dateSeries.map((row) => row.totalSales), 1);
  const maxPurchase = Math.max(...analytics.dateSeries.map((row) => row.totalPurchase), 1);
  const maxActivity = Math.max(...analytics.weekdayActivity.map((row) => row.value), 1);
  const maxBookings = Math.max(...analytics.dateSeries.map((row) => row.totalBookings), 1);

  return (
    <DashboardContainer className="space-y-5 bg-[#F5F7FB] pb-16">
      <TitleBreadCrumbs
        className="flex-1"
        title="My Service"
        breadCrumbTitle="Vendor / Service"
        subtitle="Replica-style analytics with dynamic data from your backend offerings and slots."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {service.category?.name ?? "Category"}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              service.status === "LIVE"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {service.status}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={onEditService} className="gap-2">
            <HiOutlinePencilSquare className="h-4 w-4" />
            Edit service
          </Button>
          <Button type="button" onClick={() => setAddOfferingOpen(true)} className="gap-2">
            <HiOutlinePlus className="h-4 w-4" />
            Add offering
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Sales"
          value={formatMoney(analytics.currentStats.totalSales)}
          change={computeChangePct(
            analytics.currentStats.totalSales,
            analytics.previousStats.totalSales,
          )}
          icon={<ShoppingCart className="h-4 w-4" />}
          note="Sales vs last period"
        />
        <KpiCard
          title="Sales Return"
          value={formatMoney(analytics.currentStats.salesReturn)}
          change={computeChangePct(
            analytics.currentStats.salesReturn,
            analytics.previousStats.salesReturn,
          )}
          icon={<RefreshCcw className="h-4 w-4" />}
          note="Return value vs last period"
        />
        <KpiCard
          title="Total Purchase"
          value={formatMoney(analytics.currentStats.totalPurchase)}
          change={computeChangePct(
            analytics.currentStats.totalPurchase,
            analytics.previousStats.totalPurchase,
          )}
          icon={<Package className="h-4 w-4" />}
          note="Purchase vs last period"
        />
        <KpiCard
          title="Purchase Return"
          value={formatMoney(analytics.currentStats.purchaseReturn)}
          change={computeChangePct(
            analytics.currentStats.purchaseReturn,
            analytics.previousStats.purchaseReturn,
          )}
          icon={<CheckCircle2 className="h-4 w-4" />}
          note="Unused slot value"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-semibold text-slate-900">Sales & Purchase</h3>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedAnalyticsOfferingId}
                onChange={(event) => setSelectedAnalyticsOfferingId(event.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                <option value="ALL">All offerings</option>
                {offerings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {offering.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                Weekly
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <QuickDateButton label="Today" active={rangePreset === "today"} onClick={() => setRangePreset("today")} />
            <QuickDateButton label="1W" active={rangePreset === "7d"} onClick={() => setRangePreset("7d")} />
            <QuickDateButton label="1M" active={rangePreset === "30d"} onClick={() => setRangePreset("30d")} />
            <QuickDateButton label="Custom" active={rangePreset === "custom"} onClick={() => setRangePreset("custom")} />
          </div>

          <div className="mb-4 grid gap-2 md:grid-cols-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setRangePreset("custom");
                setDateFrom(event.target.value);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setRangePreset("custom");
                setDateTo(event.target.value);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
            />
          </div>

          {isFetching ? (
            <div className="space-y-2">
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
          ) : analytics.dateSeries.length ? (
            <div className="grid grid-cols-10 gap-2">
              {analytics.dateSeries.slice(-10).map((point) => {
                const salesH = Math.max((point.totalSales / maxSales) * 98, 8);
                const purchaseH = Math.max((point.totalPurchase / maxPurchase) * 98, 8);
                return (
                  <div key={point.date} className="text-center">
                    <div className="mx-auto flex h-28 w-8 flex-col justify-end gap-1 rounded-full bg-[#F2F1FB] p-1">
                      <span className="w-full rounded-full bg-[#CFC9F8]" style={{ height: purchaseH }} />
                      <span className="w-full rounded-full bg-[#7C6AF2]" style={{ height: salesH }} />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">{point.date.slice(5)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No date-wise data available for current filters.</p>
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Overall Information</h3>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <img src={primaryImage} alt={service.title} className="h-24 w-full object-cover" />
                <div className="space-y-0.5 p-2">
                  <p className="truncate text-xs font-semibold text-slate-900">{service.title}</p>
                  <p className="text-[11px] text-slate-500">Service image</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <img src={masterVisual.src} alt={masterVisual.alt} className="h-24 w-full object-cover" />
                <div className="space-y-0.5 p-2">
                  <p className="truncate text-xs font-semibold text-slate-900">{master?.name ?? "Master service"}</p>
                  <p className="text-[11px] text-slate-500">Master image</p>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <InfoTile label="Offerings" value={String(analytics.selectedOfferings.length)} icon={<Package className="h-4 w-4" />} />
              <InfoTile label="Booked units" value={String(analytics.currentStats.bookedUnits)} icon={<ShoppingCart className="h-4 w-4" />} />
              <InfoTile label="Slots coverage" value={`${analytics.slotCoverage}%`} icon={<Users className="h-4 w-4" />} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Customers Overview</h3>
              <span className="text-xs text-slate-500">Weekly</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-emerald-50 px-3 py-3">
                <p className="text-xs text-emerald-700">First Time</p>
                <p className="mt-1 text-lg font-semibold text-emerald-900">{compactNumber.format(analytics.firstTimeCustomers)}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 px-3 py-3">
                <p className="text-xs text-rose-700">Repeat</p>
                <p className="mt-1 text-lg font-semibold text-rose-900">{compactNumber.format(analytics.repeatCustomers)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Most Day Active</h3>
            <div className="grid grid-cols-7 gap-2">
              {analytics.weekdayActivity.map((item) => {
                const barHeight = Math.max((item.value / maxActivity) * 68, 8);
                const active = item.value === maxActivity && maxActivity > 0;
                return (
                  <div key={item.day} className="text-center">
                    <div className="mx-auto flex h-20 w-7 items-end rounded-full bg-slate-100 p-1">
                      <span
                        className={`w-full rounded-full ${active ? "bg-[#4D72FF]" : "bg-slate-300"}`}
                        style={{ height: barHeight }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">{item.day}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">Date-wise Bookings</h3>
            <div className="grid grid-cols-10 gap-2">
              {analytics.dateSeries.slice(-10).map((point) => {
                const h = Math.max((point.totalBookings / maxBookings) * 72, 6);
                return (
                  <div key={`bookings-${point.date}`} className="text-center">
                    <div className="mx-auto flex h-20 w-6 items-end rounded-full bg-slate-100 p-1">
                      <span className="w-full rounded-full bg-[#22C55E]" style={{ height: h }} />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">{point.date.slice(5)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Top Trending Services</h3>
            <span className="text-xs text-slate-500">Date filtered</span>
          </div>

          {serviceTrendsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : serviceTrends.length ? (
            <ul className="mb-4 space-y-2">
              {serviceTrends.map((trend) => (
                <li key={trend.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white">
                        <img src={trend.image} alt={trend.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{trend.title}</p>
                        <p className="text-xs text-slate-500">{trend.booked} booked</p>
                      </div>
                    </div>
                    <p className={`text-[11px] font-semibold ${trend.growth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {trend.growth >= 0 ? "+" : "-"}
                      {Math.abs(trend.growth).toFixed(1)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-slate-500">No service trend data available.</p>
          )}

          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Top Trending Offerings</h3>
            <span className="text-xs text-slate-500">Live</span>
          </div>

          {isFetching ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : analytics.offeringTrends.length ? (
            <ul className="space-y-2">
              {analytics.offeringTrends.slice(0, 5).map((trend, index) => (
                <li key={trend.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-white">
                        <img
                          src={index % 2 === 0 ? primaryImage : masterVisual.src}
                          alt={trend.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{trend.name}</p>
                        <p className="text-xs text-slate-500">{trend.booked} booked</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatMoney(trend.revenue)}</p>
                      <p className={`text-[11px] font-medium ${trend.growth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {trend.growth >= 0 ? "+" : "-"}
                        {Math.abs(trend.growth).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No trending offerings yet.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] lg:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Transaction</h3>
            <button
              type="button"
              onClick={() => onEditOfferings()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {isFetching ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : analytics.recentTransactions.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-2 py-2">ID</th>
                    <th className="px-2 py-2">Product</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Amount</th>
                    <th className="px-2 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentTransactions.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100 text-slate-700">
                      <td className="px-2 py-2 text-xs">{item.id.slice(0, 7)}</td>
                      <td className="px-2 py-2 font-medium text-slate-900">{item.offeringName}</td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            item.status === "OPEN"
                              ? "bg-emerald-50 text-emerald-600"
                              : item.status === "FULL"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-2 py-2">{formatMoney(item.amount)}</td>
                      <td className="px-2 py-2 text-xs text-slate-500">
                        {new Date(item.slotTime).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recent transactions for selected range.</p>
          )}
        </div>
      </div>

      <AddOfferingDialog
        open={addOfferingOpen}
        onOpenChange={setAddOfferingOpen}
        serviceId={service.id}
        onCreated={() => refetch()}
      />
    </DashboardContainer>
  );
}

function KpiCard({
  title,
  value,
  change,
  icon,
  note,
}: {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
  note: string;
}) {
  const positive = change >= 0;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <div className="mb-2 flex items-center justify-between text-slate-500">
        <p className="text-xs font-medium">{title}</p>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-50">
          {icon}
        </span>
      </div>
      <p className="text-3xl font-semibold leading-none text-slate-900">{value}</p>
      <p className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${positive ? "text-emerald-600" : "text-rose-500"}`}>
        {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        {Math.abs(change).toFixed(1)}%
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{note}</p>
    </div>
  );
}

function QuickDateButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
        active
          ? "border-[#1F2D3D] bg-[#1F2D3D] text-white"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {label}
    </button>
  );
}

function InfoTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500">
          {icon}
        </span>
        <p className="text-xs font-medium text-slate-600">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
     
