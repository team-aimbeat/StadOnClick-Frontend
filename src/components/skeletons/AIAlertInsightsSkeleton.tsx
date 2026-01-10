import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const AIAlertInsightsSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
      <div>
        <Skeleton className={`h-4 w-32 ${shimmer}`} />
        <Skeleton className={`h-3 w-40 mt-2 ${shimmer}`} />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-slate-200/80 animate-pulse" />
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <Skeleton className={`w-8 h-8 rounded-full ${shimmer}`} />
                <div>
                  <Skeleton className={`h-4 w-36 ${shimmer}`} />
                  <Skeleton className={`h-3 w-48 mt-2 ${shimmer}`} />
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Skeleton className={`h-5 w-12 rounded-lg ${shimmer}`} />
                    <Skeleton className={`h-5 w-20 rounded-lg ${shimmer}`} />
                    <Skeleton className={`h-5 w-16 rounded-lg ${shimmer}`} />
                  </div>
                </div>
              </div>
              <Skeleton className={`h-3 w-10 ${shimmer}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIAlertInsightsSkeleton;
