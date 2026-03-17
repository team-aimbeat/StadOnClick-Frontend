import React, { memo, useMemo } from "react";
import { IconType } from "react-icons";
import {
  DashboardCol,
  DashboardContainer,
  DashboardGrid,
  DashboardSection,
} from "@/components/dashboard";
import StatsCard from "@/components/shared/StatsCard";
import ChartCard from "@/components/AdminDashboard/ChartCard";
import GmvCard from "@/components/AdminDashboard/GmvChartCard";
import RecentActivities from "@/components/AdminDashboard/RecentActivities";
import CustomerAcquisitionCard from "@/components/AdminDashboard/CustomerAcquisitionCard";
import VendorsOverview from "@/components/AdminDashboard/VendorsOverview";
import AIAlertInsights from "@/components/AdminDashboard/AIAlertInsights";
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
  HiOutlineChartBar,
  HiOutlineBuildingStorefront,
  HiOutlineHeart,
  HiOutlineTicket,
  HiOutlineShoppingCart,
  HiMiniCake,
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import {
  useGetPlatformStatsQuery,
  useGetPayoutsQuery,
} from "@/features/admin/finance/api/adminFinanceApi";
import { useListAdminBookingsQuery } from "@/features/admin/bookings/api/adminBookingsApi";
import {
  useListAllVendorsQuery,
  useListVendorApplicationsQuery,
} from "@/features/admin/vendors/api/vendorsApi";
import { useGetAllVendorKycDocumentsQuery } from "@/services/adminKycApi";

type SnapshotMetric = {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number;
  trend?: "up" | "down" | "neutral";
  icon: IconType;
  accentColor?: "blue" | "green" | "red" | "yellow" | "purple" | "cyan";
};

const formatDateOnly = (date: Date) => date.toISOString().slice(0, 10);

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

