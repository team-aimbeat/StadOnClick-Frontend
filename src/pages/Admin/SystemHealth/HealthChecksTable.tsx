import { Activity, Database, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { HEALTH_CHECK_STATUS, type HealthCheck } from "@/features/systemHealth/systemHealth.types";

type HealthChecksTableProps = {
  checks?: Record<string, HealthCheck> | null;
  isLoading?: boolean;
};

const statusStyles = {
  [HEALTH_CHECK_STATUS.up]: "border-emerald-200 bg-emerald-50 text-emerald-700",
  [HEALTH_CHECK_STATUS.down]: "border-rose-200 bg-rose-50 text-rose-700",
};

const dotStyles = {
  [HEALTH_CHECK_STATUS.up]: "bg-emerald-500",
  [HEALTH_CHECK_STATUS.down]: "bg-rose-500",
};

const iconMap: Record<string, typeof Activity> = {
  database: Database,
  redis: Server,
};

const labelMap: Record<string, string> = {
  database: "Database",
  redis: "Redis",
};

const formatLabel = (key: string) =>
  labelMap[key] ?? key.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatLatency = (latencyMs?: number | null) =>
  latencyMs === null || latencyMs === undefined ? "—" : `${latencyMs} ms`;

const skeletonRow = (key: string | number) => (
  <div
    key={key}
    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(160px,1fr)_120px_120px]"
  >
    <div className="h-5 w-40 animate-pulse rounded-md bg-slate-100" />
    <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
    <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
  </div>
);

export default function HealthChecksTable({ checks, isLoading }: HealthChecksTableProps) {
  const entries = checks ? Object.entries(checks) : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">Readiness Checks</h3>
        <p className="text-xs text-slate-500">Core dependencies and service readiness</p>
      </div>

      <div>
        {isLoading && !entries.length ? (
          <>
            {Array.from({ length: 3 }).map((_, idx) => skeletonRow(idx))}
          </>
        ) : entries.length ? (
          entries.map(([key, check]) => {
            const StatusIcon = iconMap[key] ?? Activity;
            const status = check.status ?? HEALTH_CHECK_STATUS.down;
            const statusClass = statusStyles[status] ?? "border-slate-200 bg-slate-50 text-slate-600";
            const dotClass = dotStyles[status] ?? "bg-slate-400";

            return (
              <div
                key={key}
                className="grid grid-cols-1 gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:grid-cols-[minmax(160px,1fr)_120px_120px]"
              >
                <div className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <StatusIcon className="h-4 w-4 text-slate-600" aria-hidden />
                  </span>
                  <span>{formatLabel(key)}</span>
                </div>

                <div className="flex items-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors duration-300",
                      statusClass
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full animate-pulse", dotClass)} />
                    {status}
                  </span>
                </div>

                <div className="flex items-center justify-start sm:justify-end">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors">
                    {formatLatency(check.latencyMs)}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-5 py-6 text-sm text-slate-500">No readiness checks reported.</div>
        )}
      </div>
    </div>
  );
}
