import { IconType } from "react-icons"
import { cn } from "@/lib/utils"
import ArrowUpImg from '@/assets/images/ArrowRise.png';
import ArrowdownImg from '@/assets/images/ArrowFall.png';
// or: ../assets/icons/arrow-up.svg

import { 
  ArrowUp, 
  ArrowDown,
  Minus
} from "lucide-react"

type StatCardProps = {
  title: string
  value: string | number
  subtitle?: string
  percentage?: number
  trend?: "up" | "down" | "neutral"
  icon?: IconType
  accentColor?: "blue" | "green" | "red" | "yellow" | "purple"
  className?: string
  showTrendIcon?: boolean
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
  showTrendIcon = true,
}: StatCardProps) {
  // Trend colors based on the design
  const trendColor =
    trend === "up"
      ? "text-emerald-600 bg-emerald-50"
      : trend === "down"
      ? "text-rose-600 bg-rose-50"
      : "text-gray-600 bg-gray-100"

  const trendIcon = {
   up: (
  <img
    src={ArrowUpImg}
    alt="Up"
    className="h-3 w-3 inline-block"
  />
),

   down: (
  <img
    src={ArrowdownImg}
    alt="down"
    className="h-3 w-3 inline-block"
  />
),

    neutral: <Minus className="h-3 w-3" />,
  }

  // Gradient backgrounds based on the design (EGF2FF to FFFFFF)
  const gradientMap = {
    blue: "from-[#EGF2FF] to-white",
    green: "from-[#E8F5E9] to-white",
    red: "from-[#FFEBEE] to-white",
    yellow: "from-[#FFFDE7] to-white",
    purple: "from-[#F3E5F5] to-white",
  }

  // Accent colors for the bottom line
  const accentMap = {
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    red: "bg-rose-500",
    yellow: "bg-amber-500",
    purple: "bg-purple-500",
  }

  return (
    <div
      className={cn(
        "group relative w-[300px] min-w-[200px] rounded-xl border border-gray-200",
        "bg-gradient-to-b",
        gradientMap[accentColor],
        "p-3 shadow-[0_1px_8px_0_rgba(83,85,155,0.16)]",
        "transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(83,85,155,0.24)]",
        className
      )}
    >
      {/* Content container */}
      <div className="flex h-full flex-col gap-2">
        {/* Header row with title and icon */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-600">
            {title}
          </h4>

          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700">
              <Icon size={25} />
            </div>
          )}
        </div>

        {/* Main value row */}
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </span>
            
            {percentage !== undefined && (
              <div className={cn(
                "flex items-center ml-30 gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                trendColor
              )}>
                
                <span>
                  {trend === "up" && "+"}
                  {percentage}%
                </span>
                {showTrendIcon && trendIcon[trend]}
              </div>
            )}
          </div>

        </div>

        {/* Optional description line from the design */}
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Accent bottom border - optional based on design */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-[2px] rounded-b-xl",
          accentMap[accentColor],
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        )}
      />
    </div>
  )
}
