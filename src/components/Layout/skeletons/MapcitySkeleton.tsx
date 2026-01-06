import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const MapcitySkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className={`h-4 w-28 ${shimmer}`} />
        <Skeleton className={`h-4 w-24 ${shimmer}`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className={`w-3 h-3 rounded-full ${shimmer}`} />
                  <Skeleton className={`h-3 w-20 ${shimmer}`} />
                </div>
                <Skeleton className={`h-3 w-10 ${shimmer}`} />
              </div>
              <Skeleton className={`h-2 w-full rounded-full ${shimmer}`} />
            </div>
          ))}
        </div>

        <Skeleton className={`h-[240px] rounded-lg ${shimmer}`} />
      </div>
    </div>
  );
};

export default MapcitySkeleton;
