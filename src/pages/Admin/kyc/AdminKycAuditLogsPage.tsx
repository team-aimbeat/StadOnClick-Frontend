import { useMemo } from "react";
import { DataTable, type ColumnConfig } from "@/components/shared/DataTable";
import { useGetAllKycAuditLogsQuery } from "@/services/adminKycApi";


/* ================= TYPES ================= */

type AuditLogRow = {
  id: string;
  vendor: string;
  vendorAvatar: string | null;
  documentType: string;
  action: string;
  performedBy: string;
  date: string;
  time: string;
};

const actionBadgeClass = (action: string) => {
  const normalized = action.trim().toUpperCase();

  if (normalized === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (normalized === "REJECTED") {
    return "bg-rose-100 text-rose-700";
  }
  if (normalized === "REQUESTED REUPLOAD") {
    return "bg-blue-100 text-blue-700";
  }
  if (normalized === "SUBMITTED") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-700";
};

/* ================= PAGE ================= */

const AdminKycAuditLogsPage = () => {
  const { data = [], isFetching } = useGetAllKycAuditLogsQuery();

  const rows: AuditLogRow[] = useMemo(
    () =>
      data.map((log) => {
        const date = new Date(log.createdAt);

        return {
          id: log.id,
          vendor: log.document.vendor?.user?.firstName ?? "Unknown Vendor",
          vendorAvatar: log.document.vendor?.user?.profileImageUrl ?? null,
          documentType: log.document.type.replace(/_/g, " "),
          action: log.action.replace(/_/g, " "),
          performedBy: `${log.performedBy?.firstName} ${log.performedBy?.lastName ?? ""}`,
          date: date.toLocaleDateString("en-GB"),
          time: date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }),
    [data],
  );

  const columns: ColumnConfig[] = [
    {
      key: "vendor",
      title: "Vendor",
      render: (_value, row: AuditLogRow) => (
        <div className="flex items-center gap-3">
          <img
            src={row.vendorAvatar || "/avatar-placeholder.png"}
            alt={row.vendor}
            className="h-10 w-10 rounded-full border object-cover"
          />
          <span className="font-medium text-slate-800">{row.vendor}</span>
        </div>
      ),
    },
    { key: "documentType", title: "Document" },
    {
      key: "action",
      title: "Action",
      render: (_value, row: AuditLogRow) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${actionBadgeClass(
            row.action,
          )}`}
        >
          {row.action}
        </span>
      ),
    },
    { key: "performedBy", title: "Performed By" },
    {
      key: "date",
      title: "Date",
      render: (_value, row: AuditLogRow) => (
        <>
          <div>{row.date}</div>
          <div className="text-xs text-gray-400">{row.time}</div>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          KYC Audit Logs
        </h1>
        <p className="text-sm text-gray-500">
          Complete history of all KYC actions
        </p>
      </div>

      <DataTable
        title="KYC Audit Logs"
        breadCrumbTitle="Admin / Vendor KYC / Audit Logs"
        columns={columns}
        data={rows}
        loading={isFetching}
        selectable={false}
        showSerialNumber={false}
        searchable
        searchPlaceholder="Search vendor, action, or performer"
        noRecordText="No audit logs found"
      />
    </>
  );
};

export default AdminKycAuditLogsPage;
