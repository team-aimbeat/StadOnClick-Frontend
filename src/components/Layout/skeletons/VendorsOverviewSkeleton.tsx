import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const VendorsOverviewSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <Skeleton className={`h-4 w-28 mb-4 ${shimmer}`} />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white"
          >
            <Skeleton className={`w-12 h-12 rounded-full ${shimmer}`} />
            <div className="space-y-2">
              <Skeleton className={`h-3 w-20 ${shimmer}`} />
              <div className="flex items-baseline gap-2">
                <Skeleton className={`h-5 w-10 ${shimmer}`} />
                <Skeleton className={`h-3 w-12 ${shimmer}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorsOverviewSkeleton;
