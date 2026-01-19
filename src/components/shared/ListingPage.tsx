import { ReactNode } from "react";
import { IconType } from "react-icons";

import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import StatsCard from "@/components/shared/StatsCard";
import { DataTable, DataTableProps } from "@/components/shared/DataTable";

type AccentColor = "blue" | "green" | "red" | "yellow" | "purple" | "cyan";
type Trend = "up" | "down" | "neutral";

export type StatsCardConfig = {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number;
  changeValue?: string | number;
  trend?: Trend;
  icon?: IconType;
  accentColor?: AccentColor;
  className?: string;
  showTrendIcon?: boolean;
};

export type ListingSummary = {
  left?: string;
  right?: string;
};

type ListingPageProps = {
  title: string;
  breadCrumbTitle: string;
  description?: string;
  stats?: StatsCardConfig[];
  summary?: ListingSummary;
  tableProps: DataTableProps;
  className?: string;
  headerSlot?: ReactNode;
  summarySlot?: ReactNode;
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
}: ListingPageProps) {
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

      <DataTable {...tableProps} />
    </DashboardContainer>
  );
}
