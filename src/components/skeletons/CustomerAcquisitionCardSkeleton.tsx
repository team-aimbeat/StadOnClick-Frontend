import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const CustomerAcquisitionCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className={`h-4 w-40 ${shimmer}`} />
        <Skeleton className={`h-6 w-20 rounded-full ${shimmer}`} />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <div className="flex items-end gap-3 mb-4">
            <Skeleton className={`h-8 w-16 ${shimmer}`} />
            <Skeleton className={`h-6 w-16 rounded-full ${shimmer}`} />
            <Skeleton className={`h-3 w-24 ${shimmer}`} />
          </div>
          <Skeleton className={`h-[220px] w-full rounded-md ${shimmer}`} />
        </div>

        <div className="col-span-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-xl p-4 text-center">
              <Skeleton className={`h-5 w-12 mx-auto ${shimmer}`} />
              <Skeleton className={`h-3 w-20 mx-auto mt-2 ${shimmer}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerAcquisitionCardSkeleton;
