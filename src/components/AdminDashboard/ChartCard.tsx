import React from "react";
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
  value = "3,456,773",
  data = bookingsData,
  height = 220,
  primaryColor = "#2563EB",
  secondaryColor = "#F97316",
  primaryLabel = "Current Week",
  secondaryLabel = "Last Week",
  showLegend = true,
  showPeriodSelect = true,
  activePeriod = "Today",
  periodOptions = ["Today", "Week", "Month"],
  onPeriodChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded border border-slate-200 bg-white p-6",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
            {title}
          </p>
          
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        {showPeriodSelect && (
          <select
            value={activePeriod}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            className="rounded-full  bg-white px-3 py-1 text-xs font-semibold text-slate-600"
          >
            {periodOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
          {primaryLabel}: 500
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#F97316]" />
          {secondaryLabel}: 300
        </span>
      </div>

      <div
        className="mt-6 flex-1"
        style={{ minHeight: height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                fontSize: 12,
              }}
            />
            <Bar dataKey="value1" fill={primaryColor} radius={[6, 6, 0, 0]} barSize={10} />
            <Bar dataKey="value2" fill={secondaryColor} radius={[6, 6, 0, 0]} barSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
            {primaryLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F97316]" />
            {secondaryLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChartCard;
