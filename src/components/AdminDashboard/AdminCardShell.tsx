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
        "flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6",
        className
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </div>
  );
};

export default AdminCardShell;
