import { useState } from "react";
import AdminCardShell from "./AdminCardShell";

const leadSourceData = [
  { label: "Profile", value: 500, color: "#4F7DF3" },
  { label: "Service", value: 300, color: "#FF9F2D" },
  { label: "Map", value: 220, color: "#AAB2BD" },
];

const radius = 105;
const strokeWidth = 36;
const size = 260;
const center = size / 2;
const circumference = 2 * Math.PI * radius;

const LeadSourceDistributionCard = () => {
  const total = leadSourceData.reduce((sum, item) => sum + item.value, 0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [period, setPeriod] = useState("Monthly");

  let offsetAccumulator = 0;
  const hoveredSlice =
    hoveredIndex !== null ? leadSourceData[hoveredIndex] : null;
  const hoveredPercent = hoveredSlice
    ? Math.round((hoveredSlice.value / total) * 100)
    : null;

  return (
    <AdminCardShell title="Users Overview snapshot" subtitle="Lead Source Overview">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {period}
          </p>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none"
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Yearly</option>
          </select>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center gap-3">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
            <g transform={`rotate(-90 ${center} ${center})`}>
              {leadSourceData.map((item, index) => {
                const dash = (item.value / total) * circumference;
                const gap = circumference - dash;
                const isHovered = hoveredIndex === index;
                const dimmed = hoveredIndex !== null && !isHovered;
                const circle = (
                  <circle
                    key={item.label}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={-offsetAccumulator}
                    strokeLinecap="butt"
                    className="transition-opacity"
                    opacity={dimmed ? 0.4 : 1}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
                offsetAccumulator += dash;
                return circle;
              })}
            </g>
          </svg>

          {hoveredSlice && hoveredPercent !== null && (
            <div className="pointer-events-none absolute top-6 left-1/2 w-max -translate-x-1/2 rounded border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm">
              <div className="font-semibold">{hoveredSlice.label}</div>
              <div className="text-slate-700">
                {hoveredSlice.value.toLocaleString()} ({hoveredPercent}%)
              </div>
            </div>
          )}

          <div className="flex w-full flex-col gap-2 text-sm font-semibold text-slate-800">
            {leadSourceData.map((item, index) => {
              const isHovered = hoveredIndex === index;
              const dimmed = hoveredIndex !== null && !isHovered;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded px-1 ${
                    isHovered ? "bg-slate-100" : ""
                  }`}
                >
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className={`text-slate-700 ${
                      isHovered ? "font-bold" : ""
                    }`}
                    style={{ opacity: dimmed ? 0.6 : 1 }}
                  >
                    {item.label}:{" "}
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminCardShell>
  );
};

export default LeadSourceDistributionCard;
