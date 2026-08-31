import { IconType } from "react-icons";
import {
  HiMiniUsers,
  HiOutlineArrowSmallDown,
  HiOutlineArrowSmallUp,
  HiOutlineMinusSmall,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { JSX } from "react";

export type Trend = "up" | "down" | "neutral";
export type AccentColor = "blue" | "green" | "red" | "yellow" | "purple" | "cyan";

export type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  /**
   * Use `percentage` when the delta is a percent, or `changeValue` when you need a raw number (e.g. +5,000).
   */
  percentage?: number;
  changeValue?: string | number;
  trend?: Trend;
  icon?: IconType;
  accentColor?: AccentColor;
  className?: string;
  showTrendIcon?: boolean;
};

export default function StatsCard({
  title,
  value,
  subtitle,
  percentage,
  changeValue,
  trend = "neutral",
  icon: Icon = HiMiniUsers,
  accentColor = "cyan",
  className,
  showTrendIcon = true,
}: StatCardProps) {
  const gradientMap: Record<AccentColor, string> = {
    blue: "from-[#eaf2ff] to-[#eef4ff] text-[#3554e0]",
    cyan: "from-[#eaf8ff] to-[#eefcff] text-[#0f7ed2]",
    green: "from-[#eaf8ef] to-[#f0fff5] text-[#1fb56a]",
    red: "from-[#fff0f0] to-[#fff7f7] text-[#e25353]",
    yellow: "from-[#fff7e6] to-[#fffdf0] text-[#e0a100]",
    purple: "from-[#f2efff] to-[#f7f5ff] text-[#6f63ee]",
  };

  const iconBgMap: Record<AccentColor, string> = {
    blue: "bg-[#eaf2ff] text-[#3554e0]",
    cyan: "bg-[#eaf8ff] text-[#0f7ed2]",
    green: "bg-[#eaf8ef] text-[#1fb56a]",
    red: "bg-[#fff0f0] text-[#e25353]",
    yellow: "bg-[#fff7e6] text-[#e0a100]",
    purple: "bg-[#f2efff] text-[#6f63ee]",
  };

  const trendBadgeClass: Record<Trend, string> = {
    up: "bg-emerald-50 text-emerald-600",
    down: "bg-rose-50 text-rose-600",
    neutral: "bg-slate-100 text-slate-500",
  };

  const trendIcon: Record<Trend, JSX.Element> = {
    up: <HiOutlineArrowSmallUp className="h-4 w-4" aria-hidden />,
    down: <HiOutlineArrowSmallDown className="h-4 w-4" aria-hidden />,
    neutral: <HiOutlineMinusSmall className="h-4 w-4" aria-hidden />,
  };

  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  const trendPrefix = trend === "up" ? "+" : trend === "down" ? "-" : "";
  const changeIsStringWithSign =
    typeof changeValue === "string" && /^[+-]/.test(changeValue.trim());
  const formattedChange =
    changeValue !== undefined
      ? `${changeIsStringWithSign ? "" : trendPrefix}${
          typeof changeValue === "number"
            ? Math.abs(changeValue).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : changeValue
        }`
      : percentage !== undefined
      ? `${trendPrefix}${Math.abs(percentage)}%`
      : undefined;

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg hover:scale-105 transition-all duration-200 border border-slate-200 bg-gradient-to-r p-4 text-slate-700",
        gradientMap[accentColor],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            {title}
          </p>
          <p className="text-[28px] font-bold text-slate-900">{displayValue}</p>
        </div>
        {Icon && (
          <div className={cn("rounded-xl p-2", iconBgMap[accentColor])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        {formattedChange ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              trendBadgeClass[trend]
            )}
          >
            {showTrendIcon && trendIcon[trend]}
            <span>{formattedChange}</span>
          </span>
        ) : (
          <span />
        )}
        {subtitle ? <p className="text-xs font-medium text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
