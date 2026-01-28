import { Skeleton } from "@/components/ui/skeleton";
import { DashboardContainer } from "@/components/dashboard";

const VendorWalletSkeleton = () => {
  return (
    <DashboardContainer className="space-y-8 pb-12">
      {/* Header Skeleton */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32 bg-slate-100" />
          <Skeleton className="h-8 w-64 bg-slate-100" />
        </div>
        <Skeleton className="h-8 w-32 bg-slate-50 rounded-lg border border-slate-100" />
      </div>

      {/* Metric Tiles Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-slate-100" />
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-5 w-8 bg-slate-100" />
              <Skeleton className="h-10 w-32 bg-slate-100" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl bg-slate-100" />
        </div>

        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-28 bg-slate-100" />
              <Skeleton className="h-4 w-4 rounded-full bg-slate-100" />
            </div>
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-4 w-6 bg-slate-100" />
              <Skeleton className="h-8 w-24 bg-slate-100" />
            </div>
            <Skeleton className="h-3 w-32 bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Ledger Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Skeleton className="h-6 w-1.5 rounded-full bg-slate-100" />
          <Skeleton className="h-4 w-32 bg-slate-100" />
        </div>

        <div className="rounded-2xl border border-slate-100 overflow-hidden">
          <div className="h-12 bg-slate-50/50 border-b border-slate-100" />
          <div className="p-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-5 border-b border-slate-50 last:border-0">
                <Skeleton className="h-4 w-24 bg-slate-50" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-slate-50" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40 bg-slate-50" />
                    <Skeleton className="h-2 w-24 bg-slate-50" />
                  </div>
                </div>
                <Skeleton className="h-5 w-28 bg-slate-50" />
                <Skeleton className="h-4 w-32 bg-slate-50" />
                <Skeleton className="h-6 w-20 rounded-full bg-slate-50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorWalletSkeleton;
