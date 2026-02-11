import AdminCardShell from "../AdminCardShell";
import {
  AdminTable,
  AdminTableCell,
  AdminTableRow,
} from "@/components/AdminDashboard/table/AdminTable";

const refundRequests = [
  {
    bookingId: "#BK-10234",
    user: "Emma Johansson",
    amount: "SEK 1,200",
    reason: "Cancelled booking",
  },
];

type RefundRequestItem = {
  bookingId: string;
  user: string;
  amount: string;
  reason: string;
};

type RefundRequestsCardProps = {
  items?: RefundRequestItem[];
};

const RefundRequestsCard = ({ items = refundRequests }: RefundRequestsCardProps) => {
  const hasItems = items.length > 0;

  return (
    <AdminCardShell title="Refund Requests" subtitle="Finance queue">
      <AdminTable
        className="mt-4 flex-1"
        columns={[
          { key: "booking", label: "Booking", width: "minmax(180px,1.2fr)" },
          { key: "user", label: "User", width: "minmax(180px,1.2fr)" },
          {
            key: "amount",
            label: "Amount",
            width: "minmax(120px,0.8fr)",
            align: "right",
          },
        ]}
      >
        {hasItems ? (
          items.map((request) => (
            <AdminTableRow key={request.bookingId}>
              <AdminTableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-slate-900">
                    {request.bookingId}
                  </span>
                  <span className="text-xs text-slate-500">
                    {request.reason}
                  </span>
                </div>
              </AdminTableCell>
              <AdminTableCell className="text-sm text-slate-700">
                {request.user}
              </AdminTableCell>
              <AdminTableCell
                align="right"
                className="text-sm font-semibold text-slate-900"
              >
                {request.amount}
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

export default RefundRequestsCard;
