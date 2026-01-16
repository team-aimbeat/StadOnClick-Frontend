import AdminCardShell from "../AdminCardShell";
import {
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/AdminDashboard/table/AdminTable";
import AdminPill from "@/components/AdminDashboard/table/AdminPill";

const vendorApplications = [
  {
    vendor: "Urban Yoga Studio",
    city: "Gothenburg",
    appliedAt: "Today",
  },
];

const VendorApplicationsCard = () => {
  const hasItems = vendorApplications.length > 0;

  return (
    <AdminCardShell title="Vendor Applications" subtitle="Compliance queue">
      <AdminTable
        className="mt-4 flex-1"
        columns={[
          { key: "vendor", label: "Vendor", width: "minmax(220px,1.4fr)" },
          { key: "city", label: "City", width: "minmax(160px,1fr)" },
          { key: "applied", label: "Applied", width: "minmax(140px,0.8fr)" },
        ]}
      >
        {hasItems ? (
          vendorApplications.map((application) => (
            <AdminTableRow key={`${application.vendor}-${application.city}`}>
              <AdminTableCell className="text-sm font-semibold text-slate-900">
                {application.vendor}
              </AdminTableCell>
              <AdminTableCell className="text-sm text-slate-700">
                {application.city}
              </AdminTableCell>
              <AdminTableCell>
                <AdminPill tone="neutral">{application.appliedAt}</AdminPill>
              </AdminTableCell>
            </AdminTableRow>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No records found
          </div>
        )}
      </AdminTable>
    </AdminCardShell>
  );
};

export default VendorApplicationsCard;
