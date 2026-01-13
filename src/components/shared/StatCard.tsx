import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number;
  trend?: "up" | "down" | "neutral";
  icon?: IconType;
  accentColor?: "blue" | "green" | "red" | "yellow" | "purple";
  className?: string;
  showTrendIcon?: boolean;
  avatars?: string[];
};

export default function StatCard({
  title,
  value,
  subtitle,
  percentage,
  trend = "neutral",
  icon: Icon,
  accentColor = "blue",
  className,
  showTrendIcon = true,
  avatars = [],
}: StatCardProps) {
  const trendIcon = {
    up: "↑",
    down: "↓",
    neutral: "—",
  };

  const trendColor =
    trend === "up"
      ? "text-emerald-700 bg-emerald-100"
      : trend === "down"
      ? "text-rose-600 bg-rose-100"
      : "text-slate-500 bg-slate-100";

  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[30px]  bg-white p-4  transition hover:scale-105",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
          {title}
        </p>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-[18px] border border-slate-200 bg-slate-50 text-slate-500">
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-semibold text-blue-800">{displayValue}</p>
        {percentage !== undefined && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
              trendColor
            )}
          >
            {showTrendIcon && <span>{trendIcon[trend]}</span>}
            <span>
              {(trend === "up" ? "+" : trend === "down" ? "-" : "") +
                Math.abs(percentage)}
              %
            </span>
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      {avatars.length > 0 && (
        <div className="mt-2 ml-50 flex">
          <div className="flex -space-x-2">
            {avatars.slice(0, 3).map((src, index) => (
              <img
                key={`${src}-${index}`}
                src={src}
                alt={`avatar-${index}`}
                className="h-8 w-8 rounded-full border-2 border-white bg-slate-50 object-cover shadow-sm"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
