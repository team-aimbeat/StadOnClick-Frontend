import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const RecentActivitiesSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <Skeleton className={`h-4 w-32 ${shimmer}`} />
        <Skeleton className={`h-6 w-16 ${shimmer}`} />
      </div>

      <div className="px-5 py-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 px-4 py-3 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className={`h-3 w-16 ${shimmer}`} />
            ))}
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="grid grid-cols-5 items-center px-4 py-3 gap-2">
                <Skeleton className={`h-4 w-14 ${shimmer}`} />
                <div className="flex items-center gap-3">
                  <Skeleton className={`h-8 w-8 rounded-full ${shimmer}`} />
                  <Skeleton className={`h-4 w-20 ${shimmer}`} />
                </div>
                <Skeleton className={`h-4 w-20 ${shimmer}`} />
                <Skeleton className={`h-5 w-16 rounded-full ${shimmer}`} />
                <Skeleton className={`h-4 w-12 ${shimmer}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivitiesSkeleton;
