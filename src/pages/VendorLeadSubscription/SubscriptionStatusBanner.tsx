import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LeadSubscriptionStatus } from "@/features/vendorLeadSubscriptions/types/leadPlans.types";

type SubscriptionStatusBannerProps = {
  status?: LeadSubscriptionStatus;
  isLoading?: boolean;
  error?: string | null;
};

export function SubscriptionStatusBanner({
  status,
  isLoading,
  error,
}: SubscriptionStatusBannerProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-44 rounded-full bg-slate-200/80" />
          <Skeleton className="h-6 w-24 rounded-full bg-slate-200/80" />
        </div>
        <Skeleton className="mt-4 h-3 w-full rounded-full bg-slate-200/80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-sm font-medium text-rose-700 shadow-sm backdrop-blur-md">
        {error}
      </div>
    );
  }

  const isActive = Boolean(status?.isActive);
  const leadsToday = status?.leadsToday ?? 0;
  const dailyLimit = status?.leadsPerDay ?? 0;
  const progress =
    dailyLimit > 0 ? Math.min(100, Math.round((leadsToday / dailyLimit) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-900">
            {isActive
              ? `Current plan: ${status?.planName ?? "-"}`
              : "No active subscription"}
          </p>
          <p className="text-sm text-slate-600">
            {isActive
              ? `Expires on ${status?.expiresAt ? new Date(status.expiresAt).toLocaleDateString() : "-"}`
              : "Choose a plan to start receiving new leads right away."}
          </p>
        </div>
        <Badge
          className={cn(
            "px-3 py-1 text-xs",
            isActive
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-100 text-slate-700"
          )}
          variant="outline"
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {isActive ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Leads used today</span>
            <span>
              {leadsToday} / {dailyLimit}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700">
          No active subscription. Choose a plan to start receiving leads.
        </div>
      )}
    </div>
  );
}
