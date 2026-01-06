import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const BreadcrumbSkeleton = () => {
  return (
    <nav className="flex items-center gap-2">
      <Skeleton className={`h-4 w-16 ${shimmer}`} />
      <Skeleton className={`h-4 w-4 rounded-full ${shimmer}`} />
      <Skeleton className={`h-4 w-24 ${shimmer}`} />
    </nav>
  );
};

export default BreadcrumbSkeleton;