const AdminDashboard: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const todayStr = formatDateOnly(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateOnly(yesterday);

  const { data: platformStatsResponse, isLoading: platformStatsLoading } = useGetPlatformStatsQuery();
  const { data: vendorsResponse, isLoading: vendorsLoading } = useListAllVendorsQuery({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: vendorApplicationsResponse, isLoading: vendorAppsLoading } =
    useListVendorApplicationsQuery({ page: 1, limit: 10, sortBy: "submittedAt", sortOrder: "desc" });
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
  const { data: kycDocs = [], isLoading: kycLoading } = useGetAllVendorKycDocumentsQuery();

  const allBookings = allBookingsResponse?.data ?? [];
  const todayBookings = todayBookingsResponse?.data ?? [];
  const yesterdayBookings = yesterdayBookingsResponse?.data ?? [];
  const vendors = (vendorsResponse?.data ?? []) as Array<Record<string, unknown>>;
  const platformStats = platformStatsResponse?.data;

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

  const todayBookingsCount = todayBookingsResponse?.meta?.total ?? todayBookings.length;
  const yesterdayBookingsCount = yesterdayBookingsResponse?.meta?.total ?? yesterdayBookings.length;

  const activeVendorsCount = useMemo(
    () => vendors.filter((vendor) => String(vendor.status ?? "").toUpperCase() === "ACTIVE").length,
    [vendors],
  );

  const newUsersToday = useMemo(() => {
    const uniqueIds = new Set(todayBookings.map((booking) => booking.user?.id).filter(Boolean));
    return uniqueIds.size;
  }, [todayBookings]);

  const conversionRate = activeVendorsCount > 0 ? (todayBookingsCount / activeVendorsCount) * 100 : 0;
  const conversionYesterday = activeVendorsCount > 0 ? (yesterdayBookingsCount / activeVendorsCount) * 100 : 0;

  const revenueTrend = trendFromValues(platformStats?.totalRevenue ?? todayRevenue, yesterdayRevenue);
  const bookingsTrend = trendFromValues(todayBookingsCount, yesterdayBookingsCount);
  const usersTrend = trendFromValues(newUsersToday, Math.max(0, newUsersToday - 1));
  const conversionTrend = trendFromValues(conversionRate, conversionYesterday);
  const gmvTrend = trendFromValues(todayRevenue, yesterdayRevenue);
  const gmvTrendDirection = gmvTrend.trend === "neutral" ? undefined : gmvTrend.trend;

  const platformSnapshotMetrics: SnapshotMetric[] = [
    {
      title: "Total Revenue (MTD)",
      value: platformStats?.totalRevenue ?? 0,
      percentage: revenueTrend.percentage,
      trend: revenueTrend.trend,
      icon: HiOutlineChartBar,
      accentColor: "blue",
      subtitle: "vs yesterday",
    },
    {
      title: "Total Bookings (Today)",
      value: todayBookingsCount,
      percentage: bookingsTrend.percentage,
      trend: bookingsTrend.trend,
      icon: HiOutlineShoppingBag,
      accentColor: "purple",
      subtitle: "today",
    },
    {
      title: "Active Vendors",
      value: activeVendorsCount,
      percentage: 0,
      trend: "neutral",
      icon: HiOutlineUserGroup,
      accentColor: "green",
      subtitle: "currently active",
    },
    {
      title: "New Users (Today)",
      value: newUsersToday,
      percentage: usersTrend.percentage,
      trend: usersTrend.trend,
      icon: HiOutlineUser,
      accentColor: "red",
      subtitle: "via bookings",
    },
    {
      title: "Conversion Rate (Today)",
      value: `${conversionRate.toFixed(1)}%`,
      percentage: conversionTrend.percentage,
      trend: conversionTrend.trend,
      icon: HiOutlineArrowTrendingUp,
      accentColor: "cyan",
      subtitle: "bookings per active vendor",
    },
  ];

  const bookingsChartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const year = now.getFullYear();
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
  }, [allBookings]);

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

  const topRegions = useMemo(() => {
    const counts = new Map<string, number>();
    let total = 0;

    for (const booking of allBookings) {
      const region = booking.vendorProfile?.city?.name ?? booking.vendorProfile?.country ?? "Unknown";
      const normalized = String(region).trim();
      if (!normalized) continue;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      total += 1;
    }

    if (!total) return [];

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        percent: Number(((count / total) * 100).toFixed(2)),
      }));
  }, [allBookings]);

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
    vendorAppsLoading;

  if (loading) return <AdminDashboardSkeleton />;

  return (
    <div className="min-h-screen  pb-12 text-slate-900">
      <DashboardContainer className="space-y-6">
        <TitleBreadCrumbs
          title="Admin Dashboard"
          breadCrumbTitle="Admin / Dashboard"
        />

        <DashboardSection>
          <DashboardGrid columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {platformSnapshotMetrics.map((metric) => (
              <DashboardCol key={metric.title} span={1}>
                <StatsCard
                  title={metric.title}
                  value={metric.value}
                  percentage={metric.percentage}
                  trend={metric.trend}
                  icon={metric.icon}
                  accentColor={metric.accentColor}
                  subtitle={metric.subtitle}
                />
              </DashboardCol>
            ))}
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <ChartCard
                data={bookingsChartData}
                height={260}
                primaryColor="#2563EB"
                secondaryColor="#F97316"
                primaryLabel={`Current Year (${new Date().getFullYear()})`}
                secondaryLabel={`Last Year (${new Date().getFullYear() - 1})`}
                growthText="vs last year"
                showLegend
                showPeriodSelect={false}
                className="h-full"
                animate={false}
              />
            </DashboardCol>
            <DashboardCol span={3}>
              <LeadPlanSubscribersCard />
            </DashboardCol>
            <DashboardCol span={3}>
              <LeadSourceDistributionCard />
            </DashboardCol>
            <DashboardCol span={6}>
              <Mapcity regions={topRegions} />
            </DashboardCol>
            <DashboardCol span={6}>
              <VendorsOverview categories={vendorOverviewCategories} />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={12}>
              <RecentActivities
                title="Recent activity"
                activities={recentActivitiesData}
              />
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
          <DashboardGrid>
            <DashboardCol span={12}>
              <AIAlertInsights />
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
