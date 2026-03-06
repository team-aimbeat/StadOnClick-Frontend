import { DashboardContainer } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const AuditRowSkeleton = () => (
  <div className="grid grid-cols-[110px_140px_120px_100px_minmax(220px,1fr)] items-center gap-4 px-6 py-5">
    <Skeleton className="h-4 w-16 bg-slate-100" />
    <Skeleton className="h-4 w-24 bg-slate-100" />
    <Skeleton className="mx-auto h-7 w-20 rounded-full bg-slate-100" />
    <Skeleton className="h-4 w-16 bg-slate-100" />
    <Skeleton className="h-4 w-48 bg-slate-100" />
  </div>
);

const VendorPayoutsSkeleton = () => {
  return (
    <DashboardContainer className="space-y-8 pb-12">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-slate-100" />
        <Skeleton className="h-9 w-64 bg-slate-100" />
        <Skeleton className="h-4 w-44 bg-slate-100" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8">
          <Skeleton className="h-3 w-32 bg-slate-100" />
          <div className="mt-4 flex items-end gap-2">
            <Skeleton className="h-4 w-8 bg-slate-100" />
            <Skeleton className="h-12 w-32 bg-slate-100" />
          </div>
          <Skeleton className="mt-3 h-3 w-40 bg-slate-100" />
          <Skeleton className="mt-8 h-12 w-full rounded-2xl bg-slate-100" />
          <Skeleton className="mt-3 h-11 w-full rounded-2xl bg-slate-100" />
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Skeleton className="h-4 w-28 bg-slate-100" />
            <Skeleton className="mt-2 h-3 w-full bg-slate-100" />
            <Skeleton className="mt-4 h-4 w-32 bg-slate-100" />
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-44 bg-slate-100" />
                <Skeleton className="h-3 w-24 bg-slate-100" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full bg-slate-100" />
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Skeleton className="h-16 flex-1 rounded-[1.5rem] bg-slate-100" />
              <Skeleton className="h-16 w-full rounded-[1.5rem] bg-slate-100 sm:w-44" />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <Skeleton className="h-3 w-44 bg-slate-100" />
              <Skeleton className="h-4 w-16 bg-slate-100" />
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 bg-slate-100" />
                <Skeleton className="h-3 w-24 bg-slate-100" />
              </div>
              <Skeleton className="h-4 w-24 bg-slate-100" />
            </div>
            <div className="flex flex-col gap-3 border-b border-slate-200 px-6 pt-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-5 w-16 bg-slate-100" />
                ))}
              </div>
              <Skeleton className="mb-3 h-3 w-28 bg-slate-100" />
            </div>

            <div className="grid grid-cols-[110px_140px_120px_100px_minmax(220px,1fr)] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
              <Skeleton className="h-3 w-20 bg-slate-200" />
              <Skeleton className="h-3 w-16 bg-slate-200" />
              <Skeleton className="mx-auto h-3 w-14 bg-slate-200" />
              <Skeleton className="h-3 w-14 bg-slate-200" />
              <Skeleton className="h-3 w-20 bg-slate-200" />
            </div>

            <div className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, index) => (
                <AuditRowSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default VendorPayoutsSkeleton;
