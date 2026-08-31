import type { ComponentType } from "react";
import { HiMiniArrowDown, HiMiniArrowUp, HiMiniMinus } from "react-icons/hi2";

import { cn } from "@/lib/utils";

export type InsightTone = "blue" | "green" | "amber" | "rose" | "violet" | "slate";
export type InsightBadgeTone = "green" | "red" | "amber" | "blue" | "slate" | "violet";

export type InsightStatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ComponentType<{ className?: string }>;
  iconTone?: InsightTone;
  badgeText?: string;
  badgeTone?: InsightBadgeTone;
  badgeIcon?: ComponentType<{ className?: string }>;
  className?: string;
};

const iconToneMap: Record<InsightTone, string> = {
  blue: "bg-[#eef4ff] text-[#3554e0]",
  green: "bg-[#ecfdf3] text-emerald-600",
  amber: "bg-[#fff5e6] text-amber-600",
  rose: "bg-[#fff1f2] text-rose-600",
  violet: "bg-[#f2efff] text-violet-600",
  slate: "bg-slate-100 text-slate-600",
};

const badgeToneMap: Record<InsightBadgeTone, string> = {
  green: "border-emerald-100 bg-emerald-50 text-emerald-700",
  red: "border-rose-100 bg-rose-50 text-rose-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
};

const defaultBadgeIconMap: Record<InsightBadgeTone, ComponentType<{ className?: string }>> = {
  green: HiMiniArrowUp,
  red: HiMiniArrowDown,
  amber: HiMiniMinus,
  blue: HiMiniArrowUp,
  slate: HiMiniMinus,
  violet: HiMiniArrowUp,
};

export default function InsightStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconTone = "blue",
  badgeText,
  badgeTone = "green",
  badgeIcon,
  className,
}: InsightStatCardProps) {
  const displayValue = typeof value === "number" ? value.toLocaleString() : value;
  const BadgeIcon = badgeIcon ?? defaultBadgeIconMap[badgeTone];

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", iconToneMap[iconTone])}>
          <Icon className="h-6 w-6" />
        </div>

        {badgeText ? (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none",
              badgeToneMap[badgeTone],
            )}
          >
            <BadgeIcon className="h-3.5 w-3.5" />
            <span>{badgeText}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-[30px] font-semibold tracking-[-0.06em] text-slate-950">{displayValue}</p>
        {subtitle ? <p className="text-xs font-medium text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
