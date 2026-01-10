import BreadcrumbSkeleton from "@/components/skeletons/BreadcrumbSkeleton";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import ChartCardSkeleton from "@/components/skeletons/ChartCardSkeleton";
import RecentActivitiesSkeleton from "@/components/skeletons/RecentActivitiesSkeleton";
import MapcitySkeleton from "@/components/skeletons/MapcitySkeleton";
import GmvCardSkeleton from "@/components/skeletons/GmvCardSkeleton";
import CustomerAcquisitionCardSkeleton from "@/components/skeletons/CustomerAcquisitionCardSkeleton";
import VendorsOverviewSkeleton from "@/components/skeletons/VendorsOverviewSkeleton";
import AIAlertInsightsSkeleton from "@/components/skeletons/AIAlertInsightsSkeleton";
import NewSubscriptionsCardSkeleton from "@/components/skeletons/NewSubscriptionsCardSkeleton";

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
