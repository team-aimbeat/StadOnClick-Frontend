import { ReactNode } from "react";

// ─── Import component dependencies ──────────────────────────────────────────
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatsCard from "@/components/shared/StatsCard";
import { DataTable } from "@/components/shared/DataTable";

// ─── Import type dependencies ────────────────────────────────────────
import type { DataTableProps } from "@/components/shared/DataTable";
import type { ActionConfig } from "@/types/Table/action";           // if you use actions
// import type { FilterConfig, SortOption } from ...                   // optional

type AccentColor = "blue" | "green" | "red" | "yellow" | "purple" | "cyan";
type Trend = "up" | "down" | "neutral";

type ListingSummary = {
  left?: string;
  right?: string;
};

type ListingPageProps = {
  title: string;
  breadCrumbTitle: string;
  description?: string;
  stats?: any[];
  summary?: ListingSummary;
  tableProps: DataTableProps;
  className?: string;
  headerSlot?: ReactNode;
  summarySlot?: ReactNode;

  // Optional: convenience props (as discussed earlier)
  actions?: ActionConfig[];
  searchable?: boolean;
  selectable?: boolean;
  showSerialNumber?: boolean;
  // filters?: FilterConfig[];              // uncomment if you want
  // sortOptions?: SortOption[];
};

export function ListingPage({
  title,
  breadCrumbTitle,
  description,
  stats = [],
  summary,
  tableProps,
  className = "",
  headerSlot,
  summarySlot,

  // Convenience props (optional)
  actions,
  searchable = true,
  selectable = true,
  showSerialNumber = true,
}: ListingPageProps) {
  // Merge props safely
  const mergedTableProps: DataTableProps = {
    ...tableProps,
    ...(actions !== undefined && { actions }),
    ...(searchable !== undefined && { searchable }),
    ...(selectable !== undefined && { selectable }),
    ...(showSerialNumber !== undefined && { showSerialNumber }),
  };

  return (
    <DashboardContainer className={`space-y-6 pb-10 ${className}`}>
      <div className="space-y-2">
        <TitleBreadCrumbs title={title} breadCrumbTitle={breadCrumbTitle} />
        {description && <p className="text-sm text-slate-600">{description}</p>}
        {headerSlot}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>
      )}

      {summarySlot ??
        (summary && (summary.left || summary.right) ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center gap-2">{summary.left}</span>
            {summary.right && (
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                {summary.right}
              </span>
            )}
          </div>
        ) : null)}

      <DataTable {...mergedTableProps} />
    </DashboardContainer>
  );
}