import BreadcrumbSkeleton from "@/components/skeletons/BreadcrumbSkeleton";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import RecentActivitiesSkeleton from "@/components/skeletons/RecentActivitiesSkeleton";

const KycSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <BreadcrumbSkeleton />

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      <div className="grid lg:grid-cols-1 gap-4 ">
        <RecentActivitiesSkeleton />
      </div>

    </div>
  );
};

export default KycSkeleton;
