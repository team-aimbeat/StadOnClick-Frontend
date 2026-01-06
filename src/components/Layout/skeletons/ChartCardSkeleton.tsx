import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const ChartCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Skeleton className={`h-5 w-32 ${shimmer}`} />
          <div className="flex items-baseline gap-2 mt-2">
            <Skeleton className={`h-7 w-24 ${shimmer}`} />
            <Skeleton className={`h-6 w-24 rounded-full ${shimmer}`} />
          </div>
        </div>
        <Skeleton className={`h-9 w-28 rounded-lg ${shimmer}`} />
      </div>

      <div className="relative flex items-end justify-between" style={{ height: 180 }}>
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 0.25, 0.5, 0.75, 1].map((percent) => (
            <div
              key={percent}
              className="border-t border-gray-200 dark:border-gray-800"
              style={{ bottom: `${percent * 100}%` }}
            />
          ))}
        </div>

        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center relative"
            style={{ width: `${100 / 12}%` }}
          >
            <div className="flex items-end" style={{ gap: "6px" }}>
              <Skeleton
                className={`w-[14px] rounded-t-md ${shimmer}`}
                style={{ height: `${40 + (index % 5) * 12}px` }}
              />
              <Skeleton
                className={`w-[14px] rounded-t-md ${shimmer}`}
                style={{ height: `${30 + (index % 6) * 10}px` }}
              />
            </div>
            <Skeleton className={`mt-3 h-3 w-4 ${shimmer}`} />
          </div>
        ))}
      </div>

      <div className="flex items-center mt-10 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className={`w-3 h-3 rounded-xl ${shimmer}`} />
          <Skeleton className={`h-3 w-20 ${shimmer}`} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className={`w-3 h-3 rounded-xl ${shimmer}`} />
          <Skeleton className={`h-3 w-24 ${shimmer}`} />
        </div>
      </div>
    </div>
  );
};

export default ChartCardSkeleton;
