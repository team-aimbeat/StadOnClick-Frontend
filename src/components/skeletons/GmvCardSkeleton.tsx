import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const GmvCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className={`h-4 w-24 ${shimmer}`} />
          <Skeleton className={`h-10 w-10 rounded-lg ${shimmer}`} />
        </div>

        <div className="mb-2">
          <Skeleton className={`h-7 w-28 ${shimmer}`} />
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className={`h-6 w-6 rounded-full ${shimmer}`} />
            <Skeleton className={`h-4 w-24 ${shimmer}`} />
          </div>
        </div>

        <div className="mt-auto" style={{ width: "100%", height: 60 }}>
          <Skeleton className={`h-full w-full rounded-md ${shimmer}`} />
        </div>
      </div>
    </div>
  );
};

export default GmvCardSkeleton;
