import { useState } from "react";
import AdminCardShell from "./AdminCardShell";
import { useListCustomersQuery } from "@/features/admin/customers/api/customersApi";
import { useListAllVendorsQuery } from "@/features/admin/vendors/api/vendorsApi";
import { useListAllAffiliatesQuery } from "@/features/admin/affiliates/api/affiliatesApi";

const radius = 105;
const strokeWidth = 36;
const size = 260;
const center = size / 2;
const circumference = 2 * Math.PI * radius;

const LeadSourceDistributionCard = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { data: customersRes } = useListCustomersQuery({ page: 1, limit: 1 });
  const { data: vendorsRes } = useListAllVendorsQuery({ page: 1, limit: 1 });
  const { data: affiliatesRes } = useListAllAffiliatesQuery({ page: 1, limit: 1 });

  const customerCount =
    customersRes?.meta?.total ?? customersRes?.data?.length ?? 0;
  const vendorCount = vendorsRes?.meta?.total ?? vendorsRes?.data?.length ?? 0;
  const affiliateCount =
    affiliatesRes?.meta?.total ?? affiliatesRes?.data?.length ?? 0;

  const leadSourceData = [
    { key: "CUSTOMERS", label: "Customers", value: customerCount, color: "#4F7DF3" },
    { key: "VENDORS", label: "Vendors", value: vendorCount, color: "#FF9F2D" },
    { key: "AFFILIATES", label: "Affiliate users", value: affiliateCount, color: "#AAB2BD" },
  ];

  const total = Math.max(
    1,
    leadSourceData.reduce((sum, item) => sum + item.value, 0)
  );

  let offsetAccumulator = 0;
  const hoveredSlice =
    hoveredIndex !== null ? leadSourceData[hoveredIndex] : null;
  const hoveredPercent = hoveredSlice
    ? Math.round((hoveredSlice.value / total) * 100)
    : null;

  return (
    <AdminCardShell title="System Overview snapshot" subtitle="Users / Vendors / Affiliates">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            All Time
          </p>
          <span className="rounded border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            Total records
          </span>
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
