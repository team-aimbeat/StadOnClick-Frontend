import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type AdminCardShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  className?: string;
}>;

const AdminCardShell = ({
  title,
  subtitle,
  children,
  className,
}: AdminCardShellProps) => {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
};

export default AdminCardShell;
