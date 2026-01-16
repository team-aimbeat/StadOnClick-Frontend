import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type DashboardGridProps = PropsWithChildren<{
  className?: string;
  columns?: string;
}>;

export function DashboardGrid({
  children,
  className,
  columns = "grid-cols-12",
}: DashboardGridProps) {
  return (
    <div className={cn("grid gap-6 items-stretch", columns, className)}>
      {children}
    </div>
  );
}
