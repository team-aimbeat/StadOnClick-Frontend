import React from "react";
import { cn } from "@/lib/utils";

export type AdminPillTone = "success" | "warning" | "danger" | "neutral" | "info";

export type AdminPillProps = {
  tone: AdminPillTone;
  children: React.ReactNode;
  className?: string;
};

const toneStyles: Record<AdminPillTone, string> = {
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-sky-100 text-sky-700",
  neutral: "bg-slate-100 text-slate-600",
};

const AdminPill: React.FC<AdminPillProps> = ({ tone, children, className }) => {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
};

export default AdminPill;
