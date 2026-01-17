import { NavLink } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";
import { cn } from "@/lib/utils";

type BannerAction = {
  label: string;
  to: string;
};

type BannerPill = {
  label: string;
  tone?: "warning" | "danger" | "info" | "success";
};

type DashboardBannerProps = {
  title: string;
  subtitle: string;
  primaryAction: BannerAction;
  pills?: BannerPill[];
};

const pillToneClass: Record<NonNullable<BannerPill["tone"]>, string> = {
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
};

export default function DashboardBanner({
  title,
  subtitle,
  primaryAction,
  pills = [],
}: DashboardBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="absolute right-0 top-0 h-full w-28 bg-gradient-to-l from-blue-50 to-transparent" />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
              New: Boost your visibility
            </span>
            {pills.map((pill) => (
              <span
                key={pill.label}
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
                  pill.tone ? pillToneClass[pill.tone] : "bg-slate-900 text-white"
                )}
              >
                {pill.label}
              </span>
            ))}
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to={primaryAction.to}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            {primaryAction.label}
            <HiArrowRight className="h-4 w-4" />
          </NavLink>
          <button
            type="button"
            aria-label="Dismiss"
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
