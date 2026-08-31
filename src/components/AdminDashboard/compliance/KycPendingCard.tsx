import AdminCardShell from "../AdminCardShell";
import {
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/AdminDashboard/table/AdminTable";
import AdminPill from "@/components/AdminDashboard/table/AdminPill";
import { HiOutlineShieldCheck } from "react-icons/hi2";

const pendingKyc = [
  {
    vendor: "Wellness Hub",
    document: "Business License",
    submittedAt: "3 days ago",
  },
];


type KycPendingItem = {
  vendor: string;
  document: string;
  submittedAt: string;
};

type KycPendingCardProps = {
  items?: KycPendingItem[];
};

const KycPendingCard = ({ items = pendingKyc }: KycPendingCardProps) => {
  const hasItems = items.length > 0;

  return (
    <AdminCardShell title="KYC Pending">
      <AdminTable
        className="mt-4 flex-1"
        columns={[
          { key: "vendor", label: "Vendor", width: "minmax(220px,1.4fr)" },
          { key: "document", label: "Document", width: "minmax(180px,1fr)" },
          { key: "submitted", label: "Submitted", width: "minmax(140px,0.8fr)" },
        ]}
        >
        {hasItems ? (
          items.map((kyc) => (
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
          <div className="flex min-h-[220px] flex-1 flex-col items-center justify-center px-5 py-10 text-center text-sm text-slate-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <HiOutlineShieldCheck className="h-6 w-6 opacity-40" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">No records found</p>
            <p className="mt-1 max-w-52 text-xs leading-5 text-slate-500">
              All vendor identities are up to date and verified.
            </p>
          </div>
        )}
      </AdminTable>
    </AdminCardShell>
  );
};

export default KycPendingCard;
