import AdminCardShell from "../AdminCardShell";
import {
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/AdminDashboard/table/AdminTable";
import AdminPill from "@/components/AdminDashboard/table/AdminPill";

const pendingPayouts = [
  {
    vendor: "Nordic Spa AB",
    amount: "SEK 12,400",
    requestedAt: "2 hours ago",
    status: "Pending",
  },
  {
    vendor: "Stockholm Fitness",
    amount: "SEK 8,950",
    requestedAt: "Yesterday",
    status: "Pending",
  },
];

type PendingPayoutItem = {
  vendor: string;
  amount: string;
  requestedAt: string;
  status: string;
};

type PendingPayoutsCardProps = {
  items?: PendingPayoutItem[];
};

const PendingPayoutsCard = ({ items = pendingPayouts }: PendingPayoutsCardProps) => {
  const hasItems = items.length > 0;

  return (
    <AdminCardShell title="Pending Payouts" subtitle="Finance queue">
      <AdminTable
        className="mt-4 flex-1"
        columns={[
          { key: "vendor", label: "Vendor", width: "minmax(200px,1.4fr)" },
          {
            key: "amount",
            label: "Amount",
            width: "minmax(120px,0.8fr)",
            align: "right",
          },
          {
            key: "requested",
            label: "Requested",
            width: "minmax(140px,0.9fr)",
          },
          {
            key: "status",
            label: "Status",
            width: "minmax(120px,0.8fr)",
          },
        ]}
      >
        {hasItems ? (
          items.map((payout) => (
            <AdminTableRow key={`${payout.vendor}-${payout.amount}`}>
              <AdminTableCell className="text-sm font-semibold text-slate-900">
                {payout.vendor}
              </AdminTableCell>
              <AdminTableCell
                align="right"
                className="text-sm font-semibold text-slate-900"
              >
                {payout.amount}
              </AdminTableCell>
              <AdminTableCell className="text-sm text-slate-500">
                {payout.requestedAt}
              </AdminTableCell>
              <AdminTableCell>
                <AdminPill tone="warning">{payout.status}</AdminPill>
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
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Approvals coming soon
        </p>
      )}
    </AdminCardShell>
  );
};

export default PendingPayoutsCard;
