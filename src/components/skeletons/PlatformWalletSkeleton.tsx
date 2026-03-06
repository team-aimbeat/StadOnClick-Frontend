import { Skeleton } from "@/components/ui/skeleton";
import { DashboardContainer } from "@/components/dashboard";

const PlatformWalletSkeleton = () => {
  return (
    <DashboardContainer className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32 bg-slate-100" />
          <Skeleton className="h-8 w-64 bg-slate-100" />
        </div>
        <Skeleton className="h-10 w-40 bg-slate-100 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-100 bg-white p-10 h-full space-y-12">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg bg-slate-100" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-slate-100" />
                <Skeleton className="h-3 w-40 bg-slate-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Skeleton className="h-3 w-24 bg-slate-100" />
                <div className="flex items-baseline gap-3">
                  <Skeleton className="h-8 w-12 bg-slate-100" />
                  <Skeleton className="h-16 w-48 bg-slate-100" />
                </div>
              </div>
              <div className="border-l border-slate-50 pl-12 space-y-6">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-32 bg-slate-100" />
                  <Skeleton className="h-10 w-40 bg-slate-100" />
                </div>
                <div className="pt-4 border-t border-slate-50 space-y-2">
                  <Skeleton className="h-3 w-32 bg-slate-100" />
                  <Skeleton className="h-2 w-48 bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full">
          <div className="rounded-lg border border-slate-100 bg-slate-50/30 p-8 h-full space-y-8">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg bg-slate-100" />
              <Skeleton className="h-4 w-24 bg-slate-100" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-10 w-48 bg-slate-100" />
              <Skeleton className="h-3 w-full bg-slate-100" />
            </div>
            <div className="pt-8 border-t border-slate-100 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16 bg-slate-100" />
                <Skeleton className="h-3 w-8 bg-slate-100" />
              </div>
              <Skeleton className="h-2 w-full rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="finance-card rounded-lg border border-slate-200 bg-white p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-44 bg-slate-100" />
              <Skeleton className="h-10 w-56 bg-slate-100" />
            </div>
            <Skeleton className="h-11 w-11 rounded-full bg-slate-100" />
          </div>
          <Skeleton className="h-3 w-36 bg-slate-100 mb-2" />
          <Skeleton className="h-4 w-72 bg-slate-100 mb-5" />

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <Skeleton className="h-3 w-20 bg-slate-100" />
              <Skeleton className="h-8 w-32 bg-slate-100" />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <Skeleton className="h-3 w-20 bg-slate-100" />
              <Skeleton className="h-8 w-32 bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="finance-card rounded-lg border border-slate-200 bg-white p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-36 bg-slate-100" />
              <Skeleton className="h-4 w-52 bg-slate-100" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md bg-slate-100" />
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 gap-3 px-4 py-3 bg-slate-50">
              <Skeleton className="h-3 w-16 bg-slate-200" />
              <Skeleton className="h-3 w-20 bg-slate-200" />
              <Skeleton className="h-3 w-16 bg-slate-200" />
            </div>
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-3 px-4 py-4 border-t border-slate-200">
                <Skeleton className="h-4 w-28 bg-slate-100" />
                <Skeleton className="h-4 w-24 bg-slate-100" />
                <Skeleton className="h-4 w-20 bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <Skeleton className="h-6 w-1.5 rounded-full bg-slate-100" />
          <Skeleton className="h-5 w-36 bg-slate-100" />
        </div>
        <div className="rounded-lg border border-slate-100 overflow-hidden">
          <div className="h-12 bg-slate-50/50 border-b border-slate-100 px-6 flex items-center">
            <div className="grid grid-cols-4 gap-4 w-full">
              <Skeleton className="h-4 w-24 bg-slate-200" />
              <Skeleton className="h-4 w-28 bg-slate-200" />
              <Skeleton className="h-4 w-24 bg-slate-200" />
              <Skeleton className="h-4 w-20 bg-slate-200 ml-auto" />
            </div>
          </div>
          <div className="p-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-5 border-b border-slate-50 last:border-0">
                <Skeleton className="h-4 w-24 bg-slate-50" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg bg-slate-50" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40 bg-slate-50" />
                    <Skeleton className="h-3 w-32 bg-slate-50" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 bg-slate-50" />
                <Skeleton className="h-4 w-32 bg-slate-50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default PlatformWalletSkeleton;
