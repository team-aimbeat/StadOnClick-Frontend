import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BarChart3,
  CalendarRange,
  CalendarIcon,
  Clock3,
  DollarSign,
  Flame,
  ImageOff,
  Layers3,
  ArrowUpRight,
  Package,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { HiOutlinePencilSquare, HiOutlinePlus } from "react-icons/hi2";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ServiceMasterCategory } from "@/services/serviceCategoriesApi";
import {
  useGetServiceOfferingsQuery,
} from "@/services/vendorOfferingsApi";
import type { VendorOffering, VendorSlot } from "@/services/vendorOfferingsApi";
import {
  type VendorServiceEntity,
} from "@/services/vendorServicesApi";
import { useGetVendorBookingFeedQuery, type VendorBookingFeedItem } from "@/services/bookingsApi";

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
const toAmount = (value?: string | number | null) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
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

  const { data: offerings = [], isFetching, refetch } = useGetServiceOfferingsQuery(
    service.id,
    {
      skip: !service.id,
    },
  );
  const { data: vendorBookingsResponse, isFetching: isBookingsFetching } = useGetVendorBookingFeedQuery();

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

    const end = toIsoDate(now);
    const start = new Date(now);
    start.setDate(now.getDate() - (rangePreset === "7d" ? 6 : 29));
    setDateFrom(toIsoDate(start));
    setDateTo(end);
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
          customer: "Guest booking",
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
    const mostActiveDay = weekdayActivity.reduce(
      (top, row) => (row.value > top.value ? row : top),
      { day: "-", value: 0 },
    );

    const hourMap = new Map<number, number>();
    for (const slot of currentSlots) {
      const hour = new Date(slot.startTime).getHours();
      const booked = Math.max((slot.capacity ?? 0) - (slot.remaining ?? 0), 0);
      hourMap.set(hour, (hourMap.get(hour) ?? 0) + booked);
    }
    const peakHourEntry = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0];
    const peakBookingTime =
      peakHourEntry != null
        ? `${String(peakHourEntry[0]).padStart(2, "0")}:00`
        : "N/A";

    const totalCustomers = currentStats.bookedUnits;
    const firstTimeCustomers = Math.max(totalCustomers - currentStats.fullSlots, 0);
    const repeatCustomers = currentStats.fullSlots;
    const slotUtilizationPct =
      currentStats.totalCapacity > 0
        ? (currentStats.bookedUnits / currentStats.totalCapacity) * 100
        : 0;
    const conversionRatePct =
      currentStats.totalSlots > 0
        ? ((currentStats.fullSlots + currentStats.openSlots) / currentStats.totalSlots) * 100
        : 0;
    const bestPerformingOffering = offeringTrends[0]?.name ?? "N/A";

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
      mostActiveDay,
      peakBookingTime,
      bestPerformingOffering,
      slotUtilizationPct,
      conversionRatePct,
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

  const previousUtilizationPct =
    analytics.previousStats.totalCapacity > 0
      ? (analytics.previousStats.bookedUnits / analytics.previousStats.totalCapacity) * 100
      : 0;
  const statusTone =
    service.status === "LIVE"
      ? "bg-emerald-50 text-emerald-700"
      : service.status === "PAUSED"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";
  const serviceBookings = useMemo(() => {
    const bookings = vendorBookingsResponse?.bookings ?? [];
    return bookings.filter(
      (booking) =>
        booking.vendorServiceId === service.id || booking.vendorService?.id === service.id,
    );
  }, [service.id, vendorBookingsResponse?.bookings]);
  const bookingAnalytics = useMemo(() => {
    const hasDateBounds = Boolean(dateFrom && dateTo);
    const start = hasDateBounds ? new Date(`${dateFrom}T00:00:00`) : null;
    const end = hasDateBounds ? new Date(`${dateTo}T23:59:59.999`) : null;
    const inRange = (
      booking: VendorBookingFeedItem,
      rangeStart: Date | null,
      rangeEnd: Date | null,
    ) => {
      if (!rangeStart || !rangeEnd) return true;
      const createdAt = new Date(booking.createdAt);
      return createdAt >= rangeStart && createdAt <= rangeEnd;
    };
    const daysInRange =
      start && end
        ? Math.max(Math.floor((end.getTime() - start.getTime()) / 86400000) + 1, 1)
        : 7;
    const previousEnd = start ? new Date(start.getTime() - 1) : null;
    const previousStart = previousEnd
      ? new Date(previousEnd.getTime() - (daysInRange - 1) * 86400000)
      : null;
    const currentBookings = serviceBookings.filter((booking) => inRange(booking, start, end));
    const previousBookings = serviceBookings.filter((booking) =>
      inRange(booking, previousStart, previousEnd),
    );
    const successfulStatuses = new Set(["CONFIRMED", "COMPLETED", "PAID"]);

    const totalRevenue = currentBookings.reduce(
      (sum, booking) => sum + toAmount(booking.orderItem?.priceFinal),
      0,
    );
    const previousRevenue = previousBookings.reduce(
      (sum, booking) => sum + toAmount(booking.orderItem?.priceFinal),
      0,
    );
    const totalBookings = currentBookings.length;
    const previousBookingsCount = previousBookings.length;
    const successfulCurrent = currentBookings.filter((booking) =>
      successfulStatuses.has(String(booking.status).toUpperCase()),
    ).length;
    const successfulPrevious = previousBookings.filter((booking) =>
      successfulStatuses.has(String(booking.status).toUpperCase()),
    ).length;
    const conversionRatePct = totalBookings > 0 ? (successfulCurrent / totalBookings) * 100 : 0;
    const previousConversionRatePct =
      previousBookingsCount > 0 ? (successfulPrevious / previousBookingsCount) * 100 : 0;

    const dateBuckets = new Map<string, { totalSales: number; totalBookings: number }>();
    for (const booking of currentBookings) {
      const dateKey = toDateKey(booking.createdAt);
      const existing = dateBuckets.get(dateKey) ?? { totalSales: 0, totalBookings: 0 };
      existing.totalSales += toAmount(booking.orderItem?.priceFinal);
      existing.totalBookings += 1;
      dateBuckets.set(dateKey, existing);
    }
    const dateSeries =
      start && end
        ? buildDateKeys(start, end).map((date) => {
            const bucket = dateBuckets.get(date) ?? { totalSales: 0, totalBookings: 0 };
            return { date, ...bucket };
          })
        : Array.from(dateBuckets.entries())
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([date, value]) => ({ date, ...value }));

    const selectedOfferings: VendorOffering[] =
      selectedAnalyticsOfferingId === "ALL"
        ? offerings
        : offerings.filter((offering) => offering.id === selectedAnalyticsOfferingId);
    const selectedOfferingBySlotId = new Map<string, VendorOffering>();
    for (const offering of selectedOfferings) {
      for (const slot of offering.slots ?? []) {
        selectedOfferingBySlotId.set(slot.id, offering);
      }
    }

    const offeringMap = new Map<string, { id: string; name: string; booked: number; revenue: number }>(
      selectedOfferings.map((offering) => [
        offering.id,
        { id: offering.id, name: offering.name, booked: 0, revenue: 0 },
      ]),
    );
    for (const booking of currentBookings) {
      const bookingOffering =
        (booking.slotId ? selectedOfferingBySlotId.get(booking.slotId) : undefined) ?? undefined;
      const key = bookingOffering?.id ?? booking.vendorService?.id ?? service.id;
      const name = bookingOffering?.name ?? booking.vendorService?.title ?? service.title;
      const entry = offeringMap.get(key) ?? { id: key, name, booked: 0, revenue: 0 };
      entry.booked += 1;
      entry.revenue += toAmount(booking.orderItem?.priceFinal);
      offeringMap.set(key, entry);
    }
    const previousOfferingMap = new Map<string, number>();
    for (const booking of previousBookings) {
      const bookingOffering =
        (booking.slotId ? selectedOfferingBySlotId.get(booking.slotId) : undefined) ?? undefined;
      const key = bookingOffering?.id ?? booking.vendorService?.id ?? service.id;
      previousOfferingMap.set(key, (previousOfferingMap.get(key) ?? 0) + 1);
    }
    const offeringTrends = Array.from(offeringMap.values())
      .map((row) => ({
        ...row,
        growth: computeChangePct(row.booked, previousOfferingMap.get(row.id) ?? 0),
      }))
      .sort((a, b) => {
        if (b.booked !== a.booked) return b.booked - a.booked;
        return b.revenue - a.revenue;
      });

    const weekOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayMap = new Map<string, number>(weekOrder.map((day) => [day, 0]));
    const hourMap = new Map<number, number>();
    for (const booking of currentBookings) {
      const bookingDate = new Date(booking.createdAt);
      const day = weekOrder[bookingDate.getDay()];
      weekdayMap.set(day, (weekdayMap.get(day) ?? 0) + 1);
      const hour = bookingDate.getHours();
      hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
    }
    const weekdayActivity = weekOrder.map((day) => ({ day, value: weekdayMap.get(day) ?? 0 }));
    const mostActiveDay = weekdayActivity.reduce(
      (top, row) => (row.value > top.value ? row : top),
      { day: "-", value: 0 },
    );
    const peakHourEntry = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0];
    const peakBookingTime =
      peakHourEntry != null
        ? `${String(peakHourEntry[0]).padStart(2, "0")}:00`
        : "N/A";

    const recentTransactions = currentBookings
      .map((booking) => ({
        id: booking.orderItem?.orderNumber || booking.id,
        customer:
          [booking.user?.firstName, booking.user?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || booking.user?.email || "Guest",
        offeringName:
          (booking.slotId ? selectedOfferingBySlotId.get(booking.slotId)?.name : undefined) ??
          booking.vendorService?.title ??
          service.title,
        status: booking.status,
        amount: toAmount(booking.orderItem?.priceFinal),
        slotTime: booking.slot?.startTime ?? booking.createdAt,
      }))
      .sort((a, b) => (a.slotTime < b.slotTime ? 1 : -1))
      .slice(0, 8);

    return {
      totalRevenue,
      totalBookings,
      revenueChangePct: computeChangePct(totalRevenue, previousRevenue),
      bookingsChangePct: computeChangePct(totalBookings, previousBookingsCount),
      conversionRatePct,
      conversionChangePct: conversionRatePct - previousConversionRatePct,
      dateSeries,
      offeringTrends,
      recentTransactions,
      mostActiveDay,
      peakBookingTime,
      bestPerformingOffering: offeringTrends[0]?.name ?? "N/A",
    };
  }, [
    dateFrom,
    dateTo,
    offerings,
    selectedAnalyticsOfferingId,
    service.title,
    service.id,
    serviceBookings,
  ]);
  const isOverviewLoading = isFetching || isBookingsFetching;

  return (
    <DashboardContainer className="space-y-6 bg-[#F7F9FC] pb-16">
      <TitleBreadCrumbs
        className="flex-1"
        title="Service Analytics"
        breadCrumbTitle="Vendor / Service"
        subtitle="Read-only performance insights for this service."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <img src={primaryImage} alt={service.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 space-y-2">
              <h1 className="truncate text-2xl font-semibold text-slate-900">{service.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {service.category?.name ?? "Category"}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>
                  {service.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <InlineStat label="Total Revenue" value={formatMoney(bookingAnalytics.totalRevenue)} />
                <InlineStat
                  label="Total Bookings"
                  value={compactNumber.format(bookingAnalytics.totalBookings)}
                />
                <InlineStat
                  label="Active Offerings"
                  value={String(analytics.selectedOfferings.length)}
                />
                <InlineStat
                  label="Slot Utilization"
                  value={`${analytics.slotUtilizationPct.toFixed(1)}%`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={onEditService} className="gap-2">
              <HiOutlinePencilSquare className="h-4 w-4" />
              Edit Service
            </Button>
            <Button type="button" variant="outline" onClick={() => setAddOfferingOpen(true)} className="gap-2">
              <HiOutlinePlus className="h-4 w-4" />
              Add Offering
            </Button>
          </div>
        </div>
      </section>



      <section className="grid gap-6 xl:grid-cols-10">
        <div className="xl:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Revenue & Booking Analytics</h2>
              <p className="text-sm text-slate-500">Trend across selected range and offerings</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedAnalyticsOfferingId} onValueChange={setSelectedAnalyticsOfferingId}>
                <SelectTrigger className="h-9 w-[180px] rounded-xl border-slate-200 text-xs">
                  <SelectValue placeholder="All offerings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All offerings</SelectItem>
                  {offerings.map((offering) => (
                    <SelectItem key={offering.id} value={offering.id}>
                      {offering.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={rangePreset} onValueChange={(value) => setRangePreset(value as RangePreset)}>
                <SelectTrigger className="h-9 w-[140px] rounded-xl border-slate-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {rangePreset === "custom" && (
            <div className="mb-4 grid gap-2 md:grid-cols-2">
              <DatePickerField
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="Start date"
              />
              <DatePickerField
                value={dateTo}
                onChange={setDateTo}
                placeholder="End date"
              />
            </div>
          )}

          {isOverviewLoading ? (
            <Skeleton className="h-[280px] w-full rounded-xl" />
          ) : bookingAnalytics.dateSeries.length ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingAnalytics.dateSeries}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="totalSales"
                    name="Revenue"
                    stroke="#2563EB"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                    animationDuration={700}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalBookings"
                    name="Bookings"
                    stroke="#10B981"
                    fill="url(#bookingGradient)"
                    strokeWidth={2}
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={<CalendarRange className="h-5 w-5" />}
              title="No analytics data for selected range"
              description="Try another date range or add new offerings to capture bookings."
              actionLabel="Add Offering"
              onAction={() => setAddOfferingOpen(true)}
            />
          )}
        </div>

        <div className="xl:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Performance Insights</h3>
          <p className="mb-4 text-sm text-slate-500">Key outcomes from this service</p>
          <div className="space-y-3">
            <InsightTile
              icon={<Flame className="h-4 w-4 text-amber-600" />}
              label="Most Active Day"
              value={`${bookingAnalytics.mostActiveDay.day} (${bookingAnalytics.mostActiveDay.value})`}
            />
            <InsightTile
              icon={<Package className="h-4 w-4 text-blue-600" />}
              label="Best Performing Offering"
              value={bookingAnalytics.bestPerformingOffering}
            />
            <InsightTile
              icon={<Clock3 className="h-4 w-4 text-emerald-600" />}
              label="Peak Booking Time"
              value={bookingAnalytics.peakBookingTime}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Date-wise Bookings</h2>
        <p className="mb-4 text-sm text-slate-500">Bookings count by date</p>
        {isOverviewLoading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : bookingAnalytics.dateSeries.length ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingAnalytics.dateSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip />
                <Bar dataKey="totalBookings" name="Bookings" fill="#3B82F6" radius={[6, 6, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            icon={<BarChart3 className="h-5 w-5" />}
            title="No booking chart data"
            description="Bookings will appear here once your offerings start receiving reservations."
            actionLabel="Add Offering"
            onAction={() => setAddOfferingOpen(true)}
          />
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Top Trending Offerings</h3>
          <p className="mb-4 text-sm text-slate-500">Ranked by bookings and revenue</p>
          {isOverviewLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : bookingAnalytics.offeringTrends.length ? (
            <ul className="space-y-3">
              {bookingAnalytics.offeringTrends.slice(0, 5).map((trend, index) => (
                <li key={trend.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img src={index % 2 === 0 ? primaryImage : masterVisual.src} alt={trend.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{trend.name}</p>
                      <p className="text-xs text-slate-500">{trend.booked} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatMoney(trend.revenue)}</p>
                    <p className={`text-xs font-medium ${trend.growth >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {trend.growth >= 0 ? "+" : "-"}
                      {Math.abs(trend.growth).toFixed(1)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<ImageOff className="h-5 w-5" />}
              title="No trending offerings yet"
              description="Publish offerings to start tracking top performers."
              actionLabel="Add Offering"
              onAction={() => setAddOfferingOpen(true)}
            />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
              <p className="text-sm text-slate-500">Latest booking-level activity</p>
            </div>
            <Button type="button" variant="ghost" onClick={() => onEditOfferings()} className="gap-1 text-slate-500 hover:text-slate-800">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
          {isOverviewLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : bookingAnalytics.recentTransactions.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-2 py-2">Booking ID</th>
                    <th className="px-2 py-2">Customer</th>
                    <th className="px-2 py-2">Amount</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingAnalytics.recentTransactions.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 text-slate-700">
                      <td className="px-2 py-2 text-xs font-medium text-slate-900">{item.id.slice(0, 8)}</td>
                      <td className="px-2 py-2">{item.customer}</td>
                      <td className="px-2 py-2">{formatMoney(item.amount)}</td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          String(item.status).toUpperCase().includes("PAID") ||
                          String(item.status).toUpperCase().includes("CONFIRMED") ||
                          String(item.status).toUpperCase().includes("COMPLETED")
                            ? "bg-emerald-50 text-emerald-700"
                            : String(item.status).toUpperCase().includes("PENDING")
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-slate-500">{new Date(item.slotTime).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<ReceiptText className="h-5 w-5" />}
              title="No bookings yet"
              description="Bookings will appear here once customers place their first order."
              actionLabel="Manage Offerings"
              onAction={() => onEditOfferings()}
            />
          )}
        </div>
      </section>

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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
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

function DatePickerField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-between rounded-xl border-slate-200 px-3 text-xs font-normal text-slate-700"
        >
          <span>{selectedDate ? format(selectedDate, "dd-MM-yyyy") : placeholder}</span>
          <CalendarIcon className="h-4 w-4 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function InlineStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InsightTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500">
          {icon}
        </span>
        <p className="text-xs font-medium text-slate-600">{label}</p>
      </div>
      <p className="max-w-[60%] truncate text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
      <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500">
        {icon}
      </span>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 max-w-md text-xs text-slate-500">{description}</p>
      {actionLabel && onAction ? (
        <Button type="button" size="sm" className="mt-4 gap-2" onClick={onAction}>
          <HiOutlinePlus className="h-4 w-4" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
     
