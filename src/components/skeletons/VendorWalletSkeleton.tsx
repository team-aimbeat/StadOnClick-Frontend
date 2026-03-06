import { DashboardContainer } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const MetricCardSkeleton = ({ cta = false }: { cta?: boolean }) => (
  <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28 bg-slate-100" />
        <div className="flex items-end gap-2">
          <Skeleton className="h-4 w-10 bg-slate-100" />
          <Skeleton className="h-10 w-28 bg-slate-100" />
        </div>
      </div>
      <Skeleton className="h-8 w-8 rounded-xl bg-slate-100" />
    </div>
    <Skeleton className="mt-4 h-3 w-36 bg-slate-100" />
    {cta && <Skeleton className="mt-6 h-12 w-full rounded-2xl bg-slate-100" />}
  </div>
);

const LedgerRowSkeleton = () => (
  <div className="grid grid-cols-[120px_minmax(240px,1.5fr)_160px_160px_120px] items-center gap-4 px-6 py-5">
    <Skeleton className="h-4 w-16 bg-slate-100" />
    <div className="flex items-center gap-3">
      <Skeleton className="h-11 w-11 rounded-2xl bg-slate-100" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-52 bg-slate-100" />
        <Skeleton className="h-3 w-36 bg-slate-100" />
      </div>
    </div>
    <div className="justify-self-end space-y-2">
      <Skeleton className="ml-auto h-4 w-24 bg-slate-100" />
      <Skeleton className="ml-auto h-3 w-16 bg-slate-100" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24 bg-slate-100" />
      <Skeleton className="h-3 w-16 bg-slate-100" />
    </div>
    <Skeleton className="justify-self-center h-7 w-20 rounded-full bg-slate-100" />
  </div>
);

const VendorWalletSkeleton = () => {
  return (
    <DashboardContainer className="space-y-8 pb-12">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40 bg-slate-100" />
          <Skeleton className="h-9 w-72 bg-slate-100" />
          <Skeleton className="h-4 w-52 bg-slate-100" />
        </div>
        <Skeleton className="h-8 w-36 rounded-full bg-slate-100" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCardSkeleton cta />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-slate-100" />
            <Skeleton className="h-8 w-56 bg-slate-100" />
            <Skeleton className="h-4 w-28 bg-slate-100" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-44 rounded-2xl bg-slate-100" />
            <Skeleton className="h-11 w-28 rounded-2xl bg-slate-100" />
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 bg-slate-100" />
              <Skeleton className="h-4 w-28 bg-slate-100" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-36 rounded-xl bg-slate-100" />
              <Skeleton className="h-10 w-28 rounded-xl bg-slate-100" />
              <Skeleton className="h-10 w-32 rounded-xl bg-slate-100" />
            </div>
          </div>

          <div className="grid grid-cols-[120px_minmax(240px,1.5fr)_160px_160px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
            <Skeleton className="h-3 w-20 bg-slate-200" />
            <Skeleton className="h-3 w-16 bg-slate-200" />
            <Skeleton className="ml-auto h-3 w-20 bg-slate-200" />
            <Skeleton className="h-3 w-20 bg-slate-200" />
            <Skeleton className="mx-auto h-3 w-14 bg-slate-200" />
          </div>

          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, index) => (
              <LedgerRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorWalletSkeleton;
