import { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardSectionProps = PropsWithChildren<{
  title?: string;
  actions?: ReactNode;
  className?: string;
}>;

export function DashboardSection({
  title,
  actions,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4">
          {title ? (
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          ) : (
            <span />
          )}
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
