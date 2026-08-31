import type { ComponentType } from "react";

const compactNumber = new Intl.NumberFormat("en-SE", {
  maximumFractionDigits: 0,
});

export type PortalStatTone = "blue" | "green" | "amber" | "purple" | "red";

export type PortalStatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: PortalStatTone;
  className?: string;
};

const toneStyles: Record<PortalStatTone, { icon: string; label: string }> = {
  blue: {
    icon: "bg-[#eef5ff] text-[#3554e0]",
    label: "text-slate-500",
  },
  green: {
    icon: "bg-[#eef9f2] text-emerald-600",
    label: "text-slate-500",
  },
  amber: {
    icon: "bg-[#fff4e6] text-amber-600",
    label: "text-slate-500",
  },
  purple: {
    icon: "bg-[#f0eeff] text-[#5a57e8]",
    label: "text-slate-500",
  },
  red: {
    icon: "bg-[#fff1f1] text-rose-600",
    label: "text-slate-500",
  },
};

export default function PortalStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "blue",
  className = "",
}: PortalStatCardProps) {
  const styles = toneStyles[tone];
  const formattedValue = typeof value === "number" ? compactNumber.format(value) : value;

  return (
    <div className={`min-h-[154px] rounded-[18px] border border-slate-100 bg-white p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${styles.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <p className={`text-sm font-medium ${styles.label}`}>{title}</p>
        <p className="text-[30px] font-semibold tracking-[-0.06em] text-slate-950">
          {formattedValue}
        </p>
        {subtitle ? <p className="text-xs font-medium text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
