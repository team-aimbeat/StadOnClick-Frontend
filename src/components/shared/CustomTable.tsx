import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/shared/Table";
import { cn } from "@/lib/utils";
import {
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiArrowPath,
  HiArrowDownTray,
  HiEllipsisHorizontal,
} from "react-icons/hi2";

/* ================= TYPES ================= */

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

interface VendorTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  showToolbar?: boolean;
}

/* ================= COMPONENT ================= */

function VendorTable<T extends { id: string | number }>({
  columns,
  data,
  className,
  showToolbar = true,
}: VendorTableProps<T>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm",
        className
      )}
    >
      {/* ===== TOP HEADER ===== */}
      {showToolbar ? (
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b">
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search for vendors and documents"
              className="
                w-full h-9 pl-9 pr-3 text-sm
                rounded-full bg-white
                bg-muted
                border border-border
                focus:outline-none focus:ring-2 focus:ring-primary/20
              "
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 text-muted-foreground">
            {[HiAdjustmentsHorizontal, HiArrowPath, HiArrowDownTray, HiEllipsisHorizontal].map(
              (Icon, i) => (
                <button
                  key={i}
                  className="h-9 w-9 flex items-center justify-center  rounded-md hover:bg-muted transition"
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            )}
          </div>
        </div>
      ) : null}

      {/* ===== SHADCN TABLE ===== */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className="text-xs uppercase text-muted-foreground"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default VendorTable;
