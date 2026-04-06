import React, { memo, useEffect, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import {
  DashboardCol,
  DashboardContainer,
  DashboardGrid,
  DashboardSection,
} from "@/components/dashboard";
import ChartCard from "@/components/AdminDashboard/ChartCard";
import GmvCard from "@/components/AdminDashboard/GmvChartCard";
import RecentActivities from "@/components/AdminDashboard/RecentActivities";
import CustomerAcquisitionCard from "@/components/AdminDashboard/CustomerAcquisitionCard";
import VendorsOverview from "@/components/AdminDashboard/VendorsOverview";
import AIAlertInsights from "@/components/AdminDashboard/AIAlertInsights";
import ApprovalQueueCard from "@/components/AdminDashboard/ApprovalQueueCard";
import PendingPayoutsCard from "@/components/AdminDashboard/finance/PendingPayoutsCard";
import RefundRequestsCard from "@/components/AdminDashboard/finance/RefundRequestsCard";
import KycPendingCard from "@/components/AdminDashboard/compliance/KycPendingCard";
import VendorApplicationsCard from "@/components/AdminDashboard/compliance/VendorApplicationsCard";
import AdminDashboardSkeleton from "@/components/skeletons/AdminDashboardSkeleton";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import LeadPlanSubscribersCard from "@/components/AdminDashboard/LeadPlanSubscribersCard";
import Mapcity from "@/components/AdminDashboard/Mapcity";
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";

import LeadSourceDistributionCard from "@/components/AdminDashboard/LeadSourceDistributionCard";
import {
  HiOutlineBuildingStorefront,
  HiOutlineHeart,
  HiOutlineTicket,
  HiOutlineShoppingCart,
  HiMiniCake,
  HiOutlineShoppingBag,
  HiOutlineBanknotes,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import {
  useGetPayoutsQuery,
  useGetPlatformCityAnalyticsQuery,
  useGetPlatformStatsQuery,
} from "@/features/admin/finance/api/adminFinanceApi";
import { useListAdminBookingsQuery } from "@/features/admin/bookings/api/adminBookingsApi";
import {
  useListAllVendorsQuery,
  useListVendorApplicationsQuery,
} from "@/features/admin/vendors/api/vendorsApi";
import type { Vendor } from "@/features/admin/vendors/types/vendor.types";
import { useGetAllVendorKycDocumentsQuery } from "@/services/adminKycApi";

const formatDateOnly = (date: Date) => date.toISOString().slice(0, 10);
const CONFIRMED_BOOKING_STATUSES = new Set(["CONFIRMED"]);

const toNumberSafe = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toStatusLabel = (status?: string) => {
  if (!status) return "Pending";
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCurrencyCompact = (value: number) => `SEK ${Math.round(value).toLocaleString()}`;

const formatRelativeTime = (iso: string) => {
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return "-";

  const seconds = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const trendFromValues = (current: number, previous: number) => {
  if (current === previous) return { trend: "neutral" as const, percentage: 0 };
  if (previous <= 0) {
    return { trend: current > 0 ? ("up" as const) : ("neutral" as const), percentage: current > 0 ? 100 : 0 };
  }
  const delta = ((current - previous) / previous) * 100;
  return {
    trend: delta > 0 ? ("up" as const) : ("down" as const),
    percentage: Number(Math.abs(delta).toFixed(1)),
  };
};

const monthKey = (dateValue: string | Date) => {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${date.getMonth()}`;
};

const isConfirmedBooking = (booking: { status?: string | null }) =>
  CONFIRMED_BOOKING_STATUSES.has(String(booking.status ?? "").toUpperCase());

const categoryIconFor = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("wellness") || normalized.includes("spa") || normalized.includes("fitness")) {
    return HiOutlineHeart;
  }
  if (normalized.includes("event") || normalized.includes("concert")) return HiOutlineTicket;
  if (normalized.includes("shop") || normalized.includes("market")) return HiOutlineShoppingCart;
  if (normalized.includes("food") || normalized.includes("cafe") || normalized.includes("restaurant")) {
    return HiMiniCake;
  }
  return HiOutlineBuildingStorefront;
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "V";

const formatAdminDisplayName = (
  user?: { displayName?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null } | null,
) => {
  const displayName = user?.displayName?.trim();
  if (displayName) return displayName;

  const firstName = user?.firstName?.trim();
  const lastName = user?.lastName?.trim();

  if (firstName && lastName) {
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
  }

  if (firstName) return firstName;
  if (user?.email) return user.email.split("@")[0];
  return "Admin";
};

const AdminWelcomeBanner = () => {
  const user = useAppSelector((state) => state.auth.user);
  const displayName = useMemo(() => formatAdminDisplayName(user), [user]);
  const now = useMemo(() => new Date(), []);

  const dayNumber = now.getDate();
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
  }).format(now);

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 px-5 py-4  sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <p className=" truncate text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.06em] text-slate-950">
          Welcome Back, {displayName}. <span aria-hidden="true">👋</span>
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border text-white bg-[#4F7DFF] text-[1.1rem] font-bold tracking-[-0.04em]  ">
          {dayNumber}
        </div>
        <p className=" font-serif max-w-[110px] c text-sm leading-tight text-slate-900 sm:max-w-none">
          {dateLabel}
        </p>
      </div>
    </div>
  );
};

type SnapshotMiniAvatar = {
  label: string;
  imageUrl?: string | null;
};

type SnapshotCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "light" | "solid";
  icon: IconType;
  watermarkIcon?: IconType;
  trendLabel?: string;
  trendTone?: "green" | "red" | "slate";
  watermark?: string;
  progress?: number;
  engagement?: string;
  avatars?: SnapshotMiniAvatar[]; 
  footerLabel?: string;
  footerValue?: string;
};

const SnapshotCard = ({
  title,
  value,
  subtitle,
  tone = "light",
  icon: Icon,
  watermarkIcon: WatermarkIcon,
  trendLabel,
  trendTone = "green",
  watermark,
  progress,
  engagement,
  avatars,
  footerLabel,
  footerValue,
}: SnapshotCardProps) => {
  const trendClass =
    trendTone === "red"
      ? "bg-rose-50 text-rose-600"
      : trendTone === "slate"
        ? "bg-slate-100 text-slate-500"
        : "bg-emerald-50 text-emerald-600";

  if (tone === "solid") {
    return (
      <div className="relative flex h-full min-h-[212px] flex-col overflow-hidden rounded-[26px] bg-[#4F7DFF] p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
              {title}
            </p>
            <p className="mt-2 text-4xl font-black tracking-[-0.06em]">{value}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/14 text-white/90">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 h-px bg-white/15" />

        <div className="mt-5 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">
            {footerLabel}
          </p>
          <p className="text-2xl font-black tracking-[-0.05em]">{footerValue}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[164px] overflow-hidden rounded-[26px] border border-slate-100 bg-white p-5 shadow-[0_16px_50px_-44px_rgba(15,23,42,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3ff] text-[#3554e0]">
              <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {title}
            </p>
            <p className="mt-1 text-[32px] font-black tracking-[-0.06em] text-slate-950">
              {value}
              {subtitle ? <span className="ml-1 text-sm font-semibold text-[#3554e0]">{subtitle}</span> : null}
            </p>
          </div>
        </div>

        {trendLabel ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
              trendClass,
            )}
          >
            {trendLabel}
          </span>
        ) : null}
      </div>

      {WatermarkIcon ? (
        <div className="pointer-events-none absolute -bottom-6 right-[-4px] select-none opacity-10">
          <WatermarkIcon className="h-[140px] w-[140px] text-[#3554e0]" />
        </div>
      ) : null}
      {watermark ? (
        <div className="pointer-events-none absolute -bottom-8 right-[-8px] select-none text-[110px] leading-none text-[#4F7DFF]">
          {watermark}
        </div>
      ) : null}
      {progress !== undefined ? (
        <div className="mt-6">
          <div className="h-1.5 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#3554e0]"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        </div>
      ) : null}

      {avatars || engagement ? (
        <div className="mt-5 flex items-end justify-between">
          <div className="flex -space-x-2">
            {(avatars ?? []).slice(0, 3).map((avatar) => (
              <div
                key={avatar.label}
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 text-[10px] font-semibold text-slate-600"
                title={avatar.label}
              >
                {avatar.imageUrl ? (
                  <img src={avatar.imageUrl} alt={avatar.label} className="h-full w-full object-cover" />
                ) : (
                  getInitials(avatar.label)
                )}
              </div>
            ))}
            {avatars && avatars.length > 3 ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-50 text-[10px] font-semibold text-slate-500">
                +{avatars.length - 3}
              </div>
            ) : null}
          </div>
          {engagement ? <p className="text-xs font-semibold text-emerald-600">{engagement}</p> : null}
        </div>
      ) : null}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const todayStr = formatDateOnly(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateOnly(yesterday);

  const { data: vendorApplicationsResponse, isLoading: vendorAppsLoading } =
    useListVendorApplicationsQuery({ page: 1, limit: 10, sortBy: "submittedAt", sortOrder: "desc" });
  const { data: platformStatsResponse, isLoading: platformStatsLoading } = useGetPlatformStatsQuery();
  const { data: vendorsResponse, isLoading: vendorsLoading } = useListAllVendorsQuery({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: allBookingsResponse, isLoading: allBookingsLoading } = useListAdminBookingsQuery({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: todayBookingsResponse, isLoading: todayBookingsLoading } = useListAdminBookingsQuery({
    page: 1,
    limit: 100,
    fromDate: todayStr,
    toDate: todayStr,
  });
  const { data: yesterdayBookingsResponse, isLoading: yesterdayBookingsLoading } =
    useListAdminBookingsQuery({
      page: 1,
      limit: 100,
      fromDate: yesterdayStr,
      toDate: yesterdayStr,
    });
  const { data: refundBookingsResponse, isLoading: refundsLoading } = useListAdminBookingsQuery({
    page: 1,
    limit: 5,
    statuses: "REFUND_REQUESTED",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: payoutsResponse, isLoading: payoutsLoading } = useGetPayoutsQuery({
    page: 1,
    limit: 5,
    status: "PENDING",
  });
  const [selectedCityPeriod, setSelectedCityPeriod] = useState<"today" | "weekly" | "monthly">(
    "today",
  );
  const { data: cityAnalyticsResponse, isLoading: cityAnalyticsLoading } =
    useGetPlatformCityAnalyticsQuery({
      period: selectedCityPeriod,
      limit: 5,
    });
  const { data: kycDocs = [], isLoading: kycLoading } = useGetAllVendorKycDocumentsQuery();

  const allBookings = useMemo(
    () => (allBookingsResponse?.data ?? []).filter(isConfirmedBooking),
    [allBookingsResponse?.data],
  );
  const todayBookings = useMemo(
    () => (todayBookingsResponse?.data ?? []).filter(isConfirmedBooking),
    [todayBookingsResponse?.data],
  );
  const yesterdayBookings = useMemo(
    () => (yesterdayBookingsResponse?.data ?? []).filter(isConfirmedBooking),
    [yesterdayBookingsResponse?.data],
  );

  const bookingTrendYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => currentYear - index);
  }, []);

  const [selectedBookingTrendYear, setSelectedBookingTrendYear] = useState<string>(
    String(new Date().getFullYear()),
  );

  useEffect(() => {
    if (!bookingTrendYearOptions.length) return;
    if (!bookingTrendYearOptions.includes(Number(selectedBookingTrendYear))) {
      setSelectedBookingTrendYear(String(bookingTrendYearOptions[0]));
    }
  }, [bookingTrendYearOptions, selectedBookingTrendYear]);

  const todayRevenue = useMemo(
    () =>
      todayBookings.reduce((sum, booking) => {
        const qty = Number(booking.orderItem?.quantity ?? 0);
        const unit = toNumberSafe(booking.orderItem?.priceFinal);
        return sum + unit * qty;
      }, 0),
    [todayBookings],
  );

  const yesterdayRevenue = useMemo(
    () =>
      yesterdayBookings.reduce((sum, booking) => {
        const qty = Number(booking.orderItem?.quantity ?? 0);
        const unit = toNumberSafe(booking.orderItem?.priceFinal);
        return sum + unit * qty;
      }, 0),
    [yesterdayBookings],
  );

  const vendors = (vendorsResponse?.data ?? []) as Vendor[];
  const platformStats = platformStatsResponse?.data;
  const platformCurrency = platformStats?.currency ?? "SEK";
  const todayBookingsCount = todayBookings.length;
  const activeVendorsCount = useMemo(
    () => vendors.filter((vendor) => String(vendor.status ?? "").toUpperCase() === "ACTIVE").length,
    [vendors],
  );
  const activeVendorAvatars = useMemo(
    () =>
      vendors
        .filter((vendor) => String(vendor.status ?? "").toUpperCase() === "ACTIVE")
        .slice(0, 3)
        .map((vendor) => ({
          label: vendor.businessName ?? "Vendor",
          imageUrl: vendor.user?.profileImageUrl ?? undefined,
        })),
    [vendors],
  );
  const activeVendorCoverage = vendors.length > 0 ? (activeVendorsCount / vendors.length) * 100 : 0;
  const newUsersToday = useMemo(() => {
    const uniqueIds = new Set(todayBookings.map((booking) => booking.user?.id).filter(Boolean));
    return uniqueIds.size;
  }, [todayBookings]);
  const conversionRate = activeVendorsCount > 0 ? (todayBookingsCount / activeVendorsCount) * 100 : 0;
  const revenueTrend = trendFromValues(platformStats?.totalRevenue ?? todayRevenue, yesterdayRevenue);
  const gmvTrend = trendFromValues(todayRevenue, yesterdayRevenue);
  const gmvTrendDirection = gmvTrend.trend === "neutral" ? undefined : gmvTrend.trend;

  const bookingsChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = Number(selectedBookingTrendYear) || new Date().getFullYear();
    const currentYearSeries = new Array<number>(12).fill(0);
    const previousYearSeries = new Array<number>(12).fill(0);

    for (const booking of allBookings) {
      const created = new Date(booking.createdAt);
      if (Number.isNaN(created.getTime())) continue;
      const month = created.getMonth();
      const amount = Number(booking.orderItem?.quantity ?? 0) * toNumberSafe(booking.orderItem?.priceFinal);

      if (created.getFullYear() === year) currentYearSeries[month] += amount;
      if (created.getFullYear() === year - 1) previousYearSeries[month] += amount;
    }

    return monthNames.map((month, index) => ({
      day: month,
      value1: Math.round(currentYearSeries[index]),
      value2: Math.round(previousYearSeries[index]),
    }));
  }, [allBookings, selectedBookingTrendYear]);

  const gmvChartData = useMemo(() => {
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const points: Array<{ month: string; value: number }> = [];

    for (let i = 4; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(date);
      const monthTotal = allBookings.reduce((sum, booking) => {
        if (monthKey(booking.createdAt) !== key) return sum;
        const qty = Number(booking.orderItem?.quantity ?? 0);
        const unit = toNumberSafe(booking.orderItem?.priceFinal);
        return sum + qty * unit;
      }, 0);

      points.push({
        month: names[date.getMonth()],
        value: Math.round(monthTotal),
      });
    }

    return points;
  }, [allBookings]);

  const recentActivitiesData = useMemo(() => {
    return allBookings.slice(0, 8).map((booking) => {
      const name = `${booking.user?.firstName ?? ""} ${booking.user?.lastName ?? ""}`.trim() || booking.user?.email;
      const quantity = Number(booking.orderItem?.quantity ?? 0);
      const unit = toNumberSafe(booking.orderItem?.priceFinal);
      return {
        id: booking.orderItem?.orderNumber ?? booking.id,
        name: name || "Customer",
        email: booking.user?.email,
        category: booking.vendorService?.category?.name ?? booking.vendorService?.title ?? "Service",
        status: toStatusLabel(booking.status),
        price: formatCurrencyCompact(quantity * unit),
        retained: formatRelativeTime(booking.createdAt),
      };
    });
  }, [allBookings]);

  const vendorOverviewCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const booking of allBookings) {
      const category = booking.vendorService?.category?.name ?? "Other";
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        count,
        trend: "neutral" as const,
        delta: "0%",
        icon: categoryIconFor(name),
      }));
  }, [allBookings]);

  const topRegions = useMemo(
    () => cityAnalyticsResponse?.data?.data ?? [],
    [cityAnalyticsResponse?.data?.data],
  );

  const pendingPayoutItems = useMemo(() => {
    const rows = payoutsResponse?.data?.data ?? [];
    return rows.map((row: any) => ({
      vendor: row.vendor?.businessName ?? "Vendor",
      amount: `${row.currency ?? "SEK"} ${toNumberSafe(row.amount).toLocaleString()}`,
      requestedAt: formatRelativeTime(row.createdAt),
      status: row.status ?? "Pending",
    }));
  }, [payoutsResponse?.data?.data]);

  const refundRequestItems = useMemo(() => {
    const rows = refundBookingsResponse?.data ?? [];
    return rows.map((booking) => ({
      bookingId: `#${booking.orderItem?.orderNumber ?? booking.id.slice(-6)}`,
      user:
        `${booking.user?.firstName ?? ""} ${booking.user?.lastName ?? ""}`.trim() ||
        booking.user?.email ||
        "Customer",
      amount: formatCurrencyCompact(
        Number(booking.orderItem?.quantity ?? 0) * toNumberSafe(booking.orderItem?.priceFinal),
      ),
      reason: "Refund requested",
    }));
  }, [refundBookingsResponse?.data]);

  const kycPendingItems = useMemo(() => {
    return kycDocs
      .filter((doc) => doc.status === "PENDING")
      .slice(0, 5)
      .map((doc) => ({
        vendor: doc.vendor?.name ?? "Vendor",
        document: doc.type,
        submittedAt: formatRelativeTime(doc.submittedAt),
      }));
  }, [kycDocs]);

  const vendorApplicationItems = useMemo(() => {
    const rows = vendorApplicationsResponse?.data ?? [];
    return rows.slice(0, 5).map((application: any) => ({
      vendor: application.vendor?.businessName ?? "Vendor",
      status: application.status ?? application.vendor?.status,
      appliedAt: formatRelativeTime(application.submittedAt),
      profileImageUrl:
        application.vendor?.user?.profileImageUrl ??
        application.vendor?.profileImageUrl ??
        undefined,
    }));
  }, [vendorApplicationsResponse?.data]);

  const loading =
    platformStatsLoading ||
    allBookingsLoading ||
    todayBookingsLoading ||
    yesterdayBookingsLoading ||
    vendorsLoading ||
    payoutsLoading ||
    refundsLoading ||
    kycLoading ||
    vendorAppsLoading ||
    cityAnalyticsLoading;

  if (loading) return <AdminDashboardSkeleton />;

  return (
    <div className="min-h-screen  pb-12 text-slate-900">
      <DashboardContainer className="space-y-6">
        <TitleBreadCrumbs
          title="Admin Dashboard"
          breadCrumbTitle="Admin / Dashboard"
        />

        <AdminWelcomeBanner />

        <DashboardSection>
          <DashboardGrid columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCol span={1}>
              <SnapshotCard
                title="Total Revenue (MTD)"
                value={Math.round(platformStats?.totalRevenue ?? 0).toLocaleString()}
                subtitle={platformCurrency}
                icon={HiOutlineBanknotes}
                trendLabel={`${
                  revenueTrend.trend === "up"
                    ? "+"
                    : revenueTrend.trend === "down"
                      ? "-"
                      : ""
                }${revenueTrend.percentage}%`}
                trendTone={revenueTrend.trend === "down" ? "red" : revenueTrend.trend === "neutral" ? "slate" : "green"}
                watermark={platformCurrency}
              />
            </DashboardCol>
            <DashboardCol span={1}>
              <SnapshotCard
                title="Bookings Today"
                value={todayBookingsCount.toLocaleString()}
                subtitle="units"
                icon={HiOutlineShoppingBag}
                watermarkIcon={HiOutlineShoppingBag}
                progress={Math.min(100, Math.max(16, todayBookingsCount * 12))}
              />
            </DashboardCol>
            <DashboardCol span={1}>
              <SnapshotCard
                title="Active Vendors"
                value={activeVendorsCount.toLocaleString()}
                icon={HiOutlineUserGroup}
                watermarkIcon={HiOutlineUserGroup}
                avatars={activeVendorAvatars}
                engagement={`${activeVendorCoverage.toFixed(1)}% Engagement`}
              />
            </DashboardCol>
            <DashboardCol span={1}>
              <SnapshotCard
                title="Conversion Rate"
                value={`${conversionRate.toFixed(1)}%`}
                tone="solid"
                icon={HiOutlineArrowTrendingUp}
                footerLabel="New Users Today"
                footerValue={newUsersToday.toLocaleString()}
              />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid columns="grid-cols-12">
            <DashboardCol span={7} className="h-full">
              <ChartCard
                title="Bookings Trend"
                subtitle="Annual booking volume across all categories"
                data={bookingsChartData}
                height={260}
                primaryColor="#2563EB"
                secondaryColor="#F97316"
                primaryLabel={`Selected Year (${selectedBookingTrendYear})`}
                secondaryLabel={`Last Year (${Number(selectedBookingTrendYear) - 1})`}
                growthText="vs last year"
                showLegend
                showPeriodSelect
                activePeriod={selectedBookingTrendYear}
                periodOptions={bookingTrendYearOptions.map(String)}
                onPeriodChange={setSelectedBookingTrendYear}
                className="h-full"
                animate={false}
              />
            </DashboardCol>
            <DashboardCol span={3} className="h-full">
              <div className="flex h-full flex-col gap-6">
                <LeadSourceDistributionCard />

              </div>
              
            </DashboardCol>
            <DashboardCol span={2} className="h-full">
              <div className="flex h-full flex-col">
                <LeadPlanSubscribersCard />
              </div>
              
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={4}>
              <Mapcity
                regions={topRegions}
                period={selectedCityPeriod}
                onPeriodChange={setSelectedCityPeriod}
                isLoading={cityAnalyticsLoading}
              />
            </DashboardCol>
             <DashboardCol span={6}>
              <RecentActivities
                title="Recent activity"
                activities={recentActivitiesData}
              />
            </DashboardCol>
            <DashboardCol span={2}>
              <VendorsOverview categories={vendorOverviewCategories} />
            </DashboardCol>
           
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <GmvCard
                title="GMV today"
                value={Math.round(todayRevenue)}
                percentage={gmvTrend.percentage}
                periodLabel="vs yesterday"
                trend={gmvTrendDirection}
                showChart
                chartData={gmvChartData}
                currency="SEK "
              />
            </DashboardCol>
            <DashboardCol span={6}>
              <CustomerAcquisitionCard />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid columns="grid-cols-12">
            <DashboardCol span={8} className="h-full">
              <AIAlertInsights />
            </DashboardCol>
            <DashboardCol span={4} className="h-full">
              <ApprovalQueueCard />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <PendingPayoutsCard items={pendingPayoutItems} />
            </DashboardCol>
            <DashboardCol span={6}>
              <RefundRequestsCard items={refundRequestItems} />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <KycPendingCard items={kycPendingItems} />
            </DashboardCol>
            <DashboardCol span={6}>
              <VendorApplicationsCard items={vendorApplicationItems} />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>
      </DashboardContainer>
    </div>
  );
};

export default memo(AdminDashboard);
