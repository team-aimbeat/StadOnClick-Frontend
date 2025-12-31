import { IconType } from "react-icons"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  percentage?: number
  trend?: "up" | "down" | "neutral"
  icon?: IconType
  accentColor?: "blue" | "green" | "red" | "yellow"
  className?: string
}

export default function StatCard({
  title,
  value,
  subtitle,
  percentage,
  trend = "neutral",
  icon: Icon,
  accentColor = "blue",
  className,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-600"
      : "text-muted-foreground"

  const accentMap = {
    blue: "from-blue-500 to-indigo-500",
    green: "from-green-500 to-emerald-500",
    red: "from-red-500 to-rose-500",
    yellow: "from-yellow-500 to-orange-500",
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground">
          {title}
        </h4>

        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Icon size={18} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-3 flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {value}
        </span>

        {percentage !== undefined && (
          <span className={cn("text-sm font-medium", trendColor)}>
            {trend === "up" && "+"}
            {percentage}%
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">
          {subtitle}
        </p>
      )}

      {/* Accent line */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r",
          accentMap[accentColor]
        )}
      />
    </div>
  )
}
