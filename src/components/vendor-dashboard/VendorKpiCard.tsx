import { IconType } from "react-icons";
import { JSX } from "react";
import {
  HiArrowTrendingDown,
  HiArrowTrendingUp,
  HiMinusSmall,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "flat";

type VendorKpiCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType;
  accent?: "blue" | "green" | "red" | "amber" | "indigo" | "slate";
  badgeLabel?: string;
  badgeTone?: "success" | "danger" | "info";
  trend?: Trend;
  trendLabel?: string;
};

const accentMap = {
  blue: { bg: "bg-blue-100 text-blue-700", ring: "ring-blue-100" },
  green: { bg: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-100" },
  red: { bg: "bg-rose-100 text-rose-700", ring: "ring-rose-100" },
  amber: { bg: "bg-amber-100 text-amber-700", ring: "ring-amber-100" },
  indigo: { bg: "bg-indigo-100 text-indigo-700", ring: "ring-indigo-100" },
  slate: { bg: "bg-slate-100 text-slate-700", ring: "ring-slate-100" },
};

const badgeToneMap: Record<NonNullable<VendorKpiCardProps["badgeTone"]>, string> =
  {
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-sky-100 text-sky-700",
  };

const trendIconMap: Record<Trend, JSX.Element> = {
  up: <HiArrowTrendingUp className="h-4 w-4" aria-hidden />,
  down: <HiArrowTrendingDown className="h-4 w-4" aria-hidden />,
  flat: <HiMinusSmall className="h-4 w-4" aria-hidden />,
};

export default function VendorKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "slate",
  badgeLabel,
  badgeTone = "info",
  trend = "flat",
  trendLabel,
}: VendorKpiCardProps) {
  const accentClasses = accentMap[accent];
  const formattedValue = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div className="flex h-full min-h-[132px] items-stretch justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
      <div className="flex flex-1 flex-col justify-between space-y-2 pr-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-700">{title}</p>
          {badgeLabel ? (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                badgeToneMap[badgeTone]
              )}
            >
              {badgeLabel}
            </span>
          ) : null}
        </div>
        <p className="text-[26px] font-bold leading-8 tracking-tight text-slate-900">
          {formattedValue}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {trendLabel ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
              {trendIconMap[trend]}
              {trendLabel}
            </span>
          ) : null}
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
      </div>
      <div className="flex items-center pl-3">
        <div className="h-full border-l border-slate-200" aria-hidden />
        <div
          className={cn(
            "ml-3 flex h-12 w-12 items-center justify-center rounded-full ring-8",
            accentClasses.bg,
            accentClasses.ring
          )}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      </div>
    </div>
  );
}
