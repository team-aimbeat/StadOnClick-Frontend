import { DashboardContainer } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const SummaryCardSkeleton = () => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-28 bg-slate-100" />
      <Skeleton className="h-8 w-8 rounded-xl bg-slate-100" />
    </div>
    <div className="mt-4 flex items-end gap-2">
      <Skeleton className="h-4 w-8 bg-slate-100" />
      <Skeleton className="h-10 w-32 bg-slate-100" />
    </div>
    <Skeleton className="mt-3 h-3 w-36 bg-slate-100" />
  </div>
);

const PayoutRowSkeleton = ({ action = false }: { action?: boolean }) => (
  <div className="grid grid-cols-[110px_minmax(240px,1.3fr)_120px_130px_150px_120px] items-center gap-4 px-6 py-5">
    <Skeleton className="h-4 w-16 bg-slate-100" />
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-2xl bg-slate-100" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-44 bg-slate-100" />
        <Skeleton className="h-3 w-32 bg-slate-100" />
      </div>
    </div>
    <Skeleton className="ml-auto h-5 w-24 bg-slate-100" />
    <Skeleton className="mx-auto h-7 w-20 rounded-full bg-slate-100" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-24 bg-slate-100" />
      <Skeleton className="h-3 w-16 bg-slate-100" />
    </div>
    {action ? (
      <Skeleton className="justify-self-end h-10 w-24 rounded-xl bg-slate-100" />
    ) : (
      <Skeleton className="justify-self-end h-4 w-16 bg-slate-100" />
    )}
  </div>
);

const AdminPayoutsSkeleton = () => {
  return (
    <DashboardContainer className="space-y-8 pb-12">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-slate-100" />
          <Skeleton className="h-9 w-60 bg-slate-100" />
          <Skeleton className="h-4 w-44 bg-slate-100" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl bg-slate-100" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SummaryCardSkeleton key={index} />
        ))}
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 bg-slate-100" />
            <Skeleton className="h-4 w-56 bg-slate-100" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl bg-slate-100" />
        </div>
        <Skeleton className="mt-5 h-4 w-28 bg-slate-100" />
        <Skeleton className="mt-3 h-12 w-48 bg-slate-100" />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Skeleton className="h-3 w-16 bg-slate-200" />
            <Skeleton className="mt-3 h-8 w-28 bg-slate-100" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Skeleton className="h-3 w-16 bg-slate-200" />
            <Skeleton className="mt-3 h-8 w-28 bg-slate-100" />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Skeleton className="h-7 w-32 rounded-full bg-slate-100" />
          <Skeleton className="h-3 w-28 bg-slate-100" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-1 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-16 bg-slate-100" />
            ))}
          </div>
          <Skeleton className="h-3 w-28 bg-slate-100" />
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div className="space-y-2">
              <Skeleton className="h-7 w-44 bg-slate-100" />
              <Skeleton className="h-4 w-28 bg-slate-100" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28 rounded-xl bg-slate-100" />
              <Skeleton className="h-10 w-24 rounded-xl bg-slate-100" />
              <Skeleton className="h-10 w-20 rounded-xl bg-slate-100" />
            </div>
          </div>

          <div className="grid grid-cols-[110px_minmax(240px,1.3fr)_120px_130px_150px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
            <Skeleton className="h-3 w-20 bg-slate-200" />
            <Skeleton className="h-3 w-16 bg-slate-200" />
            <Skeleton className="ml-auto h-3 w-16 bg-slate-200" />
            <Skeleton className="mx-auto h-3 w-14 bg-slate-200" />
            <Skeleton className="h-3 w-18 bg-slate-200" />
            <Skeleton className="ml-auto h-3 w-12 bg-slate-200" />
          </div>

          <div className="divide-y divide-slate-100">
            {Array.from({ length: 7 }).map((_, index) => (
              <PayoutRowSkeleton key={index} action={index < 2} />
            ))}
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminPayoutsSkeleton;
