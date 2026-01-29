import { useMemo } from "react";
import VendorTable from "@/components/shared/CustomTable";
import { useGetAllKycAuditLogsQuery } from "@/services/adminKycApi";


/* ================= TYPES ================= */

type AuditLogRow = {
  id: string;
  vendor: string;
  documentType: string;
  action: string;
  comment?: string | null;
  performedBy: string;
  date: string;
  time: string;
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
          vendor: log.document.vendor?.user.firstName,
          documentType: log.document.type.replace(/_/g, " "),
          action: log.action.replace(/_/g, " "),
          comment: log.comment,
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

  const columns = [
    { key: "vendor", header: "Vendor" },
    { key: "documentType", header: "Document" },
    {
      key: "action",
      header: "Action",
      render: (row: AuditLogRow) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
          {row.action}
        </span>
      ),
    },
    { key: "comment", header: "Comment" },
    { key: "performedBy", header: "Performed By" },
    {
      key: "date",
      header: "Date",
      render: (row: AuditLogRow) => (
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

      <VendorTable<AuditLogRow>
        columns={columns}
        data={rows}
        showToolbar={!isFetching}
      />
    </>
  );
};

export default AdminKycAuditLogsPage;
