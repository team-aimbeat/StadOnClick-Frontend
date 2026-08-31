import {
  DashboardCol,
  DashboardContainer,
  DashboardGrid,
  DashboardSection,
} from "@/components/dashboard";
import BreadcrumbSkeleton from "@/components/skeletons/BreadcrumbSkeleton";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import ChartCardSkeleton from "@/components/skeletons/ChartCardSkeleton";
import RecentActivitiesSkeleton from "@/components/skeletons/RecentActivitiesSkeleton";
import GmvCardSkeleton from "@/components/skeletons/GmvCardSkeleton";
import CustomerAcquisitionCardSkeleton from "@/components/skeletons/CustomerAcquisitionCardSkeleton";
import VendorsOverviewSkeleton from "@/components/skeletons/VendorsOverviewSkeleton";
import AIAlertInsightsSkeleton from "@/components/skeletons/AIAlertInsightsSkeleton";
import MapcitySkeleton from "@/components/skeletons/MapcitySkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const shimmer = "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100";

const HeaderSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className={`h-6 w-48 ${shimmer}`} />
        <Skeleton className={`h-3 w-36 ${shimmer}`} />
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <BreadcrumbSkeleton />
      </div>
    </div>
  );
};

const WelcomeBannerSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-[#f2efe8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <Skeleton className={`h-10 w-full max-w-[520px] ${shimmer}`} />
      <div className="flex items-center gap-3 self-start sm:self-auto">
        <Skeleton className={`h-14 w-14 rounded-full ${shimmer}`} />
        <div className="space-y-2">
          <Skeleton className={`h-4 w-24 ${shimmer}`} />
          <Skeleton className={`h-3 w-20 ${shimmer}`} />
        </div>
      </div>
    </div>
  );
};

const LeadPlanSubscribersSkeleton = () => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5">
      <div className="space-y-1">
        <Skeleton className={`h-4 w-40 ${shimmer}`} />
        <Skeleton className={`h-3 w-24 ${shimmer}`} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Skeleton className={`h-9 w-24 ${shimmer}`} />
        <div className="flex items-center gap-2">
          <Skeleton className={`h-6 w-14 rounded-full ${shimmer}`} />
          <Skeleton className={`h-4 w-20 ${shimmer}`} />
        </div>
      </div>

      <div className="mt-4 flex flex-1 items-end gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton
            key={index}
            className={`flex-1 rounded-md ${shimmer}`}
            style={{ height: 54 + (index % 4) * 12 }}
          />
        ))}
      </div>

      <Skeleton className={`mt-4 h-3 w-32 ${shimmer}`} />
    </div>
  );
};

const LeadSourceDistributionSkeleton = () => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className={`h-4 w-40 ${shimmer}`} />
          <Skeleton className={`h-3 w-24 ${shimmer}`} />
        </div>
        <Skeleton className={`h-8 w-24 rounded-md ${shimmer}`} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative h-40 w-40">
          <Skeleton className={`absolute inset-0 rounded-full ${shimmer}`} />
          <Skeleton className={`absolute inset-6 rounded-full ${shimmer}`} />
        </div>

        <div className="w-full space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className={`h-3 w-3 rounded-sm ${shimmer}`} />
              <Skeleton className={`h-3 w-28 ${shimmer}`} />
              <Skeleton className={`ml-auto h-3 w-10 ${shimmer}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type TableCardSkeletonProps = {
  columns: number;
  columnTemplate: string;
  rows?: number;
  footerWidth?: string;
};

const TableCardSkeleton = ({
  columns,
  columnTemplate,
  rows = 3,
  footerWidth,
}: TableCardSkeletonProps) => {
  const headerCells = Array.from({ length: columns });

  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 space-y-1">
        <Skeleton className={`h-4 w-40 ${shimmer}`} />
        <Skeleton className={`h-3 w-24 ${shimmer}`} />
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-slate-200">
        <div
          className="grid items-center gap-4 bg-slate-50 px-4 py-3"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          {headerCells.map((_, index) => (
            <Skeleton
              key={`header-${index}`}
              className={`h-3 ${shimmer} ${index === 0 ? "w-24" : "w-16"}`}
            />
          ))}
        </div>

        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="grid items-center gap-4 px-4 py-4"
              style={{ gridTemplateColumns: columnTemplate }}
            >
              {headerCells.map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`h-4 ${shimmer} ${
                    colIndex === 0
                      ? "w-28"
                      : colIndex === columns - 1
                      ? "w-14"
                      : "w-20"
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {footerWidth && (
        <Skeleton className={`mt-3 h-3 ${footerWidth} ${shimmer}`} />
      )}
    </div>
  );
};

const AdminDashboardSkeleton = () => {
  return (
    <div className="min-h-screen pb-12 text-slate-900">
      <DashboardContainer className="space-y-6">
        <HeaderSkeleton />
        <WelcomeBannerSkeleton />

        <DashboardSection>
          <DashboardGrid columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <DashboardCol key={index} span={1}>
                <StatCardSkeleton />
              </DashboardCol>
            ))}
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <ChartCardSkeleton />
            </DashboardCol>
            <DashboardCol span={3}>
              <LeadPlanSubscribersSkeleton />
            </DashboardCol>
            <DashboardCol span={3}>
              <LeadSourceDistributionSkeleton />
            </DashboardCol>
            <DashboardCol span={6}>
              <MapcitySkeleton />
            </DashboardCol>
            <DashboardCol span={6}>
              <VendorsOverviewSkeleton />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={12}>
              <RecentActivitiesSkeleton />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <GmvCardSkeleton />
            </DashboardCol>
            <DashboardCol span={6}>
              <CustomerAcquisitionCardSkeleton />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={12}>
              <AIAlertInsightsSkeleton />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <TableCardSkeleton
                columns={4}
                columnTemplate="minmax(200px,1.4fr) minmax(120px,0.8fr) minmax(140px,0.9fr) minmax(120px,0.8fr)"
                rows={2}
                footerWidth="w-32"
              />
            </DashboardCol>
            <DashboardCol span={6}>
              <TableCardSkeleton
                columns={3}
                columnTemplate="minmax(180px,1.2fr) minmax(180px,1.2fr) minmax(120px,0.8fr)"
                rows={2}
              />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>

        <DashboardSection>
          <DashboardGrid>
            <DashboardCol span={6}>
              <TableCardSkeleton
                columns={3}
                columnTemplate="minmax(220px,1.4fr) minmax(180px,1fr) minmax(140px,0.8fr)"
                rows={2}
                footerWidth="w-28"
              />
            </DashboardCol>
            <DashboardCol span={6}>
              <TableCardSkeleton
                columns={3}
                columnTemplate="minmax(220px,1.4fr) minmax(160px,1fr) minmax(140px,0.8fr)"
                rows={2}
              />
            </DashboardCol>
          </DashboardGrid>
        </DashboardSection>
      </DashboardContainer>
    </div>
  );
};

export default AdminDashboardSkeleton;
