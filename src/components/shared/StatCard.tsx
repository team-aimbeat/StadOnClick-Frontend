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

  const trendBadgeClass =
    trend === "up"
      ? "bg-emerald-50 text-emerald-700"
      : trend === "down"
      ? "bg-rose-50 text-rose-600"
      : "bg-slate-100 text-slate-500";

  const trendTextClass =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
      ? "text-rose-600"
      : "text-slate-500";

  const displayValue = typeof value === "number" ? value.toLocaleString() : value;

  const gradientMap: Record<
    NonNullable<StatCardProps["accentColor"]>,
    string
  > = {
    blue: "from-[#D3E5FF] via-white/90 to-white",
    green: "from-[#D1FADF] via-white/90 to-white",
    red: "from-[#FEE2E2] via-white/90 to-white",
    yellow: "from-[#FEF3C7] via-white/90 to-white",
    purple: "from-[#EDE9FE] via-white/90 to-white",
  };

  const iconBgMap: Record<
    NonNullable<StatCardProps["accentColor"]>,
    string
  > = {
    blue: "bg-sky-500/10 text-sky-600",
    green: "bg-emerald-500/10 text-emerald-600",
    red: "bg-rose-500/10 text-rose-600",
    yellow: "bg-amber-500/10 text-amber-600",
    purple: "bg-purple-500/10 text-purple-600",
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-[28px] border border-slate-100 bg-gradient-to-r p-3 transition hover:-translate-y-0.5",
        gradientMap[accentColor],
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black">
          {title}
        </p>
        {Icon && (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border border-white/60 text-lg shadow-inner text-white",
              iconBgMap[accentColor]
            )}
          >
            <Icon size={35} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-semibold text-black">{displayValue}</p>
        {percentage !== undefined && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1  text-xs font-semibold",
              trendBadgeClass
            )}
          >
            {showTrendIcon && <span>{trendIcon[trend]}</span>}
            <span className={trendTextClass}>
              {(trend === "up" ? "+" : trend === "down" ? "-" : "") +
                Math.abs(percentage)}
              %
            </span>
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-black">{subtitle}</p>}
      {avatars.length > 0 && (
        <div className="mt-2 flex ml-50">
          <div className="flex -space-x-2">
            {avatars.slice(0, 3).map((src, index) => (
              <img
                key={`${src}-${index}`}
                src={src}
                alt={`avatar-${index}`}
                className="h-6 w-6 rounded-full border-2  border-white bg-slate-50 object-cover shadow-sm"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
