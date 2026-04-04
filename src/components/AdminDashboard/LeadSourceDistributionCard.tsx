import { useListCustomersQuery } from "@/features/admin/customers/api/customersApi";
import { useListAllVendorsQuery } from "@/features/admin/vendors/api/vendorsApi";
import { useListAllAffiliatesQuery } from "@/features/admin/affiliates/api/affiliatesApi";

const size = 204;
const center = size / 2;
const radius = 54;
const strokeWidth = 16;
const circumference = 2 * Math.PI * radius;

const LeadSourceDistributionCard = () => {
  const { data: customersRes } = useListCustomersQuery({ page: 1, limit: 1 });
  const { data: vendorsRes } = useListAllVendorsQuery({ page: 1, limit: 1 });
  const { data: affiliatesRes } = useListAllAffiliatesQuery({ page: 1, limit: 1 });

  const vendorCount = vendorsRes?.meta?.total ?? vendorsRes?.data?.length ?? 0;
  const customerCount = customersRes?.meta?.total ?? customersRes?.data?.length ?? 0;
  const affiliateCount = affiliatesRes?.meta?.total ?? affiliatesRes?.data?.length ?? 0;

  const segments = [
    { label: "Vendors", value: vendorCount, color: "#2F5BEA" },
    { label: "Customers", value: customerCount, color: "#5857E6" },
    { label: "Affiliates", value: affiliateCount, color: "#C7D5F3" },
  ];

  const total = Math.max(1, segments.reduce((sum, segment) => sum + segment.value, 0));
  const percentages = segments.map((segment) => ({
    ...segment,
    percent: Math.round((segment.value / total) * 100),
  }));

  let offset = 0;
  const topPercent = percentages[0]?.percent ?? 0;
  const secondPercent = percentages[1]?.percent ?? 0;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.35)]">
      <div className="mb-2.5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#2F5BEA]">
            Most Bought
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-900">
            System Overview
          </h3>
        </div>
        <div className="rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-500">
          by bookings
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#EEF2FF"
              strokeWidth={strokeWidth}
            />
            <g transform={`rotate(-90 ${center} ${center})`}>
              {segments.map((segment) => {
                const dash = (segment.value / total) * circumference;
                const circle = (
                  <circle
                    key={segment.label}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += dash;
                return circle;
              })}
            </g>
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
              {total.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Total
            </div>
          </div>

          <div className="absolute left-2 top-[52%] -translate-y-1/2 rounded-full bg-white px-2.5 py-1.5 text-sm font-semibold text-[#5857E6] shadow-[0_10px_25px_-18px_rgba(15,23,42,0.35)]">
            {secondPercent}%
          </div>
          <div className="absolute left-1/2 top-1.5 -translate-x-1/2 rounded-full bg-white px-2.5 py-1.5 text-sm font-semibold text-[#2F5BEA] shadow-[0_10px_25px_-18px_rgba(15,23,42,0.35)]">
            {topPercent}%
          </div>
        </div>
      </div>

      <div className="mt-2.5 space-y-2">
        {percentages.map((segment) => (
          <div
            key={segment.label}
            className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 text-sm"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="truncate font-medium text-slate-700">{segment.label}</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span>{segment.value.toLocaleString()}</span>
              <span>{segment.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadSourceDistributionCard;
