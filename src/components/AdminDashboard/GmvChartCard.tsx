import React from "react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type ChartDatum = {
  month: string;
  value: number;
  highlight?: boolean;
};

export const gmvChartData: ChartDatum[] = [
  { month: "Jan", value: 160, highlight: false },
  { month: "Feb", value: 190 },
  { month: "Mar", value: 210 },
  { month: "Apr", value: 200, highlight: true },
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
  title = "GMV today",
  value = "$1,24,560",
  percentage = 1.01,
  periodLabel = "last month",
  trend = "up",
  className,
  currency = "$",
  showChart = true,
  chartData = gmvChartData,
}) => {
  const formatIndianNumber = (num: number): string => {
    if (num >= 100000) {
      const lakhs = num / 100000;
      return `${currency}${lakhs.toFixed(2)} L`;
    }

    const numStr = num.toString();
    const lastThree = numStr.slice(-3);
    const otherNumbers = numStr.slice(0, -3);

    if (otherNumbers !== "") {
      return `${currency}${otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}`;
    }

    return `${currency}${lastThree}`;
  };

  const formattedValue =
    typeof value === "number" ? formatIndianNumber(value) : value;
  const isPositive = trend === "up";
  const percentageLabel = Number.isFinite(percentage)
    ? `${percentage.toFixed(2)}%`
    : `${percentage}%`;

  const renderDot = ({
    cx,
    cy,
    payload,
  }: {
    cx?: number;
    cy?: number;
    payload?: ChartDatum;
  }) => {
    if (cx === undefined || cy === undefined) return null;
    const isHighlight = payload?.highlight;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isHighlight ? 5 : 2.5}
        stroke="#111827"
        strokeWidth={isHighlight ? 2 : 1}
        fill={isHighlight ? "#111827" : "#ffffff"}
      />
    );
  };

  const maxValue = Math.max(...chartData.map((d) => d.value));
  const yAxisDomain = [0, maxValue * 1.2];

  return (
    <div
      className={cn(
        "bg-white rounded-3xl  p-5",
        "flex h-full flex-col gap-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{title}</p>
        <button className="text-xs font-semibold text-slate-500 hover:text-slate-700">
          View Report
        </button>
      </div>

      <div>
        <p className="text-3xl font-bold text-slate-900">{formattedValue}</p>
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">{periodLabel}</p>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span
          className={cn(
            "text-2xl font-semibold leading-none",
            isPositive ? "text-emerald-600" : "text-rose-500"
          )}
        >
          {isPositive ? "+" : "-"}
          {percentageLabel}
        </span>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Customers</span>
      </div>

      {showChart && (
        <div className="mt-auto h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 0, right: 0, left: -4, bottom: -4 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} opacity={0.6} />
              <ReferenceLine
                x="Apr"
                stroke="#22c55e"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                padding={{ left: 8, right: 8 }}
              />
              <YAxis domain={yAxisDomain} hide />
              <Tooltip
                cursor={{
                  stroke: "#d1d5db",
                  strokeDasharray: "3 3",
                  strokeOpacity: 0.8,
                }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "6px 8px",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#1f2937" }}
                formatter={(value) => [`${currency}${value}`, "GMV"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#111827"
                strokeWidth={2}
                dot={renderDot}
                activeDot={{
                  r: 5,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                  fill: "#111827",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GmvCard;
