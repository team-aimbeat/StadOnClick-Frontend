import AdminCardShell from "../AdminCardShell";
import AdminPill, { type AdminPillTone } from "@/components/AdminDashboard/table/AdminPill";
import { HiChevronRight } from "react-icons/hi2";

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
    <AdminCardShell title="Vendor Applications">
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm"
        >
          PENDING
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500"
        >
          ARCHIVED
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {hasItems ? (
          items.map((application) => (
            <div
              key={`${application.vendor}-${application.appliedAt}`}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                {application.profileImageUrl ? (
                  <img
                    src={application.profileImageUrl}
                    alt={application.vendor}
                    className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold uppercase text-slate-600 ring-1 ring-slate-200">
                    {application.vendor.trim().charAt(0) || "V"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{application.vendor}</p>
                  <p className="text-xs text-slate-500">Home & Living Category</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Applied</p>
                  <p className="text-sm font-semibold text-slate-900">{application.appliedAt}</p>
                </div>
                <AdminPill tone={application.status ? statusMeta[application.status].tone : "neutral"}>
                  {application.status ? statusMeta[application.status].label : "Unknown"}
                </AdminPill>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200"
                  aria-label={`View ${application.vendor}`}
                >
                  <HiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-5 py-10 text-center text-sm text-slate-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <HiChevronRight className="h-6 w-6 opacity-40" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">No records found</p>
            <p className="mt-1 max-w-52 text-xs leading-5 text-slate-500">
              No vendor applications are currently awaiting review.
            </p>
          </div>
        )}
      </div>
    </AdminCardShell>
  );
};

export default VendorApplicationsCard;
