import AdminCardShell from "../AdminCardShell";
import {
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/AdminDashboard/table/AdminTable";
import AdminPill from "@/components/AdminDashboard/table/AdminPill";

const pendingKyc = [
  {
    vendor: "Wellness Hub",
    document: "Business License",
    submittedAt: "3 days ago",
  },
];

const KycPendingCard = () => {
  const hasItems = pendingKyc.length > 0;

  return (
    <AdminCardShell title="KYC Pending" subtitle="Compliance queue">
      <AdminTable
        className="mt-4 flex-1"
        columns={[
          { key: "vendor", label: "Vendor", width: "minmax(220px,1.4fr)" },
          { key: "document", label: "Document", width: "minmax(180px,1fr)" },
          { key: "submitted", label: "Submitted", width: "minmax(140px,0.8fr)" },
        ]}
      >
        {hasItems ? (
          pendingKyc.map((kyc) => (
            <AdminTableRow key={`${kyc.vendor}-${kyc.document}`}>
              <AdminTableCell className="text-sm font-semibold text-slate-900">
                {kyc.vendor}
              </AdminTableCell>
              <AdminTableCell>
                <AdminPill tone="warning">{kyc.document}</AdminPill>
              </AdminTableCell>
              <AdminTableCell className="text-sm text-slate-500">
                {kyc.submittedAt}
              </AdminTableCell>
            </AdminTableRow>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No records found
          </div>
        )}
      </AdminTable>
      {hasItems && (
        <p className="mt-3 text-xs font-semibold text-slate-600">
          Compliance review required
        </p>
      )}
    </AdminCardShell>
  );
};

export default KycPendingCard;
