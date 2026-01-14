import { IconType } from "react-icons";
import {
  HiMiniUsers,
  HiOutlineArrowSmallDown,
  HiOutlineArrowSmallUp,
  HiOutlineMinusSmall,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { JSX } from "react";
import { FaChevronCircleDown, FaChevronCircleUp } from "react-icons/fa";

type Trend = "up" | "down" | "neutral";
type AccentColor = "blue" | "green" | "red" | "yellow" | "purple" | "cyan";

type StatCardProps = {
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
    blue: "from-[#EAF4FF] to-[#FEFFFF]",
    cyan: "from-[#EAFBFF] to-[#FEFFFF]",
    green: "from-[#E9F7EF] to-[#FEFFFF]",
    red: "from-[#FFEDEF] to-[#FEFFFF]",
    yellow: "from-[#FFF8E6] to-[#FEFFFF]",
    purple: "from-[#F4EDFF] to-[#FEFFFF]",
  };

  const iconBgMap: Record<AccentColor, string> = {
    blue: "bg-sky-500 text-white",
    cyan: "bg-cyan-500 text-white",
    green: "bg-emerald-500 text-white",
    red: "bg-rose-500 text-white",
    yellow: "bg-amber-500 text-white",
    purple: "bg-purple-500 text-white",
  };

  const trendBadgeClass: Record<Trend, string> = {
    up: "text-emerald-600",
    down: "text-rose-600",
    neutral: "text-slate-500",
  };

  const trendIcon: Record<Trend, JSX.Element> = {
    up: <FaChevronCircleUp className="h-4 w-4" aria-hidden />,
    down: <FaChevronCircleDown  className="h-4 w-4" aria-hidden />,
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
        "flex h-full flex-col rounded border border-slate-200 bg-gradient-to-r p-4 text-slate-700 ",
        gradientMap[accentColor],
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1 leading-tight">
          <p className="text-base font-semibold text-slate-800">{title}</p>
          <p className="text-3xl font-semibold text-slate-900">
            {displayValue}
          </p>
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border border-white/80 shadow-md",
              iconBgMap[accentColor]
            )}
          >
            <Icon className="h-6 w-6" aria-hidden />
          </div>
        )}
      </div>

      {(formattedChange || subtitle) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {formattedChange && (
            <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", trendBadgeClass[trend])}>
              {showTrendIcon && trendIcon[trend]}
              <span>{formattedChange}</span>
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
