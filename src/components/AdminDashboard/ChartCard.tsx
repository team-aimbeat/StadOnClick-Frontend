import React, { memo } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface BarData {
  day: string;
  value1: number;
  value2: number;
}

interface ChartCardProps {
  title?: string;
  value?: string | number;
  data: BarData[];
  currency?: string;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  showLegend?: boolean;
  showPeriodSelect?: boolean;
  activePeriod?: string;
  periodOptions?: string[];
  onPeriodChange?: (period: string) => void;
  className?: string;
  showGrowth?: boolean;
  growthPercentage?: number;
  growthTrend?: "up" | "down" | "neutral";
  growthText?: string;
  animate?: boolean;
  animationDuration?: number;
  animationEasing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
}

export const bookingsData = [
  { day: "Jan", value1: 18000, value2: 14000 },
  { day: "Feb", value1: 21000, value2: 16000 },
  { day: "Mar", value1: 24000, value2: 18500 },
  { day: "Apr", value1: 27000, value2: 22000 },
  { day: "May", value1: 42000, value2: 31000 },
  { day: "Jun", value1: 19000, value2: 17000 },
  { day: "Jul", value1: 26000, value2: 23000 },
  { day: "Aug", value1: 18000, value2: 14500 },
  { day: "Sep", value1: 25000, value2: 20000 },
  { day: "Oct", value1: 47000, value2: 35000 },
  { day: "Nov", value1: 17000, value2: 12500 },
  { day: "Dec", value1: 21000, value2: 16000 },
];

const ChartCard: React.FC<ChartCardProps> = ({
  title = "Bookings Trend",
  value,
  data = bookingsData,
  currency = "SEK",
  height = 220,
  primaryColor = "#2563EB",
  secondaryColor = "#F97316",
  primaryLabel = "Current Week",
  secondaryLabel = "Last Week",
  showLegend = true,
  showPeriodSelect = true,
  activePeriod = "Week",
  periodOptions = ["Week", "Month", "Year"],
  onPeriodChange,
  className,
  showGrowth = true,
  growthPercentage,
  growthTrend,
  growthText = "vs last period",
  animate = false,
  animationDuration = 0,
  animationEasing = "ease-out",
}) => {
  const totalPrimary = data.reduce((sum, point) => sum + Number(point.value1 || 0), 0);
  const totalSecondary = data.reduce((sum, point) => sum + Number(point.value2 || 0), 0);
  const resolvedValue = value ?? Math.round(totalPrimary).toLocaleString();

  const computedGrowth = (() => {
    if (typeof growthPercentage === "number") {
      const trend =
        growthTrend ?? (growthPercentage > 0 ? "up" : growthPercentage < 0 ? "down" : "neutral");
      return { percent: Math.abs(growthPercentage), trend };
    }

    if (totalSecondary <= 0) {
      return {
        percent: totalPrimary > 0 ? 100 : 0,
        trend: totalPrimary > 0 ? ("up" as const) : ("neutral" as const),
      };
    }

    const delta = ((totalPrimary - totalSecondary) / totalSecondary) * 100;
    return {
      percent: Number(Math.abs(delta).toFixed(1)),
      trend: delta > 0 ? ("up" as const) : delta < 0 ? ("down" as const) : ("neutral" as const),
    };
  })();

  const growthTone =
    computedGrowth.trend === "up"
      ? "text-emerald-700"
      : computedGrowth.trend === "down"
        ? "text-rose-700"
        : "text-slate-600";
  const growthArrow =
    computedGrowth.trend === "up" ? "+" : computedGrowth.trend === "down" ? "-" : "";

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6",
        className
      )}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">{resolvedValue}</span>
            <span className="text-sm font-medium text-slate-500">{currency}</span>
          </div>
          <p className="text-xs text-slate-500">Total booking value</p>
        </div>
        <div className="flex items-start justify-end gap-4">
          {showGrowth && (
            <div className="text-right">
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-sm font-semibold",
                  growthTone
                )}
              >
                {growthArrow}
                {computedGrowth.percent}%
              </div>
              <p className="text-xs text-slate-500">{growthText}</p>
            </div>
          )}
          {showPeriodSelect && (
            <select
              value={activePeriod}
              onChange={(e) => onPeriodChange?.(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600"
            >
              {periodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
          {primaryLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#F97316]" />
          {secondaryLabel}
        </span>
      </div>

      <div
        className="mt-6 flex-1"
        style={{ minHeight: height }}
      >
        <ResponsiveContainer width="100%" height="100%" debounce={120}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="28%"
          >
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip
              cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
              formatter={(
                value: number | string | undefined,
                name: string | number | undefined
              ): [string, string] => {
                const labelMap: Record<string, string> = {
                  value1: primaryLabel,
                  value2: secondaryLabel,
                };
                const numeric = Number(value ?? 0);
                const labelKey = name !== undefined ? String(name) : "";
                const formattedValue = Number.isFinite(numeric)
                  ? `${currency} ${numeric.toLocaleString()}`
                  : `${currency} ${value ?? 0}`;
                return [formattedValue, labelMap[labelKey] ?? ""];
              }}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar
              dataKey="value1"
              fill={primaryColor}
              radius={[6, 6, 0, 0]}
              barSize={14}
              isAnimationActive={animate}
              animationDuration={animationDuration}
              animationEasing={animationEasing}
            />
            <Bar
              dataKey="value2"
              fill={secondaryColor}
              radius={[6, 6, 0, 0]}
              barSize={14}
              isAnimationActive={animate}
              animationDuration={animationDuration}
              animationEasing={animationEasing}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(ChartCard);
