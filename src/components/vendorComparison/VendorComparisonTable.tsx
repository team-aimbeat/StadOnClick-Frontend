import { ReactNode } from "react";
import { VendorComparisonRecord } from "@/services/vendorComparisonApi";
import { cn } from "@/lib/utils";
import { Flame, Eye, Repeat, Zap, ListChecks } from "lucide-react";

type Props = {
  vendors: VendorComparisonRecord[];
};

type MetricRow = {
  key: keyof VendorComparisonRecord | `stats.${keyof VendorComparisonRecord["stats"]}`;
  label: string;
  icon?: ReactNode;
};

const metricRows: MetricRow[] = [
  { key: "totalServices", label: "Total Services" },
  { key: "avgRating", label: "Avg Rating" },
  { key: "stats.totalVisitors", label: "Total Visitors", icon: <Eye className="h-4 w-4 text-slate-500" /> },
  { key: "stats.visitorsLast7Days", label: "Visitors (7 days)", icon: <Flame className="h-4 w-4 text-amber-500" /> },
  { key: "stats.repeatVisitorsPercentage", label: "Repeat Visitors", icon: <Repeat className="h-4 w-4 text-emerald-500" /> },
  { key: "stats.conversionRate", label: "Conversion Rate", icon: <Zap className="h-4 w-4 text-indigo-500" /> },
  { key: "stats.totalBookings", label: "Total Bookings" },
];

const formatValue = (value: any) => {
  if (typeof value === "number") {
    if (value % 1 === 0) return value.toLocaleString();
    return value.toFixed(1);
  }
  return value;
};

export function VendorComparisonTable({ vendors }: Props) {
  if (!vendors.length) return null;

  const maxVisitors = Math.max(...vendors.map((v) => v.stats.totalVisitors));
  const maxConversion = Math.max(...vendors.map((v) => v.stats.conversionRate));

  const getValue = (vendor: VendorComparisonRecord, key: (typeof metricRows)[number]["key"]) => {
    if (key.startsWith("stats.")) {
      const statKey = key.replace("stats.", "") as keyof VendorComparisonRecord["stats"];
      return vendor.stats[statKey];
    }
    return vendor[key as keyof VendorComparisonRecord] as number | string;
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-lg shadow-emerald-50/60">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <tr>
            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Metric
            </th>
            {vendors.map((vendor) => (
              <th key={vendor.vendorId} className="px-5 py-4 text-left align-top">
                <div className="flex flex-col gap-2">
                  <span className="text-base font-semibold text-slate-900">{vendor.vendorName}</span>
                  <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
                    {vendor.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-emerald-50 px-2 py-[3px] text-emerald-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm text-slate-700">
          {metricRows.map((row, idx) => (
            <tr key={row.key as string} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
              <td className="px-5 py-4 font-semibold text-slate-800">
                <div className="flex items-center gap-2">
                  {row.icon ? row.icon : <ListChecks className="h-4 w-4 text-slate-400" />}
                  {row.label}
                </div>
              </td>
              {vendors.map((vendor) => {
                const value = getValue(vendor, row.key);
                const isVisitors = row.key === "stats.totalVisitors" && vendor.stats.totalVisitors === maxVisitors;
                const isConversion =
                  row.key === "stats.conversionRate" && vendor.stats.conversionRate === maxConversion && maxConversion > 0;
                const isBest = isVisitors || isConversion;
                return (
                  <td
                    key={vendor.vendorId}
                    className={cn(
                      "px-5 py-4 text-slate-800",
                      isBest && "bg-emerald-50 font-semibold text-emerald-800 rounded-lg"
                    )}
                  >
                    <span>{formatValue(value)}</span>
                    {isVisitors && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-[2px] text-[11px] font-semibold text-emerald-700">
                        <Eye className="h-3 w-3" /> Top Visitors
                      </span>
                    )}
                    {isConversion && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-[2px] text-[11px] font-semibold text-amber-800">
                        <Zap className="h-3 w-3" /> Best Conversion
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
