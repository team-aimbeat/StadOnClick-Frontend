import { Skeleton } from "@/components/ui/skeleton";
import { DashboardContainer } from "@/components/dashboard";

const AdminPayoutsSkeleton = () => {
  return (
    <DashboardContainer className="space-y-8 pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32 bg-slate-100" />
          <Skeleton className="h-8 w-64 bg-slate-100" />
        </div>
        <Skeleton className="h-10 w-40 bg-slate-100 rounded-lg" />
      </div>

      {/* Summary Metrics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28 bg-slate-100" />
              <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
            </div>
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-4 w-8 bg-slate-100" />
              <Skeleton className="h-10 w-32 bg-slate-100" />
            </div>
            <Skeleton className="h-3 w-40 bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-lg w-fit">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md bg-slate-100" />
        ))}
      </div>

      {/* Ledger Skeleton */}
      <div className="space-y-6">
        <div className="rounded-lg border border-slate-100 overflow-hidden">
          <div className="h-12 bg-slate-50/50 border-b border-slate-100" />
          <div className="p-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-5 border-b border-slate-50 last:border-0">
                <div className="flex gap-3">
                   <Skeleton className="h-10 w-10 rounded-lg bg-slate-100" />
                   <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-slate-100" />
                      <Skeleton className="h-3 w-48 bg-slate-100" />
                   </div>
                </div>
                <Skeleton className="h-6 w-24 bg-slate-100" />
                <Skeleton className="h-6 w-20 bg-slate-100 rounded-full" />
                <Skeleton className="h-4 w-32 bg-slate-100" />
                <Skeleton className="h-8 w-24 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminPayoutsSkeleton;
