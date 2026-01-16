import React, { useEffect, useState } from "react";
import { IconType } from "react-icons";
import {
  DashboardCol,
  DashboardContainer,
  DashboardGrid,
  DashboardSection,
} from "@/components/dashboard";
import StatsCard from "@/components/shared/StatsCard";
import ChartCard, { bookingsData } from "@/components/AdminDashboard/ChartCard";
import GmvCard, {
  gmvChartData,
} from "@/components/AdminDashboard/GmvChartCard";
import RecentActivities, {
  recentActivities,
} from "@/components/AdminDashboard/RecentActivities";
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
  HiOutlineShoppingBag,
  HiOutlineUser,
  HiOutlineUserGroup,
} from "react-icons/hi2";

type SnapshotMetric = {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number;
  trend?: "up" | "down" | "neutral";
  icon: IconType;
  accentColor?: "blue" | "green" | "red" | "yellow" | "purple" | "cyan";
};


const platformSnapshotMetrics: SnapshotMetric[] = [
  {
    title: "Total Revenue (MTD)",
    value: 1420500,
    percentage: 12.4,
    trend: "up",
    icon: HiOutlineChartBar,
    accentColor: "blue",
    subtitle: "vs last month",
  },
  {
    title: "Total Bookings (Today)",
    value: 1840,
    percentage: 4.2,
    trend: "up",
    icon: HiOutlineShoppingBag,
    accentColor: "purple",
    subtitle: "as of 10:00",
  },
  {
    title: "Active Vendors",
    value: 312,
    percentage: 3.1,
    trend: "up",
    icon: HiOutlineUserGroup,
    accentColor: "green",
    subtitle: "live vendors",
  },
  {
    title: "New Users (Today)",
    value: 186,
    percentage: 2.3,
    trend: "down",
    icon: HiOutlineUser,
    accentColor: "red",
    subtitle: "vs yesterday",
  },

  // ✅ New StatsCard
  {
    title: "Conversion Rate (Today)",
    value: "3.8%",
    percentage: 0.6,
    trend: "up",
    icon: HiOutlineArrowTrendingUp,
    accentColor: "cyan",
    subtitle: "views to bookings",
  },
];


const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <AdminDashboardSkeleton />;

  return (
    <div className="min-h-screen  pb-12 text-slate-900">
      <DashboardContainer className="space-y-6">
        <TitleBreadCrumbs
          title="Admin Dashboard"
          breadCrumbTitle="Admin / Dashboard"
        />

        <DashboardSection>
          <DashboardGrid columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                data={bookingsData}
                height={260}
                primaryColor="#2563EB"
                secondaryColor="#F97316"
                primaryLabel="Current Week"
                secondaryLabel="Last Week"
                showLegend
                showPeriodSelect={false}
                className="h-full"
              />
            </DashboardCol>
            <DashboardCol span={3}>
              <LeadPlanSubscribersCard />
            </DashboardCol>
            <DashboardCol span={3}>
              <LeadSourceDistributionCard />
            </DashboardCol>
            <DashboardCol span={6}>
              <Mapcity />
            </DashboardCol>
            <DashboardCol span={6}>
              <VendorsOverview />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={12}>
              <RecentActivities
                title="Recent activity"
                activities={recentActivities}
              />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <GmvCard
                title="GMV today"
                value={124560}
                percentage={1.01}
                periodLabel="last month"
                trend="up"
                showChart
                chartData={gmvChartData}
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
              <PendingPayoutsCard />
            </DashboardCol>
            <DashboardCol span={6}>
              <RefundRequestsCard />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <KycPendingCard />
            </DashboardCol>
            <DashboardCol span={6}>
              <VendorApplicationsCard />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>
      </DashboardContainer>
    </div>
  );
};

export default AdminDashboard;
