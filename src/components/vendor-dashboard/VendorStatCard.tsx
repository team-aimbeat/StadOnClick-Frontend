import { IconType } from "react-icons";
import { JSX } from "react";
import {
  HiOutlineArrowTrendingDown,
  HiOutlineArrowTrendingUp,
  HiOutlineMinusSmall,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "neutral";
type AccentColor = "blue" | "green" | "red" | "yellow" | "purple" | "cyan";

type VendorStatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number;
  trend?: Trend;
  icon?: IconType;
  accentColor?: AccentColor;
  meta?: string;
};

const accentBg: Record<AccentColor, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-rose-50 text-rose-700",
  yellow: "bg-amber-50 text-amber-700",
  purple: "bg-purple-50 text-purple-700",
  cyan: "bg-cyan-50 text-cyan-700",
};

const gradientBg: Partial<Record<AccentColor, string>> = {
  blue: "bg-gradient-to-br from-blue-50 to-white",
  purple: "bg-gradient-to-br from-purple-50 to-white",
};

const trendIcon: Record<Trend, JSX.Element> = {
  up: <HiOutlineArrowTrendingUp className="h-4 w-4" aria-hidden />,
  down: <HiOutlineArrowTrendingDown className="h-4 w-4" aria-hidden />,
  neutral: <HiOutlineMinusSmall className="h-4 w-4" aria-hidden />,
};

export default function VendorStatCard({
  title,
  value,
  subtitle,
  percentage,
  trend = "neutral",
  icon: Icon,
  accentColor = "blue",
  meta,
}: VendorStatCardProps) {
  const formattedValue = typeof value === "number" ? value.toLocaleString() : value;
  const delta =
    typeof percentage === "number"
      ? `${trend === "up" ? "+" : trend === "down" ? "-" : ""}${Math.abs(
          percentage
        )}%`
      : undefined;

  return (
    <div
      className={cn(
        "relative flex h-full flex-col justify-between rounded-lg border border-slate-200 p-3",
        gradientBg[accentColor] ?? "bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className="text-2xl font-bold text-slate-900 leading-6">{formattedValue}</p>
          {subtitle ? (
            <p className="text-xs font-medium text-slate-500 truncate">{subtitle}</p>
          ) : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200",
              accentBg[accentColor]
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
              trend === "up" && "bg-emerald-50 text-emerald-700",
              trend === "down" && "bg-rose-50 text-rose-700",
              trend === "neutral" && "bg-slate-100 text-slate-700"
            )}
          >
            {trendIcon[trend]}
            {delta}
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-slate-500">No change</span>
        )}
        {meta ? <span className="text-[11px] text-slate-500">{meta}</span> : null}
      </div>
    </div>
  );
}
