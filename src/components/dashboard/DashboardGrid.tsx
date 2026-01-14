import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type DashboardGridProps = PropsWithChildren<{
  className?: string;
}>;

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn("grid grid-cols-12 gap-6 items-stretch", className)}>
      {children}
    </div>
  );
}
