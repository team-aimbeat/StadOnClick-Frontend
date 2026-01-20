import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const StatCardSkeleton = () => {
  return (
    <div className="relative flex h-full w-full flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className={`h-4 w-28 ${shimmer}`} />
          <Skeleton className={`h-10 w-10 rounded-full ${shimmer}`} />
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <Skeleton className={`h-8 w-24 ${shimmer}`} />
            <Skeleton className={`h-5 w-16 rounded-full ${shimmer}`} />
          </div>
        </div>

        <Skeleton className={`h-3 w-32 ${shimmer}`} />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[2px] animate-pulse rounded-b-lg bg-slate-200/80" />
    </div>
  );
};

export default StatCardSkeleton;
