import React, { memo } from "react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartDatum = {
  month: string;
  value: number;
  highlight?: boolean;
};

export const gmvChartData: ChartDatum[] = [
  { month: "Jan", value: 160 },
  { month: "Feb", value: 30 },
  { month: "Mar", value: 210 },
  { month: "Apr", value: 130, highlight: true },
  { month: "May", value: 170 },
];

interface GmvCardProps {
  title?: string;
  value?: string | number;
  percentage?: number;
  periodLabel?: string;
  trend?: "up" | "down";
  className?: string;
  currency?: string;
  showChart?: boolean;
  chartData?: Array<ChartDatum>;
}

const GmvCard: React.FC<GmvCardProps> = ({
  title = "Sales Statistic",
  value = 27200,
  percentage = 10,
  periodLabel = "Last month",
  trend = "up",
  className,
  currency = "$",
  showChart = true,
  chartData = gmvChartData,
}) => {
  const formatValue = (val: string | number) =>
    typeof val === "number" ? `${currency}${val.toLocaleString()}` : val;

  const formattedValue = formatValue(value);
  const isPositive = trend === "up";
  const percentageLabel =
    typeof percentage === "number"
      ? `${Math.abs(percentage).toFixed(0)}%`
      : percentage;
  const percentDisplay = percentageLabel
    ? `${isPositive ? "+" : "-"}${percentageLabel.replace(/^[+-]/, "")}`
    : "";

  const maxValue = Math.max(...chartData.map((d) => d.value));
  const yAxisDomain = [0, maxValue * 1.2];

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {title}
          </p>
          <p className="text-[32px] font-semibold text-slate-900">
            {formattedValue}
          </p>
        </div>
        <select
          value="Yearly"
          onChange={() => {}}
          className="rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold text-slate-600 outline-none"
        >
          <option>Yearly</option>
          <option>Monthly</option>
          <option>Weekly</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {percentDisplay && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold",
              isPositive
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-600"
            )}
          >
            {percentDisplay}
          </span>
        )}
        <span className="text-sm font-semibold text-slate-500">
          + $1,500 per day
        </span>
      </div>

      <div className="flex items-center text-xs uppercase tracking-[0.2em] text-slate-600">
        <span className="mr-2">{periodLabel}</span>
        <span className="px-2 text-slate-300">/</span>
        <span>Customers</span>
      </div>

      {showChart && (
        <div className="mt-2 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                vertical={false}
                opacity={0.6}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                padding={{ left: 8, right: 8 }}
              />
              <YAxis
                domain={yAxisDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#cbd5f5" }}
              />
              <Tooltip
                cursor={{
                  stroke: "#cbd5f5",
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "8px 10px",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#1f2937" }}
                formatter={(value) => [`${currency}${value}`, "GMV"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={4}
                dot={false}
                activeDot={{
                  r: 5,
                  stroke: "#ffffff",
                  strokeWidth: 3,
                  fill: "#2563EB",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default memo(GmvCard);
