import { IconType } from "react-icons";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

type IconTone = "blue" | "amber" | "emerald" | "rose" | "violet" | "slate";

type QuickActionTileProps = {
  icon: IconType;
  label: string;
  to: string;
  badge?: string;
  showDot?: boolean;
  tone?: IconTone;
};

const toneStyles: Record<IconTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-100",
};

export default function QuickActionTile({
  icon: Icon,
  label,
  to,
  badge,
  showDot,
  tone = "blue",
}: QuickActionTileProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "relative flex h-[96px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800 transition hover:-translate-y-[2px] hover:border-blue-200 hover:bg-slate-50",
          isActive && "border-blue-200 bg-blue-50"
        )
      }
    >
      {badge ? (
        <span className="absolute right-2 top-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
          {badge}
        </span>
      ) : null}
      {showDot ? (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
      ) : null}
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full ring-2",
          toneStyles[tone]
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <span className="text-sm font-semibold leading-4 text-slate-800">
        {label}
      </span>
    </NavLink>
  );
}
