import BreadcrumbSkeleton from "@/components/Layout/skeletons/BreadcrumbSkeleton";
import StatCardSkeleton from "@/components/Layout/skeletons/StatCardSkeleton";
import ChartCardSkeleton from "@/components/Layout/skeletons/ChartCardSkeleton";
import RecentActivitiesSkeleton from "@/components/Layout/skeletons/RecentActivitiesSkeleton";
import MapcitySkeleton from "@/components/Layout/skeletons/MapcitySkeleton";
import GmvCardSkeleton from "@/components/Layout/skeletons/GmvCardSkeleton";
import CustomerAcquisitionCardSkeleton from "@/components/Layout/skeletons/CustomerAcquisitionCardSkeleton";
import VendorsOverviewSkeleton from "@/components/Layout/skeletons/VendorsOverviewSkeleton";
import AIAlertInsightsSkeleton from "@/components/Layout/skeletons/AIAlertInsightsSkeleton";
import NewSubscriptionsCardSkeleton from "@/components/Layout/skeletons/NewSubscriptionsCardSkeleton";

const AdminDashboardSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <BreadcrumbSkeleton />

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCardSkeleton />
        <div className="grid gap-6">
          <RecentActivitiesSkeleton />
        </div>
      </div>

      <div>
        <MapcitySkeleton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <GmvCardSkeleton />
        <CustomerAcquisitionCardSkeleton />
        <VendorsOverviewSkeleton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <AIAlertInsightsSkeleton />
        <NewSubscriptionsCardSkeleton />
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
