type PillTone = "success" | "warning" | "danger" | "info" | "neutral";

type StatusPillProps = {
  status: string;
  tone?: PillTone;
  size?: "sm" | "md";
};

const defaultToneClass: Record<PillTone, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-sky-100 text-sky-700",
  neutral: "bg-slate-100 text-slate-700",
};

const statusToneMap: Record<string, PillTone> = {
  ACTIVE: "success",
  VERIFIED: "success",
  COMPLETED: "success",
  PENDING: "warning",
  PENDING_REVIEW: "warning",
  NOT_SUBMITTED: "danger",
  SUSPENDED: "danger",
  REJECTED: "danger",
  EXPIRED: "danger",
};

export default function StatusPill({ status, tone, size = "md" }: StatusPillProps) {
  const normalized = status.toUpperCase();
  const resolvedTone = tone || statusToneMap[normalized] || "neutral";
  return (
    <span
      className={`inline-flex items-center rounded-full ${size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"} font-semibold ${defaultToneClass[resolvedTone]}`}
    >
      {status}
    </span>
  );
}
