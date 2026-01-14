import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const spanClassMap: Record<ColumnSpan, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

type DashboardColProps = PropsWithChildren<{
  span: ColumnSpan;
  className?: string;
}>;

export function DashboardCol({ span, children, className }: DashboardColProps) {
  return (
    <div className={cn(spanClassMap[span], className)}>
      {children}
    </div>
  );
}
