import { IconType } from "react-icons";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

type QuickActionTileProps = {
  icon: IconType;
  label: string;
  to: string;
  badge?: string;
  showDot?: boolean;
};

export default function QuickActionTile({
  icon: Icon,
  label,
  to,
  badge,
  showDot,
}: QuickActionTileProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "relative flex h-[74px] flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-[12px] font-semibold text-slate-800 transition hover:-translate-y-[1px] hover:border-blue-200 hover:bg-slate-50",
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
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-blue-600 ring-2 ring-slate-100">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <span className="text-[12px] font-semibold leading-4 text-slate-800">
        {label}
      </span>
    </NavLink>
  );
}
