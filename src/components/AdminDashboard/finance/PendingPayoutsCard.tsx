import AdminCardShell from "../AdminCardShell";
import AdminPill from "@/components/AdminDashboard/table/AdminPill";
import {
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/AdminDashboard/table/AdminTable";
import { HiOutlineArrowTopRightOnSquare } from "react-icons/hi2";

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
    <AdminCardShell title="Pending Payouts" className="relative">
      <div className="absolute right-5 top-5">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#3554e0] shadow-sm transition hover:border-slate-300 hover:text-[#2740b8]"
        >
          <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
          View Ledger
        </button>
      </div>
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
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                    {payout.vendor
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <span>{payout.vendor}</span>
                </div>
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
                <AdminPill tone="warning" className="bg-[#ebefff] text-[#3554e0]">
                  {payout.status}
                </AdminPill>
              </AdminTableCell>
            </AdminTableRow>
          ))
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-14 text-center text-sm text-slate-500">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <HiOutlineArrowTopRightOnSquare className="h-6 w-6 opacity-40" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">No records found</p>
            <p className="mt-1 max-w-52 text-xs leading-5 text-slate-500">
              There are currently no pending payouts to process.
            </p>
          </div>
        )}
      </AdminTable>
    </AdminCardShell>
  );
};

export default PendingPayoutsCard;
