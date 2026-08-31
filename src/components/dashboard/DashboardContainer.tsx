import { PropsWithChildren, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type DashboardContainerProps = PropsWithChildren<{
  className?: string;
  style?: CSSProperties;
}>;

export function DashboardContainer({
  children,
  className,
  style,
}: DashboardContainerProps) {
  return (
    <div className={cn("mx-auto  ", className)} style={style}>
      {children}
    </div>
  );
}
