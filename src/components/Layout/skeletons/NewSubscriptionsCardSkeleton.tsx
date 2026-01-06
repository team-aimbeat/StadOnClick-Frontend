import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const NewSubscriptionsCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm h-[250px] w-[350px]">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className={`h-3 w-24 ${shimmer}`} />
        <Skeleton className={`h-3 w-16 ${shimmer}`} />
      </div>

      <div className="flex items-end gap-2 mb-2">
        <Skeleton className={`h-7 w-16 ${shimmer}`} />
        <Skeleton className={`h-5 w-12 rounded-full ${shimmer}`} />
      </div>

      <div className="h-[150px]">
        <Skeleton className={`h-full w-full rounded-md ${shimmer}`} />
      </div>
    </div>
  );
};

export default NewSubscriptionsCardSkeleton;
