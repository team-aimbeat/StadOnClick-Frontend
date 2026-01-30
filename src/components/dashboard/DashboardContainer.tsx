import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type DashboardContainerProps = PropsWithChildren<{
  className?: string;
}>;

export function DashboardContainer({
  children,
  className,
}: DashboardContainerProps) {
  return (
    <div className={cn("mx-auto  ", className)}>
      {children}
    </div>
  );
}
