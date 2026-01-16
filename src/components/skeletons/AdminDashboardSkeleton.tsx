import {
  DashboardCol,
  DashboardContainer,
  DashboardGrid,
  DashboardSection,
} from "@/components/dashboard";
import BreadcrumbSkeleton from "@/components/skeletons/BreadcrumbSkeleton";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import ChartCardSkeleton from "@/components/skeletons/ChartCardSkeleton";
import RecentActivitiesSkeleton from "@/components/skeletons/RecentActivitiesSkeleton";
import GmvCardSkeleton from "@/components/skeletons/GmvCardSkeleton";
import CustomerAcquisitionCardSkeleton from "@/components/skeletons/CustomerAcquisitionCardSkeleton";
import VendorsOverviewSkeleton from "@/components/skeletons/VendorsOverviewSkeleton";
import AIAlertInsightsSkeleton from "@/components/skeletons/AIAlertInsightsSkeleton";
import NewSubscriptionsCardSkeleton from "@/components/skeletons/NewSubscriptionsCardSkeleton";

const AdminDashboardSkeleton = () => {
  return (
    <div className="bg-slate-50 pb-10">
      <DashboardContainer className="space-y-8 pt-4">
        <BreadcrumbSkeleton />

        <DashboardSection>
          <DashboardGrid>
            {Array.from({ length: 4 }).map((_, index) => (
              <DashboardCol key={index} span={3}>
                <StatCardSkeleton />
              </DashboardCol>
            ))}
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={12}>
              <ChartCardSkeleton />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={12}>
              <RecentActivitiesSkeleton />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={4}>
              <GmvCardSkeleton />
            </DashboardCol>
            <DashboardCol span={4}>
              <CustomerAcquisitionCardSkeleton />
            </DashboardCol>
            <DashboardCol span={4}>
              <VendorsOverviewSkeleton />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <AIAlertInsightsSkeleton />
            </DashboardCol>
            <DashboardCol span={6}>
              <NewSubscriptionsCardSkeleton />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <div className="h-full rounded border border-slate-200 bg-white p-6">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </DashboardCol>
            <DashboardCol span={6}>
              <div className="h-full rounded border border-slate-200 bg-white p-6">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <div className="h-full rounded border border-slate-200 bg-white p-6">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </DashboardCol>
            <DashboardCol span={6}>
              <div className="h-full rounded border border-slate-200 bg-white p-6">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>
      </DashboardContainer>
    </div>
  );
};

export default AdminDashboardSkeleton;
