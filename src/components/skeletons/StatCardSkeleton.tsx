import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const StatCardSkeleton = () => {
  return (
    <div className="relative w-[300px] min-w-[200px] rounded-xl border border-gray-200 bg-white p-3 shadow-[0_1px_8px_0_rgba(83,85,155,0.16)]">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className={`h-4 w-24 ${shimmer}`} />
          <Skeleton className={`h-8 w-8 rounded-lg ${shimmer}`} />
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <Skeleton className={`h-8 w-20 ${shimmer}`} />
            <Skeleton className={`h-5 w-14 rounded-full ${shimmer}`} />
          </div>
        </div>

        <Skeleton className={`h-3 w-28 ${shimmer}`} />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-xl bg-slate-200/80 animate-pulse" />
    </div>
  );
};

export default StatCardSkeleton;
