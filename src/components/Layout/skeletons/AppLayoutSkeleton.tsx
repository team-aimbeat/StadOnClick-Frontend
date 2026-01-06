import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const AppLayoutSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className={`h-5 w-32 ${shimmer}`} />
      <Skeleton className={`h-10 w-full rounded-xl ${shimmer}`} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className={`h-40 rounded-xl ${shimmer}`} />
        ))}
      </div>
    </div>
  );
};

export default AppLayoutSkeleton;
