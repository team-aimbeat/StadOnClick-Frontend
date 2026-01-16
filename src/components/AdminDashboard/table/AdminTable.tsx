import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

type ColumnAlign = "left" | "right" | "center";

type AdminTableColumn = {
  key: string;
  label: string;
  width: string;
  align?: ColumnAlign;
};

type AdminTableProps = {
  columns: AdminTableColumn[];
  children: React.ReactNode;
  className?: string;
};

type AdminTableRowProps = {
  children: React.ReactNode;
  className?: string;
};

type AdminTableCellProps = {
  align?: ColumnAlign;
  children: React.ReactNode;
  className?: string;
};

const AdminTableContext = createContext<string | undefined>(undefined);

const getAlignClass = (align?: ColumnAlign) => {
  if (align === "right") return "text-right justify-self-end";
  if (align === "center") return "text-center justify-self-center";
  return "text-left";
};

export const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  children,
  className,
}) => {
  const gridTemplateColumns = columns.map((column) => column.width).join(" ");

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="min-w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div
          className="grid items-center gap-6 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400"
          style={{ gridTemplateColumns }}
        >
          {columns.map((column) => (
            <span
              key={column.key}
              className={cn("whitespace-nowrap", getAlignClass(column.align))}
            >
              {column.label}
            </span>
          ))}
        </div>
        <AdminTableContext.Provider value={gridTemplateColumns}>
          <div className="divide-y divide-slate-100">{children}</div>
        </AdminTableContext.Provider>
      </div>
    </div>
  );
};

export const AdminTableRow: React.FC<AdminTableRowProps> = ({
  children,
  className,
}) => {
  const gridTemplateColumns = useContext(AdminTableContext);

  return (
    <div
      className={cn(
        "grid items-center gap-6 px-5 py-4 transition hover:bg-slate-50",
        className
      )}
      style={gridTemplateColumns ? { gridTemplateColumns } : undefined}
    >
      {children}
    </div>
  );
};

export const AdminTableCell: React.FC<AdminTableCellProps> = ({
  align = "left",
  children,
  className,
}) => {
  return (
    <div
      className={cn("text-sm text-slate-700", getAlignClass(align), className)}
    >
      {children}
    </div>
  );
};

export type { AdminTableProps, AdminTableRowProps, AdminTableCellProps };
