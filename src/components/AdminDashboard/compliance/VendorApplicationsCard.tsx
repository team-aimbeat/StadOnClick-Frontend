import AdminCardShell from "../AdminCardShell";
import {
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/AdminDashboard/table/AdminTable";
import AdminPill, { type AdminPillTone } from "@/components/AdminDashboard/table/AdminPill";

const vendorApplications:any = [
  {
    vendor: "Urban Yoga Studio",
    status: "PENDING",
    appliedAt: "Today",
    profileImageUrl: undefined,
  },
];

type VendorApplicationItem = {
  vendor: string;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "MORE_INFO_REQUIRED";
  appliedAt: string;
  profileImageUrl?: string;
};

type VendorApplicationsCardProps = {
  items?: VendorApplicationItem[];
};

const statusMeta: Record<
  NonNullable<VendorApplicationItem["status"]>,
  { label: string; tone: AdminPillTone }
> = {
  PENDING: { label: "Pending", tone: "warning" },
  APPROVED: { label: "Approved", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
  MORE_INFO_REQUIRED: { label: "More info", tone: "info" },
};

const VendorApplicationsCard = ({ items = vendorApplications }: VendorApplicationsCardProps) => {
  const hasItems = items.length > 0;

  return (
    <AdminCardShell title="Vendor Applications" subtitle="Compliance queue">
      <AdminTable
        className="mt-4 flex-1"
        columns={[
          { key: "vendor", label: "Vendor", width: "minmax(220px,1.4fr)" },
          { key: "status", label: "Status", width: "minmax(160px,1fr)" },
          { key: "applied", label: "Applied", width: "minmax(140px,0.8fr)" },
        ]}
      >
        {hasItems ? (
          items.map((application) => (
            <AdminTableRow key={`${application.vendor}-${application.appliedAt}`}>
              <AdminTableCell className="text-sm font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  {application.profileImageUrl ? (
                    <img
                      src={application.profileImageUrl}
                      alt={application.vendor}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold uppercase text-slate-600 ring-1 ring-slate-200">
                      {application.vendor.trim().charAt(0) || "V"}
                    </div>
                  )}
                  <span>{application.vendor}</span>
                </div>
              </AdminTableCell>
              <AdminTableCell className="text-sm text-slate-700">
                <AdminPill tone={application.status ? statusMeta[application.status].tone : "neutral"}>
                  {application.status ? statusMeta[application.status].label : "Unknown"}
                </AdminPill>
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
